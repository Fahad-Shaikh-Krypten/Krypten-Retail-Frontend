import React, { useEffect, useState } from 'react'
import apiClient from '../utils/apiClient';
import { decryptData } from '../utils/Encryption';
import MyOrderItem from '../components/Order/MyOrderItem';
import "../styles/Order/MyOrders.css"
import { Loader } from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const server = import.meta.env.VITE_SERVER

    const fetchMyOrders = async () => {

        setIsLoading(true);
        try{
        const encryptedResponse = await apiClient.get('/order/my-orders');
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const data = JSON.parse(decryptedResponse);
        setOrders(data);
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
        setIsLoading(false);
    }

    useEffect(() => {
        fetchMyOrders();
    }, [])

    if(isLoading) return <Loader />
    if(orders.length === 0) {
        return (
            <div className='my-empty-orders'>
                <h3>No Orders Found</h3>
                <button onClick={() => navigate('/')}>Continue Shopping</button>
            </div>
        )
    }
  return (
    <div className='my-orders'>
        {
            orders.map((order) => (
                <MyOrderItem key={order._id} order={order} />
            ))
        }

    </div>
  )
}

export default MyOrders