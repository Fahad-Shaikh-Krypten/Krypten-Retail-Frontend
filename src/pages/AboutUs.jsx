import React from 'react'
import "../styles/ServicePage.css"

const AboutUs = () => {
  return (
    <div className="about-us">
      <h3>About Us</h3>
      <p>
        Welcome to E-Commerce Store! We are a dedicated team of professionals committed to delivering the best shopping experience. Our platform offers a wide variety of products at competitive prices, ensuring you find exactly what you're looking for.
      </p>
      <div className="about-us-content">
        <ul>
          <li>Our Mission:</li>
          <p>
            Our mission is to provide customers with an exceptional online shopping experience by offering a diverse range of high-quality products, fast delivery, and top-notch customer service.
          </p>
          <li>Customer Commitment:</li>
          <p>
            We value our customers and are committed to providing transparent pricing, secure payments, and reliable delivery services. Customer satisfaction is our top priority.
          </p>
          <li>Quality Products:</li>
          <p>
            Our catalog includes products from trusted brands and suppliers. We carefully curate each item to ensure quality and reliability.
          </p>
          <li>Fast & Secure Shopping:</li>
          <p>
            Enjoy a seamless shopping experience with easy navigation, secure payments, and a fast checkout process. We ensure all your transactions are secure and your data is protected.
          </p>
          <li>Contact Us:</li>
          <p>
            We are here to help! If you have any questions, concerns, or feedback, feel free to reach out to us through our contact page. We would love to hear from you!
          </p>
        </ul>
      </div>
    </div>
  )
}

export default AboutUs;
