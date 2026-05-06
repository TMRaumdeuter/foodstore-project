import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    };

    // Chain .select() for findById
    mockUserModel.findById.mockReturnValue({
      select: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('addLoyaltyPoints()', () => {
    it('should increment loyalty points by the given amount', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});

      await service.addLoyaltyPoints('user123', 15);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $inc: { loyaltyPoints: 15 },
      });
    });

    it('should handle adding 0 points', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});

      await service.addLoyaltyPoints('user123', 0);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $inc: { loyaltyPoints: 0 },
      });
    });
  });

  describe('useLoyaltyPoints()', () => {
    it('should deduct points and return true when user has enough points', async () => {
      mockUserModel.findById.mockResolvedValue({ loyaltyPoints: 500 });
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.useLoyaltyPoints('user123', 200);

      expect(result).toBe(true);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $inc: { loyaltyPoints: -200 },
      });
    });

    it('should return false when user has insufficient points', async () => {
      mockUserModel.findById.mockResolvedValue({ loyaltyPoints: 100 });

      const result = await service.useLoyaltyPoints('user123', 500);

      expect(result).toBe(false);
      expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return false when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.useLoyaltyPoints('nonexistent', 10);

      expect(result).toBe(false);
    });

    it('should succeed when using exact amount of available points (edge case)', async () => {
      mockUserModel.findById.mockResolvedValue({ loyaltyPoints: 300 });
      mockUserModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.useLoyaltyPoints('user123', 300);

      expect(result).toBe(true);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $inc: { loyaltyPoints: -300 },
      });
    });
  });

  describe('create()', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'dup@test.com' });

      await expect(
        service.create({ name: 'Test', email: 'dup@test.com', password: 'hashed' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user when email is unique', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const userData = { name: 'New User', email: 'new@test.com', password: 'hashed' };
      mockUserModel.create.mockResolvedValue(userData);

      const result = await service.create(userData);

      expect(result).toEqual(userData);
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('findById()', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user without password', async () => {
      const user = { _id: 'user123', name: 'Test', email: 'test@test.com' };
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      const result = await service.findById('user123');

      expect(result).toEqual(user);
      expect(mockUserModel.findById('user123').select).toHaveBeenCalledWith('-password');
    });
  });
});
