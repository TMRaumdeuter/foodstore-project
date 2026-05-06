import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './order.schema';
import { UsersService } from '../users/users.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { ProductsService } from '../products/products.service';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;
  let mockUsersService: any;
  let mockVouchersService: any;
  let mockProductsService: any;

  beforeEach(async () => {
    mockOrderModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockUsersService = {
      addLoyaltyPoints: jest.fn().mockResolvedValue(undefined),
      useLoyaltyPoints: jest.fn().mockResolvedValue(true),
    };

    mockVouchersService = {
      validate: jest.fn(),
      useVoucher: jest.fn().mockResolvedValue(undefined),
    };

    mockProductsService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: UsersService, useValue: mockUsersService },
        { provide: VouchersService, useValue: mockVouchersService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create()', () => {
    it('should calculate subtotal correctly from product base prices', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Gà Rán',
        basePrice: 39000,
        options: [],
      });

      mockOrderModel.create.mockImplementation((data) => ({
        ...data,
        _id: 'order1',
        save: jest.fn(),
      }));

      const result = await service.create('user1', {
        items: [{ productId: 'prod1', quantity: 3 }],
        deliveryAddress: '123 Test St',
        paymentMethod: 'cod',
      });

      // 39000 * 3 = 117000
      expect(result.subtotal).toBe(117000);
      expect(result.totalPrice).toBe(117000);
    });

    it('should include option extra prices in calculation', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Pizza Hải Sản',
        basePrice: 169000,
        options: [
          {
            name: 'Kích cỡ',
            choices: [
              { label: 'Size S', extraPrice: 0 },
              { label: 'Size M', extraPrice: 60000 },
            ],
          },
        ],
      });

      mockOrderModel.create.mockImplementation((data) => ({
        ...data,
        _id: 'order1',
      }));

      const result = await service.create('user1', {
        items: [
          {
            productId: 'prod1',
            quantity: 2,
            selectedOptions: [{ name: 'Kích cỡ', choice: 'Size M' }],
          },
        ],
        deliveryAddress: '123 Test St',
        paymentMethod: 'cod',
      });

      // (169000 + 60000) * 2 = 458000
      expect(result.subtotal).toBe(458000);
    });

    it('should apply voucher discount server-side', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Burger',
        basePrice: 50000,
        options: [],
      });

      mockVouchersService.validate.mockResolvedValue({
        discount: 10000,
        voucher: { code: 'SAVE10K' },
      });

      mockOrderModel.create.mockImplementation((data) => ({
        ...data,
        _id: 'order1',
      }));

      const result = await service.create('user1', {
        items: [{ productId: 'prod1', quantity: 2 }],
        voucherCode: 'SAVE10K',
        deliveryAddress: '123 Test St',
        paymentMethod: 'cod',
      });

      // subtotal = 100000, discount = 10000
      expect(result.subtotal).toBe(100000);
      expect(result.discountAmount).toBe(10000);
      expect(result.totalPrice).toBe(90000);
      expect(mockVouchersService.useVoucher).toHaveBeenCalledWith('SAVE10K');
    });

    it('should apply loyalty points discount (1 point = 1000đ)', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Trà Đào',
        basePrice: 35000,
        options: [],
      });

      mockUsersService.useLoyaltyPoints.mockResolvedValue(true);

      mockOrderModel.create.mockImplementation((data) => ({
        ...data,
        _id: 'order1',
      }));

      const result = await service.create('user1', {
        items: [{ productId: 'prod1', quantity: 1 }],
        pointsUsed: 10,
        deliveryAddress: '123 Test St',
        paymentMethod: 'cod',
      });

      // 10 points * 1000đ = 10000đ discount
      expect(result.pointsDiscount).toBe(10000);
      expect(result.totalPrice).toBe(25000); // 35000 - 10000
    });

    it('should throw BadRequestException when insufficient loyalty points', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Pizza',
        basePrice: 100000,
        options: [],
      });

      mockUsersService.useLoyaltyPoints.mockResolvedValue(false);

      await expect(
        service.create('user1', {
          items: [{ productId: 'prod1', quantity: 1 }],
          pointsUsed: 999,
          deliveryAddress: '123 Test St',
          paymentMethod: 'cod',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should ensure final total is never negative', async () => {
      mockProductsService.findById.mockResolvedValue({
        _id: 'prod1',
        name: 'Pepsi',
        basePrice: 18000,
        options: [],
      });

      mockVouchersService.validate.mockResolvedValue({
        discount: 50000, // more than subtotal
        voucher: { code: 'BIGDISCOUNT' },
      });

      mockOrderModel.create.mockImplementation((data) => ({
        ...data,
        _id: 'order1',
      }));

      const result = await service.create('user1', {
        items: [{ productId: 'prod1', quantity: 1 }],
        voucherCode: 'BIGDISCOUNT',
        deliveryAddress: '123 Test St',
        paymentMethod: 'cod',
      });

      // max(0, 18000 - 50000) = 0
      expect(result.totalPrice).toBe(0);
    });
  });

  describe('updateStatus()', () => {
    it('should award loyalty points when order is completed', async () => {
      const mockOrder = {
        _id: 'order1',
        status: 'delivering',
        totalPrice: 250000,
        userId: { toString: () => 'user1' },
        save: jest.fn().mockResolvedValue(true),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      await service.updateStatus('order1', 'completed');

      // 250000 / 10000 = 25 points
      expect(mockUsersService.addLoyaltyPoints).toHaveBeenCalledWith('user1', 25);
      expect(mockOrder.status).toBe('completed');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const mockOrder = {
        _id: 'order1',
        status: 'pending',
        save: jest.fn(),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      // pending → completed is not allowed
      await expect(
        service.updateStatus('order1', 'completed'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transition: pending → confirmed', async () => {
      const mockOrder = {
        _id: 'order1',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      await service.updateStatus('order1', 'confirmed');

      expect(mockOrder.status).toBe('confirmed');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should allow valid status transition: preparing → delivering', async () => {
      const mockOrder = {
        _id: 'order1',
        status: 'preparing',
        save: jest.fn().mockResolvedValue(true),
      };
      mockOrderModel.findById.mockResolvedValue(mockOrder);

      await service.updateStatus('order1', 'delivering');

      expect(mockOrder.status).toBe('delivering');
    });
  });
});
