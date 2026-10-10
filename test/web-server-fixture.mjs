import {Service} from '@deepseek-ai/cordis';
import {HostConnectionService} from '@deepseek-ai/dsh-client-connection';

export const fixtureConnection = {
  name:'qa-host-connection',
  // Shipped Connection injects credentials, not webServer, on its owner fiber.
  inject:[],
  apply(ctx,{isAuthenticated}) {new HostConnectionService(ctx,[],{isAuthenticated});},
};

// Register in a separate plugin fiber, as the desktop does. A root ctx.set()
// bypasses required-service checks and cannot reproduce desktop activation bugs.
export class FixtureWebServer extends Service {
  constructor(ctx, {routes = new Map()} = {}) {
    super(ctx, 'webServer');
    this.routes = routes;
  }
  register(route) {
    if (this.routes.has(route.path)) throw Error('Duplicate QA route');
    this.routes.set(route.path, route);
    return () => this.routes.delete(route.path);
  }
}
