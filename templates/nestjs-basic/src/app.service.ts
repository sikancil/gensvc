import { Injectable } from '@nestjs/common';
<% if (includeValidation) { -%>
import { CreateSampleDto } from './modules/sample/sample.dto';
<% } -%>

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): object {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  <% if (includeCaching) { -%>
  async getSlowData(): Promise<any> {
    // Simulate a slow database call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      message: 'This data is slow!',
      timestamp: new Date().toISOString(),
    };
  }
  <% } -%>

  <% if (includeValidation) { -%>
  createSample(data: CreateSampleDto) {
    console.log('Data received:', data);
    return { message: 'Sample created successfully', data };
  }
  <% } -%>
}
