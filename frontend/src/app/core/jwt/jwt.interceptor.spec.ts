import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  it('should be defined', () => {
    expect(new JwtInterceptor()).toBeDefined();
  });
});
