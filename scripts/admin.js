
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addProductForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Check if required form fields are filled
        const productName = form.querySelector('#productName').value.trim();
        const productPrice = form.querySelector('#productPrice').value.trim();
        const productImage1 = form.querySelector('#productImage1').files.length;
        const productImage2 = form.querySelector('#productImage2').files.length;
        const productImage3 = form.querySelector('#productImage3').files.length;

        if (!productName || !productPrice || !productImage1 || !productImage2 || !productImage3) {
            document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">Please fill out all required fields and upload three images.</div>`;
            return;
        }


        const formData = new FormData(form);

        try {
            const response = await axios.post(`/admin/add_product`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                document.getElementById('message').innerHTML = `<div class="alert alert-success text-center">Product added successfully</div>`;
                form.reset();
            } else {
                document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">Failed to add product</div>`;
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            document.getElementById('message').innerHTML = `<div class="alert alert-danger text-center">An error occurred while submitting the form</div>`;
        };

    });
});
