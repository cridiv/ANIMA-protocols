import { Module, Global } from '@nestjs/common';
import { SuiService } from './sui.service.js';

@Global()
@Module({
  providers: [SuiService],
  exports: [SuiService],
})
export class SuiModule { }
