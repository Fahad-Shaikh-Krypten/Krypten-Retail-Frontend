import React, { useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';
import '../styles/admin-styles/CarouselForm.css'; // Your CSS file

const CarouselForm = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const server = import.meta.env.VITE_SERVER;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file)); // Create preview URL for the image
        } else {
            setImagePreview(null);
        }
    };

    const handleCaptionChange = (e) => {
        setCaption(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image || !caption) {
            setMessage('Please select an image and provide a caption.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('caption', caption);

        try {
            setUploading(true);
            setMessage('');

            const response = await apiClient.post(`/carousel/new`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
            setMessage(response.data.message);
            setImage(null);
            setImagePreview(null);
            setCaption('');
            toast.success('Carousel slide uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading slide:', error);
            setMessage('Error uploading slide');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-carousel-form">
            <h2>Add Carousel Slide</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" onChange={handleImageChange} accept="image/*" />
                </div>

                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="caption">Caption:</label>
                    <input
                        type="text"
                        id="caption"
                        value={caption}
                        onChange={handleCaptionChange}
                        placeholder="Enter slide caption"
                    />
                </div>

                <button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default CarouselForm;
