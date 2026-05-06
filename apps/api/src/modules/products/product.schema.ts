import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductOptionChoice {
  @Prop({ required: true })
  label: string;

  @Prop({ default: 0 })
  extraPrice: number;
}

@Schema()
export class ProductOption {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [ProductOptionChoice] })
  choices: ProductOptionChoice[];
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ProductOption], default: [] })
  options: ProductOption[];

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
