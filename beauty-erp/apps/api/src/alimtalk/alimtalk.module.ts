import { Module } from '@nestjs/common';
import { AlimtalkController } from './alimtalk.controller';
import { AlimtalkService } from './alimtalk.service';

@Module({
  controllers: [AlimtalkController],
  providers: [AlimtalkService],
  exports: [AlimtalkService],
})
export class AlimtalkModule {}
