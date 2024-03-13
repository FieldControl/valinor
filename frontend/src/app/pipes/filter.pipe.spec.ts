import { FilterPipe } from './filter.pipe';

describe('FiltroPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should filter items based on term', () => {
    const items = [
      { title: 'Apple' },
      { title: 'Banana' },
      { title: 'Orange' }
    ];

    const term = 'Banana';
    const filteredItems = pipe.transform(items, term);

    expect(filteredItems.length).toBe(1);
    expect(filteredItems[0].title).toBe('Banana');
  });

  it('should return all items if term is empty', () => {
    const items = [
      { title: 'Apple' },
      { title: 'Banana' },
      { title: 'Orange' }
    ];

    const term = '';
    const filteredItems = pipe.transform(items, term);

    expect(filteredItems.length).toBe(items.length);
  });

  it('should return all items if items array is empty', () => {
    const items: any[] = [];
    const term = 'Banana';
    const filteredItems = pipe.transform(items, term);

    expect(filteredItems.length).toBe(0);
  });
});
