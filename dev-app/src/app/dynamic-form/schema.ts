import type {Signal} from '@angular/core';
import {
  aggregateMetadata,
  applyEach,
  applyWhenValue,
  maxLength,
  minLength,
  reducedMetadataKey,
  required,
  schema,
  type FieldPath,
} from '@angular/forms/signals';
import {extractInitial, type DynamicModel} from './model';
import {
  assertArrayFieldSpec,
  assertTerminalFieldSpec,
  lookupFieldSpec,
  type FieldSpec,
} from './spec';

// TODO: figure out what's up with `createMetadataKey`
export const LABEL = reducedMetadataKey(
  (_, next: string) => next,
  () => '',
);
export const ARRAY_ITEM_TEMPLATE = reducedMetadataKey(
  (_: DynamicModel | undefined, next: DynamicModel) => next,
  () => undefined,
);

// 🔪 Complex recursive schema.
export function createSchema(spec: Signal<FieldSpec>) {
  const dynamicSchema = schema((p: FieldPath<DynamicModel>) => {
    aggregateMetadata(p, LABEL, ({pathKeys}) => pathKeys()[pathKeys().length - 1] ?? '<root>');
    applyWhenValue(
      p,
      (v) => v === null || typeof v !== 'object',
      (terminal) => {
        required(terminal, {
          when: ({pathKeys}) => {
            const s = lookupFieldSpec(spec(), pathKeys());
            assertTerminalFieldSpec(s);
            return s.validation.required;
          },
        });
      },
    );
    applyWhenValue(
      p,
      (v) => Array.isArray(v),
      (array) => {
        minLength(array, ({pathKeys}) => {
          const s = lookupFieldSpec(spec(), pathKeys());
          assertArrayFieldSpec(s);
          return s.validation.minLength;
        });
        maxLength(array, ({pathKeys}) => {
          const s = lookupFieldSpec(spec(), pathKeys());
          assertArrayFieldSpec(s);
          return s.validation.maxLength;
        });
        aggregateMetadata(array, ARRAY_ITEM_TEMPLATE, ({pathKeys}) => {
          const s = lookupFieldSpec(spec(), pathKeys());
          assertArrayFieldSpec(s);
          return extractInitial(s.template);
        });
      },
    );
    applyWhenValue(
      p,
      (v) => v !== null && typeof v === 'object',
      (groupOrArray) => {
        applyEach(groupOrArray, dynamicSchema);
      },
    );
  });
  return dynamicSchema;
}
