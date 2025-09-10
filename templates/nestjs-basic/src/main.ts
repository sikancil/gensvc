import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<% if (appType === 'Microservice') { -%>
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
<% } -%>
<% if (includeConfig) { -%>
import { ConfigService } from '@nestjs/config';
<% } -%>
<% if (includeValidation) { -%>
import { ZodValidationPipe } from 'nestjs-zod';
<% } -%>
<% if (includeErrorHandling) { -%>
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
<% } -%>
<% if (includeLogging) { -%>
import { Logger } from 'nestjs-pino';
<% } -%>

async function bootstrap() {
  <% if (appType === 'API Gateway (HTTP)') { -%>
  const app = await NestFactory.create(AppModule);

  <% if (includeLogging) { -%>
  app.useLogger(app.get(Logger));
  <% } -%>

  <% if (includeValidation) { -%>
  app.useGlobalPipes(new ZodValidationPipe());
  <% } -%>

  <% if (includeErrorHandling) { -%>
  app.useGlobalFilters(new HttpExceptionFilter());
  <% } -%>

  <% if (includeConfig) { -%>
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, () => {
    app.get(Logger).log(`Server is running on port ${port}`);
  });
  <% } else { -%>
  await app.listen(3000);
  <% } -%>
  <% } else { -%>
  // This is a Microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      <% if (transport === 'Redis') { -%>
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
      <% } -%>
      <% if (transport === 'Kafka') { -%>
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        },
        consumer: {
          groupId: '<%= projectName.toLowerCase() %>-consumer',
        },
      },
      <% } -%>
      <% if (transport === 'NATS') { -%>
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
      },
      <% } -%>
    },
  );

  <% if (includeLogging) { -%>
  app.useLogger(app.get(Logger));
  <% } -%>

  await app.listen();
  <% } -%>
}
bootstrap();
