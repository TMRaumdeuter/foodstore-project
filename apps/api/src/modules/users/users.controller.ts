import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  async updateProfile(@Request() req: any, @Body() body: any) {
    const { password, role, loyaltyPoints, ...updateData } = body;
    return this.usersService.update(req.user.userId, updateData);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: any) {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    return this.usersService.create(body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query() query: { page?: number; limit?: number; role?: string }) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
