async function get_products() {
    try {
        const response = await axios.get(`/get_products`);
        return response.data
    } catch (error) {
        console.error('Error shuffling films')
    }
}

window.onload = async function () {

    const overlay = document.getElementById('overlay');

    // products
    const products = await get_products();
    const products_container = document.getElementById('viewProducts');
    let products_html = ''

    // add products
    const addProductsContainer = document.getElementById('addProductsContainer') || null;
    const addProductsForm = document.getElementById('addProductForm') || null;
    const loadingCircle = document.getElementById('spinner') || null;

    // await loadProducts();

    async function loadProducts() {
        // load products
        products.forEach(product => {
            products_html += `
            <div class="row mb-3">
                <div class="col-sm text-left">
                    <img src="https://drive.google.com/thumbnail?id=${product.image_1}" class="img-fluid" alt="Product Image">
                </div>
                <div class="col-sm d-flex align-items-center text-left">
                    <h5>${product.name}</h5>
                </div>
                <div class="col-sm d-flex align-items-center text-center">
                    <h5>£${product.price}</h5>
                </div>
                <div class="col-sm d-flex align-items-center text-right">
                    <button type="button" class="btn btn-danger delete-product-btn" data-product-id="${product.id}">Delete</button>
                </div>
            </div>
        `;
        });
        products_container.innerHTML = products_html;
    };

    // add new products form
    if (addProductsForm) {
        addProductsForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Check if required form fields are filled
            const productName = addProductsForm.querySelector('#productName').value.trim();
            const productPrice = addProductsForm.querySelector('#productPrice').value.trim();
            const productImage1 = addProductsForm.querySelector('#productImage1').files.length;
            const productImage2 = addProductsForm.querySelector('#productImage2').files.length;
            const productImage3 = addProductsForm.querySelector('#productImage3').files.length;

            if (!productName || !productPrice || !productImage1 || !productImage2 || !productImage3) {
                document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">Please fill out all required fields and upload three images.</div>`;
                return;
            }

            const formData = new FormData(addProductsForm);
            Array.from(addProductsForm.elements).forEach(element => element.disabled = true);
            loadingCircle.style.display = 'block';

            try {

                const response = await axios.post(`/admin/add_product`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {
                    document.getElementById('message').innerHTML = `<div class="alert alert-success text-center">Product added successfully</div>`;
                    addProductsForm.reset();
                } else {
                    document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">Failed to add product</div>`;
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">An error occurred while submitting the form</div>`;
            } finally {
                // Re-enable the submit button and hide the loading spinner
                Array.from(addProductsForm.elements).forEach(element => element.disabled = false);
                loadingCircle.style.display = 'none';
            }

        });

    }

    // close add products form on outside click
    if (overlay != null) {
        overlay.addEventListener('click', function (event) {
            if (event.target === this) {
                window.location.href = '/admin';
            }
        });
    };

};
