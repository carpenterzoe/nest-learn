import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator'

/**
 * compilation errors appeared because we're using dependency injection
 * inside of our Guard, which wasn't instantiated in the main.ts file.

 * ! Global guards that depend on other classes must be registered
 * within a @Module context.
 */

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    // the Reflector class allows us retrieve metadata within a specific context.
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler()) // looks up metadata
    if (isPublic) {
      return true
    }
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.header('Authorization')
    return authHeader === this.configService.get('API_KEY') // best practice, 用configService
  }
}
