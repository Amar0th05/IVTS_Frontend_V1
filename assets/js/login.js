document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = sessionStorage.getItem('token');
    if (token) {
        showPopupFadeInDown(`Already logged in`);
        document.querySelector(".login-form").remove(); // matches your form's class
        setTimeout(() => {
            window.location.href = window.history.go(-1);
        }, 1500);
        return;
    }

    const loginForm = document.querySelector('.login-form'); // match your form selector

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Match your HTML input IDs
        const mail = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember')?.checked ? 'true' : 'false';

        
        try {
            // Call your existing API endpoint
            const response = await axiosInstance.post(API_ROUTES.login, {
                mail,
                password,
            });
            
            const user=response.data.user;
            

            const authHeader = response.headers['authorization'];
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));
                showPopupFadeInDown(`Login Successful`);
                roles = await axiosInstance.get('/roles/role/perms');
                roles = roles.data.roles;
                // console.log(roles);
                window.roles = roles;
                e.target.reset();
                setTimeout(() => {
                    // if(user.role===2){
                    //     window.location.href = 'user-details.html';
                    // }else{
                    //     window.location.href = 'index.html';
                    // }

                 
                    roleUtil.loginRedirect(user.role);

                }, 1000);
            } else {
                showErrorPopupFadeInDown('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorPopupFadeInDown(error.response?.data?.message || 'Login failed. Please try again.');
        }
        
    });
     
});
