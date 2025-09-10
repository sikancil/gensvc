<% if (includeQueues) { -%>
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MessageController } from './message.controller';
import { MessageProducerService } from './message.producer.service';
import { MessageConsumer } from './message.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  controllers: [MessageController],
  providers: [MessageProducerService, MessageConsumer],
})
export class MessageModule {}
<% } -%>
