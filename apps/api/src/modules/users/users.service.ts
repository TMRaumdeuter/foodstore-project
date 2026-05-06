import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }
    return this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async findAll(query: { page?: number; limit?: number; role?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: any = {};
    if (query.role) filter.role = query.role;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password');
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async addLoyaltyPoints(userId: string, points: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: points },
    });
  }

  async useLoyaltyPoints(userId: string, points: number): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || user.loyaltyPoints < points) return false;
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: -points },
    });
    return true;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy người dùng');
  }

  async countByRole(): Promise<Record<string, number>> {
    const results = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    return results.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
  }
}
