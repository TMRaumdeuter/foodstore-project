import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(data: Partial<Category>): Promise<CategoryDocument> {
    return this.categoryModel.create(data);
  }

  async findAll(activeOnly = false): Promise<CategoryDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.categoryModel.find(filter).sort({ order: 1, name: 1 });
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findOne({ slug });
    if (!cat) throw new NotFoundException('Không tìm thấy danh mục');
    return cat;
  }

  async update(id: string, data: Partial<Category>): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findByIdAndUpdate(id, data, { new: true });
    if (!cat) throw new NotFoundException('Không tìm thấy danh mục');
    return cat;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy danh mục');
  }
}
