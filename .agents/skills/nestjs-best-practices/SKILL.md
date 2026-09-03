---
name: nestjs-best-practices
description: Expert guidance for developing robust, scalable NestJS backend APIs. Use when creating or modifying NestJS controllers, services, modules, guards, DTOs, interceptors, exception filters, or database integrations.
---

# NestJS Best Practices & Architecture Skill

> **North Star:** Modular, maintainable, type-safe enterprise TypeScript backend architecture following standard NestJS design patterns.

---

## 1. Architectural Layers & Separation of Concerns

1. **Controllers (`*.controller.ts`)**:
   - Sole responsibility is request routing, parameter extraction, and invoking services.
   - Never write database queries or business algorithms directly in controllers.
   - Annotate all endpoints with `@ApiOperation()`, `@ApiResponse()`, and `@ApiBearerAuth()` for OpenAPI/Swagger documentation.

2. **Services (`*.service.ts`)**:
   - Houses domain business logic, data manipulation, validation rules, and third-party API orchestrations.
   - Use dependency injection for database repositories, configuration, and auxiliary services.
   - Return clean, typed domain models or data transfer objects.

3. **Data Transfer Objects (DTOs) (`dto/*.dto.ts`)**:
   - Define exact request and response schemas using TypeScript classes.
   - Annotate fields with `class-validator` decorators (`@IsString()`, `@IsNumber()`, `@IsOptional()`, `@Min()`, `@Length()`).
   - Use `class-transformer` for type coercion (`@Type(() => Number)`).

4. **Guards (`common/guards/*.guard.ts`)**:
   - Implement `CanActivate` to verify authentication tokens (JWT) and evaluate user permissions/roles.
   - Attach metadata using custom decorators (e.g. `@Permissions('orders.read')`, `@Roles('Admin')`).

5. **Exception Filters (`common/filters/*.filter.ts`)**:
   - Capture uncaught exceptions and format them into consistent API responses:
     ```json
     {
       "success": false,
       "error": {
         "code": "BAD_REQUEST",
         "message": "Detailed user-friendly error message",
         "details": {}
       },
       "requestId": "req-12345"
     }
     ```

6. **Interceptors (`common/interceptors/*.interceptor.ts`)**:
   - Transform outgoing successful responses into standard format (`{ success: true, data: ... }`).
   - Measure execution latency and inject audit trace IDs.

---

## 2. Dependency Injection & Module Hygiene

- Always register providers in their originating module's `providers: [...]` and expose shared services via `exports: [...]`.
- Keep modules cohesive and domain-bounded (`orders.module.ts`, `products.module.ts`, `customizations.module.ts`).
- Use `@Injectable()` on all services, repositories, and helper classes.
- Avoid tight coupling: inject interfaces or abstract services where practical.

---

## 3. Asynchronous Execution & Error Handling

- Always use `async/await` instead of raw callbacks or floating promises.
- Throw appropriate built-in NestJS HTTP exceptions:
  - `NotFoundException` (404)
  - `BadRequestException` (400)
  - `UnauthorizedException` (401)
  - `ForbiddenException` (403)
  - `ConflictException` (409)
  - `InternalServerErrorException` (500)
- Ensure all database transactions are wrapped in atomic rollback blocks when mutating multiple tables.
