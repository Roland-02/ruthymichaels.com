async function get_products() {
    try {
        const response = await axios.get(`/get_products`);
        return response.data
    } catch (error) {
        console.error('Error shuffling films')
    }
}


window.onload = async function () {

    // login
    const loginForm = document.getElementById('login-form') || null;
    const createAccountForm = document.getElementById('createAccount-form') || null;
    const overlay = document.getElementById('overlay') || null;

    // products
    const products = await get_products();
    const products_container = document.getElementById('products_section');
    let products_html = ''

    // login form submission
    if (loginForm != null) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent form submission

            //frontend validation
            var email = document.getElementById('email_login').value;
            var password = document.getElementById('password_login').value;

            if (!validateEmail_login(email)) {
                return document.getElementById('emailError_login').hidden = false;
            } else {
                document.getElementById('emailError_login').hidden = true;
            }

            if (!validatePassword_login(password)) {
                return document.getElementById('passwordError_login').hidden = false;
            } else {
                document.getElementById('passwordError_login').hidden = true;
            }

            //allow form submission
            loginForm.submit();

        });
    };

    //sign up form submission
    if (createAccountForm != null) {
        createAccountForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            //frontend validation
            var email = document.getElementById('email_signup').value;
            var password = document.getElementById('password_signup').value;
            var confirmPassword = document.getElementById('confPassword_signup').value;

            if (!validateEmail_signup(email)) {
                return document.getElementById('emailError_signup').hidden = false;
            } else {
                document.getElementById('emailError_signup').hidden = true;
            }

            if (!validatePassword_signup(password)) {
                return document.getElementById('passwordError_signup').hidden = false;
            } else {
                document.getElementById('passwordError_signup').hidden = true;
            }

            if (password !== confirmPassword) {
                return document.getElementById('confPasswordError_signup').hidden = false;
            } else {
                document.getElementById('confPasswordError_signup').hidden = true;
            }

            createAccountForm.submit();

        });
    };

    // close login form on outside click
    if (overlay != null) {
        overlay.addEventListener('click', function (event) {
            if (event.target === this) {
                window.location.href = '/';
            }
        });
    };

    // load products
    products.forEach(product => {
        console.log(product.image_1)
        products_html += `
            <div class="col-4">
                <div class="card product-card">
                    <div class="card-body">
                        <img src="https://drive.google.com/thumbnail?id=${product.image_1}" class="product-image" alt="Product Image">
                        <h4 class="card-title">${product.name}</h4>
                        <p class="card-text">${product.description}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="price-text-style">£${product.price}</h3>
                        </div>
                        <div>
                            <button type="button" class="btn penguin-btn">
                                <i class="fa fa-shopping-cart"></i> BUY
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    });
    products_container.innerHTML = products_html;

};

function validateEmail_signup(email) {
    let valid = false;

    //matches email format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(email)) {
        valid = true;
    }

    return valid;
};

function validatePassword_signup(password) {
    let valid = false;

    //6 char and an uppercase letter
    const regex = /^(?=.*[A-Z]).{6,}$/;
    if (regex.test(password)) {
        valid = true;
    };

    return valid; // Replace with your validation logic
};

function validateEmail_login(email) {
    let valid = false;

    //matches email format
    const regex = /\S+@\S+\.\S+/;
    if (regex.test(email)) {
        valid = true;
    }

    return valid;
};

function validatePassword_login(password) {
    return (password && password.trim().length !== 0);
};

function togglePassword() {
    var password = document.getElementById("password_login") || document.getElementById("password_signup");
    var confPassword = document.getElementById("confPassword_signup") || null

    if (password.type === "password") {
        password.type = "text";
        if (confPassword) {
            confPassword.type = "text"
        }
    } else {
        password.type = "password";
        if (confPassword) {
            confPassword.type = "password"
        }
    }

};

// google and facebook login
document.addEventListener('DOMContentLoaded', function () {

    // facebook login
    window.fbAsyncInit = function () {
        FB.init({
            appId: '417605231226749',
            cookie: true,
            xfbml: true,
            version: 'v19.0'
        });
        FB.AppEvents.logPageView();
    };

    function checkLoginState() {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                statusChangeCallback(response);
            }
        });
    };

    function statusChangeCallback(response) {
        if (response.status === 'connected') {
            facebookLogin(response.authResponse.accessToken);
        } else {
            document.getElementById('status').innerHTML = 'Please log into this app.';
            window.location.href = '/login';
        }
    };

    function facebookLogin(accessToken) {
        FB.api('/me', { access_token: accessToken }, function (response) {
            if (response && !response.error) {
                console.log('Successful login for: ' + response.name);
                document.cookie = `sessionID=${response.id}; path=/; secure; samesite=Strict`;
                document.cookie = `sessionEmail=${response.email}; path=/; secure; samesite=Strict`;
                window.location.href = '/';
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };

    if (document.getElementById('FBlogin')) {
        document.getElementById('FBlogin').addEventListener('click', function () {
            FB.login(function (response) {
                if (response.authResponse) {
                    checkLoginState();
                } else {
                    // Handle the case where the user closes the login dialog without logging in
                    console.log('User cancelled login or did not fully authorize.');
                    document.getElementById('status').innerHTML = 'Please log into this app.';
                }
            }, { scope: 'public_profile,email' });
        });
    };
    // end facebook login

    // google login
    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        document.cookie = `sessionID=${profile.getId()}; path=/; SameSite=None; Secure`;
        document.cookie = `sessionEmail=${profile.getEmail()}; path=/; SameSite=None; Secure`;
        window.location.href = '/';
    };

    function handleCredentialResponse(response) {
        const data = parseJwt(response.credential);
        document.cookie = `sessionID=${data.sub}; path=/; SameSite=None; Secure`;
        document.cookie = `sessionEmail=${data.email}; path=/; SameSite=None; Secure`;
        window.location.href = '/';
    };

    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };
    // end google login

    window.handleCredentialResponse = handleCredentialResponse;
    window.onSignIn = onSignIn;

    if (document.getElementById('signoutBtn')) {
        document.getElementById('signoutBtn').addEventListener('click', function () {
            document.getElementById('signoutForm').submit();
        });

    };

});