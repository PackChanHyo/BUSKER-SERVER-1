import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GqlAuthAccessGuard extends AuthGuard('access') {
  async getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    return await gqlContext.getContext().req;
  }
}

export class GqlAuthRefreshGuard extends AuthGuard('refresh') {
  async getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    return await gqlContext.getContext().req;
  }

  handleRequest(err, user, info) {
    try {
      if (err || !user) {
        throw err || info;
      }
      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
