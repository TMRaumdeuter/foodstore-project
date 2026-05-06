import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ enum: ['percent', 'fixed'], required: true })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: 0 })
  minOrderAmount: number;

  @Prop()
  maxDiscount: number;

  @Prop({ default: 100 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
