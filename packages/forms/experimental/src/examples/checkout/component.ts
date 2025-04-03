import {CommonModule} from '@angular/common';
import {Component, effect, signal} from '@angular/core';
import {form, submit} from '../../api/structure';
import {Field} from '../../api/types';
import {FieldDirective} from '../../controls/field';
import {checkoutSchema} from './logic';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [CommonModule, FieldDirective], // Assuming FieldDirective is standalone
  template: `
  <h2>Checkout</h2>
  <form (submit)="onSubmit($event)" class="checkout-form">

    <fieldset>
      <legend>Contact Information</legend>
      <div>
        <label for="email">Email:</label>
        <input id="email" type="email" [field]="checkoutForm.email" />
        <div *ngIf="checkoutForm.email.$state.touched() && checkoutForm.email.$state.errors().length > 0" class="errors">
          <p *ngFor="let err of checkoutForm.email.$state.errors()">{{ err.message || err.kind }}</p>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Shipping Address</legend>
      <!-- Render Address Fields (Could be a sub-component) -->
      <div class="address-grid">
        <div class="form-group span-2">
          <label>Full Name: <input [field]="checkoutForm.shippingAddress.fullName" /></label>
          <div *ngIf="checkoutForm.shippingAddress.fullName.$state.touched() && checkoutForm.shippingAddress.fullName.$state.errors().length > 0" class="errors">...</div>
        </div>
        <div class="form-group span-2">
          <label>Street Address: <input [field]="checkoutForm.shippingAddress.streetAddress1" /></label>
           <div *ngIf="checkoutForm.shippingAddress.streetAddress1.$state.touched() && checkoutForm.shippingAddress.streetAddress1.$state.errors().length > 0" class="errors">...</div>
        </div>
         <div class="form-group span-2">
          <label>Address Line 2 (Optional): <input [field]="checkoutForm.shippingAddress.streetAddress2" /></label>
           <!-- No required error needed -->
        </div>
        <div class="form-group">
          <label>City: <input [field]="checkoutForm.shippingAddress.city" /></label>
          <div *ngIf="checkoutForm.shippingAddress.city.$state.touched() && checkoutForm.shippingAddress.city.$state.errors().length > 0" class="errors">...</div>
        </div>
        <div class="form-group">
          <label>State: <input [field]="checkoutForm.shippingAddress.state" /></label> <!-- TODO: Use Select -->
           <div *ngIf="checkoutForm.shippingAddress.state.$state.touched() && checkoutForm.shippingAddress.state.$state.errors().length > 0" class="errors">...</div>
        </div>
        <div class="form-group">
          <label>ZIP Code: <input [field]="checkoutForm.shippingAddress.zipCode" /></label>
           <div *ngIf="checkoutForm.shippingAddress.zipCode.$state.touched() && checkoutForm.shippingAddress.zipCode.$state.errors().length > 0" class="errors">...</div>
        </div>
         <div class="form-group">
          <label>Phone Number: <input type="tel" [field]="checkoutForm.shippingAddress.phoneNumber" /></label>
          <div *ngIf="checkoutForm.shippingAddress.phoneNumber.$state.touched() && checkoutForm.shippingAddress.phoneNumber.$state.errors().length > 0" class="errors">...</div>
        </div>
      </div>
    </fieldset>

    <fieldset>
        <legend>Billing Address</legend>
        <div class="form-group">
            <label>
                <input type="checkbox" [field]="checkoutForm.useShippingAsBilling" />
                Same as shipping address
            </label>
        </div>

        <div [class.disabled-section]="checkoutForm.billingAddress.$state.disabled()">
             <p *ngIf="checkoutForm.billingAddress.$state.disabled()" class="disabled-reason">
                {{ checkoutForm.billingAddress.$state.metadata('disabledReason')() }}
             </p>
             <!-- Render Address Fields Again -->
             <div class="address-grid">
                <div class="form-group span-2">
                  <label>Full Name: <input [field]="checkoutForm.billingAddress.fullName" /></label>
                  <div *ngIf="checkoutForm.billingAddress.fullName.$state.touched() && checkoutForm.billingAddress.fullName.$state.errors().length > 0" class="errors">...</div>
                </div>
                <!-- ... other billing address fields ... -->
                 <div class="form-group span-2">
                  <label>Street Address: <input [field]="checkoutForm.billingAddress.streetAddress1" /></label>
                   <div *ngIf="checkoutForm.billingAddress.streetAddress1.$state.touched() && checkoutForm.billingAddress.streetAddress1.$state.errors().length > 0" class="errors">...</div>
                </div>
                 <!-- ... etc ... -->
             </div>
        </div>
    </fieldset>

     <fieldset>
        <legend>Payment</legend>
        <!-- Payment Method Selection (if more than one) -->
        <!-- <select [field]="checkoutForm.paymentMethod"> ... </select> -->

        <div *ngIf="checkoutForm.paymentMethod.$state.value() === 'creditCard'">
            <h4>Credit Card Details</h4>
             <div *ngIf="checkoutForm.paymentDetails.$state.errors().length > 0" class="errors form-group span-2"> <!-- Show card-level errors (like expiry) -->
               <p *ngFor="let err of checkoutForm.paymentDetails.$state.errors()">{{ err.message || err.kind }}</p>
             </div>
             <div class="payment-grid">
                <div class="form-group span-2">
                    <label>Card Number: <input [field]="checkoutForm.paymentDetails.cardNumber" /></label>
                     <div *ngIf="checkoutForm.paymentDetails.cardNumber.$state.touched() && checkoutForm.paymentDetails.cardNumber.$state.errors().length > 0" class="errors">...</div>
                </div>
                 <div class="form-group span-2">
                    <label>Name on Card: <input [field]="checkoutForm.paymentDetails.cardholderName" /></label>
                     <div *ngIf="checkoutForm.paymentDetails.cardholderName.$state.touched() && checkoutForm.paymentDetails.cardholderName.$state.errors().length > 0" class="errors">...</div>
                </div>
                <div class="form-group">
                    <label>Expiry Month:</label>
                    <select [field]="checkoutForm.paymentDetails.expiryMonth">
                        <option value="">Month</option>
                        <option *ngFor="let month of expiryMonths" [value]="month">{{ month }}</option>
                    </select>
                     <div *ngIf="checkoutForm.paymentDetails.expiryMonth.$state.touched() && checkoutForm.paymentDetails.expiryMonth.$state.errors().length > 0" class="errors">...</div>
                </div>
                 <div class="form-group">
                    <label>Expiry Year:</label>
                     <select [field]="checkoutForm.paymentDetails.expiryYear">
                        <option value="">Year</option>
                        <option *ngFor="let year of expiryYears" [value]="year">{{ year }}</option>
                    </select>
                    <div *ngIf="checkoutForm.paymentDetails.expiryYear.$state.touched() && checkoutForm.paymentDetails.expiryYear.$state.errors().length > 0" class="errors">...</div>
                </div>
                 <div class="form-group">
                    <label>CVV: <input [field]="checkoutForm.paymentDetails.cvv" size="4" /></label>
                     <div *ngIf="checkoutForm.paymentDetails.cvv.$state.touched() && checkoutForm.paymentDetails.cvv.$state.errors().length > 0" class="errors">...</div>
                </div>
            </div>
        </div>
    </fieldset>

    <fieldset>
        <legend>Gift Options</legend>
        <div class="form-group">
            <label>
                <input type="checkbox" [field]="checkoutForm.isGift" />
                This order is a gift
            </label>
        </div>
        <div class="form-group">
            <label>Gift Message (Optional):</label>
            <textarea
                [field]="checkoutForm.giftMessage"
                [disabled]="checkoutForm.giftMessage.$state.disabled()"
                rows="3"
            ></textarea>
             <div *ngIf="checkoutForm.giftMessage.$state.touched() && checkoutForm.giftMessage.$state.errors().length > 0" class="errors">
                 <p *ngFor="let err of checkoutForm.giftMessage.$state.errors()">{{ err.message || err.kind }}</p>
             </div>
        </div>
    </fieldset>

    <div class="submit-section">
        <button type="submit" [disabled]="!checkoutForm.$state.valid() || submitStatus() === 'submitting'">
             {{ submitStatus() === 'submitting' ? 'Placing Order...' : 'Place Your Order' }}
        </button>
    </div>

    <pre>Form Valid: {{ checkoutForm.$state.valid() }}</pre>
    <pre>Submit Status: {{ submitStatus() }}</pre>
    <!-- <pre>Form Value: {{ checkoutModel() | json }}</pre> -->

  </form>
  `,
  styles: [
    `
    .checkout-form fieldset { border: 1px solid #ccc; margin-bottom: 1em; padding: 1em; }
    .checkout-form legend { font-weight: bold; }
    .form-group { margin-bottom: 0.8em; }
    .form-group label { display: block; margin-bottom: 0.2em; font-size: 0.9em; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.5em; box-sizing: border-box; }
    .errors p { color: red; font-size: 0.8em; margin: 0.2em 0 0 0; }
    .address-grid, .payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1em; }
    .span-2 { grid-column: span 2; }
    .disabled-section { opacity: 0.6; pointer-events: none; }
    .disabled-reason { font-style: italic; color: #666; font-size: 0.9em; margin-bottom: 1em; }
    .submit-section { margin-top: 1.5em; }
    button[type="submit"] { padding: 0.8em 1.5em; font-size: 1.1em; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.7; }
    /* Add more specific styling as needed */
  `,
  ],
})
export class CheckoutFormComponent {
  // --- Component Model ---
  checkoutModel = signal<CheckoutData>({
    email: '',
    shippingAddress: createDefaultAddress(),
    useShippingAsBilling: true,
    billingAddress: createDefaultAddress(), // Start empty, will be synced or filled
    paymentMethod: 'creditCard',
    paymentDetails: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
    isGift: false,
    giftMessage: null,
  });

