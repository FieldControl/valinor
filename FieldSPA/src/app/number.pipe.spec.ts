import { NumberPipe } from './number.pipe';

describe('NumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberPipe();
    expect(pipe).toBeTruthy();
  });
});
