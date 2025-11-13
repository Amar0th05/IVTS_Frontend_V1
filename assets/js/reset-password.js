document.addEventListener('DOMContentLoaded', function(){
    const password = document.getElementById('password-field');
    const confirmPassword = document.getElementById('confirm-password-field');

    password.addEventListener('input', matchPassword);
    confirmPassword.addEventListener('input', matchPassword);

    const resetForm=document.getElementById('password-reset-form');
    const token=new URLSearchParams(window.location.search).get('token');

    if(!token || token.trim() === ''){
        window.location.href='index.html';
    }


    resetForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const password=document.getElementById('password-field').value;
        const confirmPassword=document.getElementById('confirm-password-field').value;

        if(!password){
            showErrorPopupFadeInDown('Password is required.');
            return;
        }

        if(password===confirmPassword){
            console.log(password,confirmPassword,token);
            axiosInstance.post('/password/resetpassword',{
                password,
                token
            }).then((response)=>{
                showPopupFadeInDown('Password reset successful. You can now login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                },1500);
            }).catch((error)=>{
                showErrorPopupFadeInDown(error.response.data.message || 'Password reset failed. Please try again.');
            })
        }else{
            showErrorPopupFadeInDown('Passwords do not match.');
        }
    });
    
}
);

function matchPassword() {
    const password = document.getElementById('password-field');
    const confirmPassword = document.getElementById('confirm-password-field');
    const label = document.getElementById('confirm-password-label');
    const submitbutton = document.getElementById('submit-button');

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