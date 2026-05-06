import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import { Product, ProductDocument } from '../products/product.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Personalized recommendations based on user purchase history.
   * Strategy:
   * 1. Find categories user frequently orders from
   * 2. Recommend un-ordered products from those categories
   * 3. Collaborative: find what other users who bought same products also bought
   * 4. Fallback: top-rated products
   */
  async getPersonalized(userId: string, limit = 8): Promise<ProductDocument[]> {
    // Step 1: Get user's completed orders
    const userOrders = await this.orderModel
      .find({ userId, status: { $ne: 'cancelled' } })
      .select('items')
      .lean();

    if (!userOrders.length) {
      return this.getPopular(limit);
    }

    // Step 2: Extract product IDs user has ordered
    const orderedProductIds = new Set<string>();
    for (const order of userOrders) {
      for (const item of order.items) {
        orderedProductIds.add(item.productId.toString());
      }
    }

    // Step 3: Get categories of ordered products
    const orderedProducts = await this.productModel
      .find({ _id: { $in: Array.from(orderedProductIds) } })
      .select('categoryId')
      .lean();

    const categoryFreq = new Map<string, number>();
    for (const p of orderedProducts) {
      const catId = p.categoryId.toString();
      categoryFreq.set(catId, (categoryFreq.get(catId) || 0) + 1);
    }

    // Sort categories by frequency
    const topCategories = [...categoryFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId]) => new Types.ObjectId(catId));

    // Step 4: Find products from top categories that user hasn't ordered
    const recommendations = await this.productModel
      .find({
        categoryId: { $in: topCategories },
        _id: { $nin: Array.from(orderedProductIds).map(id => new Types.ObjectId(id)) },
        isAvailable: true,
      })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();

    // Step 5: If not enough, fill with collaborative filtering
    if (recommendations.length < limit) {
      const collaborativeRecs = await this.getCollaborative(
        Array.from(orderedProductIds),
        userId,
        limit - recommendations.length,
      );
      recommendations.push(...collaborativeRecs);
    }

    // Step 6: If still not enough, fill with popular
    if (recommendations.length < limit) {
      const existingIds = new Set([
        ...orderedProductIds,
        ...recommendations.map(r => r._id.toString()),
      ]);
      const popular = await this.productModel
        .find({
          _id: { $nin: Array.from(existingIds).map(id => new Types.ObjectId(id)) },
          isAvailable: true,
        })
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(limit - recommendations.length)
        .lean();
      recommendations.push(...popular);
    }

    return recommendations as any;
  }

  /**
   * Collaborative filtering: find other users who bought same products,
   * then recommend what they also bought.
   */
  private async getCollaborative(
    orderedProductIds: string[],
    currentUserId: string,
    limit: number,
  ): Promise<any[]> {
    // Find other users who also ordered these products
    const similarOrders = await this.orderModel
      .find({
        userId: { $ne: currentUserId },
        'items.productId': { $in: orderedProductIds.map(id => new Types.ObjectId(id)) },
        status: { $ne: 'cancelled' },
      })
      .select('items')
      .limit(50)
      .lean();

    // Count product frequency from similar users
    const productFreq = new Map<string, number>();
    for (const order of similarOrders) {
      for (const item of order.items) {
        const pid = item.productId.toString();
        if (!orderedProductIds.includes(pid)) {
          productFreq.set(pid, (productFreq.get(pid) || 0) + 1);
        }
      }
    }

    const topProductIds = [...productFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pid]) => new Types.ObjectId(pid));

    if (!topProductIds.length) return [];

    return this.productModel
      .find({ _id: { $in: topProductIds }, isAvailable: true })
      .sort({ averageRating: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Popular/top-rated products (public fallback).
   */
  async getPopular(limit = 8): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isAvailable: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit) as any;
  }
}
