import { Controller, Get, Post, Param, Query, Res, UseGuards, Body } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('custom')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  async generateCustom(@Body() body: any, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="custom-invoice.pdf"',
    });
    this.invoicesService.createPDFStream(body, res);
  }

  @Post('generate/:orderId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  async generate(@Param('orderId') orderId: string) {
    return this.invoicesService.generate(orderId);
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.invoicesService.findByOrder(orderId);
  }

  @Get('download/:orderId')
  async download(@Param('orderId') orderId: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findByOrder(orderId);
    res.download(path.resolve(invoice.pdfPath));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.invoicesService.findAll(page, limit);
  }
}
