import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Order' }) orderId: Types.ObjectId;
  @Prop({ required: true, min: 1, max: 5 }) rating: number;
  @Prop({ trim: true }) comment: string;
  @Prop({ type: [String], default: [] }) images: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1, orderId: 1 });
