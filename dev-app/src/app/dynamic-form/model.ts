import type {FieldSpec} from './spec';

export type DynamicModelPrimitive = string | number | boolean;

export type DynamicModelObject = {[k: PropertyKey]: DynamicModel};

export type DynamicModelArray = DynamicModel[];

export type DynamicModel = DynamicModelPrimitive | DynamicModelObject | DynamicModelArray;

export function computeDataModel(
  spec: FieldSpec,
  prev?: {source: FieldSpec; value: DynamicModel},
): DynamicModel {
  if (!prev) {
    return extractInitial(spec);
  }
  const {source: prevSpec, value: prevModel} = prev;
  if (spec.kind === 'group' && prevSpec.kind === 'group') {
    assertDynamicModelObject(prevModel);
    const result = copyTrackingSymbol(prevModel);
    for (const key in spec.children) {
      result[key] =
        key in prevModel
          ? computeDataModel(spec.children[key], {
              source: prevSpec.children[key],
              value: prevModel[key],
            })
          : computeDataModel(spec.children[key]);
    }
    return result;
  }
  if (spec.kind === 'terminal' && prevSpec.kind === 'terminal') {
    return prevModel;
  }
  return extractInitial(spec);
}

function extractInitial(spec: FieldSpec): DynamicModel {
  if (spec.kind === 'group') {
    const result: DynamicModel = {};
    for (const key of Object.keys(spec.children)) {
      result[key] = extractInitial(spec.children[key]);
    }
    return result;
  }
  return spec.initial;
}

function assertDynamicModelObject(data: DynamicModel): asserts data is DynamicModelObject {
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw Error('should be dynamic model object!');
  }
}

// 🔪 We don't spread the previous model since its keys may have completely changed.
// Therefore we need to know about and preserve the tracking symbol.
function copyTrackingSymbol(from: DynamicModelObject): DynamicModelObject {
  const result: DynamicModelObject = {};
  for (const symbol of Object.getOwnPropertySymbols(from)) {
    result[symbol] = from[symbol];
  }
  return result;
}
