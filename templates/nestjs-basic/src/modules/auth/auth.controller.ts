<% if (includeAuth) { -%>
import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
<% if (includeLocalAuth) { -%>
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
<% } -%>
<% if (includeGoogleAuth) { -%>
import { AuthGuard } from '@nestjs/passport';
<% } -%>

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  <% if (includeLocalAuth) { -%>
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
  <% } -%>

  <% if (includeGoogleAuth) { -%>
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // Initiates the Google OAuth2 flow
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req) {
    // Handles the Google callback
    return this.authService.login(req.user);
  }
  <% } -%>
}
<% } -%>
