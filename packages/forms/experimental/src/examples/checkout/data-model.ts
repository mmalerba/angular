// Shared Address Structure
interface Address {
  fullName: string;
  streetAddress1: string;
  streetAddress2: string | null; // Optional line 2
  city: string;
  state: string; // Could be a dropdown, using string for simplicity
  zipCode: string;
  phoneNumber: string; // Often required for shipping
}

// Payment Structure (Focus on Credit Card)
interface CreditCardPayment {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string; // e.g., "01", "12"
  expiryYear: string; // e.g., "2024", "2025"
  cvv: string;
}

// Main Checkout Data Model
interface CheckoutData {
  email: string; // For confirmation/contact
  shippingAddress: Address;
  useShippingAsBilling: boolean;
  billingAddress: Address; // Always keep the structure, disable fields if useShippingAsBilling=true
  paymentMethod: 'creditCard'; // Can be expanded later (PayPal, etc.)
  paymentDetails: CreditCardPayment;
  isGift: boolean;
  giftMessage: string | null;
}

// Helper function for default Address
function createDefaultAddress(): Address {
  return {
    fullName: '',
    streetAddress1: '',
    streetAddress2: null,
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
  };
}
