import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ShippingAddressDto {
  @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @IsString() @IsNotEmpty() @MaxLength(20) phone!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) line1!: string;
  @IsOptional() @IsString() @MaxLength(200) line2?: string;
  @IsString() @IsNotEmpty() @MaxLength(100) city!: string;
  @IsString() @IsNotEmpty() @MaxLength(100) state!: string;
  @IsString() @IsNotEmpty() @MaxLength(12) postalCode!: string;
  @IsString() @IsNotEmpty() @MaxLength(3) country!: string;
}

export class CheckoutValidationDto {
  @IsString() @IsNotEmpty() cartId!: string;

  @IsOptional() @IsString() @MaxLength(50) couponCode?: string;

  @IsIn(['prepaid', 'cod', 'partial_cod'])
  paymentMethod!: 'prepaid' | 'cod' | 'partial_cod';

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;
}

/** Identity of the caller a cart must belong to. */
export interface CartOwner {
  userId?: string;
  sessionId?: string;
}
