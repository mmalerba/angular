/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form} from '../../public_api';

const noop = () => {};

describe('dynamic data patterns', () => {
  it('should create a field for property with `undefined` value', () => {
    const model = signal({data: undefined});
    const f = form(model, noop, {injector: TestBed.inject(Injector)});
    expect(f.data).not.toBe(undefined);
    expect(f.data().value()).toBe(undefined);
  });

  it('supports non-null assertions for declared fields with an optional property', () => {
    const model = signal<{data?: string}>({data: 'test'});
    const f = form(model, noop, {injector: TestBed.inject(Injector)});

    expect(f.data).not.toBeUndefined();
    expect(f.data!().value()).toBe('test');
  });

  describe('tracking', () => {
    it('should write to the right key after a move', () => {
      const data = signal([
        {name: 'Alex', counter: 0},
        {name: 'Miles', counter: 0},
      ]);
      const f = form(data, {injector: TestBed.inject(Injector)});
      const c0 = f[0].counter();
      // Swap
      data.update(([v0, v1]) => [v1, v0]);

      c0.value.set(1);
      expect(data()[0].name).toBe('Miles');
      expect(data()[0].counter).toBe(0);
      expect(data()[1].name).toBe('Alex');
      expect(data()[1].counter).toBe(1);
    });
  });
});
