document.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.getElementById('signup-form');

  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const mail = document.getElementById('email')?.value.trim();
      const password = document.getElementById('password-field')?.value.trim();
      const confirmPassword = document.getElementById('confirm-password-field')?.value.trim();

      if (!name || !mail || !password || !confirmPassword) {
        showErrorPopupFadeInDown('All fields are required.');
        return;
      } else if (password !== confirmPassword) {
        showErrorPopupFadeInDown('Passwords do not match.');
        return;
      }

      const userData = { name, mail, password };

      try {
        const data = await api.register(userData);
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

  // Password match live validation
  const passwordField = document.getElementById('password-field');
  const confirmPasswordField = document.getElementById('confirm-password-field');

  if (passwordField && confirmPasswordField) {
    passwordField.addEventListener('input', matchPassword);
    confirmPasswordField.addEventListener('input', matchPassword);
  }
});

function matchPassword() {
  const password = document.getElementById('password-field');
  const confirmPassword = document.getElementById('confirm-password-field');
  const label = document.querySelector('label[for="confirm-password"]'); // Fix label reference
  const submitButton = document.querySelector('#signup-form button[type="submit"]'); // Better selector

  if (password && confirmPassword && label && submitButton) {
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Passwords do not match');
      label.style.color = 'red';
      label.textContent = 'Passwords do not match';
      submitButton.disabled = true;
    } else {
      confirmPassword.setCustomValidity('');
      label.style.color = '';
      label.textContent = 'Confirm Password';
      submitButton.disabled = false;
    }
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (!input || !icon) return; // safety check

  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}
