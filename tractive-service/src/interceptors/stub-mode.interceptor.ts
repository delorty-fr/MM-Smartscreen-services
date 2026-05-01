import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { StubModeService } from '../config/stub-mode.service';
import { StubDataProvider } from '../config/stub-data-provider';

/**
 * Interceptor to provide stub data when stub mode is enabled
 * This interceptor intercepts all responses except command endpoints
 */
@Injectable()
export class StubModeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(StubModeInterceptor.name);

  constructor(
    private readonly stubModeService: StubModeService,
    private readonly stubDataProvider: StubDataProvider,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;
    const method = request.method;

    // Check if this route should be stubbed
    if (!this.stubModeService.shouldStubRoute(path)) {
      return next.handle();
    }

    // Get stub data and return it immediately
    const stubData = this.stubDataProvider.getStubData(path, method);
    this.logger.debug(`Returning stub data for ${method} ${path}`);

    // Return stub data wrapped in the API response format
    return new Observable((observer) => {
      observer.next({
        status: 200,
        data: stubData,
        message: 'STUB_MODE: Mock data returned',
      });
      observer.complete();
    });
  }
}
