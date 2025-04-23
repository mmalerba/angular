import {FieldContext} from '../public_api';
import {LinkedLogicListNode} from '../src/logic_node';

const dummyFieldContext: FieldContext<any> = {resolve: () => undefined!, value: undefined!};

describe('LogicNode', () => {
  it('should build root logic node', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.errors.push(() => [{kind: 'root-err'}]);
    const logic = builder.merged();

    expect(logic.errors.compute(dummyFieldContext)).toEqual([{kind: 'root-err'}]);
  });

  it('should build child logic node', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.getChild('a').errors.push(() => [{kind: 'child-err'}]);
    const logic = builder.merged();

    expect(logic.getChild('a').errors.compute(dummyFieldContext)).toEqual([{kind: 'child-err'}]);
  });

  it('should build linked logic nodes', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.errors.push(() => [{kind: 'err-1'}]);

    const otherBuilder = new LinkedLogicListNode(undefined);
    otherBuilder.errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();

    expect(logic.errors.compute(dummyFieldContext)).toEqual([{kind: 'err-1'}, {kind: 'err-2'}]);
  });

  it('should build linked logic nodes with children', () => {
    const builder = new LinkedLogicListNode(undefined);
    builder.getChild('a').errors.push(() => [{kind: 'err-1'}]);

    const otherBuilder = new LinkedLogicListNode(undefined);
    otherBuilder.getChild('a').errors.push(() => [{kind: 'err-2'}]);

    builder.linkTo(otherBuilder);
    const logic = builder.merged();

    expect(logic.getChild('a').errors.compute(dummyFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);
  });
});
