import {SecurityContext} from '../../../../../../core';
import {isIframeSecuritySensitiveAttr} from '../../../../schema/dom_security_schema';
import * as ir from '../../ir';
import {ComponentCompilation, ViewCompilation} from '../compilation';

/**
 * Mapping of security contexts to sanitizer function for that context.
 */
const sanitizers = new Map<SecurityContext, ir.SanitizerFn|null>([
  [SecurityContext.HTML, ir.SanitizerFn.Html], [SecurityContext.SCRIPT, ir.SanitizerFn.Script],
  [SecurityContext.STYLE, ir.SanitizerFn.Style], [SecurityContext.URL, ir.SanitizerFn.Url],
  [SecurityContext.RESOURCE_URL, ir.SanitizerFn.ResourceUrl]
]);

/**
 * Resolves sanitization functions for ops that need them.
 */
export function phaseResolveSanitizers(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    const elements = getElements(view);
    let sanitizerFn: ir.SanitizerFn|null;
    for (const op of view.update) {
      switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.InterpolateProperty:
          // TODO: Add ir.OpKind.Attribute and ir.OpKind.InterpolateAttribute to this case block,
          // they should follow the same pattern as properties.
          sanitizerFn = sanitizers.get(op.securityContext) || null;
          op.sanitizer = sanitizerFn ? new ir.SanitizerExpr(sanitizerFn) : null;
          // If there was no sanitization function found based on the security context of an
          // attribute/property, check whether this attribute/property is one of the
          // security-sensitive <iframe> attributes (and that the current element is actually an
          // <iframe>).
          if (op.sanitizer === null) {
            const ownerOp = elements.get(op.target);
            if (ownerOp === undefined) {
              throw Error('Property should have an element-like owner');
            }
            if (isIframeElement(ownerOp) && isIframeSecuritySensitiveAttr(op.name)) {
              op.sanitizer = new ir.SanitizerExpr(ir.SanitizerFn.IframeAttribute);
            }
          }
          break;
        case ir.OpKind.StyleProp:
        case ir.OpKind.StyleMap:
        case ir.OpKind.InterpolateStyleProp:
        case ir.OpKind.InterpolateStyleMap:
          // The compiler does not fill in a sanitizer for style binding values because the style
          // algorithm knows internally what props are subject to sanitization (only style values
          // set via [attr.style] are explicitly sanitized)
          sanitizerFn = op.securityContext === SecurityContext.STYLE ?
              null :
              sanitizers.get(op.securityContext) || null
          op.sanitizer = sanitizerFn ? new ir.SanitizerExpr(sanitizerFn) : null;
          break;
      }
    }
  }
}

/**
 * Gets a map of all elements in the givne view by their xref id.
 */
// TODO: Is there a shared location I can put this? Copied the code from attribute_extraction.ts
function getElements(view: ViewCompilation) {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
  for (const op of view.create) {
    if (!ir.isElementOrContainerOp(op)) {
      continue;
    }
    elements.set(op.xref, op);
  }
  return elements;
}

/**
 * Checks whether the given op represents an iframe element.
 */
function isIframeElement(op: ir.ElementOrContainerOps): boolean {
  return (op.kind === ir.OpKind.Element || op.kind === ir.OpKind.ElementStart) &&
      op.tag.toLowerCase() === 'iframe';
}
