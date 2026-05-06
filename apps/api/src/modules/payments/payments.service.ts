import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentQR, PaymentQRDocument } from './payment-qr.schema';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(PaymentQR.name) private qrModel: Model<PaymentQRDocument>) {}

  async create(data: Partial<PaymentQR>): Promise<PaymentQRDocument> {
    return this.qrModel.create(data);
  }

  async findAll(): Promise<PaymentQRDocument[]> {
    return this.qrModel.find().sort({ createdAt: -1 });
  }

  async findActive(): Promise<PaymentQRDocument[]> {
    return this.qrModel.find({ isActive: true });
  }

  async update(id: string, data: Partial<PaymentQR>): Promise<PaymentQRDocument> {
    const qr = await this.qrModel.findByIdAndUpdate(id, data, { new: true });
    if (!qr) throw new NotFoundException('Không tìm thấy mã QR');
    return qr;
  }

  async delete(id: string): Promise<void> {
    const result = await this.qrModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy mã QR');
  }
}
