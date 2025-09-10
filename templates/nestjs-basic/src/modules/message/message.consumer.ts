<% if (includeQueues) { -%>
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('message-queue')
export class MessageConsumer extends WorkerHost {
  private readonly logger = new Logger(MessageConsumer.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`);
    // Add your job processing logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.logger.log(`Job ${job.id} completed.`);
  }
}
<% } -%>
