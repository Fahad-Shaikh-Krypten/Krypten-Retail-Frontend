import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link , useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TableHOC from '../../components/admin/TableHOC';
import '../../styles/admin-styles/products.css';
import Pagination from '../../components/Pagination';
import { encryptData , decryptData } from '../../utils/Encryption';
import toast from 'react-hot-toast';

const columns = [
  {
    Header: 'Photo',
    accessor: 'images',
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Price',
    accessor: 'price',
  },
  {
    Header: 'Display Price',
    accessor: 'display_price',
  },
  {
    Header: 'Stock',
    accessor: 'stock',
  },
  {
    Header: 'Category',
    accessor: 'category',
  },
  {
    Header: 'Brand',
    accessor: 'brand',
  },
  {
    Header: 'Action',
    accessor: 'action',
  },
];

const Products = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleNavigate = (product) => {
    navigate(`/admin/productmanagement/${product._id}`);
  };
  const fetchProducts = async () => {
    const server = import.meta.env.VITE_SERVER
    try {
      const encryptedData = encryptData(JSON.stringify({
        page: page + 1, 
        perPage: 10,
      }));
      const encryptedResponse = await axios.post(`${server}/products/all`,{
        encryptedData,
      });
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const parsedData = JSON.parse(decryptedResponse);
      const { products, total } = parsedData;
      const updatedRows = products.map((row) => ({
        ...row,
        images: <img src={`${server}/${row.images[0]?.url}`} alt={row.images[0]?.alt_text} />,
        action: <button className="manage" onClick={() => handleNavigate(row)}>Manage</button>,
      }));
      setRows(updatedRows);
      setTotalPages(Math.ceil(total / 10));
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
  useEffect(() => {


    fetchProducts();
  }, [page]);

  useEffect(()=>{
    fetchProducts()
  },[])

  const TableComponent = TableHOC(columns, rows, 'dashboard-product-box', 'Products');

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
      <Link to="/admin/product/new" className="create-product-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default Products;
