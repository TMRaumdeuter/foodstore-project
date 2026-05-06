import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Request() req: any, @Body() body: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, body);
  }

  @Get('my-orders')
  async getMyOrders(@Request() req: any, @Query('page') page: number, @Query('limit') limit: number) {
    return this.ordersService.findByUser(req.user.userId, page, limit);
  }

  @Get('status/:id')
  async getStatus(@Param('id') id: string, @Request() req: any) {
    const status = await this.ordersService.getOrderStatusById(id);
    if (req.user.role === 'customer') {
      const order = await this.ordersService.findById(id);
      const ownerId = (order.userId as any)._id || order.userId;
      if (ownerId.toString() !== req.user.userId) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
    }
    return status;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: string,
  ) {
    return this.ordersService.findAll({ page, limit, status });
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    const order = await this.ordersService.findById(id);
    const ownerId = (order.userId as any)._id || order.userId;
    if (req.user.role === 'customer' && ownerId.toString() !== req.user.userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/request-cancel')
  async requestCancel(@Param('id') id: string, @Request() req: any, @Body('reason') reason: string) {
    return this.ordersService.requestCancel(id, req.user.userId, reason);
  }

  @Patch(':id/confirm-payment')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  async confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }
}
