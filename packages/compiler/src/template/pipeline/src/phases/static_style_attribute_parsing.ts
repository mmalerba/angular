/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import {parse as parseStyle} from '../../../../render3/view/style_parser';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Parses static style and class attributes into separate ops per style/class.
 */
export function phaseStaticStyleAttributeParsing(cpl: ComponentCompilationJob): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.ops()) {
      if (op.kind === ir.OpKind.Attribute && !(op.expression instanceof ir.Interpolation) &&
          isStringLiteral(op.expression)) {
        // TemplateDefinitionBuilder only extracts style and class TextAttributes.
        if (view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
            !op.isTextAttribute) {
          continue;
        }

        if (op.name === 'style') {
          const parsedStyles = parseStyle(op.expression.value);
          for (let i = 0; i < parsedStyles.length - 1; i += 2) {
            ir.OpList.insertBefore<ir.UpdateOp>(
                ir.createParsedStaticStyleOp(op.target, parsedStyles[i], parsedStyles[i + 1]), op);
          }
          ir.OpList.remove<ir.UpdateOp>(op);
        } else if (op.name === 'class') {
          const parsedClasses = op.expression.value.trim().split(/\s+/g);
          for (const parsedClass of parsedClasses) {
            ir.OpList.insertBefore<ir.UpdateOp>(
                ir.createParsedStaticClassOp(op.target, parsedClass), op);
          }
          ir.OpList.remove<ir.UpdateOp>(op);
        }
      }
    }
  }
}

/**
 * Checks whether the given expression is a string literal.
 */
function isStringLiteral(expr: o.Expression): expr is o.LiteralExpr&{value: string} {
  return expr instanceof o.LiteralExpr && typeof expr.value === 'string';
}
