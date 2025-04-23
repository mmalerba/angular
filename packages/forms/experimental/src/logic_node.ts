/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MetadataKey} from './api/metadata';
import {type FieldContext, type FieldPath, type FormError, type LogicFn} from './api/types';
import {FieldNode} from './field_node';

/**
 * Special key which is used to represent a dynamic index in a `FieldLogicNode` path.
 */
export const DYNAMIC = Symbol('DYNAMIC');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
  readonly path: FieldPath<any>;
}

export interface LogicContainer {
  readonly hidden: BooleanOrLogic;
  readonly disabled: BooleanOrLogic;
  readonly errors: ArrayMergeLogic<FormError>;
  getMetadataKeys(): IterableIterator<MetadataKey<unknown>>;
  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T>;
}

class LogicChunk implements LogicContainer {
  readonly hidden: BooleanOrLogic;
  readonly disabled: BooleanOrLogic;
  readonly errors: ArrayMergeLogic<FormError>;
  private readonly metadata = new Map<MetadataKey<unknown>, AbstractLogic<unknown>>();

  constructor(private predicate: Predicate | undefined) {
    this.hidden = new BooleanOrLogic(predicate);
    this.disabled = new BooleanOrLogic(predicate);
    this.errors = new ArrayMergeLogic<FormError>(predicate);
  }

  getMetadataKeys() {
    return this.metadata.keys();
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    if (!this.metadata.has(key as MetadataKey<unknown>)) {
      this.metadata.set(key as MetadataKey<unknown>, new MetadataMergeLogic(this.predicate, key));
    }
    return this.metadata.get(key as MetadataKey<unknown>)! as AbstractLogic<T>;
  }

  readMetadata<T>(key: MetadataKey<T>, arg: FieldContext<any>): T {
    if (this.metadata.has(key as MetadataKey<unknown>)) {
      return this.metadata.get(key as MetadataKey<unknown>)!.compute(arg) as T;
    } else {
      return key.defaultValue;
    }
  }
}

export interface LinkedLogicNode extends LogicContainer {
  readonly element: LinkedLogicNode;
  predicate: Predicate | undefined;
  linkTo(other: LinkedLogicNode): void;
  merged(): MergedLogicNode;
  getChild(key: PropertyKey): LinkedLogicNode;
  getAllChildren(key: PropertyKey): LinkedLogicNode[];
}

export class LinkedLogicChunkNode implements LinkedLogicNode {
  readonly chunk: LogicChunk;
  private readonly children = new Map<PropertyKey, LinkedLogicListNode>();

  get hidden() {
    return this.chunk.hidden;
  }
  get disabled() {
    return this.chunk.disabled;
  }
  get errors() {
    return this.chunk.errors;
  }
  get element() {
    return this.getChild(DYNAMIC);
  }

  constructor(readonly predicate: Predicate | undefined) {
    this.chunk = new LogicChunk(predicate);
  }

  getChild(key: PropertyKey) {
    if (!this.children.has(key)) {
      this.children.set(key, new LinkedLogicListNode(this.predicate));
    }
    return this.children.get(key)!;
  }

  getAllChildren(key: PropertyKey): LinkedLogicNode[] {
    if (this.children.has(key)) {
      return [this.children.get(key)!];
    }
    return [];
  }

  getMetadataKeys() {
    return this.chunk.getMetadataKeys();
  }

  getMetadata<T>(key: MetadataKey<T>) {
    return this.chunk.getMetadata(key);
  }

  linkTo(other: LinkedLogicNode): void {
    throw new Error('LinkedLogicChunkNode cannot be linked to another node');
  }

  merged(): MergedLogicNode {
    return new MergedLogicNode(this);
  }
}

export class LinkedLogicListNode implements LinkedLogicNode {
  private current: LinkedLogicChunkNode | undefined;
  all: LinkedLogicNode[];

  get hidden() {
    return this.getCurrent().hidden;
  }
  get disabled() {
    return this.getCurrent().disabled;
  }
  get errors() {
    return this.getCurrent().errors;
  }
  get element() {
    return this.getCurrent().element;
  }

  constructor(readonly predicate: Predicate | undefined) {
    this.all = [];
  }

  private getCurrent() {
    if (this.current === undefined) {
      this.current = new LinkedLogicChunkNode(this.predicate);
      this.all.push(this.current);
    }
    return this.current;
  }

  getChild(key: PropertyKey) {
    return this.getCurrent().getChild(key);
  }

  getAllChildren(key: PropertyKey): LinkedLogicNode[] {
    return this.all.flatMap((node) => node.getAllChildren(key));
  }

