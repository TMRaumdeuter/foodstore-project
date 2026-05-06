import { IsString, IsArray, IsOptional, IsNumber, IsEnum, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SelectedOptionDto {
  @IsString()
  name: string;

  @IsString()
  choice: string;

  @IsNumber()
  extraPrice: number;
}

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  selectedOptions?: SelectedOptionDto[];
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(['cod', 'qr_transfer'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsUsed?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
