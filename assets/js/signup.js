document.addEventListener("DOMContentLoaded", () => {
    const signUpForm = document.getElementById('signup-form');

    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            const name = formData.get('name')?.trim();
            const mail = formData.get('mail')?.trim();
            const password = formData.get('password')?.trim();
            const confirmPassword = formData.get('confirm-password')?.trim();
            const read = document.getElementById('read').checked;


            if (!read) {
                showErrorPopupFadeInDown('Please accept the terms and conditions.');
                return;
            } else if (!name || !mail || !password || !confirmPassword) {
                showErrorPopupFadeInDown('All fields are required.');
                return;
            } else if (password !== confirmPassword) {
                showErrorPopupFadeInDown('Passwords do not match.');
                return;
            }

            const userData={
                name,
                mail,
                password,
            }


            try {
              
                const data=await api.register(userData);
                showPopupFadeInDown('Registration successful. You can now login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            } catch (error) {
                console.error('Error:', error);
                showErrorPopupFadeInDown(error.response?.data?.message || 'Registration failed. Please try again.');
                e.target.reset();
            }
            



        });
    }

    const passwordField = document.getElementById('password-field');
    const confirmPasswordField = document.getElementById('confirm-password-field');

    passwordField.addEventListener('input', matchPassword);
    confirmPasswordField.addEventListener('input', matchPassword);

});

function matchPassword() {
    const password = document.getElementById('password-field');
    const confirmPassword = document.getElementById('confirm-password-field');
    const label = document.getElementById('confirm-password');
    const submitbutton = document.getElementById('signupForm-submit-button');

    if (password && confirmPassword) {
        if (password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match');
            label.style.color = 'red';
            label.textContent = 'Passwords do not match';
            submitbutton.disabled = true;
        } else {
            confirmPassword.setCustomValidity('');
            label.style.removeProperty('color');
            label.textContent = 'Confirm Password';
            submitbutton.disabled = false;
        }
    }


}


