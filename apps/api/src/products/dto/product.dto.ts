import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, MaxLength, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categorySlug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() collectionSlug?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sizes?: string; // comma-separated
  @ApiPropertyOptional() @IsOptional() @IsString() colors?: string; // comma-separated
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['draft', 'active', 'archived']) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() customizable?: boolean;
  @ApiPropertyOptional({ default: 'newest' }) @IsOptional() @IsString() sort?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 12 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
}

export class CreateProductDto {
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiProperty() @IsString() @MaxLength(200) slug!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) basePrice!: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) compareAtPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() customizationEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['draft', 'active', 'archived']) status?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) basePrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) compareAtPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() customizationEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['draft', 'active', 'archived']) status?: string;
}

export class CreateVariantDto {
  @ApiProperty() @IsString() sku!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() size?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorHex?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) price!: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) stockQuantity!: number;
}
