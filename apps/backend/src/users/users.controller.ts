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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Customer Profile & Addresses (Strictly Isolated to Authenticated User) ──

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateProfile(
    @Req() req: any,
    @Body() body: { fullName?: string; phone?: string; avatarKey?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Delete('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete user account and personal data (App Store 5.1.1(v) compliance)' })
  deleteProfile(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }

  @Get('addresses')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user saved addresses' })
  getAddresses(@Req() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('addresses')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add address for authenticated user' })
  addAddress(@Req() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.id, body);
  }

  @Put('addresses/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user address' })
  updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateAddress(req.user.id, id, body);
  }

  @Delete('addresses/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete authenticated user address' })
  deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  @Patch('addresses/:id/default')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set default address for authenticated user' })
  setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(req.user.id, id);
  }

  // ── Admin: Customers & Staff (Guarded by RBAC) ──

  @Get('staff')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('staff.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all staff users (Staff Manager only)' })
  getStaffUsers() {
    return this.usersService.getStaffUsers();
  }

  @Post('staff')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('staff.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new staff user (Staff Manager only)' })
  createStaffUser(@Body() body: { name: string; email: string; role: string; password?: string }) {
    return this.usersService.createStaffUser(body);
  }

  @Patch('staff/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('staff.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff user role or status (Staff Manager only)' })
  updateStaffUser(
    @Param('id') id: string,
    @Body() body: Partial<{ role: string; status: string; name: string }>,
  ) {
    return this.usersService.updateStaffUser(id, body);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('users.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all customer records (Admin only)' })
  getAllCustomers(@Query('search') search?: string) {
    return this.usersService.getAllCustomers(search);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('users.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get single customer details (Admin only)' })
  getCustomerDetail(@Param('id') id: string) {
    return this.usersService.getCustomerDetail(id);
  }
}

