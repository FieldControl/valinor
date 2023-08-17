import { GetLastUpdateRepoPipe } from './get-last-update-repo.pipe';

describe('GetLastUpdateRepoPipe', () => {
  let pipe: GetLastUpdateRepoPipe;

  beforeEach(() => {
    pipe = new GetLastUpdateRepoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Updated now" for recent update', () => {
    const recentUpdate = new Date().toISOString();
    expect(pipe.transform(recentUpdate)).toBe('Updated now');
  });

  it('should return correct string for update less than an hour ago', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000).toISOString();
    expect(pipe.transform(oneMinuteAgo)).toBe('Updated 1 minute ago');
  });

  it('should return correct string for update less than a day ago', () => {
    const now = new Date();
    const oneHourAgo = new Date(
      now.getTime() - 1 * 60 * 60 * 1000
    ).toISOString();
    expect(pipe.transform(oneHourAgo)).toBe('Updated 1 hour ago');
  });

  it('should return "Updated yesterday" for update less than two days ago', () => {
    const now = new Date();
    const oneDayAgo = new Date(
      now.getTime() - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(pipe.transform(oneDayAgo)).toBe('Updated yesterday');
  });

  it('should return correct string for update more than two days ago', () => {
    const now = new Date();
    const threeDaysAgo = new Date(
      now.getTime() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(pipe.transform(threeDaysAgo)).toBe('Updated 3 days ago');
  });
});
