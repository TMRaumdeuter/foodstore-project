import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './product.schema';
import { NotFoundException } from '@nestjs/common';

const mockProduct = {
  _id: '1',
  name: 'Test Product',
  slug: 'test-product',
  categoryId: 'category1',
  basePrice: 10000,
  isAvailable: true,
  averageRating: 0,
  reviewCount: 0,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let model: any;

  beforeEach(async () => {
    const mockModel = {
      create: jest.fn().mockResolvedValue(mockProduct),
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([mockProduct]),
      countDocuments: jest.fn().mockResolvedValue(1),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = { name: 'Test Product', categoryId: 'category1', basePrice: 10000 };
      const result = await service.create(createDto as any);
      expect(model.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(model.find).toHaveBeenCalled();
      expect(result.products).toEqual([mockProduct]);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      model.populate.mockResolvedValueOnce(mockProduct);
      const result = await service.findById('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      model.populate.mockResolvedValueOnce(null);
      await expect(service.findById('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      model.findByIdAndUpdate.mockResolvedValueOnce({ ...mockProduct, name: 'Updated' });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if product not found for update', async () => {
      model.findByIdAndUpdate.mockResolvedValueOnce(null);
      await expect(service.update('2', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });
});
