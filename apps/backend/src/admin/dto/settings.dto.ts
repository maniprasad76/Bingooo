import { IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Allow-listed store settings. Anything not declared here is rejected by the
 * global ValidationPipe (whitelist + forbidNonWhitelisted), so the settings
 * object can no longer be extended with arbitrary keys.
 */
export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(120) store_name?: string;
  @IsOptional() @IsEmail() store_email?: string;
  @IsOptional() @IsString() @MaxLength(30) store_phone?: string;
  @IsOptional() @IsString() @MaxLength(120) support_hours?: string;
  @IsOptional() @IsIn(['INR']) currency?: string;

  @IsOptional() @IsBoolean() gst_enabled?: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100) tax_rate_percentage?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) max_upload_size_mb?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(365) return_window_days?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(90) dtg_print_lead_days?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) prepaid_discount_percentage?: number;

  // Shipping is always free. Admin builds deployed before that change still
  // send these two keys back; accept them so saving settings doesn't 400, and
  // AdminService.updateSettings drops them.
  @IsOptional() @IsNumber() shipping_fee_default?: number;
  @IsOptional() @IsNumber() free_shipping_threshold?: number;
}
