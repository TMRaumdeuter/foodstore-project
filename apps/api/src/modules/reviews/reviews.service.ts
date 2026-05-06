import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, data: any): Promise<ReviewDocument> {
    const review = await this.reviewModel.create({ ...data, userId });
    await this.recalculateProductRating(data.productId);
    return review;
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ productId })
        .populate('userId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.reviewModel.countDocuments({ productId }),
    ]);
    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find()
        .populate('userId', 'name email')
        .populate('productId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.reviewModel.countDocuments(),
    ]);
    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByUser(userId: string) {
    return this.reviewModel
      .find({ userId })
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 });
  }

  async delete(id: string): Promise<void> {
    const review = await this.reviewModel.findByIdAndDelete(id);
    if (!review) throw new NotFoundException('Không tìm thấy đánh giá');
    await this.recalculateProductRating(review.productId.toString());
  }

  private async recalculateProductRating(productId: string): Promise<void> {
    const [result] = await this.reviewModel.aggregate([
      { $match: { productId: new (require('mongoose').Types.ObjectId)(productId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const avg = result ? Math.round(result.avg * 10) / 10 : 0;
    const count = result ? result.count : 0;
    await this.productsService.updateRating(productId, avg, count);
  }
}
