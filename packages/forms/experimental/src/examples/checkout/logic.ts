import {disabled, required, validate} from '../../api/logic';
import {apply, applyWhen} from '../../api/structure';
import {FieldContext, FieldPath, Schema} from '../../api/types';

// --- Address Schema ---
const addressSchema: Schema<Address> = (path: FieldPath<Address>) => {
  required(path.fullName, () => true, 'Full name is required.');
  required(path.streetAddress1, () => true, 'Street address is required.');
  required(path.city, () => true, 'City is required.');
  required(path.state, () => true, 'State is required.');
  required(path.zipCode, () => true, 'ZIP code is required.');
  required(path.phoneNumber, () => true, 'Phone number is required.');

  // Basic ZIP validation
  validate(path.zipCode, ({value}: FieldContext<string>) => {
    if (value() && !/^\d{5}(-\d{4})?$/.test(value())) {
      return {kind: 'zip-format', message: 'Invalid ZIP code format.'};
    }
    return;
  });

  // Basic phone validation (allows various formats, simplistic)
  validate(path.phoneNumber, ({value}: FieldContext<string>) => {
    if (value() && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value())) {
      return {kind: 'phone-format', message: 'Invalid phone number format.'};
    }
    return;
  });
};

// --- Credit Card Payment Schema ---
const creditCardPaymentSchema: Schema<CreditCardPayment> = (path: FieldPath<CreditCardPayment>) => {
  required(path.cardholderName, () => true, 'Cardholder name is required.');
  required(path.cardNumber, () => true, 'Card number is required.');
  required(path.expiryMonth, () => true, 'Expiry month is required.');
  required(path.expiryYear, () => true, 'Expiry year is required.');
  required(path.cvv, () => true, 'CVV is required.');

  // Basic card number format (very naive, just checks for digits/spaces)
  validate(path.cardNumber, ({value}: FieldContext<string>) => {
    const cleaned = value().replace(/\s+/g, '');
    if (cleaned && !/^\d{13,19}$/.test(cleaned)) {
      return {kind: 'card-format', message: 'Invalid card number format.'};
    }
    // Real validation (Luhn) is more complex, skipping here.
    return;
  });

  // Basic CVV format
  validate(path.cvv, ({value}: FieldContext<string>) => {
    if (value() && !/^\d{3,4}$/.test(value())) {
      return {kind: 'cvv-format', message: 'Invalid CVV (must be 3 or 4 digits).'};
    }
    return;
  });

  // Validate expiry date is not in the past (checks the year/month combination)
  validate(path, ({value}: FieldContext<CreditCardPayment>) => {
    const {expiryMonth, expiryYear} = value();
    if (expiryMonth && expiryYear) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // JS months are 0-indexed
      const expYearNum = parseInt(expiryYear, 10);
      const expMonthNum = parseInt(expiryMonth, 10);

      if (isNaN(expYearNum) || isNaN(expMonthNum)) return; // Let required handle empty

      if (expYearNum < currentYear || (expYearNum === currentYear && expMonthNum < currentMonth)) {
        return {kind: 'expired', message: 'Card expiry date is in the past.'};
      }
    }
    return;
  });
};

// --- Main Checkout Schema ---
export const checkoutSchema: Schema<CheckoutData> = (path: FieldPath<CheckoutData>) => {
  // Email Validation
  required(path.email, () => true, 'Email is required for order confirmation.');
  validate(path.email, ({value}: FieldContext<string>) => {
    if (value() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value())) {
      return {kind: 'email-format', message: 'Please enter a valid email address.'};
    }
    return;
  });

  // Apply address schema to shipping address
  apply(path.shippingAddress, addressSchema);

  // Apply address schema to billing address (logic will be conditionally disabled below)
  apply(path.billingAddress, addressSchema);

  // Disable billing address fields if 'useShippingAsBilling' is checked
  // We disable the whole billingAddress group.
  disabled(
    path.billingAddress,
    ({resolve}: FieldContext<Address>) => {
      // Resolve the checkbox state from the context of the billing address
      return resolve(path.useShippingAsBilling).$state.value();
    },
    'Billing address is same as shipping.',
  );
  // Could also disable individual fields:
  // disabled(path.billingAddress.fullName, ({resolve}) => resolve(path.useShippingAsBilling).$state.value());
  // ... etc for all fields

  // Apply payment schema ONLY when method is 'creditCard'
  // We use applyWhen because the structure 'paymentDetails' always exists,
  // but its *logic* depends on the selected method.
  applyWhen(
    path.paymentDetails,
    ({resolve}: FieldContext<CreditCardPayment>) => {
      const method = resolve(path.paymentMethod).$state.value();
      return method === 'creditCard';
    },
    creditCardPaymentSchema,
  );

  // Conditionally require gift message if isGift is true
  required(
    path.giftMessage,
    ({resolve}: FieldContext<string | null>) => {
      return resolve(path.isGift).$state.value();
    },
    'Gift message cannot be empty when marked as gift.',
  );

  // Disable gift message if isGift is false
  disabled(path.giftMessage, ({resolve}: FieldContext<string | null>) => {
    return !resolve(path.isGift).$state.value();
  });
};
