import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class InvoicesService {
  private invoiceDir: string;

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {
    this.invoiceDir = this.configService.get('INVOICE_DIR', './invoices');
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  async generate(orderId: string): Promise<InvoiceDocument> {
    const order = await this.ordersService.findById(orderId);
    const fileName = `invoice-${order.orderCode}.pdf`;
    const filePath = path.join(this.invoiceDir, fileName);

    await this.createPDF(order, filePath);

    const invoice = await this.invoiceModel.create({
      orderId,
      pdfPath: filePath,
    });

    return invoice;
  }

  async findByOrder(orderId: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findOne({ orderId });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');
    return invoice;
  }

  async findAll(page = 1, limit = 20) {
    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find()
        .populate('orderId', 'orderCode totalPrice status')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ generatedAt: -1 }),
      this.invoiceModel.countDocuments(),
    ]);
    return { invoices, total, page, totalPages: Math.ceil(total / limit) };
  }

  private createPDF(order: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      this.createPDFStream(order, stream);
    });
  }

  createPDFStream(order: any, stream: NodeJS.WritableStream): void {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Use a font that supports Vietnamese
    const fontPath = 'C:\\Windows\\Fonts\\Arial.ttf';
    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    }

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('FOODSTORE', { align: 'center' });
    doc.fontSize(12).text('HÓA ĐƠN BÁN HÀNG', { align: 'center' });
    doc.moveDown();

    // Order info
    doc.fontSize(10);
    doc.text(`Mã đơn: ${order.orderCode || 'Tùy chỉnh'}`);
    doc.text(`Ngày: ${new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}`);
    doc.text(`Khách hàng: ${order.customerName || order.userId?.name || 'N/A'}`);
    doc.text(`Địa chỉ: ${order.deliveryAddress || ''}`);
    doc.moveDown();

    // Items table
    doc.fontSize(10).text('STT', 50, doc.y, { width: 30 });
    doc.text('Sản phẩm', 80, doc.y - 12, { width: 200 });
    doc.text('SL', 280, doc.y - 12, { width: 40 });
    doc.text('Đơn giá', 320, doc.y - 12, { width: 80 });
    doc.text('Thành tiền', 400, doc.y - 12, { width: 100 });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any, index: number) => {
        const y = doc.y;
        doc.text(`${index + 1}`, 50, y, { width: 30 });
        doc.text(item.name || '', 80, y, { width: 200 });
        doc.text(`${item.quantity || 1}`, 280, y, { width: 40 });
        const price = item.price || 0;
        doc.text(`${price.toLocaleString('vi-VN')}đ`, 320, y, { width: 80 });
        const lineTotal = price * (item.quantity || 1);
        doc.text(`${lineTotal.toLocaleString('vi-VN')}đ`, 400, y, { width: 100 });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const subtotal = order.subtotal || 0;
    doc.text(`Tạm tính: ${subtotal.toLocaleString('vi-VN')}đ`, { align: 'right' });
    if (order.discountAmount > 0) {
      doc.text(`Giảm giá: -${order.discountAmount.toLocaleString('vi-VN')}đ`, { align: 'right' });
    }
    if (order.pointsDiscount > 0) {
      doc.text(`Điểm thưởng (-${order.pointsUsed || 0} điểm): -${order.pointsDiscount.toLocaleString('vi-VN')}đ`, { align: 'right' });
    }
    const total = order.totalPrice || 0;
    doc.fontSize(14).text(`TỔNG: ${total.toLocaleString('vi-VN')}đ`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).text('Cảm ơn quý khách!', { align: 'center' });

    doc.end();
  }
}
