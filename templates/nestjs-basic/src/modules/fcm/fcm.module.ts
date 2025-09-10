<% if (includeFcm) { -%>
import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FcmService],
  exports: [FcmService],
})
export class FcmModule {}
<% } -%>
