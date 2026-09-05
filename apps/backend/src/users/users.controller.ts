import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private resolveUserId(req: any, fallbackQuery?: string): string {
    return req?.user?.id || fallbackQuery || 'usr-cust-1';
  }

  // ── Customer Profile & Addresses ──

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: any, @Query('userId') userId?: string) {
    return this.usersService.getProfile(this.resolveUserId(req, userId));
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile details' })
  updateProfile(
    @Req() req: any,
    @Body() body: { fullName?: string; phone?: string; avatarKey?: string },
    @Query('userId') userId?: string,
  ) {
    return this.usersService.updateProfile(this.resolveUserId(req, userId), body);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get saved user addresses' })
  getAddresses(@Req() req: any, @Query('userId') userId?: string) {
    return this.usersService.getAddresses(this.resolveUserId(req, userId));
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  addAddress(@Req() req: any, @Body() body: any, @Query('userId') userId?: string) {
    return this.usersService.addAddress(this.resolveUserId(req, userId), body);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
    @Query('userId') userId?: string,
  ) {
    return this.usersService.updateAddress(this.resolveUserId(req, userId), id, body);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  deleteAddress(@Req() req: any, @Param('id') id: string, @Query('userId') userId?: string) {
    return this.usersService.deleteAddress(this.resolveUserId(req, userId), id);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefaultAddress(@Req() req: any, @Param('id') id: string, @Query('userId') userId?: string) {
    return this.usersService.setDefaultAddress(this.resolveUserId(req, userId), id);
  }

  // ── Admin: Customers & Staff ──

  @Get('staff')
  @ApiOperation({ summary: 'List all staff users' })
  getStaffUsers() {
    return this.usersService.getStaffUsers();
  }

  @Post('staff')
  @ApiOperation({ summary: 'Create a new staff user' })
  createStaffUser(@Body() body: { name: string; email: string; role: string; password?: string }) {
    return this.usersService.createStaffUser(body);
  }

  @Patch('staff/:id')
  @ApiOperation({ summary: 'Update staff user role or status' })
  updateStaffUser(
    @Param('id') id: string,
    @Body() body: Partial<{ role: string; status: string; name: string }>,
  ) {
    return this.usersService.updateStaffUser(id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Admin list all customer records' })
  getAllCustomers(@Query('search') search?: string) {
    return this.usersService.getAllCustomers(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin get single customer details' })
  getCustomerDetail(@Param('id') id: string) {
    return this.usersService.getCustomerDetail(id);
  }
}
