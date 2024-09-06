import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
// import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        age: '',
        price: ''
    });
    const [images, setImages] = useState(Array(6).fill({ file: null, url: null }));
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                if (id) {
                    // Fetch existing product data for editing
                    const response = await axios.get(`/server/get_product`, { params: { id } });
                    const product = response.data;

                    setFormData({
                        name: product.name,
                        type: product.type,
                        description: product.description,
                        age: product.age,
                        price: product.price
                    });

                    const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(x => ({ file: null, url: `https://drive.google.com/thumbnail?id=${x}` }));
                    setImages([...imageUrls, ...Array(6 - imageUrls.length).fill({ file: null, url: null })]);

                    setEdit(true);
                } else {
                    // Initialize for new product
                    setFormData({ name: '', type: '', description: '', age: '', price: '' });
                    setImages(Array(6).fill({ file: null, url: null }));
                    setEdit(false);
                }

            } catch (error) {
                setMessage({ text: 'Product not found. Create a new product?', type: 'danger' });
                setTimeout(() => setMessage({ text: '', type: '' }), 2000);

            } finally {
                setLoading(false);

            }
        };

        fetchProduct();
    }, [id]);

    const extractDriveId = (url) => {
        const match = url.match(/id=([^&]+)/);
        return match ? match[1] : null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...images];
            newImages[index] = { file, url: URL.createObjectURL(file) };
            setImages(newImages);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append('name', formData.name);
        form.append('type', formData.type);
        form.append('description', formData.description);
        form.append('age', formData.age);
        form.append('price', formData.price);

        images.forEach((image, index) => {
            if (image && image.file) {
                form.append('images', image.file);
            } else if (image && image.url) {
                form.append(`existingImages[${index}]`, extractDriveId(image.url));
            }
        });

        try {
            let response;
            if (edit) {
                // Update existing product
                response = await axios.post(`/admin/products/edit_product/${id}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage({ text: 'Product updated successfully!', type: 'success' });

            } else {
                // Add new product
                response = await axios.post('/admin/products/add_product', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage({ text: 'Product added successfully!', type: 'success' });

                // Clear form after success
                setFormData({ name: '', type: '', description: '', price: '' });
                setImages(Array(6).fill({ file: null, url: null }));
            }

            if (response.status === 200) {
                setTimeout(() => {
                    navigate('/admin/products');
                }, 2000);
            }
        } catch (error) {
            setMessage({ text: 'Error saving product. Please check the fields.', type: 'danger' });

        } finally {
            setLoading(false);

        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="admin-product-card card shadow">
                        <div className="card-header text-center">
                            <h2>{edit ? 'Edit Product' : 'Add Product'}</h2>
                        </div>
                        <div className="card-body">
                            {message.text && (
                                <div className={`alert alert-${message.type}`} role="alert">
                                    {message.text}
                                </div>
                            )}
                            {loading && <div className="loading-spinner"></div>}
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="mb-2">
                                    <label className="admin-form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="admin-form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter product description"
                                    ></textarea>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <label className="admin-form-label">Price (£)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="Enter product price"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="admin-form-label">Type</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            placeholder="Enter product type"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="admin-form-label">Age</label>
                                        <select
                                            className="form-control"
                                            name="age"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        >
                                            <option value="">Select Age Category</option>
                                            <option value="0">Kids</option>
                                            <option value="1">Adults</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="admin-form-label">Images</label>
                                    <div className="image-upload-container">
                                        {images.map((image, index) => (
                                            <div key={index} className="image-upload-slot">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, index)}
                                                    style={{ display: 'none' }}
                                                    id={`productImage${index}`}
                                                />
                                                <label htmlFor={`productImage${index}`} className="image-upload-label">
                                                    {image.url ? (
                                                        <img src={image.url} alt={`Product Image ${index + 1}`} className="uploaded-image" />
                                                    ) : (
                                                        <svg width="50" height="50" fill="#a09e9e" viewBox="0 0 16 16">
                                                            {/* SVG for placeholder */}
                                                            <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                                                            <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7a1 1 0 0 1-1 1" />
                                                        </svg>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button type="submit" className="btn btn-primary m-3">
                                        {edit ? 'Save' : 'Add'}
                                    </button>
                                    <button type="button" className="btn btn-secondary m-3" onClick={() => navigate('/admin/products')}>
                                        Cancel
                                    </button>
                                </div>


                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
