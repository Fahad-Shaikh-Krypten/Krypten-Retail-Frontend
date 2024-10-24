import React, { useState, useEffect, useRef } from 'react';
import Star from './Star';
import { MdOutlineShoppingCart } from "react-icons/md";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { encryptData, decryptData } from '../../utils/Encryption';
import apiClient from '../../utils/apiClient';
import { getCartFromLocalStorage, setCartToLocalStorage } from '../../utils/localStorage';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../../styles/Product/Product.css';
import Header from '../Header';
import { checkCourierServiceability } from '../../utils/Shiprocket';

const ProductPage = ({ product }) => {
  const server = import.meta.env.VITE_SERVER;
  const [mainImage, setMainImage] = useState(`${server}/${product.images[0].url}`);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [display, setDisplay] = useState('none');
  const [isFixed, setIsFixed] = useState(true);
  const [pincode, setPincode] = useState('');
  const [availability, setAvailability] = useState(false);

  const handlePincodeChange = (event) => {
    const pincode = event.target.value;
    const validValue = pincode.replace(/\D/g, '').slice(0, 6);
    setPincode(validValue);
   
  };

  const { isLoggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const specificationsRef = useRef(null);

  const handleImageHover = (newImage) => {
    setMainImage(newImage);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setX(x);
    setY(y);
    setDisplay('block');
  };

  async function addtoCart(event) {
    event.stopPropagation();
  
    if (product.stock <= 0) {
      toast.error('Out of Stock');
      return;
    }
  
    const productData = {
      product: product._id,
      quantity: 1,
    };
  
    const encryptedData = encryptData(JSON.stringify(productData));
  
    try {
      if (isLoggedIn) {

        const response = await apiClient.get('/cart');
        const decryptedResponse = decryptData(response.data.data);
        const cart = JSON.parse(decryptedResponse);
  
        const existingItem = cart.items.find(item => item.product._id === product._id);
  
        if (existingItem) {
          existingItem.quantity += 1;
          await apiClient.post('/cart/update', { encryptedData });
        } else {
          await apiClient.post('/cart/add', { encryptedData });
        }
  
        toast.success('Added to cart');
        navigate('/cart');
      } else {
        // Handle cart in local storage
        let cart = getCartFromLocalStorage();
        const existingItem = cart.items.find(item => item.product._id === product._id);
  
        if (existingItem) {
          // Update the quantity of the existing item
          existingItem.quantity += 1;
        } else {
          // Add new item to the cart
          cart.items.push({ product, quantity: 1 });
        }
  
        // Save the updated cart to local storage
        setCartToLocalStorage(cart);
  
        toast.success('Added to cart');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          // Check if the bottom of the specifications is fully visible
          if (entry.boundingClientRect.bottom <= window.innerHeight) {
            setIsFixed(false);
          } else {
            setIsFixed(true);
          }
        }
      },
      {
        threshold: 1.0,
        rootMargin: '0px'
      }
    );

    if (specificationsRef.current) {
      observer.observe(specificationsRef.current);
    }

    return () => {
      if (specificationsRef.current) {
        observer.unobserve(specificationsRef.current);
      }
    };
  }, []);

  const checkAvailability = async () => {
    try {
      if (!pincode) {
        toast.error('Please enter a pincode');
        return;
      }
      if(pincode.length !== 6) {
        toast.error('Please enter a valid pincode');
        return;
      }
      const data = await checkCourierServiceability(pincode, product.weight); ;
      setAvailability(data);
      if(data) {
        toast.success('Delivery available');
      } else {
        toast.error('Delivery not available');
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      toast.error('Failed to check delivery availability');
    }
  };

  const formatDescription = (description) => {
    // Split sentences based on periods that are not surrounded by the '#' character
    const sentences = description.split(/(?<!#)\.(?!#)/).filter(sentence => sentence.trim() !== '');
  
    return sentences.map((sentence, index) => (
      // Remove '#' from each sentence and trim it before displaying
      <li key={index}>{sentence.replace(/#/g, '').trim()}.</li>
    ));
  };
  

  const renderSpecifications = () => (
    <div className="specifications" ref={specificationsRef}>
      {product.specifications?.map(spec => (
        <div key={spec._id} className="specification">
          <div className="spec-key">{spec.key}</div>
          <div className="spec-value">{spec.value}</div>
        </div>
      ))}
    </div>
  );

  if (!product) return navigate('/');

  return (
    <>
      <Header />
      <div className="product-page">
        <div className={`product-image ${isFixed ? 'fixed' : 'unfixed'}`} style={{
          '--url': `url(${mainImage})`,
          '--zoom-x': `${x}%`,
          '--zoom-y': `${y}%`,
          '--display': display
        }}>
          <div className="image-with-overlay">
            {/* Image overlay if needed */}
          </div>
          <div className={` ${isFixed ? 'stick' : 'unstick'}`}>
            <img
              className="main-product-image"
              onMouseOut={() => setDisplay('none')}
              onMouseMove={handleMouseMove}
              src={mainImage}
              alt="Product"
            />
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
                onClick={(e) => addtoCart(e)}
                disabled={product.stock <= 0 || !availability}
              >
                <MdOutlineShoppingCart /> Add to Cart
              </button>
              <button
                onClick={() => navigate('/checkout', { state: { buyNowProduct: product } })}
                className="buy-now-btn"
                disabled={product.stock <= 0 || !availability}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        <div className={`side-product-image ${isFixed ? 'fixed' : 'unfixed'}`}>
          {product?.images?.map((image) => (
            <img
              key={image._id}
              src={`${server}/${image.url}`}
              alt="Product"
              onMouseEnter={() => handleImageHover(`${server}/${image.url.replace(/\\/g, '/')}`)}
            />
          ))}
        </div>
        <div className="product-details">
          <p className="product-title">{product?.name}</p>
          <div className="product-rating">
            {product?.rating ? <Star star={product.rating} /> : null}
          </div>
          <p className="product-category">{product?.category}</p>
          <p className="product-brand">{product?.brand}</p>
          <div className="price">
            <p className="product-price">RS.{product?.price}</p>
            <em className="product-display-price">RS.{product?.display_price}</em>
            <p className="product-discount">
              {((product?.display_price - product?.price) / product?.display_price * 100).toFixed(0)}% off
            </p>
          </div>
          {product.stock <= 0 && (
            <p className="out-of-stock">Out of Stock</p>
          )}
          <div className="new-action-buttons">
            <button onClick={(e) => addtoCart(e)} className="add-to-cart-btn" disabled={product.stock <= 0}>
              <MdOutlineShoppingCart /> Add to Cart
            </button>
            <button
              onClick={() => navigate('/checkout', { state: { buyNowProduct: product } })}
              className="buy-now-btn"
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>
          </div>
          <div className="delivery-availability">
            <input
              type="text"
              placeholder="Enter your pincode"
              value={pincode}
              onChange={handlePincodeChange}
              maxLength={6}
            />
            <button disabled={product.stock <= 0} onClick={checkAvailability}>Check Availability</button>
          </div>
          <div className="product-description">
            <ul>
              {product?.description && formatDescription(product.description)}
            </ul>
          </div>

          {/* Render specifications */}
          {renderSpecifications()}
        </div>
      </div>
    </>
  );
};

export default ProductPage;
