import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { UsersService } from '../users/users.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private usersService: UsersService,
    private vouchersService: VouchersService,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, data: any): Promise<OrderDocument> {
    const orderCode = `FS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Server-side price recalculation
    let subtotal = 0;
    const verifiedItems = [];
    for (const item of data.items || []) {
      const product = await this.productsService.findById(item.productId);
      let itemPrice = product.basePrice;

      // Add selected option extra prices
      if (item.selectedOptions?.length) {
        for (const opt of item.selectedOptions) {
          const productOpt = product.options?.find((o: any) => o.name === opt.name);
          if (productOpt) {
            const choice = productOpt.choices?.find((c: any) => c.label === opt.choice);
            if (choice) itemPrice += choice.extraPrice;
          }
        }
      }

      subtotal += itemPrice * item.quantity;
      verifiedItems.push({
        ...item,
        name: product.name,
        price: itemPrice,
      });
    }

    // Server-side voucher validation
    let discountAmount = 0;
    if (data.voucherCode) {
      const voucherResult = await this.vouchersService.validate(data.voucherCode, subtotal);
      discountAmount = voucherResult.discount;
      await this.vouchersService.useVoucher(data.voucherCode);
    }

    // Handle loyalty points
    let pointsDiscount = 0;
    if (data.pointsUsed > 0) {
      const success = await this.usersService.useLoyaltyPoints(userId, data.pointsUsed);
      if (!success) throw new BadRequestException('Không đủ điểm thưởng');
      pointsDiscount = data.pointsUsed * 1000;
    }

    const totalPrice = Math.max(0, subtotal - discountAmount - pointsDiscount);

    const order = await this.orderModel.create({
      items: verifiedItems,
      userId,
      orderCode,
      subtotal,
      totalPrice,
      discountAmount,
      pointsUsed: data.pointsUsed || 0,
      pointsDiscount,
      voucherCode: data.voucherCode,
      deliveryAddress: data.deliveryAddress,
      phone: data.phone,
      paymentMethod: data.paymentMethod,
      note: data.note,
    });

    return order;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.orderModel.countDocuments({ userId }),
    ]);
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: any = {};
    if (query.status) filter.status = query.status;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email phone')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.orderModel.countDocuments(filter),
    ]);
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).populate('userId', 'name email phone');
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['delivering'],
      delivering: ['completed'],
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Không thể chuyển từ "${order.status}" sang "${status}"`);
    }

    order.status = status;

    // Award loyalty points on completion
    if (status === 'completed') {
      const earnedPoints = Math.floor(order.totalPrice / 10000);
      if (earnedPoints > 0) {
        await this.usersService.addLoyaltyPoints(order.userId.toString(), earnedPoints);
      }
    }

    return order.save();
  }

  async requestCancel(id: string, userId: string, reason: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.userId.toString() !== userId) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('Không thể hủy đơn hàng ở trạng thái này');
    }

    order.status = 'cancel_requested';
    order.cancelReason = reason;
    return order.save();
  }

  async confirmPayment(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus: 'paid' },
      { new: true },
    );
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async getOrderStatusById(id: string): Promise<{ status: string; paymentStatus: string }> {
    const order = await this.orderModel.findById(id).select('status paymentStatus');
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return { status: order.status, paymentStatus: order.paymentStatus };
  }

  async getDailyStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTotalStats() {
    const [result] = await this.orderModel.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    return result || { totalRevenue: 0, totalOrders: 0 };
  }

  async countByStatus(status: string): Promise<number> {
    return this.orderModel.countDocuments({ status });
  }
}
