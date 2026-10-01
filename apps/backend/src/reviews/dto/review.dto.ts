import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ enum: ['runs_small', 'true_to_size', 'runs_large'] })
  @IsOptional()
  @IsEnum(['runs_small', 'true_to_size', 'runs_large'])
  fitFeedback?: 'runs_small' | 'true_to_size' | 'runs_large';
}

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: ['approved', 'rejected', 'pending'] })
  @IsEnum(['approved', 'rejected', 'pending'])
  status!: 'approved' | 'rejected' | 'pending';
}
