import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class OrderItemOption {
  @Prop() name: string;
  @Prop() choice: string;
  @Prop({ default: 0 }) extraPrice: number;
}

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true }) name: string;
  @Prop({ required: true }) price: number;
  @Prop({ required: true, min: 1 }) quantity: number;
  @Prop({ type: [OrderItemOption], default: [] }) selectedOptions: OrderItemOption[];
}

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  orderCode: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true }) subtotal: number;
  @Prop({ default: 0 }) discountAmount: number;
  @Prop({ default: 0 }) pointsUsed: number;
  @Prop({ default: 0 }) pointsDiscount: number;
  @Prop({ required: true }) totalPrice: number;
  @Prop() voucherCode: string;

  @Prop({
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled', 'cancel_requested'],
    default: 'pending',
  })
  status: string;
  
  @Prop() cancelReason: string;

  @Prop({ enum: ['cod', 'qr_transfer'], required: true })
  paymentMethod: string;

  @Prop({ enum: ['unpaid', 'paid'], default: 'unpaid' })
  paymentStatus: string;

  @Prop({ required: true }) deliveryAddress: string;
  @Prop() phone: string;
  @Prop() note: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
