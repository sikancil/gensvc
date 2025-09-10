<% if (includeAuth) { -%>
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
<% if (usePrisma) { -%>
import { PrismaService } from '../../core/prisma/prisma.service';
<% } -%>
<% if (useSequelize) { -%>
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../db/models/user.model';
<% } -%>
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    <% if (usePrisma) { -%>
    private prisma: PrismaService,
    <% } -%>
    <% if (useSequelize) { -%>
    @InjectModel(User)
    private userModel: typeof User,
    <% } -%>
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    <% if (usePrisma) { -%>
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    <% } -%>
    <% if (useSequelize) { -%>
    const user = await this.userModel.findOne({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user.get();
      return result;
    }
    <% } -%>
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    <% if (usePrisma) { -%>
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    const { password, ...result } = user;
    return result;
    <% } -%>
    <% if (useSequelize) { -%>
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user.get();
    return result;
    <% } -%>
  }
}
<% } -%>