  // --- Form Creation ---
  checkoutForm = form(this.checkoutModel, checkoutSchema);

  // Expose submit status
  submitStatus = this.checkoutForm.$state.submittedStatus;

  // --- Helpers for Dropdowns ---
  expiryMonths = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  expiryYears = Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString());

  constructor() {
    // Effect to sync billing address when checkbox changes
    effect(() => {
      const useSame = this.checkoutForm.useShippingAsBilling.$state.value();
      const shipping = this.checkoutForm.shippingAddress.$state.value();

      if (useSame) {
        // Update billing address model signal only if values actually differ
        this.checkoutForm.billingAddress.$state.value.update((currentBilling) => {
          if (JSON.stringify(currentBilling) !== JSON.stringify(shipping)) {
            return {...shipping}; // Create a new object copy
          }
          return currentBilling; // No change needed
        });
      }
      // Optional: Clear billing address when unchecked? Or leave the values?
      // Leaving values is usually preferred so user doesn't lose input if they toggle.
      // The 'disabled' state handles the UI/validation aspect.
    });

    // Effect to clear gift message if isGift is unchecked
    effect(() => {
      const isGift = this.checkoutForm.isGift.$state.value();
      if (!isGift && this.checkoutForm.giftMessage.$state.value() !== null) {
        this.checkoutForm.giftMessage.$state.value.set(null);
      }
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    console.log('Attempting submit...');

    if (!this.checkoutForm.$state.valid()) {
      console.error('Form is invalid. Cannot submit.');
      // TODO: Maybe mark all fields as touched to reveal errors?
      // This would require a utility function on the form/field state.
      return;
    }

    console.log('Form is valid. Simulating submission...');
    this.checkoutForm.$state.resetSubmittedStatus(); // Ensure it's not stuck in 'submitted'

    try {
      await submit(this.checkoutForm, async (formField: Field<CheckoutData>) => {
        const dataToSubmit = formField.$state.value();
        console.log('Submitting Data:', dataToSubmit);

        // --- Simulate API Call ---
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // --- Simulate Potential Server Errors ---
        if (dataToSubmit.paymentDetails.cardNumber.endsWith('1111')) {
          return [
            {
              field: formField.paymentDetails.cardNumber, // Target specific field
              error: {kind: 'card-declined', message: 'Your card was declined by the bank.'},
            },
          ];
        }
        if (dataToSubmit.email.includes('test@fail.com')) {
          return [
            {
              field: formField.email, // Target email field
              error: {
                kind: 'email-bounce',
                message: 'Email address seems invalid (simulated server check).',
              },
            },
          ];
        }

        // Success case
        console.log('API call successful (simulated)');
        return []; // Resolve with empty array for success
      });

      // Post-submission success logic (if submit didn't throw)
      if (this.checkoutForm.$state.valid()) {
        // Double check validity after server errors applied
        console.log('Order Placed Successfully!');
        // Navigate to success page or show success message
      } else {
        console.warn('Submission completed, but server errors were added.');
      }
    } catch (e) {
      console.error('Unexpected error during submission process:', e);
      // Handle network errors etc. Maybe add root error?
      // (this.checkoutForm.$state as any).setServerErrors([{ kind: 'network-error', message: 'Submission failed. Please try again.' }]);
      this.checkoutForm.$state.resetSubmittedStatus(); // Reset status on unexpected failure
    }
  }
}
