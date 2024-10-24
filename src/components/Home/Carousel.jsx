import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Loader } from '../Loader';

import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import axios from 'axios'; // Import axios

import '../../styles/Home/Carousel.css'; // Import your custom CSS file

const CarouselSlideshow = () => {
    const [carouselData, setCarouselData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCarouselData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_SERVER}/carousel`);
                setIsLoading(false);
                setCarouselData(response.data.data.items);
            } catch (error) {
                console.error('Error fetching carousel data:', error);
                // Handle error, e.g., show a toast notification or message
            }
        };

        fetchCarouselData();
    }, []); // Empty dependency array to run once on mount

    return (
        <div className="carousel-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={100}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation={true}
                autoplay={{ delay: 5000 }}
                loop={true}
            >
                {carouselData.map((item) => (
                    <SwiperSlide key={item._id}> {/* Use unique id for key */}
                        <div className="slide">
                            <img src={`${import.meta.env.VITE_SERVER}/${item.url}`} alt={item.caption} />
                            <p className="legend">{item.caption}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CarouselSlideshow;
