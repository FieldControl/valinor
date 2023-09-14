import { GithubDatePipe } from './github-date.pipe';

describe('GithubDatePipe', () => {
  it('create an instance', () => {
    const pipe = new GithubDatePipe();
    expect(pipe).toBeTruthy();
  });
});
