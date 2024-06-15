import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';
import { useNavigate } from 'react-router-dom';


const Add_Products_Form = ({ session }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('price', formData.price);
    images.forEach((image, index) => {
      form.append(`images`, image);
    });

    try {
      const response = await axios.post('/admin/add_product', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Product added successfully!');
    } catch (error) {
      setMessage('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session || !session.addProducts) {
    return null;
  }

  // const handleClose = (e) => {
  //   if (e.target.className.includes('overlay-background')) {
  //     navigate('/admin/products');
  //   }
  // };

  return (
    <section>
    {/* <div className="overlay" onClick={handleClose}> */}
    <div className="container" id="addProductsContainer">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow add-product">
              <div id="message" className="mt-3">{message}</div>
              <div className="card-header text-center">
                <h4>Add New Product</h4>
              </div>
              <div className="card-body">
                {loading && <div id="spinner" className="loading-spinner"></div>}
                <form id="addProductForm" onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">Product Name</label>
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
                  <div className="mb-3">
                    <label htmlFor="productDescription" className="form-label">Product Description</label>
                    <textarea
                      className="form-control"
                      id="productDescription"
                      rows="1"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImage1" className="form-label">Product Image 1</label>
                    <input
                      type="file"
                      className="form-control"
                      id="productImage1"
                      name="images"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImage2" className="form-label">Product Image 2</label>
                    <input
                      type="file"
                      className="form-control"
                      id="productImage2"
                      name="images"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productImage3" className="form-label">Product Image 3</label>
                    <input
                      type="file"
                      className="form-control"
                      id="productImage3"
                      name="images"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="productPrice" className="form-label">Product Price (£)</label>
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
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary" id="submitBtn">
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </section>
  );
};

export default Add_Products_Form;
