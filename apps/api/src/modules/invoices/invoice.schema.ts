import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId;
  @Prop({ required: true }) pdfPath: string;
  @Prop({ default: () => new Date() }) generatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
