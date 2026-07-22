import React, { useState } from 'react';
import { Input, Link } from '../../packages/components-react/src';
import './CheckoutPage.css';
import { Button } from '../../packages/components-react/src';

export default {
  title: 'Pages/CheckoutPage',
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
};

/**
 * Account setup page showing step 1 of 3 checkout flow
 * Includes form inputs for first name, last name, email, and password
 */
export const AccountSetup = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });

    const handleInputChange = (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleContinue = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      alert('Account setup complete! Moving to next step...');
    };

    const isFormValid =
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.password.length >= 6 &&
      formData.password.length <= 20;

    return (
      <div className="checkout-container">
        <div className="checkout-page">
          {/* Header Section */}
          <div className="checkout-header">
            <h1 className="checkout-title">Account set up</h1>
            <p className="checkout-step">Step 1 of 3</p>
          </div>

          {/* Login Link Section */}
          <div className="checkout-login-section">
            <p className="checkout-login-text">Already registered?</p>
            <Link href="#" intent="primary">
              Log in
            </Link>
          </div>

          {/* Form Section */}
          <form className="checkout-form" onSubmit={handleContinue}>
            <div className="form-group">
              <Input
                label="First name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Last name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Your Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Create a password"
                type="password"
                placeholder="Enter a password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
              />
              <p className="password-hint">
                Must be between 6 and 20 characters
              </p>
            </div>

            {/* Privacy Notice */}
            <p className="checkout-privacy-notice">
              Your information will be used in accordance with our Privacy and
              Cookie Policy, and may be used to contact you if you do not
              complete your purchase to check if you need any support.
            </p>

            {/* Continue Button */}
            <button
              type="submit"
              className="checkout-button"
              disabled={!isFormValid}
            >
              Continue
            </button>
          </form>

          {/* Support Section */}
          <div className="checkout-support-section">
            <div className="support-help-link">
              <Link href="#" intent="primary">
                Chat to us for help
              </Link>
            </div>
          </div>
          <div className="support-phone">
            <Link href="tel:+448000284258" intent="primary">
              Call 0800 028 4258
            </Link>
            <p className="support-phone-hours">
              Mon - Fri 8am to 7pm / Weekends 9am to 6pm
            </p>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Completed Account Setup - showing success state
 */
export const AccountSetupCompleted = {
  render: () => {
    return (
      <div className="checkout-container">
        <div className="checkout-page">
          {/* Header Section */}
          <div className="checkout-header">
            <h1 className="checkout-title">Account set up</h1>
            <p className="checkout-step">Step 1 of 3 - Complete</p>
          </div>

          {/* Success Message */}
          <div className="checkout-success">
            <svg
              className="success-icon"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="var(--interactive-primary-fill-default, #005c8a)"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <h2 className="success-title">Account created successfully!</h2>
            <p className="success-message">
              Your account has been set up. Proceed to payment information.
            </p>

            <button className="checkout-button checkout-button--success">
              <svg
                className="button-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="white"
              >
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
              Next Step
              <svg
                className="button-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="white"
              >
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Support Contact Section - showing help and phone support options
 */
export const SupportContactSection = {
  render: () => {
    return (
      <div className="checkout-container">
        <div className="checkout-page">
          <div className="checkout-header">
            <h1 className="checkout-title">Need Help?</h1>
          </div>

          <div className="checkout-support-section checkout-support-section--standalone">
            <div className="support-help-link">
              <p className="support-help-label">Chat with us</p>
              <Link href="#" intent="primary">
                Chat to us for help
              </Link>
            </div>
            <div className="support-phone">
              <p className="support-phone-label">Call us</p>
              <Link href="tel:+448000284258" intent="primary">
                Call 0800 028 4258
              </Link>
              <p className="support-phone-hours">
                Mon - Fri 8am to 7pm / Weekends 9am to 6pm
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

/**
 * Multi-step checkout showing all steps
 */
export const MultiStepCheckout = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });

    const handleInputChange = (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleNext = (e) => {
      e.preventDefault();
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      }
    };

    const isFormValid =
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.password.length >= 6 &&
      formData.password.length <= 20;

    // ... rest of the code remains the same until the return statement ...

    return (
      <div className="checkout-container">
        <div className="checkout-page">
          {/* Progress Indicator */}
          <div className="checkout-progress">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`progress-step ${
                  step <= currentStep ? 'progress-step--active' : ''
                } ${step < currentStep ? 'progress-step--completed' : ''}`}
              >
                <div className="progress-step-circle">
                  {step < currentStep ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="white"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <p className="progress-step-label">
                  {step === 1 && 'Account'}
                  {step === 2 && 'Payment'}
                  {step === 3 && 'Confirmation'}
                </p>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <>
              <div className="checkout-header">
                <h1 className="checkout-title">Account set up</h1>
                <p className="checkout-step">Step 1 of 3</p>
              </div>

              <div className="checkout-login-section">
                <p className="checkout-login-text">Already registered?</p>
                <Link href="#" intent="primary">
                  Log in
                </Link>
              </div>

              <form className="checkout-form" onSubmit={handleNext}>
                <div className="form-group">
                  <Input
                    label="First name"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Last name"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Your Email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </div>

                <div className="form-group">
                  <Input
                    label="Create a password"
                    type="password"
                    placeholder="Enter a password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    required
                  />
                  <p className="password-hint">
                    Must be between 6 and 20 characters
                  </p>
                </div>

                <p className="checkout-privacy-notice">
                  Your information will be used in accordance with our Privacy
                  and Cookie Policy, and may be used to contact you if you do
                  not complete your purchase to check if you need any support.
                </p>

                <Button type="submit" disabled={!isFormValid}>
                  Continue
                </Button>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="checkout-header">
                <h1 className="checkout-title">Payment Details</h1>
                <p className="checkout-step">Step 2 of 3</p>
              </div>

              <form className="checkout-form" onSubmit={handleNext}>
                <div className="form-group">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
                >
                  <div className="form-group">
                    <Input label="Expiry Date" placeholder="MM/YY" required />
                  </div>
                  <div className="form-group">
                    <Input label="CVV" placeholder="123" required />
                  </div>
                </div>

                <div className="form-group">
                  <Input
                    label="Cardholder Name"
                    placeholder="Name on card"
                    required
                  />
                </div>

                <Button type="submit">Continue to Confirmation</Button>
              </form>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="checkout-header">
                <h1 className="checkout-title">Confirmation</h1>
                <p className="checkout-step">Step 3 of 3</p>
              </div>

              <div className="checkout-success">
                <svg
                  className="success-icon"
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  fill="var(--interactive-primary-fill-default, #005c8a)"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <h2 className="success-title">Order Confirmed!</h2>
                <p className="success-message">
                  Thank you for your purchase. Your order number is #12345. You
                  will receive a confirmation email shortly.
                </p>

                <Button onClick={() => setCurrentStep(1)}>
                  Start New Order
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
};
