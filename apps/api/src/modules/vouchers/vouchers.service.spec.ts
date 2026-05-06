import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VouchersService } from './vouchers.service';
import { Voucher } from './voucher.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('VouchersService', () => {
  let service: VouchersService;
  let mockVoucherModel: any;

  const createMockVoucher = (overrides = {}) => ({
    code: 'SAVE20',
    discountType: 'percent',
    discountValue: 20,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    usageLimit: 100,
    usedCount: 0,
    expiresAt: new Date(Date.now() + 86400000), // tomorrow
    isActive: true,
    ...overrides,
  });

  beforeEach(async () => {
    mockVoucherModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: getModelToken(Voucher.name), useValue: mockVoucherModel },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
  });

  describe('validate()', () => {
    it('should apply fixed discount correctly', async () => {
      const voucher = createMockVoucher({
        code: 'FLAT30K',
        discountType: 'fixed',
        discountValue: 30000,
        minOrderAmount: 50000,
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      const result = await service.validate('FLAT30K', 200000);

      expect(result.discount).toBe(30000);
      expect(result.voucher).toBeDefined();
    });

    it('should apply percentage discount correctly', async () => {
      const voucher = createMockVoucher({
        discountType: 'percent',
        discountValue: 10,
        maxDiscount: undefined,
        minOrderAmount: 0,
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      const result = await service.validate('SAVE20', 200000);

      expect(result.discount).toBe(20000); // 10% of 200000
    });

    it('should cap percentage discount at maxDiscount', async () => {
      const voucher = createMockVoucher({
        discountType: 'percent',
        discountValue: 50, // 50%
        maxDiscount: 30000,
        minOrderAmount: 0,
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      const result = await service.validate('SAVE20', 200000);

      // 50% of 200000 = 100000, but capped at 30000
      expect(result.discount).toBe(30000);
    });

    it('should throw NotFoundException for non-existent voucher', async () => {
      mockVoucherModel.findOne.mockResolvedValue(null);

      await expect(service.validate('NONEXIST', 100000)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for inactive voucher', async () => {
      const voucher = createMockVoucher({ isActive: false });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      await expect(service.validate('SAVE20', 200000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired voucher', async () => {
      const voucher = createMockVoucher({
        expiresAt: new Date(Date.now() - 86400000), // yesterday
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      await expect(service.validate('SAVE20', 200000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when order is below minOrderAmount', async () => {
      const voucher = createMockVoucher({ minOrderAmount: 500000 });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      await expect(service.validate('SAVE20', 100000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when usage limit is exceeded', async () => {
      const voucher = createMockVoucher({
        usageLimit: 10,
        usedCount: 10,
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      await expect(service.validate('SAVE20', 200000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should round discount to nearest integer', async () => {
      const voucher = createMockVoucher({
        discountType: 'percent',
        discountValue: 33,
        maxDiscount: undefined,
        minOrderAmount: 0,
      });
      mockVoucherModel.findOne.mockResolvedValue(voucher);

      const result = await service.validate('SAVE20', 100001);

      // 33% of 100001 = 33000.33 → rounded to 33000
      expect(result.discount).toBe(Math.round(100001 * 33 / 100));
    });
  });

  describe('useVoucher()', () => {
    it('should increment usedCount by 1', async () => {
      mockVoucherModel.findOneAndUpdate.mockResolvedValue({});

      await service.useVoucher('SAVE20');

      expect(mockVoucherModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'SAVE20' },
        { $inc: { usedCount: 1 } },
      );
    });
  });
});
