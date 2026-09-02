import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty() @IsString() variantId!: string;
  @ApiProperty({ default: 1 }) @Type(() => Number) @IsNumber() @Min(1) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() customizationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sessionId?: string;
}

export class UpdateCartItemDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(1) quantity!: number;
}

export class MergeCartDto {
  @ApiProperty() @IsString() guestSessionId!: string;
}
