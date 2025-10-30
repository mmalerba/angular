import type {Signal} from '@angular/core';
import {
  aggregateMetadata,
  applyEach,
  applyWhenValue,
  latestMetadataKey,
  required,
  schema,
  type FieldPath,
} from '@angular/forms/signals';
import type {DynamicModel} from './model';
import {assertTerminalFieldSpec, lookupFieldSpec, type FieldSpec} from './spec';

export const LABEL = latestMetadataKey('');

export function createSchema(spec: Signal<FieldSpec>) {
  const dynamicSchema = schema((p: FieldPath<DynamicModel>) => {
    applyWhenValue(
      p,
      (v) => typeof v === 'object' && !Array.isArray(v),
      (group) => {
        aggregateMetadata(
          group,
          LABEL,
          ({pathKeys}) => pathKeys()[pathKeys().length - 1] ?? '<root>',
        );
        applyEach(group, dynamicSchema);
      },
    );
    applyWhenValue(
      p,
      (v) => typeof v !== 'object',
      (terminal) => {
        aggregateMetadata(
          terminal,
          LABEL,
          ({pathKeys}) => pathKeys()[pathKeys().length - 1] ?? '<root>',
        );
        required(terminal, {
          when: ({pathKeys}) => {
            const s = lookupFieldSpec(spec(), pathKeys());
            assertTerminalFieldSpec(s);
            return s.validation.required;
          },
        });
      },
    );
  });
  return dynamicSchema;
}
