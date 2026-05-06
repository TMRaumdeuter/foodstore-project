import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'apps/api/uploads'),
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        console.log('Tải ảnh lên:', file.originalname);
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Chỉ hỗ trợ ảnh JPG, PNG, GIF, WEBP'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      console.error('Không nhận được file');
      throw new Error('Không nhận được file');
    }
    console.log('Tải ảnh thành công:', file.filename);
    return { url: `/uploads/${file.filename}`, filename: file.filename };
  }
}
