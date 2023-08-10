import { MaxLengthPipe } from './max-length.pipe';

describe('MaxLengthPipe', () => {
  it('create an instance', () => {
    const pipe = new MaxLengthPipe();
    expect(pipe).toBeTruthy();
  });
});
