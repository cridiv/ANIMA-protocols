import { Module } from '@nestjs/common';
import { DeepbookService } from './deepbook.service.js';

@Module({
  providers: [DeepbookService],
  exports: [DeepbookService],
})
export class DeepbookModule { }
