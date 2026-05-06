import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  @Get('stats')
  async getStats() {
    const [orderStats, userCounts, pendingOrders] = await Promise.all([
      this.ordersService.getTotalStats(),
      this.usersService.countByRole(),
      this.ordersService.countByStatus('pending'),
    ]);
    return { ...orderStats, pendingOrders, users: userCounts };
  }

  @Get('revenue')
  async getRevenue() {
    return this.ordersService.getDailyStats(30);
  }
}
