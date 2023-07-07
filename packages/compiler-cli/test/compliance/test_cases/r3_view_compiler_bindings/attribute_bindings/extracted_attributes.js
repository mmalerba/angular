function MyComponent_div_0_Template(rf, ctx) { 
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div", 1);
  } 
  if (rf & 2) {
    $r3$.ɵɵattribute("a1", 1)("a2", "2")("style", "display:block", $r3$.ɵɵsanitizeStyle)("class", "x y z");
  } 
}

// ...

MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  vars: 0,
  consts: [
    ["tabindex", "1", "style", "color:red", "class", "a b c", 4, "struct"], 
    ["tabindex", "1", 1, "a", "b", "c", 2, "color", "red"]
  ],
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 4, "div", 0);
    }
  },
  dependencies: [StructuralDirective],
  encapsulation: 2
});
