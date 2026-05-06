import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(data: any): Promise<ProductDocument> {
    if (!data.slug && data.name) {
      data.slug = this.generateSlug(data.name);
    }
    return this.productModel.create(data);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    availableOnly?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: any = {};

    if (query.categoryId) {
      try {
        filter.categoryId = new Types.ObjectId(query.categoryId);
      } catch (e) {
        filter.categoryId = query.categoryId;
      }
    }
    if (query.availableOnly) filter.isAvailable = true;
    if (query.search) filter.$text = { $search: query.search };

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name slug')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug }).populate('categoryId', 'name slug');
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).populate('categoryId', 'name slug');
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async update(id: string, data: any): Promise<ProductDocument> {
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
    }
    const product = await this.productModel.findByIdAndUpdate(id, data, { new: true });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async updateRating(productId: string, avgRating: number, count: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      averageRating: avgRating,
      reviewCount: count,
    });
  }

  async delete(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy sản phẩm');
  }

  async getTopProducts(limit = 8): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isAvailable: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
  }
}
