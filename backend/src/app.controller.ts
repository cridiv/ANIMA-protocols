import { Controller, Get, Logger } from '@nestjs/common';
import { SuiService } from './sui/sui.service.js';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly suiService: SuiService) {}

  @Get()
  getRoot() {
    return { message: 'ANIMA backend is running smoothly!' };
  }

  @Get('health')
  async getHealth() {
    let suiStatus = 'unreachable';

    try {
      // Attempt a lightweight RPC call with a 10-second timeout
      const chainId = await withTimeout(
        this.suiService.suiClient.getChainIdentifier(),
        10_000,
      );

      if (chainId) {
        suiStatus = 'connected';
      }
    } catch (err) {
      this.logger.warn(`[HEALTH] Sui RPC check failed: ${err}`);
    }

    const status = suiStatus === 'connected' ? 'ok' : 'degraded';

    return {
      status,
      sui: suiStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}
