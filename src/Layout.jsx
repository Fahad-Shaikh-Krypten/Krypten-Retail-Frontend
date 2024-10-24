import React from 'react';
import Header from './components/Header';
import Navbar from './components/Home/Navbar';
import NetworkStatus from "./components/NetworkStatus";

const Layout = ({ children }) => {
  return (
    <>
      <NetworkStatus />
      {/* <Header /> */}
      {children}
    </>
  );
};

export default Layout;
