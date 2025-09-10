import { Module } from '@nestjs/common';
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
    <% if (includeConfig) { -%>
    ConfigModule.forRoot({
      isGlobal: true,
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
