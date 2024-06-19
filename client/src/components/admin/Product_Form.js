import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';
import { useNavigate, useParams } from 'react-router-dom';


const Product_Form = ({ }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    price: ''
  });

  // const [images, setImages] = useState(Array(6).fill(null)); 
  const [images, setImages] = useState(Array(6).fill({ file: null, url: null }));
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false)
  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        if (id) {
          const response = await axios.get(`/server/get_product/${id}`);
          const product = response.data;
          setFormData({
            name: product.name,
            type: product.type,
            description: product.description,
            price: product.price,
          });
          const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
          const imageUrls = imageIds.map(x => ({ file: null, url: `https://drive.google.com/thumbnail?id=${x}` }));
          setImages([...imageUrls, ...Array(6 - imageUrls.length).fill({ file: null, url: null })]);
          setEdit(true);

        } else {
          setImages(Array(6).fill(null));
          setEdit(false);

        }

      } catch (error) {
        setEdit(false);
        setMessage({ text: 'Product not found. Create new?', type: 'danger' });
        setFormData({
          name: null,
          type: null,
          description: null,
          price: null,
        })
        setTimeout(() => { setMessage({ text: '', type: '' }); }, 2000);

      } finally {
        setLoading(false);

      };

    };

    fetchProduct();

  }, [id]);

  const extractDriveId = (url) => {
    const match = url.match(/id=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append('name', formData.name);
    form.append('type', formData.type);
    form.append('description', formData.description);
    form.append('price', formData.price);
    images.forEach((image, index) => {
      if (image && image.file) {
        form.append(`images`, image.file);
      } else if (image && image.url) {
        form.append(`existingImages[${index}]`, extractDriveId(image.url));

      }
    });

    if (id) {
      try {
        const response = await axios.post(`/admin/products/edit_product/${id}`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status == 200) {
          setMessage({ text: 'Changes saved!', type: 'success' });
        } else {
          setMessage({ text: 'Error saving changes. Please check your fields', type: 'danger' });
        }

      } catch (error) {
        setMessage({ text: 'Error saving changes. Please check your fields', type: 'danger' });

      } finally {
        setTimeout(() => { setMessage({ text: '', type: '' }) }, 2000);
        setLoading(false);

      }

    } else {
      try {
        const response = await axios.post('/admin/products/add_product', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage({ text: 'Product added!', type: 'success' });

        // Clear form and message after 3 seconds
        setTimeout(() => {
          setFormData({ name: '', type: '', description: '', price: '' });
          setImages(Array(6).fill(null));
          setMessage({ text: '', type: '' });
        }, 2000);

      } catch (error) {
        setMessage({ text: 'Error adding product. Please check your fields.', type: 'danger' });

      } finally {
        setLoading(false);

      }

    }

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


  return (
    <div className="container" >
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="add-product-card card shadow">

            <div className="card-header text-center">
              <h2>{edit ? 'Edit Product' : 'New Product'}</h2>
            </div>

            <div className="card-body add-card">
              {message.text && (
                <div className={`alert alert-${message.type} text-center`} role="alert">
                  {message.text}
                </div>
              )}
              {loading && <div id="spinner" className="loading-spinner"></div>}
              <form id="addProductForm" onSubmit={handleSubmit} encType="multipart/form-data">

                <div className="mb-2">
                  <label htmlFor="productName" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="productName"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="productDescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="productDescription"
                    rows="2"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="productPrice" className="form-label">Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="productPrice"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter product price"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="productType" className="form-label">Type</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productType"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="Enter product type"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="form-label">Pictures</label>
                  <div className="image-upload-container">
                    {images.map((image, index) => (
                      <div key={index} className="image-upload-slot">
                        <input
                          type="file"
                          id={`productImage${index}`}
                          className="file-input"
                          onChange={(e) => handleFileChange(e, index)}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor={`productImage${index}`} className="image-upload-label">
                          {image && image.url ? (
                            <img
                              src={image.url}
                              alt={`Product Image ${index + 1}`}
                              className="uploaded-image"
                            />
                          ) : (
                            <svg
                              className="bi bi-images"
                              xmlns="http://www.w3.org/2000/svg"
                              width="50"
                              height="50"
                              fill="#a09e9e"
                              viewBox="0 0 16 16"
                            >
                              <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                              <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                            </svg>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn btn-primary">
                    {edit ? 'Save' : 'Add'}
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

export default Product_Form;
