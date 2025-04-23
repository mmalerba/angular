import {signal} from '@angular/core';
import {applyEach, FieldPath, form, required, Schema} from '../public_api';

xdescribe('circular logic', () => {
  it('should not infinite loop', () => {
    type Item = {
      items: Item[];
      name: string;
    };

    const itemSchema: Schema<Item> = (p: FieldPath<Item>) => {
      required(p.name);
      applyEach(p.items, itemSchema);
      // disabled(p.other);
    };

    const f = form(signal<Item>({items: [], name: 'cat'}), itemSchema);
    expect(true).toBe(true);
  });
});
