<% if (includeAuth) { -%>
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
<% if (includeLocalAuth) { -%>
import { LocalStrategy } from './local.strategy';
<% } -%>
<% if (includeGoogleAuth) { -%>
import { GoogleStrategy } from './google.strategy';
<% } -%>
<% if (usePrisma) { -%>
import { PrismaModule } from '../../core/prisma/prisma.module';
<% } -%>

const providers = [AuthService, JwtStrategy];
<% if (includeLocalAuth) { -%>
providers.push(LocalStrategy);
<% } -%>
<% if (includeGoogleAuth) { -%>
providers.push(GoogleStrategy);
<% } -%>


@Module({
  imports: [
    <% if (usePrisma) { -%>
    PrismaModule,
    <% } -%>
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: providers,
  controllers: [AuthController],
})
export class AuthModule {}
<% } -%>
