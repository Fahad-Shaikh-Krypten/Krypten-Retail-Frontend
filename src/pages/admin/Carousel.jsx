import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TableHOC from '../../components/admin/TableHOC';
import '../../styles/admin-styles/products.css';
import Pagination from '../../components/Pagination';
import { encryptData, decryptData } from '../../utils/Encryption';
import toast from 'react-hot-toast';

const columns = [
  {
    Header: 'Image',
    accessor: 'images',
  },
  {
    Header: 'Caption',
    accessor: 'caption',
  },
  {
    Header: 'Action',
    accessor: 'action',
  },
];

const CarouselManagement = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCarouselItems = async () => {
    const server = import.meta.env.VITE_SERVER;
    try {
      const response = await axios.get(`${server}/carousel`);
      const { items, total } = response.data.data;
      const updatedRows = items.map((item) => ({
        ...item,
        images: <img src={`${server}/${item.url}`} alt={item.caption} />,
        action: <button className="delete" onClick={() => deleteCarouselItem(item._id)}>Delete</button>,
      }));
      setRows(updatedRows);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      if (!navigator.onLine) {
        toast.error('Please check your internet connection', { duration: 10000 });
      } else if (error.response?.status === 403) {
        navigate('/');
      } else {
        toast.error('Something went wrong. Please try again later');
      }
    }
  };

  const deleteCarouselItem = async (id) => {
    const server = import.meta.env.VITE_SERVER;
    try {
      const response = await axios.delete(`${server}/carousel/${id}`);
      if (response.status === 200) {
        toast.success("Carousel item deleted successfully");
        fetchCarouselItems(); // Refresh the list after deletion
      }
    } catch (error) {
      if (!navigator.onLine) {
        toast.error('Please check your internet connection', { duration: 10000 });
      } else if (error.response?.status === 403) {
        navigate('/');
      } else {
        toast.error('Something went wrong. Please try again later');
      }
    }
  };

  useEffect(() => {
    fetchCarouselItems();
  }, [page]);

  const TableComponent = TableHOC(columns, rows, 'dashboard-carousel-box', 'Carousel Items');

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
      <Link to="/admin/carousel/new" className="create-carousel-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default CarouselManagement;
