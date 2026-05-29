import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DeepbookModule } from './deepbook/deepbook.module.js';
import { SuiModule } from './sui/sui.module.js';
import { PtbModule } from './ptb/ptb.module.js';

@Module({
  imports: [DeepbookModule, SuiModule, PtbModule],
  controllers: [AppController],
})
export class AppModule { }
