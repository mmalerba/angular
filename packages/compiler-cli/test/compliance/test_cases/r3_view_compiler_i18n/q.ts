import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  standalone: true,
  template: `
    <div i18n>
      <div *ngFor="let diskView of attachedDiskViews">
        <p class="cfc-space-below-minus-5">
          Disk "{{ diskView.disk?.metadata?.name }}" needs to be detached from the below
          {diskView.disk?.status?.virtualMachineAttachments?.length, plural, =1 {VM} other {VMs}} to be
          deleted.
        </p>
      </div>
    </div>
  `,
})
export class MyComponent {
  attachedDiskViews: any;
}
