import { Module } from '@nestjs/common';
import { PtbService } from './ptb.service.js';
import { SuiModule } from '../sui/sui.module.js';
import { DeepbookModule } from '../deepbook/deepbook.module.js';

@Module({
  imports: [SuiModule, DeepbookModule],
  providers: [PtbService],
  exports: [PtbService],
})
export class PtbModule { }
