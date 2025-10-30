import {Component, computed, effect, input, linkedSignal, output} from '@angular/core';
import {Field, form, type FieldTree} from '@angular/forms/signals';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {computeDataModel, type DynamicModel, type DynamicModelObject} from './model';
import {createSchema, LABEL} from './schema';
import type {FieldSpec} from './spec';

@Component({
  selector: 'dynamic-form-terminal',
  standalone: true,
  imports: [Field, MatFormField, MatInput, MatError, MatLabel],
  template: `
    <mat-form-field>
      <mat-label>{{ label() }}</mat-label>
      <input matInput [field]="field()" />
      @for (error of errors(); track $index) {
        <mat-error>{{ error.message ?? error.kind }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class DynamicFormTerminal {
  field = input.required<FieldTree<DynamicModel>>();

  label = computed(() => this.field()().metadata(LABEL)());

  errors = computed(() => this.field()().errors());
}

@Component({
  selector: 'dynamic-form-group',
  standalone: true,
  imports: [DynamicFormTerminal],
  template: `
    <p>{{ label() }}</p>
    @for (item of items(); track item.key) {
      @if (isObjectForm(item.child)) {
        <dynamic-form-group [field]="item.child" />
      } @else {
        <dynamic-form-terminal [field]="item.child" />
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        border-left: 2px solid black;
        padding-left: 10px;
      }
    `,
  ],
})
export class DynamicFormGroup {
  field = input.required<FieldTree<DynamicModelObject>>();

  items = computed(() => Object.entries(this.field()).map(([key, child]) => ({key, child})));

  label = computed(() => this.field()().metadata(LABEL)());

  isObjectForm = isObjectForm;
}

@Component({
  selector: 'dynamic-form',
  standalone: true,
  imports: [DynamicFormTerminal, DynamicFormGroup],
  template: `
    @if (isObjectForm(form)) {
      <dynamic-form-group [field]="form" />
    } @else {
      <dynamic-form-terminal [field]="form" />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 10px;
      }
    `,
  ],
})
export class DynamicForm {
  spec = input.required<FieldSpec>();

  valueChange = output<unknown>();

  model = linkedSignal<FieldSpec, DynamicModel>({
    source: this.spec,
    computation: computeDataModel,
  });

  form = form(this.model, createSchema(this.spec));

  constructor() {
    effect(() => {
      this.valueChange.emit(this.form().value());
    });
  }

  isObjectForm = isObjectForm;
}

function isObjectForm<T>(f: FieldTree<DynamicModel>): f is FieldTree<DynamicModelObject> {
  return typeof f().value() === 'object' && !Array.isArray(f().value());
}
