import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { Link, useLocation , useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import axios from "axios";
import { encryptData , decryptData } from "../../../utils/Encryption";
import "../../../styles/admin-styles/products.css";
import toast from "react-hot-toast";

const statusOptions = [   'Pending',     // Order is awaiting confirmation
  'Ordered', 
  'Pickup Scheduled', 
  'Picked Up',   
  'In Transit', 
  'Out for Delivery', 
  'Delivered',  
  'Returned',   
  'Cancelled',  
  'Refunded' ];

const TransactionManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const [orderData, setOrderData] = useState(order || {});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(orderData?.status[orderData.status.length - 1]?.status || "Processing");

  const server = import.meta.env.VITE_SERVER;

  useEffect(() => {
    if (order) {
      setOrderData(order);
      setSelectedStatus(order?.status[order.status.length - 1]?.status || "Processing");
    }
  }, [order]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    const updatedStatuses = [...orderData.status, { status, date: new Date().toISOString() }];
    setOrderData((prev) => ({
      ...prev,
      status: updatedStatuses,
    }));
    setShowStatusDropdown(false);
  };

  const toggleDropdown = () => {
    setShowStatusDropdown((prev) => !prev);
  };

  const updateOrder = async () => {
    try
    {
      const encryptedData = encryptData(JSON.stringify({id: orderData._id, status: selectedStatus }));
      const response = await axios.post(`${server}/order/manual-status`, { encryptedData });
      if (response.data.success) {
        toast.success("Order updated successfully");
        navigate("/admin/transaction");  
      }
      else if(response.data.success === false && response.status === 200){
        toast.error(response.data.message);
      }
         else {
        throw new Error("Failed to update order");
      }
    }catch (error) {
      if(!navigator.onLine){
        toast.error('Please check your internet connection',{duration: 10000});
      }else if(error.response.status === 403){
        navigate('/');
      }
      else{
        toast.error('Something went wrong. Please try again later');
      }
    }
  };

  if (!order) {
    return <p>Order data not found.</p>;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <section style={{ padding: "2rem" }}>
          <h2> {orderData.order_number}</h2>
          {orderData.items.map((item) => (
            <ProductCard
              key={item._id}
              name={ item.product.name }
              photo={ `${server}/${item.product.images[0].url}`}
              productId={item.product}
              quantity={typeof item.quantity === "number" ? item.quantity : 0}
              price={typeof item.price === "number" ? item.price : 0}
            />
          ))}
        </section>

        <article className="shipping-info-card">
          <button className="product-delete-btn" onClick={() => handleStatusChange("Cancelled")}>
            <FaTrash />
          </button>
          <h1>Order Info</h1>
          <h5>User Info</h5>
          <p>Name: {orderData.shipping_address.name} </p>
          <p>Mobile: {orderData.shipping_address.phoneNumber}</p>
          {orderData.shipping_address.alternatePhoneNumber && <p>Alternate Mobile: {orderData.shipping_address.alternatePhoneNumber}</p>}
          <p>
            Address: {`${orderData.shipping_address.address_line1}, ${orderData.shipping_address.city}, ${orderData.shipping_address.state}, ${orderData.shipping_address.country} ${orderData.shipping_address.pinCode}`}
          </p>

          <h5>Amount Info</h5>
          <p>Subtotal: ₹{orderData.subtotal}</p>
          <p>Shipping Charges: ₹{orderData.shippingCharges}</p>
          <p>Tax: ₹{orderData.tax}</p>
          <p>Discount: ₹{orderData.discount}</p>
          <p>Total: ₹{orderData.total_amount}</p>

          <h5>Status Info</h5>
          <p>
            Status:{" "}
            <span
              className={
                selectedStatus === "Delivered"
                  ? "purple"
                  : selectedStatus === "Shipped"
                  ? "green"
                  : "red"
              }
            >
              {selectedStatus}
            </span>
          </p>

          <button className="shipping-btn" onClick={toggleDropdown}>
            Process Status
          </button>

          {showStatusDropdown && (
            <div className="status-dropdown">
              {statusOptions.map((status) => (
                <div key={status} className="status-option" onClick={() => handleStatusChange(status)}>
                  {status}
                </div>
              ))}
            </div>
          )}

          <button className="update-btn" onClick={updateOrder}>
            Update Order
          </button>
        </article>
      </main>
    </div>
  );
};

const ProductCard = ({ name, photo, price, quantity, productId }) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
