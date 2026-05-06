import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [OrdersModule, UsersModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
