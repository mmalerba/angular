import {signal} from '@angular/core';
import {FieldContext} from '../public_api';
import {LinkedLogicListNode} from '../src/logic_node';

const fakeFieldContext: FieldContext<unknown> = {
  resolve: () =>
    ({
      $state: {fieldContext: fakeFieldContext},
    }) as any,
  value: undefined!,
};

describe('LogicNode', () => {
  it('should build root logic node', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.errors.push(() => [{kind: 'root-err'}]);
    const logic = builder.merged();

    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'root-err'}]);
  });

  it('should build child logic node', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.getChild('a').errors.push(() => [{kind: 'child-err'}]);
    const logic = builder.merged();

    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([{kind: 'child-err'}]);
  });

  it('should build linked logic nodes', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.errors.push(() => [{kind: 'err-1'}]);

    const otherBuilder = new LinkedLogicListNode(undefined);
    otherBuilder.errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();

    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}, {kind: 'err-2'}]);
  });

  it('should build linked logic nodes with children', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.getChild('a').errors.push(() => [{kind: 'err-1'}]);

    const otherBuilder = new LinkedLogicListNode(undefined);
    otherBuilder.getChild('a').errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();

    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);
  });

  it('should build logic node with predicate', () => {
    const pred = signal(true);
    const builder = new LinkedLogicListNode({fn: pred, path: undefined!});
    builder.errors.push(() => [{kind: 'err-1'}]);

    const logic = builder.merged();
    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    pred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should consider predicate when linking', () => {
    const pred = signal(true);
    const builder = new LinkedLogicListNode({fn: pred, path: undefined!});
    builder.errors.push(() => [{kind: 'err-1'}]);

    const otherPred = signal(true);
    const otherBuilder = new LinkedLogicListNode({
      fn: otherPred,
      path: undefined!,
    });
    otherBuilder.errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();
    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}, {kind: 'err-2'}]);

    otherPred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    otherPred.set(true);
    pred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should propagate predicates to children', () => {
    const pred = signal(true);
    const builder = new LinkedLogicListNode({fn: pred, path: undefined!});
    builder.getChild('a').errors.push(() => [{kind: 'err-1'}]);

    const otherPred = signal(true);
    const otherBuilder = new LinkedLogicListNode({fn: otherPred, path: undefined!});
    otherBuilder.getChild('a').errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);

    otherPred.set(false);
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    otherPred.set(true);
    pred.set(false);
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should propagate predicates to children', () => {
    const pred = signal(true);
    const builder = new LinkedLogicListNode({fn: pred, path: undefined!});
    builder.getChild('a').errors.push(() => [{kind: 'err-1'}]);

    const otherPred = signal(true);
    const otherBuilder = new LinkedLogicListNode({fn: otherPred, path: undefined!});
    otherBuilder.getChild('a').errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);

    otherPred.set(false);
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    otherPred.set(true);
    pred.set(false);
    expect(logic.getChild('a').errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should propagate predicate across multiple links', () => {
    const pred = signal(true);
    const builder = new LinkedLogicListNode({fn: pred, path: undefined!});
    builder.errors.push(() => [{kind: 'err-1'}]);

    const secondPred = signal(true);
    const secondBuilder = new LinkedLogicListNode({
      fn: secondPred,
      path: undefined!,
    });
    secondBuilder.errors.push(() => [{kind: 'err-2'}]);

    const thirdPred = signal(true);

    const thirdBuilder = new LinkedLogicListNode({
      fn: thirdPred,
      path: undefined!,
    });
    thirdBuilder.errors.push(() => [{kind: 'err-3'}]);

    builder.linkTo(secondBuilder);
    secondBuilder.linkTo(thirdBuilder);
    const logic = builder.merged();
    expect(logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
      {kind: 'err-3'},
    ]);

    thirdPred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}, {kind: 'err-2'}]);

    thirdPred.set(true);
    secondPred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    secondPred.set(true);
    pred.set(false);
    expect(logic.errors.compute(fakeFieldContext)).toEqual([]);
  });
});
