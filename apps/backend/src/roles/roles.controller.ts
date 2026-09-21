import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

// RBAC configuration itself — every route here must be staff-only.
// Left open, anyone could create a role with permissions: ['*'] or rewrite
// the permission set of roles real staff already hold.
@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard, RolesGuard)
@Permissions('roles.manage')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles and permission assignments' })
  getRoles() {
    return this.rolesService.getRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all granular permission definitions' })
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role definition' })
  createRole(@Body() body: { name: string; description: string; permissions: string[] }) {
    return this.rolesService.createRole(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role permissions or details' })
  updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.rolesService.updateRole(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom role' })
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
