import React, { useEffect, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { VscPackage } from "react-icons/vsc";
import { FaMapPin, FaUser, FaBars } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import { GiPowerButton } from "react-icons/gi";
import { useDispatch } from 'react-redux';
import { logout } from '../redux/thunks/User';
import { logout as localLogout } from '../redux/reducers/UserReducer';
import { useNavigate , useLocation} from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { decryptData, encryptData } from '../utils/Encryption';
import PersonalInfoForm from '../components/PersonalInfoForm';
import MyOrders from './MyOrders';
import toast from 'react-hot-toast';
import ShippingAddress from './ShippingAddress';
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [user, setUser] = useState({});
  const [activeSection, setActiveSection] = useState(location?.state || 'personalInfo');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const fetchUser = async () => {
    try {
      const encryptedResponse = await apiClient.get('/user');
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const response = JSON.parse(decryptedResponse);
      setUser(response);
    } catch (error) {
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

  const onSave = async (formData) => {
    try{
    const encryptedData = encryptData(JSON.stringify(formData));
    const response = await apiClient.put('/user', { encryptedData });
    if (response.data.success) {
      const decryptedResponse = decryptData(response.data.data);
      const parsedResponse = JSON.parse(decryptedResponse);
      setUser(parsedResponse);
    }
  }catch (error) {
    if(!navigator.onLine){
      toast.error('Please check your internet connection',{duration: 10000});
      console.log("here")
    }else if(error.response.status === 403){
      navigate('/');
    }
    else{
      toast.error('Something went wrong. Please try again later');
    }
  }
  };


  const handleLogout = () => {
    dispatch(logout())
      .then(() => {
        dispatch(localLogout());
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className='profile-page'>
      <div className={`left ${isSidebarOpen ? 'open' : ''}`}>
        <ImCancelCircle className="cancel" size={20} onClick={toggleSidebar} />
        <div className="user-display">
          <CgProfile size={30} />
          <div>
            <p>Hello,</p>
            <h4>{user.first_name}</h4>
          </div>
        </div>
        <div className="user-options">
        <div onClick={() => setActiveSection("personalInfo")}
        className={`account-settings ${activeSection === 'personalInfo' ? 'active' : ''}`}
      >
            <FaUser size={20} />
            <p>Personal Information</p>
          </div>
          <div onClick={() => setActiveSection("myOrders")} className={`my-orders-settings ${activeSection === 'myOrders' ? 'active' : ''}`}>
            <VscPackage size={20} />
            <p>My Orders</p>
          </div>
          <div onClick={() => setActiveSection("shippingAddress")} className={`address ${activeSection === 'shippingAddress' ? 'active' : ''}`}>
            <FaMapPin size={20} />
            <p>Manage Address</p>
          </div>
          <div onClick={handleLogout} className="logout">
            <GiPowerButton size={20} />
            <p>Logout</p>
          </div>
        </div>
      </div>
      <div className="right">
       <div className="hamburger" onClick={toggleSidebar}>
          <FaBars size={20} />
        </div>
        {activeSection === "shippingAddress" && <ShippingAddress />}
        {activeSection === "personalInfo" && <PersonalInfoForm currentInfo={user} onSave={onSave} />}
        {activeSection === "myOrders" && <MyOrders />}
      </div>
    </div>
  );
};

export default Profile;
