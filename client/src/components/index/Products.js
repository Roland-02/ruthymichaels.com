import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import { motion } from 'framer-motion';
import axios from 'axios';

import '../../styles/index.css';
import '../../styles/common.css'
import '../../bootstrap/css/mdb.min.css';

import LoadingSpinner from '../common/LoadingSpinner';


const Products = ({ setMessage, initialProducts, updateWishlist }) => {
    const { session } = useContext(SessionContext);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([products]);
    const [wishlist, setWishlist] = useState([]);
    const [cartProducts, setCartedProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [selectedAge, setSelectedAge] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [sortOption, setSortOption] = useState("default");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [selectedPrice, setSelectedPrice] = useState(maxPrice);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const filterRef = useRef(null);
    const navigate = useNavigate();


    const toggleFilterMenu = () => {
        setIsFilterOpen(prevState => !prevState);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/server/get_products');
            const allProducts = response.data;
            const formattedProducts = allProducts.map(prod => {
                const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                return { ...prod, imageUrls };
            });
            setProducts(formattedProducts)
            setAllProducts(formattedProducts)
            const types = [...new Set(formattedProducts.map(product => product.type))];
            const prices = formattedProducts.map(product => product.price);

            const maxPriceRounded = Math.ceil(Math.max(...prices));
            setProductTypes(types);
            setMinPrice(Math.floor(Math.min(...prices)));
            setMaxPrice(maxPriceRounded);
            setSelectedPrice(maxPriceRounded);


        } catch (error) {
            setMessage({ content: 'Error loading products', product: null, action: 'error' });

        } finally {
            setLoading(false);

        }
    };

    const fetchWishlist = async () => {
        try {
            if (session && session.id) {
                const response = await axios.get(`/server/get_wishlist/${session.id}`);
                const allLoved = response.data.map(x => x.product_id);
                setWishlist(allLoved);

            } else {
                setWishlist([])
            }

        } catch (error) {
            setMessage({ content: 'Error loading wishlist', product: null, action: 'error' });

        }
    };

    const fetchCartProducts = async () => {
        try {
            if (session && session.id) {
                const response = await axios.get(`/server/get_cart/${session.id}`);
                const allCart = response.data.map(x => x.product_id);
                setCartedProducts(allCart);

            } else {
                // fetch cart from cache
                const cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];
                const cartProductIDs = cachedCart.map(item => item.productID);
                setCartedProducts(cartProductIDs);
            }

        } catch (error) {
            setMessage({ content: 'Error loading cart', product: null, action: 'error' });

        }
    };

    const handleLoveClick = async (productID) => {
        if (session && session.id != null) {

            const isLoved = wishlist.includes(productID);
            setWishlist((prev) => {
                if (isLoved) {
                    return prev.filter(id => id !== productID); // Remove product
                } else {
                    return [...prev, productID]; // Add product
                }
            });

            try {
                let response;
                if (isLoved) {

                    if (updateWishlist) {
                        await updateWishlist(productID);
                    }

                    // If the product is already loved, make a request to remove it
                    response = await axios.post('/server/remove_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Removed from wishlist', productID, action: 'love' });

                    } else {
                        setMessage({ content: 'Error removing from wishlist', productID, action: 'love' });

                    }
                } else {

                    // If the product is not loved, make a request to love it
                    response = await axios.post('/server/add_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Added to wishlist', productID, action: 'love' });

                    } else {
                        setMessage({ content: 'Error adding to wishlist', productID, action: 'love' });

                    }
                }
            } catch (error) {
                // Revert the state if the request fails
                setWishlist((prev) => ({
                    ...prev,
                    [productID]: isLoved,
                }));
                setMessage({ content: 'Error occurred while updating wishlist', product: '', action: 'error' });

            }
        } else {
            navigate('/login');
        }
    };

    const handleCartClick = async (productID) => {
        if (session && session.id != null) {

            const isCart = cartProducts.includes(productID);
            setCartedProducts((prev) => {
                if (isCart) {
                    return prev.filter(id => id !== productID); // Remove product
                } else {
                    return [...prev, productID]; // Add product
                }
            });

            try {
                let response;
                if (isCart) {
                    // If the product is already loved, make a request to remove it
                    response = await axios.post('/server/remove_cart_product', {
                        user_id: session.id,
                        product_id: productID,
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Removed from basket', productID, action: 'cart' });

                    } else {
                        setMessage({ content: 'Failed to remove from basket', productID, action: 'cart' });

                    }
                } else {

                    // If the product is not loved, make a request to love it
                    response = await axios.post('/server/update_cart', {
                        user_id: session.id,
                        product_id: productID,
                        qty: 1
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Added to basket', productID, action: 'cart' });
                    }
                }
            } catch (error) {
                // Revert the state if the request fails
                setCartedProducts((prev) => ({
                    ...prev,
                    [productID]: isCart,
                }));
                setMessage({ content: 'Error saving basket', product: '', action: 'error' });

            }
        } else {

            // Retrieve the current cart from localStorage
            let cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

            // Check if the product is already in the cached cart
            const isCart = cachedCart.some(item => item.productID === productID);

            // Add or update the product in the cached cart
            if (isCart) {
                cachedCart = cachedCart.filter(item => item.productID !== productID);
            } else {
                cachedCart.push({ productID, qty: 1 });
            }

            // Update the cart in localStorage
            localStorage.setItem('cartProducts', JSON.stringify(cachedCart));

            // Update the state with only product IDs
            const cartProductIDs = cachedCart.map(item => item.productID);
            setCartedProducts(cartProductIDs);

            setMessage({ content: 'Added to basket', productID, action: 'cart' });
        }
    };

    const handleProductClick = (name) => {
        navigate(`/item/${name}`);
    };

    const sortProducts = (products, sortOption) => {
        switch (sortOption) {
            case "price-asc":
                return [...products].sort((a, b) => a.price - b.price);
            case "price-desc":
                return [...products].sort((a, b) => b.price - a.price);
            default:
                return allProducts;
        }
    };

    const handleClickOutside = (event) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
            setIsFilterOpen(false); // Close the filter
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    useEffect(() => {
        const initialize = async () => {
            if (initialProducts) {
                setProducts(initialProducts)

            } else {
                await fetchProducts();
            }
            await fetchWishlist();
            await fetchCartProducts();
        };

        initialize();

    }, [session, navigate, initialProducts]);

    useEffect(() => {
        const filteredAndSortedProducts = sortProducts(products, sortOption);
        setProducts(filteredAndSortedProducts);
    }, [sortOption]);

    useEffect(() => {
        const filterProducts = () => {
            let filtered = allProducts;

            if (selectedType) {
                filtered = filtered.filter(product => product.type === selectedType);
            }

            if (selectedAge !== "") {
                filtered = filtered.filter(product => product.age === selectedAge);
            }

            const roundedSelectedPrice = Math.ceil(parseFloat(selectedPrice));
            filtered = filtered.filter(product => product.price <= roundedSelectedPrice);

            setProducts(filtered);
        };

        filterProducts();
    }, [selectedType, selectedAge, selectedPrice]);

    // filter slide animation
    const filterVariants = {
        hidden: {
            x: '-100%',
            opacity: 0,
        },
        visible: {
            x: '0%',
            opacity: 1,
            transition: {
                type: 'tween',
                duration: 0.2,
                ease: 'easeInOut',
            },
        },
        exit: {
            x: '-100%',
            opacity: 0,
            transition: {
                type: 'tween',
                duration: 0.4,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <section className="view-container products">
            <div className="row">

                {!initialProducts && (
                    <div className="col-lg-2 col-md-2">

                        {/* desktop */}
                        <div className="filter-box desktop">

                            {/* Sort By */}
                            <h4>Sort by</h4>
                            <div className="sort-container">
                                <select
                                    id="sort-by"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="default">Default</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div className="type-filter">
                                <h4>Type</h4>
                                <div>
                                    <input
                                        type="radio"
                                        id="all"
                                        name="product-type"
                                        value=""
                                        checked={selectedType === ''}
                                        onChange={() => setSelectedType("")}
                                    />
                                    <label htmlFor="all" style={{ fontWeight: 'bold', fontSize: '18px' }}>All</label>
                                </div>

                                {productTypes.map((type) => (
                                    <div key={type}>
                                        <input
                                            type="radio"
                                            id={type}
                                            name="product-type"
                                            value={type}
                                            checked={selectedType === type}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                        />
                                        <label htmlFor={type}>{type}</label>
                                    </div>
                                ))}
                            </div>

                            {/* Age Filter */}
                            <div className="type-filter mt-2">
                                <h4>Age</h4>
                                <div>
                                    <input
                                        type="radio"
                                        id="all-ages"
                                        name="age"
                                        value=""
                                        checked={selectedAge === ''}
                                        onChange={() => setSelectedAge("")}
                                    />
                                    <label htmlFor="all-ages" style={{ fontWeight: 'bold', fontSize: '18px' }}>All</label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        id="kids"
                                        name="age"
                                        value="Kids"  // Age 0 for kids
                                        checked={selectedAge === 'Kids'}
                                        onChange={() => setSelectedAge("Kids")}
                                    />
                                    <label htmlFor="kids">Kids</label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        id="adults"
                                        name="age"
                                        value="Adults"  // Age 1 for adults
                                        checked={selectedAge === 'Adults'}
                                        onChange={() => setSelectedAge("Adults")}
                                    />
                                    <label htmlFor="adults">Adults</label>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="price-filter">
                                <h4>Price</h4>
                                <input
                                    type="range"
                                    id="price-range"
                                    name="product-price"
                                    min={minPrice}
                                    max={maxPrice}
                                    value={selectedPrice}
                                    onChange={(e) => setSelectedPrice(e.target.value)}
                                    step="1"
                                />
                                <div className="price-label">
                                    <label htmlFor="price-range">
                                        up to <strong>£{selectedPrice}</strong>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* mobile */}
                        <div className="filter-box mobile" ref={filterRef}>
                            {/* Filter toggle button */}
                            <button
                                className={`filter-toggle-btn menu-item ${isFilterOpen ? 'open' : ''}`}
                                onClick={toggleFilterMenu}
                            >
                                {isFilterOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" className="bi bi-funnel-fill" viewBox="0 0 16 16">
                                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" class="bi bi-funnel" viewBox="0 0 16 16">
                                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                                    </svg>
                                )}
                            </button>

                            {isFilterOpen && (
                                // <div className={`mobile-filter-box ${isFilterOpen ? 'open' : ''}`}>
                                <motion.div
                                    className={`mobile-filter-box  ${isFilterOpen ? 'open' : ''}`}
                                    initial="hidden"
                                    animate={isFilterOpen ? 'visible' : 'hidden'}
                                    exit="exit"
                                    variants={filterVariants}
                                >

                                    {/* Sort By */}
                                    <h4>Sort by</h4>
                                    <div className="sort-container">

                                        <select
                                            id="sort-by"
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                        >
                                            <option value="default">Default</option>
                                            <option value="price-asc">Price: Low to High</option>
                                            <option value="price-desc">Price: High to Low</option>
                                        </select>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="type-filter">
                                        <h4>Filter</h4>
                                        <div>
                                            <input
                                                type="radio"
                                                id="all"
                                                name="product-type"
                                                value=""
                                                checked={selectedType === ''}
                                                onChange={() => setSelectedType("")}
                                            />
                                            <label htmlFor="all" style={{ fontWeight: 'bold', fontSize: '18px' }}>All</label>
                                        </div>
                                        {productTypes.map((type) => (
                                            <div key={type}>
                                                <input
                                                    type="radio"
                                                    id={type}
                                                    name="product-type"
                                                    value={type}
                                                    checked={selectedType === type}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                />
                                                <label htmlFor={type}>{type}</label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Age Filter */}
                                    <div className="type-filter mt-2">
                                        <h4>Age</h4>
                                        <div>
                                            <input
                                                type="radio"
                                                id="all-ages"
                                                name="age"
                                                value=""
                                                checked={selectedAge === ''}
                                                onChange={() => setSelectedAge("")}
                                            />
                                            <label htmlFor="all-ages" style={{ fontWeight: 'bold', fontSize: '18px' }}>All</label>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                id="kids"
                                                name="age"
                                                value="0"
                                                checked={selectedAge === '0'}
                                                onChange={() => setSelectedAge("0")}
                                            />
                                            <label htmlFor="kids">Kids</label>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                id="adults"
                                                name="age"
                                                value="1"
                                                checked={selectedAge === '1'}
                                                onChange={() => setSelectedAge("1")}
                                            />
                                            <label htmlFor="adults">Adults</label>
                                        </div>
                                    </div>

                                    {/* Price Filter */}
                                    <div className="price-filter mt-2">
                                        <h4>Price</h4>
                                        <input
                                            type="range"
                                            id="price-range"
                                            name="product-price"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={selectedPrice}
                                            onChange={(e) => setSelectedPrice(e.target.value)}
                                            step="1"
                                        />
                                        <div className="price-label">
                                            <label htmlFor="price-range">
                                                up to <strong>£{selectedPrice}</strong>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                                // </div>
                            )}

                        </div>

                    </div>
                )}

                {loading && <LoadingSpinner />}

                {/* Products Container */}
                <div className="col-lg-10 col-md-10 col-sm-10 col-10">

                    <div className={`card-container ${initialProducts ? 'center-layout' : 'default-layout'}`}>
                        {products.map((product) => (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={product.id}>
                                <div className="product-card" onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product.name);
                                }}>
                                    <div className="card-body">
                                        <img
                                            src={product.imageUrls[0]}
                                            className='product-image'
                                            alt="Product"
                                            onMouseEnter={(e) => {
                                                if (product.imageUrls[1]) {
                                                    e.currentTarget.src = product.imageUrls[1];
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.src = product.imageUrls[0];
                                            }}
                                        />
                                        <div className='product-details'>
                                            <h2 className="card-title">{product.name}</h2>
                                            <h5 className="card-price">£{product.price}</h5>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="menu-item shop-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            handleLoveClick(product.id);
                                        }}>
                                            {wishlist.includes(product.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                                    <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart" viewBox="0 0 16 16">
                                                    <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="menu-item shop-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            handleCartClick(product.id);
                                        }}>
                                            {cartProducts.includes(product.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-cart-fill" viewBox="0 0 16 16">
                                                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-cart-plus" viewBox="0 0 16 16">
                                                    <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                                                    <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                </svg>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>

        </section>
    );

};

export default Products;
