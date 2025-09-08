
//table instance 

let table;

//add row
async function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
    if(!data){
        throw new Error('no data to add');
        return;
    }
    if(data.status){
        data.status=true;
    }else{
        data.status=false;
    }

    table.row.add([
        data.userID,
        data.userName,
        data.mail,
        data.role,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.userID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateModal" onclick="loadUpdateUser(${data.userID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        `<div class="row d-flex justify-content-center">
            <div class="d-flex align-items-center rounded justify-content-center p-1 " style="cursor:pointer;background-color:#f7694f" data-toggle="modal" data-target="#updatePasswordModal" onclick="updatePassword('${data.userID}')">
                <i class="ti-reload text-white" style="font-size: large;"></i>
            </div>
        </div>`,
    ]).draw(false);

}


const addNewUserButton=document.getElementById('add_user_btn');
const updateUserButton=document.getElementById('update_user_btn');
const resetPasswordButton=document.getElementById('reset_password_btn');

//add user
addNewUserButton.addEventListener('click',()=>{
    const form=document.getElementById('addNewUserForm');
    const formData=new FormData(form);
    
    const data={
        name:formData.get('name'),
        mail:formData.get('mail'),
        password:formData.get('password'),
        role:formData.get('role')
    }
    
   if(validateForm(data)){
    addNewUser(data);
    return;
   }
    
});

//update user
updateUserButton.addEventListener('click',async ()=>{
    const form=document.getElementById('updateUserForm');
    const formData=new FormData(form);
    const userIDfield = document.querySelector('input[name="updateuserID"]');
    const userID = parseInt(userIDfield.value);

    const data={
        userID:userID,
        name:formData.get('userName'),
        mail:formData.get('mail'),
        role:formData.get('role')
    }

    if(validateUpdateForm(data)){
        updateUserData(data);
        return;
       }
    
});


function updatePassword(id){

    let valid = false;

    const updatePasswordField = document.getElementById('update-password');
    const confirmPasswordField=document.getElementById('update-confirmPassword');
    const label=document.getElementById('confirm-password-label');

    updatePasswordField.addEventListener('input', () => {
        if (updatePasswordField.value !== confirmPasswordField.value) {
            label.style.color ='red';
            label.textContent = 'Passwords do not match';
            valid = false;
        } else {
            label.style.removeProperty('color');
            label.textContent = 'Confirm Password';
            confirmPasswordField.setCustomValidity('');
            valid=true;
        }
    });
    confirmPasswordField.addEventListener('input', () => {
        if (updatePasswordField.value !== confirmPasswordField.value) {
            label.style.color ='red';
            label.textContent = 'Passwords do not match';
            valid = false;
        } else {
            label.style.removeProperty('color');
            label.textContent = 'Confirm Password';
            confirmPasswordField.setCustomValidity('');
            valid=true;
        }
    });

    //reset password
    resetPasswordButton.addEventListener('click', () => {
        const form = document.getElementById('updatePasswordForm');
        const formData = new FormData(form);
        const userID = parseInt(id);
        const data = {
            userID: userID,
            password: formData.get('password')
        }
        if(valid){
            try {
                updateUserData(data);
                form.reset();
                return;
            } catch (err) {
                console.error('Error updating password:', err);
                showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to update password. Please try again later.');
            }
        }

    });
}




//fetch all users
async function fetchAllUsers(){
    try{
        const users=await api.getAllUsers();
        users.forEach((user)=>{
            addRow(user);
        });
    }catch(error){
        console.error('Error fetching users:', error);
    }
}

//logout
// document.getElementById('logout-button').addEventListener('click', logout);
// function logout() {
//     sessionStorage.removeItem('token');
// }

//toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const data = await api.toggleUserStatus(id);
        // showSucessPopupFadeInDownLong(data.message);
        if (element) {
            element.classList.toggle('active');
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

//dom loaded
document.addEventListener('DOMContentLoaded',async()=>{

    // const token = sessionStorage.getItem('token');
    // const user = JSON.parse(sessionStorage.getItem('user'));
    // if (token === null || user === null) {
    //     window.location.href = "login.html";
    // } else if (user.role !== 2) {
    //     window.location.href = "index.html";
    // }

    // document.getElementById('user-name-display').textContent=user.name;
    // document.getElementById('more-details').textContent=user.name;

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#user-name-display');

    await fetchAllUsers();
    await fetchAllRoles('roleSelect');
});

//validate form
function validateForm(formData){
  
    if(!formData){
        console.error('Invalid form data');
        return false;
    }
    if(!formData.name||!formData.mail|| !formData.password){
        showErrorPopupFadeInDown('All the Fields are required');
        return false;
    }

    const mail=formData.mail;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(mail)){
        showErrorPopupFadeInDown('Invalid Email');
        return false;
    }
    

    return true;
}
function validateUpdateForm(formData){

    if(!formData){
        console.error('Invalid form data');
        return false;
    }
    if(!formData.userID){
        showErrorPopupFadeInDown('user Id is required');
        return false;
    }
    if(formData.mail){
        const mail = formData.mail;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(mail)) {
            showErrorPopupFadeInDown('Invalid Email');
            return false;
    }
    }
    
    

    return true;
}

//get all roles
async function fetchAllRoles(id){
    try{
       
        const roles=await api.getAllRoles();
        const select=document.getElementById(id);
        select.innerHTML='';
        roles.forEach(role=>{
            const option=document.createElement('option');
            option.value=role.roleID;
            option.textContent=role.role;
            select.appendChild(option);
        });
    }catch(err){
        console.error('Error fetching roles:', err);
    }
}

async function addNewUser(userData){
    try{
       
        const data=await api.createUser(userData);
        if(data.message){
            showSucessPopupFadeInDownLong(data.message);
        }
        table.clear();
        fetchAllUsers();
    }catch(err){
        console.error('Error adding user:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add new user. Please try again later.');
    }
}

async function updateUserData(userData){
    try{
        // const response=await axiosInstance.put(API_ROUTES.user,{
        //     userData
        // });
        const data=await api.updateUser(userData);
        if(data.message){
            showSucessPopupFadeInDownLong(data.message);
        }
        table.clear();
        fetchAllUsers();
    }catch(err){
        console.error('Error updating user:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to update user. Please try again later.');
    }
}

//load update details
async function loadUpdateUser(id){
    await fetchAllRoles('update-roleSelect');
    try{
        

        const user=await api.getUser(id);
     
        if(!user){
            showErrorPopupFadeInDown("User not found");
            return;
        }
        document.getElementById('update-userID').value=user.userID;
        document.getElementById('update-userName').value=user.userName;
        document.getElementById('update-mail').value=user.mail;
        document.getElementById('update-roleSelect').value=user.role;
    }catch(error){
        console.error("Error fetching user details:", error);
        showErrorPopupFadeInDown(error);
    }
}

