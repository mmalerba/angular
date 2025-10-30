export interface TerminalFieldSpec {
  kind: 'terminal';
  initial: string;
  validation: {required: boolean};
}

export interface GroupFieldSpec {
  kind: 'group';
  children: {[key: string]: FieldSpec};
}

export type FieldSpec = TerminalFieldSpec | GroupFieldSpec;

export function lookupFieldSpec(spec: FieldSpec, keys: readonly string[]): FieldSpec {
  for (const key of keys) {
    assertGroupFieldSpec(spec);
    spec = spec.children[key];
  }
  return spec;
}

export function assertGroupFieldSpec(spec: FieldSpec): asserts spec is GroupFieldSpec {
  if (spec.kind !== 'group') {
    throw Error('should be group field spec!');
  }
}

export function assertTerminalFieldSpec(spec: FieldSpec): asserts spec is TerminalFieldSpec {
  if (spec.kind !== 'terminal') {
    throw Error('should be terminal field spec!');
  }
}
