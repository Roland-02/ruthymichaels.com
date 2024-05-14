window.onload = async function () {

    const loginForm = document.getElementById('login-form') || null;
    const createAccountForm = document.getElementById('createAccount-form') || null;
    const overlay = document.getElementById('overlay') || null;

    // event listener for form submission
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

    //event listener for form submission
    if (createAccountForm != null) {
        createAccountForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            //frontend validation
            var email = document.getElementById('email_signup').value;
            var password = document.getElementById('password_signup').value;
            var confirmPassword = document.getElementById('confPassword_signup').value;
            
            if (!validateEmail_signup(email)) {
                return document.getElementById('emailError_signup').hidden = false;
            }else{
                document.getElementById('emailError_signup').hidden = true;
            }
    
            if (!validatePassword_signup(password)) {
                return document.getElementById('passwordError_signup').hidden = false;
            }else{
                document.getElementById('passwordError_signup').hidden = true;
            }
    
            if (password !== confirmPassword) {
                return document.getElementById('confPasswordError_signup').hidden = false;
            }else{
                document.getElementById('confPasswordError_signup').hidden = true;
            }
    
            form.submit();
            

        });
    };

    // Event listener for clicking on the overlay
    if (overlay != null) {
        overlay.addEventListener('click', function (event) {
            if (event.target === this) {
                window.location.href = '/';
            }
        });
    };

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

function validateEmail_login(email) {
    let valid = false;

    //matches email format
    const regex = /\S+@\S+\.\S+/;
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

function validatePassword_login(password) {
    return (password && password.trim().length !== 0);
};

function togglePassword() {
    var password = document.getElementById("password_login") || document.getElementById("password_signup");
    var confPassword = document.getElementById("confPassword_signup") || null

    if (password.type === "password") {
        password.type = "text";
        if(confPassword){
            confPassword.type ="text"
        }
    } else {
        password.type = "password";
        if(confPassword){
            confPassword.type ="password"
        }
    }
    
};
