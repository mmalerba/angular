import type {Signal} from '@angular/core';
import {
  aggregateMetadata,
  applyEach,
  applyWhenValue,
  reducedMetadataKey,
  required,
  schema,
} from '@angular/forms/signals';

export interface TerminalFieldSpec {
  name: string;
  initial: string;
  validation: {required: boolean};
}

export interface GroupFieldSpec {
  name: string;
  children: FieldSpec[];
}

// TODO: ArrayFieldSpec?
export type FieldSpec = TerminalFieldSpec | GroupFieldSpec;

export function isGroup(spec: FieldSpec): spec is GroupFieldSpec {
  return (spec as GroupFieldSpec).children !== undefined;
}

export const LABEL = reducedMetadataKey<string, string>(
  (_, item) => item,
  () => '',
);

// 🔪 Requires recursive schema
export function createSchema(spec: Signal<FieldSpec>) {
  const dynamicSchema = schema((p) => {
    applyWhenValue(
      p,
      (v) => Array.isArray(v),
      (group) => {
        aggregateMetadata(group, LABEL, ({pathKeys}) => lookupPath(spec(), pathKeys()).name);
        applyEach(group, dynamicSchema);
      },
    );
    applyWhenValue(
      p,
      (v) => !Array.isArray(v),
      (terminal) => {
        aggregateMetadata(terminal, LABEL, ({pathKeys}) => lookupPath(spec(), pathKeys()).name);
        required(terminal, {
          when: ({pathKeys}) => {
            const s = lookupPath(spec(), pathKeys());
            assertTerminal(s);
            return s.validation.required;
          },
        });
      },
    );
  });
  return dynamicSchema;
}

export function lookupPath(spec: FieldSpec, keys: readonly string[]): FieldSpec {
  for (const key of keys) {
    assertGroup(spec);
    spec = spec.children[Number(key)];
  }
  return spec;
}

export function assertGroup(spec: FieldSpec): asserts spec is GroupFieldSpec {
  if (!isGroup(spec)) {
    throw Error('non group spec!');
  }
}

function assertTerminal(spec: FieldSpec): asserts spec is TerminalFieldSpec {
  if (isGroup(spec)) {
    throw Error('non terminal spec!');
  }
}
