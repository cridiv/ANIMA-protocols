import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { SuiService } from '../sui/sui.service.js';
import { addEvent, AgentEvent } from '../events/store.js';

@Injectable()
export class IndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexerService.name);
  private ws: any = null; // Typing as any to allow standard global WebSocket or ws library
  private reconnectAttempts = 0;
  private isDestroyed = false;
  private readonly backoffDelays = [5000, 10000, 20000];
  private pollIntervalId: any = null;

  constructor(private readonly suiService: SuiService) {}

  onModuleInit() {
    const packageId = process.env.ANIMA_PACKAGE_ID;
    if (!packageId) {
      this.logger.error('ANIMA_PACKAGE_ID environment variable is missing.');
      return;
    }

    const usePolling = process.env.USE_EVENT_POLLING === 'true';
    if (usePolling) {
      this.logger.log('USE_EVENT_POLLING is true. Starting Event Indexer with Polling Fallback...');
      this.pollEvents(packageId, 5000);
    } else {
      this.logger.log('USE_EVENT_POLLING is false. Starting Event Indexer with WebSocket Subscription...');
      this.startEventIndexer(packageId);
    }
  }

  onModuleDestroy() {
    this.isDestroyed = true;
    this.closeConnection();
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
      this.logger.log('Stopped event polling fallback timer.');
    }
  }

  private closeConnection() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (err) {
        this.logger.error('Error closing WebSocket connection', err);
      }
      this.ws = null;
    }
  }

  /**
   * Primary WebSocket Subscription Indexer
   */
  startEventIndexer(packageId: string): void {
    if (this.isDestroyed) return;

    this.closeConnection();

    const httpUrl = getJsonRpcFullnodeUrl((process.env.SUI_NETWORK as any) || 'testnet');
    const wsUrl = httpUrl.replace(/^http/, 'ws');

    this.logger.log(`Connecting to Sui Event Indexer WS: ${wsUrl}`);
    
    try {
      this.ws = new (globalThis as any).WebSocket(wsUrl);
    } catch (err) {
      this.logger.error(`Failed to initialize WebSocket: ${err}`);
      this.handleReconnect(packageId);
      return;
    }

    this.ws.onopen = () => {
      if (this.isDestroyed) return;
      this.logger.log(`Sui Event Indexer WebSocket connection established.`);
      this.reconnectAttempts = 0;

      // Subscribe to events for the specified package and module 'events'
      const subscribePayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_subscribeEvent',
        params: [
          {
            MoveEventModule: {
              package: packageId,
              module: 'events',
            },
          },
        ],
      };

      this.ws?.send(JSON.stringify(subscribePayload));
      this.logger.log(`Subscribed to events for package: ${packageId} module: events`);
    };

    this.ws.onmessage = (messageEvent: any) => {
      if (this.isDestroyed) return;
      try {
        const rawData = JSON.parse(messageEvent.data as string);
        if (rawData.method === 'suix_subscribeEvent' && rawData.params?.result) {
          const rawEvent = rawData.params.result;
          this.processRawEvent(rawEvent);
        }
      } catch (err) {
        this.logger.error(`Error parsing WebSocket event data: ${err}`);
      }
    };

    this.ws.onerror = (errorEvent: any) => {
      this.logger.error(`WebSocket error encountered: ${JSON.stringify(errorEvent)}`);
    };

    this.ws.onclose = () => {
      if (this.isDestroyed) return;
      this.logger.warn(`WebSocket connection closed.`);
      this.handleReconnect(packageId);
    };
  }

  private handleReconnect(packageId: string) {
    if (this.isDestroyed) return;

    if (this.reconnectAttempts < this.backoffDelays.length) {
      const delay = this.backoffDelays[this.reconnectAttempts];
      this.reconnectAttempts++;
      this.logger.log(`Attempting reconnection ${this.reconnectAttempts}/${this.backoffDelays.length} in ${delay / 1000}s...`);
      setTimeout(() => {
        this.startEventIndexer(packageId);
      }, delay);
    } else {
      this.logger.warn(`WebSocket reconnection failed after ${this.reconnectAttempts} attempts.`);
    }
  }

  /**
   * Polling Fallback loop (runs when USE_EVENT_POLLING=true)
   */
  pollEvents(packageId: string, intervalMs = 5000): void {
    if (this.isDestroyed) return;

    this.logger.log(`Starting event polling loop with interval: ${intervalMs}ms...`);
    
    let lastCursor: any = null;
    let isPolling = false;

    const tick = async () => {
      if (this.isDestroyed || isPolling) return;
      isPolling = true;

      try {
        const response = await this.suiService.suiClient.queryEvents({
          query: {
            MoveEventModule: {
              package: packageId,
              module: 'events',
            },
          },
          cursor: lastCursor,
          order: 'ascending', // Chronological order ensures cursor moves forward naturally
        });

        if (response.data && response.data.length > 0) {
          this.logger.log(`[POLLING] Fetched ${response.data.length} new events from blockchain.`);
          for (const rawEvent of response.data) {
            this.processRawEvent(rawEvent);
          }
          lastCursor = response.nextCursor;
        }
      } catch (err) {
        this.logger.error(`Error during event polling tick: ${err}`);
      } finally {
        isPolling = false;
      }
    };

    // Run first tick immediately to query current events
    tick().catch((err) => this.logger.error(`Initial polling tick failed: ${err}`));

    // Schedule regular polling
    this.pollIntervalId = setInterval(tick, intervalMs);
  }

  private processRawEvent(event: any) {
    try {
      const typeStr: string = event.type || '';
      const parts = typeStr.split('::');
      const structName = parts[parts.length - 1] || 'Unknown';

      // Map dynamic fields from parsedJson
      const parsedJson = event.parsedJson || {};
      const agentId = parsedJson.anima_id || '';
      const txDigest = event.id?.txDigest || '';
      const timestamp = event.timestampMs ? Number(event.timestampMs) : Date.now();

      let actionType = structName;
      let amountVal = 0;

      // Normalize action types and amount according to struct
      if (structName === 'AgentActionExecuted') {
        actionType = 'SWAP';
        amountVal = parsedJson.amount_swapped ? Number(parsedJson.amount_swapped) : 0;
      } else if (structName === 'ComputeSettled') {
        actionType = 'COMPUTE';
        amountVal = parsedJson.amount ? Number(parsedJson.amount) : 0;
      } else if (structName === 'EmergencyHatchTriggered') {
        actionType = 'KILL_SWITCH';
        amountVal = parsedJson.recovered_amount ? Number(parsedJson.recovered_amount) : 0;
      } else if (structName === 'AnimaMinted') {
        actionType = 'MINT';
        amountVal = 0;
      }

      const parsedEvent: AgentEvent = {
        agentId,
        actionType,
        amount: amountVal.toString(), // amount represented as string
        timestamp,
        txDigest,
      };

      addEvent(parsedEvent);
      this.logger.log(`[EVENT] New action from agent ${agentId} | type: ${actionType} | tx: ${txDigest}`);
    } catch (err) {
      this.logger.error(`Error processing raw event: ${err}`);
    }
  }
}
