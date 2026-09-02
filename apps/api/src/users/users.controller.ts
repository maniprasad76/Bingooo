import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Query('userId') userId = 'mock-user-id') {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile details' })
  updateProfile(@Body() body: { fullName?: string; phone?: string }, @Query('userId') userId = 'mock-user-id') {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get saved user addresses' })
  getAddresses(@Query('userId') userId = 'mock-user-id') {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  addAddress(@Body() body: any, @Query('userId') userId = 'mock-user-id') {
    return this.usersService.addAddress(userId, body);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  deleteAddress(@Param('id') id: string, @Query('userId') userId = 'mock-user-id') {
    return this.usersService.deleteAddress(userId, id);
  }
}
