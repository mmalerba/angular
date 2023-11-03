/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Extracts ICUs into i18n expressions.
 */
export function phaseIcuExtraction(job: CompilationJob): void {
  for (const unit of job.units) {
    // Build a map of ICU to the i18n block they belong to, then remove the `Icu` ops.
    const icus = new Map<ir.XrefId, {message: i18n.Message, i18nOp: ir.I18nStartOp}>();
    let currentI18nOp: ir.I18nStartOp|null = null;
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          if (!op.context) {
            throw Error('I18n op should have its context set.');
          }
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.Icu:
          if (currentI18nOp === null) {
            throw Error('Unexpected ICU outside of an i18n block.');
          }
          icus.set(op.xref, {message: op.message, i18nOp: currentI18nOp});
          ir.OpList.remove<ir.CreateOp>(op);
          break;
      }
    }

    // Replace the `IcuUpdate` ops with `i18nExpr` ops.
    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.IcuUpdate:
          const {message, i18nOp} = icus.get(op.xref)!;
          const icuNode = message.nodes.find((n): n is i18n.Icu => n instanceof i18n.Icu);
          if (icuNode === undefined) {
            throw Error('Could not find ICU in i18n AST');
          }
          if (icuNode.expressionPlaceholder === undefined) {
            throw Error('ICU is missing an i18n placeholder');
          }
          ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createI18nExpressionOp(
                  i18nOp.context!, i18nOp.xref, i18nOp.slot,
                  new ir.LexicalReadExpr(icuNode.expression), icuNode.expressionPlaceholder,
                  ir.I18nParamResolutionTime.Postproccessing, null!));
          break;
      }
    }
  }
}
