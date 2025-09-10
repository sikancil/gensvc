<% if (appType === 'API Gateway (HTTP)') { -%>
import { Controller, Get, Post, Body, UseGuards, Request, Inject, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
<% if (includeCaching) { -%>
import { CacheInterceptor } from '@nestjs/cache-manager';
<% } -%>
<% } else { -%>
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
<% } -%>
import { AppService } from './app.service';
<% if (includeValidation) { -%>
import { CreateSampleDto } from './modules/sample/sample.dto';
<% } -%>
<% if (includeAuth) { -%>
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
<% } -%>

@Controller()
export class AppController {
  <% if (appType === 'API Gateway (HTTP)') { -%>
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  getHealth(): object {
    return this.appService.getHealth();
  }

  <% if (includeCaching) { -%>
  @UseInterceptors(CacheInterceptor)
  @Get('/cached')
  getCachedData() {
    return this.appService.getSlowData();
  }
  <% } -%>

  <% if (includeValidation) { -%>
  @Post('/sample')
  createSample(@Body() createSampleDto: CreateSampleDto) {
    return this.appService.createSample(createSampleDto);
  }
  <% } -%>

  <% if (includeAuth) { -%>
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  <% } -%>
  <% } else { -%>
  // This is a Microservice
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'get_hello' })
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern({ cmd: 'get_health' })
  getHealth(): object {
    return this.appService.getHealth();
  }
  <% } -%>
}
