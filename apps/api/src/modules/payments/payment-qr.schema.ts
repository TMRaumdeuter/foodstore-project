import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentQRDocument = PaymentQR & Document;

@Schema({ timestamps: true })
export class PaymentQR {
  @Prop({ required: true }) accountName: string;
  @Prop({ required: true }) bankName: string;
  @Prop({ required: true }) accountNumber: string;
  @Prop({ required: true }) qrImageUrl: string;
  @Prop({ default: true }) isActive: boolean;
}

export const PaymentQRSchema = SchemaFactory.createForClass(PaymentQR);
