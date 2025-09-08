document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const mail = formData.get('mail');

        if (!mail) {
            showErrorPopupFadeInDown('Email is required.');
            return;
        }

        try {
            const data = await api.resetPassword(mail);
            
            showSucessPopupFadeInDownLong(data.message);
            
          
            if (data.message) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
           
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to send reset password email. Please try again later.');
        }
    });
});
