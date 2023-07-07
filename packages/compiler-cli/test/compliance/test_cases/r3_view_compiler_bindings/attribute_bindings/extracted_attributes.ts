import {Component, Directive, TemplateRef} from '@angular/core';

@Directive({selector: '[struct]', standalone: true})
export class StructuralDirective {
  constructor(template: TemplateRef<any>) {}
}

@Component({
  template: `
    <div *struct
         tabindex="1" 
         style="color:red" 
         class="a b c" 
         [attr.a1]="1" 
         [attr.a2]="'2'" 
         [attr.style]="'display:block'" 
         [attr.class]="'x y z'">
    </div>
  `,
  standalone: true,
  imports: [StructuralDirective]
})
export class MyComponent {
}
