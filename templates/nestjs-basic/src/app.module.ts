import { Module } from '@nestjs/common';
<% if (appType === 'API Gateway (HTTP)' && microservices.length > 0) { -%>
import { ClientsModule, Transport } from '@nestjs/microservices';
<% } -%>
<% if (includeCaching) { -%>
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
<% } -%>
<% if (includeQueues) { -%>
import { BullModule } from '@nestjs/bullmq';
import { MessageModule } from './modules/message/message.module';
<% } -%>
<% if (includeWebsockets) { -%>
import { EventsModule } from './modules/events/events.module';
<% } -%>
<% if (includeFcm) { -%>
import { FcmModule } from './modules/fcm/fcm.module';
<% } -%>
<% if (includeConfig) { -%>
import { ConfigModule, ConfigService } from '@nestjs/config';
<% } -%>
<% if (useSequelize) { -%>
import { SequelizeModule } from '@nestjs/sequelize';
<% } -%>
<% if (includeLogging) { -%>
import { LoggerModule } from 'nestjs-pino';
<% } -%>
<% if (usePrisma) { -%>
import { PrismaModule } from './core/prisma/prisma.module';
<% } -%>
<% if (includeAuth) { -%>
import { AuthModule } from './modules/auth/auth.module';
<% } -%>
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    <% if (appType === 'API Gateway (HTTP)' && microservices.length > 0) { -%>
    ClientsModule.register([
      <% microservices.forEach(service => { %>
      {
        name: '<%= service.appName.toUpperCase() %>_SERVICE',
        transport: Transport.<%= service.transport.toUpperCase() %>,
        options: {
          <% if (service.transport === 'Redis') { %>
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
          <% } else if (service.transport === 'Kafka') { %>
          client: {
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: '<%= service.appName.toLowerCase() %>-consumer',
          },
          <% } else if (service.transport === 'NATS') { %>
          servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
          <% } %>
        },
      },
      <% }) %>
    ]),
    <% } -%>
    <% if (includeConfig) { -%>
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    <% } -%>
    <% if (useSequelize) { -%>
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    <% } -%>
    <% if (includeCaching) { -%>
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        }),
      }),
      inject: [ConfigService],
    }),
    <% } -%>
    <% if (includeQueues) { -%>
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    MessageModule,
    <% } -%>
    <% if (includeWebsockets) { -%>
    EventsModule,
    <% } -%>
    <% if (includeFcm) { -%>
    FcmModule,
    <% } -%>
    <% if (includeLogging) { -%>
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    <% } -%>
    <% if (usePrisma) { -%>
    PrismaModule,
    <% } -%>
    <% if (includeAuth) { -%>
    AuthModule,
    <% } -%>
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
