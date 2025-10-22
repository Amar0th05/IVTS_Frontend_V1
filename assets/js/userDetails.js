
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
            <span class="d-flex align-items-center justify-content-center p-0 edit-btn" style="cursor:pointer;" data-toggle="modal" data-target="#updateModal" onclick="loadUpdateUser(${data.userID})">
      <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
            </span>
        </div>`,
        `<div class="row d-flex justify-content-center">
  <div class="d-flex align-items-center justify-content-center p-1 reset-btn"
      style="width: 40px; height: 40px; cursor:pointer;"
      data-toggle="modal"
      data-target="#updatePasswordModal"
      onclick="updatePassword('${data.userID}')">
      
      <!-- Default icon -->
      <i class="fa-solid fa-key key-icon" style="font-size: 22px;"></i>
      
      <!-- Hover icon -->
      <i class="fa-solid fa-rotate rotate-icon" style="font-size: 22px;"></i>
  </div>
</div>
`,
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

    // document.getElementById('username').textContent=user.name;
    // document.getElementById('more-details').textContent=user.name;

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#username');

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

      $(document).ready(function () {
  // Initialize DataTable
  const table = $('#myTable').DataTable({
    paging: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: 'excelHtml5',
         text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel",
        exportOptions: {
          columns: [0, 1, 2, 3],
          format: {
            body: function (data, row, column, node) {
              const $node = $(node);
              if ($node.find('.toggle-btn').length) {
                return $node.find('.toggle-btn').hasClass('active') ? 'True' : 'False';
              }
              return data;
            }
          }
        }
      },
      {
        extend: 'pdfHtml5',
         text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
    className: "btn-pdf",
        exportOptions: {
          columns: [0, 1, 2, 3],
          format: {
            body: function (data, row, column, node) {
              const $node = $(node);
              if ($node.find('.toggle-btn').length) {
                return $node.find('.toggle-btn').hasClass('active') ? 'True' : 'False';
              }
              return data;
            }
          }
        }
      },
      {
        extend: 'colvis',
        text: `
      <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns
    `,
    className: "btn-colvis"
      }
    ],
    language: {
      search: "",
      searchPlaceholder: "Type to search...",
      paginate: {
        first: "«",
        last: "»",
        next: "›",
        previous: "‹"
      }
    },
    initComplete: function () {
      // Remove default "Search:" text
      $('#myTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#myTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Append export buttons to custom container
  table.buttons().container().appendTo($('#exportButtons'));
});

