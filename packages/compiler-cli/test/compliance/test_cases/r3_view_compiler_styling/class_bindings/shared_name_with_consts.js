consts: () => { 
  __i18nMsg__('label', [], {}, {})
  return [
    ["attr", "", 1, "attr"], 
    ["ngProjectAs", "selector", 5, ["selector"], 1, "selector"], 
    [1, "width", 2, "width", "0px"], 
    [1, "tabindex", 3, "tabindex"], 
    ["class", "ngIf", 4, "ngIf"], 
    ["aria-label", i18n_0, 1, "aria-label"], 
    ["all", "", "ngProjectAs", "all", "style", "all:all", "class", "all", 5, ["all"], 3, "all", 4],
    [1, "ngIf"],
    ["all", "", "ngProjectAs", "all", 5, ["all"], 1, "all", 2, "all", "all", 3, "all"]
  ];
}, 
template: function MyComponent_Template(rf, ctx) { 
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
    i0.ɵɵtemplate(4, MyComponent_div_4_Template, 1, 0, "div", 4);
    i0.ɵɵelement(5, "div", 5);
    i0.ɵɵtemplate(6, MyComponent_div_6_Template, 1, 1, "div", 6);
  } 
  if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("tabindex", ctx.tabIndex);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx.cond);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("all", ctx.all);
  } 
}
