/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LogicFn, PathKind} from '../types';
import {ValidationError} from '../validation_errors';

// TODO(kirjs): Consider using {length: number}
export type ValueWithLength = Array<unknown> | string;

export interface BaseValidatorConfig<T, TPathKind extends PathKind = PathKind.Root> {
  error?:
    | ValidationError
    | ValidationError[]
    | LogicFn<T, ValidationError | ValidationError[], TPathKind>;
}
