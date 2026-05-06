import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.reviewsService.findByProduct(productId, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueName = `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Chỉ hỗ trợ ảnh JPG, PNG, GIF, WEBP'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    }),
  )
  async create(
    @Request() req: any,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const images = files?.map(f => `/uploads/${f.filename}`) || [];
    return this.reviewsService.create(req.user.userId, {
      ...body,
      rating: Number(body.rating),
      images,
    });
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req: any) {
    return this.reviewsService.findByUser(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.reviewsService.findAll(page, limit);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
