import React from 'react'
import Star from '../Product/Star'
import { useNavigate } from 'react-router'
import "../../styles/DisplayPage/ProductDisplay.css"

const ProductDisplay = ({product}) => {
    const server = import.meta.env.VITE_SERVER
    const navigate = useNavigate();
    const encodedProductName = encodeURIComponent(product.name.replace(/\s+/g, '-').toLowerCase());

  return (
    <div className="product-display" onClick={() => navigate(`/product/${encodedProductName}`)}>
        <div className="product-display-image">
            <img src={`${server}/${product?.images[0].url}`} alt={product?.images[0].alt_text} />
        </div>
        <div className="product-display-details">
            <h5 >{product?.name}</h5>
            <p>{product?.description?.replace(/#/g, '')}</p>
            <div className="rating">
                <Star star={product?.rating} />
            </div>
            <h4>RS. {product?.price}</h4>
        </div>
    </div>
  )
}

export default ProductDisplay