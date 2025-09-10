<% if (includeQueues) { -%>
import { Controller, Post, Body } from '@nestjs/common';
import { MessageProducerService } from './message.producer.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageProducerService: MessageProducerService) {}

  @Post()
  async sendMessage(@Body('message') message: string) {
    await this.messageProducerService.sendMessage(message);
    return { status: 'ok', message: 'Message sent to queue.' };
  }
}
<% } -%>
