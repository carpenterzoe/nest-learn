import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Let's image that for some reason we want to retrieve
 * the 'request.protocol' from within the route handler.
 *
 * Normally we would need to inject the entire Request object with the @Req() decorator into the method definition.
 * However this makes this particular method harder to test
 * since we would need to mock the entire Request object every time we try to test this method.
 *
 * In order to make our code more readable and easier to test,
 * let's create a custom param decorator instead.
 */
export const Protocol = createParamDecorator(
  (defaultValue: string, ctx: ExecutionContext) => {
    console.log({ defaultValue })
    const request = ctx.switchToHttp().getRequest()
    return request.protocol
  }
)
