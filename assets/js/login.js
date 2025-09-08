
document.addEventListener('DOMContentLoaded',()=>{
    const token = sessionStorage.getItem('token');
    if(token){
        showPopupFadeInDown(`already logged in`);
        document.querySelector("#login-form").remove(); 
        setTimeout(() => {
            window.location.href = window.history.go(-1);
        },1500);
    }
    
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit',async (e)=>{
        e.preventDefault();
        const loginData=new FormData(e.target);
        const mail=loginData.get('mail');
        const password=loginData.get('password');
        const remember=document.getElementById('remember').checked? 'true' : 'false';

     


        try {
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
