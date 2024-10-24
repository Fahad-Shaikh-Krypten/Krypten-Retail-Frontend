import React from 'react'
import "../styles/ServicePage.css"

const CancellationPolicy = () => {
  return (
    <div className="cancellation-policy">
      <h3>Cancellation Policy</h3>
      <p>
        We understand that circumstances may change, and you may need to cancel your order. Our cancellation policy allows you to cancel your order under the following conditions:
        
      </p>
      <div className="cancellation-policy-content">
        <ul>
          <li>Eligibility for Cancellation:</li>
          <p>
            Cancellations are only allowed before the product is delivered. Once the product has been delivered, cancellations are no longer accepted.
          </p>
          <li>How to Cancel:</li>
          <p>
            To cancel your order, please log in to your account and navigate to the 'My Orders' section. Select the order you wish to cancel and follow the prompts to cancel it.
          </p>
          <li>Refunds for Cancelled Orders:</li>
          <p>
            Once your cancellation request is confirmed, we will process your refund based on the original payment method. The refund process may take 7-10 business days.
          </p>
          <li>Shipping Cancellations:</li>
          <p>
            If your order has already been shipped, you will not be able to cancel the order, and you may be eligible for a return instead.
          </p>
        </ul>
      </div>
    </div>
  )
}

export default CancellationPolicy;
