import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voucher, VoucherDocument } from './voucher.schema';

@Injectable()
export class VouchersService {
  constructor(@InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>) {}

  async create(data: Partial<Voucher>): Promise<VoucherDocument> {
    return this.voucherModel.create(data);
  }

  async findAll(): Promise<VoucherDocument[]> {
    return this.voucherModel.find().sort({ createdAt: -1 });
  }

  async findActive(): Promise<VoucherDocument[]> {
    return this.voucherModel.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    }).sort({ createdAt: -1 });
  }

  async validate(code: string, orderTotal: number) {
    const voucher = await this.voucherModel.findOne({ code: code.toUpperCase() });
    if (!voucher) throw new NotFoundException('Mã giảm giá không tồn tại');
    if (!voucher.isActive) throw new BadRequestException('Mã giảm giá đã hết hiệu lực');
    if (voucher.expiresAt < new Date()) throw new BadRequestException('Mã giảm giá đã hết hạn');
    if (voucher.usedCount >= voucher.usageLimit) throw new BadRequestException('Mã đã hết lượt sử dụng');
    if (orderTotal < voucher.minOrderAmount) {
      throw new BadRequestException(`Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString()}đ`);
    }

    let discount = voucher.discountType === 'percent'
      ? (orderTotal * voucher.discountValue) / 100
      : voucher.discountValue;

    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }

    return { discount: Math.round(discount), voucher };
  }

  async useVoucher(code: string): Promise<void> {
    await this.voucherModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
    );
  }

  async update(id: string, data: Partial<Voucher>): Promise<VoucherDocument> {
    const voucher = await this.voucherModel.findByIdAndUpdate(id, data, { new: true });
    if (!voucher) throw new NotFoundException('Không tìm thấy mã giảm giá');
    return voucher;
  }

  async delete(id: string): Promise<void> {
    const result = await this.voucherModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy mã giảm giá');
  }
}