  getMetadataKeys() {
    return new Set([...this.all.flatMap((node) => [...node.getMetadataKeys()])]).keys();
  }

  getMetadata<T>(key: MetadataKey<T>) {
    return this.getCurrent().getMetadata(key);
  }

  linkTo(other: LinkedLogicNode) {
    this.all.push(other);
    this.current = undefined;
  }

  merged(): MergedLogicNode {
    return new MergedLogicNode(this);
  }
}

export class MergedLogicNode {
  private readonly full: LogicChunk;

  get hidden() {
    return this.full.hidden;
  }
  get disabled() {
    return this.full.disabled;
  }
  get errors() {
    return this.full.errors;
  }
  get element() {
    return this.getChild(DYNAMIC);
  }

  constructor(private linkedNode: LinkedLogicNode) {
    this.full = new LogicChunk(linkedNode.predicate);
    const chunks = linkedNode instanceof LinkedLogicListNode ? linkedNode.all : [linkedNode];
    for (const chunk of chunks) {
      this.full.disabled.mergeIn(chunk.disabled);
      this.full.hidden.mergeIn(chunk.hidden);
      this.full.errors.mergeIn(chunk.errors);
      for (const key of chunk.getMetadataKeys()) {
        this.full.getMetadata(key).mergeIn(chunk.getMetadata(key));
      }
    }
  }

  getChild(key: PropertyKey): MergedLogicNode {
    const children = this.linkedNode.getAllChildren(key);
    if (children.length === 0) {
      return new MergedLogicNode(new LinkedLogicChunkNode(undefined));
    }
    if (children.length === 1) {
      return new MergedLogicNode(children[0]);
    }
    const all = new LinkedLogicListNode(this.linkedNode.predicate);
    for (const child of children) {
      all.linkTo(child);
    }
    return new MergedLogicNode(all);
  }

  getMetadataKeys() {
    return this.full.getMetadataKeys();
  }

  getMetadata<T>(key: MetadataKey<T>): AbstractLogic<T> {
    return this.full.getMetadata(key);
  }

  readMetadata<T>(key: MetadataKey<T>, arg: FieldContext<any>): T {
    return this.full.readMetadata(key, arg);
  }
}

export abstract class AbstractLogic<TReturn, TValue = TReturn> {
  protected readonly fns: Array<LogicFn<any, TValue>> = [];

  constructor(private predicate: Predicate | undefined) {}

  abstract compute(arg: FieldContext<any>): TReturn;

  abstract get defaultValue(): TValue;

  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(wrapWithPredicate(this.predicate, logicFn, this.defaultValue));
  }

  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    const fns = this.predicate
      ? other.fns.map((fn) => wrapWithPredicate(this.predicate, fn, this.defaultValue))
      : other.fns;
    this.fns.push(...fns);
  }
}

class BooleanOrLogic extends AbstractLogic<boolean> {
  override get defaultValue() {
    return false;
  }

  override compute(arg: FieldContext<any>): boolean {
    return this.fns.some((f) => f(arg));
  }
}

class ArrayMergeLogic<TElement> extends AbstractLogic<
  TElement[],
  TElement | TElement[] | undefined
> {
  override get defaultValue() {
    return undefined;
  }

  override compute(arg: FieldContext<any>): TElement[] {
    return this.fns.reduce((prev, f) => {
      const value = f(arg);

      if (value === undefined) {
        return prev;
      } else if (Array.isArray(value)) {
        return [...prev, ...value];
      } else {
        return [...prev, value];
      }
    }, [] as TElement[]);
  }
}

class MetadataMergeLogic<T> extends AbstractLogic<T> {
  override get defaultValue() {
    return this.key.defaultValue;
  }

  constructor(
    predicate: Predicate | undefined,
    private key: MetadataKey<T>,
  ) {
    super(predicate);
  }

  override compute(arg: FieldContext<any>): T {
    return this.fns.reduce((prev, fn) => this.key.merge(prev, fn(arg)), this.key.defaultValue);
  }
}

function wrapWithPredicate<TValue, TReturn>(
  predicate: Predicate | undefined,
  logicFn: LogicFn<TValue, TReturn>,
  defaultValue: TReturn,
) {
  if (predicate === undefined) {
    return logicFn;
  }
  return (arg: FieldContext<any>): TReturn => {
    const predicateField = arg.resolve(predicate.path).$state as FieldNode;
    if (!predicate.fn(predicateField.fieldContext)) {
      // don't actually run the user function
      return defaultValue;
    }
    return logicFn(arg);
  };
}
