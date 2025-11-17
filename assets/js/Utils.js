// =============== Logout Functionality ===============
document.getElementById('logout-button').addEventListener('click',logout);
        function logout(){
            sessionStorage.removeItem('token');
            window.location.href='login.html';
        }
// =============== Sidebar Gentrated ===============
 document.addEventListener("DOMContentLoaded", async function () {

      let user=JSON.parse(sessionStorage.getItem('user'));
      let token=sessionStorage.getItem('token');
    //   console.log("this session",user)
      if(token===null||user===null){
        window.location.href="login.html";
      }else{
            
    roles=await axiosInstance.get('/roles/role/perms');
    roles=roles.data.roles;
    console.log(roles); 
    window.roles=roles;
        handlePermission('#username');
       
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = generateSidebar();
        
        // Set the current page as active
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const navLinks = document.querySelectorAll('.pcoded-item a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.parentElement.classList.add('active');
                
                // Expand the parent accordion
                const accordionContent = link.closest('.accordion-content');
                if (accordionContent) {
                    accordionContent.style.display = 'block';
                    const header = accordionContent.previousElementSibling;
                    const icon = header.querySelector('.accordion-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }
        });
    }
      }

    });

    function toggleAccordion(button) {
        const content = button.parentElement.nextElementSibling;
        content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
        const icon = button.querySelector("i");
        icon.classList.toggle("fa-chevron-down");
        icon.classList.toggle("fa-chevron-up");
    }


    
async function updateUserData(userData){
    try{
        // const response=await axiosInstance.put(API_ROUTES.user,{
        //     userData
        // });
        const data=await api.changePassword(userData);
        // if(data.message){
        //     showSucessPopupFadeInDownLong(data.message);
        // }
    }catch(err){
        console.error('Error updating user:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to update user. Please try again later.');
    }
}
   // =============================
// 🔹 DOM ELEMENTS
// =============================
const slideContainer = document.getElementById('slideContainer');
const profileSection = document.getElementById('profileSection');
const passwordSection = document.getElementById('passwordSection');
const modalTitle = document.getElementById('modalTitle');
const profileModal = document.getElementById('profileDetailsModal');

// =============================
// 🔹 SLIDE: Show Change Password
// =============================
document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
  profileSection.classList.replace('visible-section', 'hidden-section');
  passwordSection.classList.replace('hidden-section', 'visible-section');
  slideContainer.classList.add('reversed');
  modalTitle.textContent = 'Change Password';
});

// =============================
// 🔹 SLIDE: Back to Profile
// =============================
document.getElementById('backToProfile')?.addEventListener('click', () => {
  passwordSection.classList.replace('visible-section', 'hidden-section');
  profileSection.classList.replace('hidden-section', 'visible-section');
  slideContainer.classList.remove('reversed');
  modalTitle.textContent = 'Profile Details';
});

// =============================
// 🔹 LOAD USER DATA INTO PROFILE MODAL
// =============================
profileModal?.addEventListener('shown.bs.modal', () => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  console.log("Loaded User Data:", storedUser);

  if (storedUser) {
    document.getElementById('profileName').textContent =
      storedUser.name ||
      `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() ||
      'Unknown';

    document.getElementById('profileRole').textContent =
      storedUser.Role_Name || 'N/A';

    document.getElementById('firstName').textContent =
      storedUser.name || storedUser.firstName || '—';

    document.getElementById('empId').textContent =
      storedUser.Employee_ID || '—';

    document.getElementById('emailId').textContent =
      storedUser.mail || '—';

    document.getElementById('Designation').textContent =
      storedUser.Designation || '—';

    if (storedUser.Gender === "Female") {
      document.getElementById('profileImage').src = "assets/images/female.png";
    }
    else{
            document.getElementById('profileImage').src = "assets/images/male.png";
    }
  } else {
    console.warn("No user data found in sessionStorage");
  }
});

document.getElementById("savePassword")?.addEventListener('click',()=>{
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const userId = userData.id;

  if (!userId) {
    showErrorPopupFadeInDown("User data not found. Please re-login.");
    return;
  }

  const newPasswordField = document.getElementById('newPassword');
  const confirmPasswordField = document.getElementById('confirmPassword');
  const confirmLabel = document.querySelector('label[for="confirmPassword"]');
  const passwordForm = document.getElementById('passwordForm');

  const newPassword = newPasswordField.value.trim();
  const confirmPassword = confirmPasswordField.value.trim();

  // 🧩 Validate input
  if (!newPassword || !confirmPassword) {
    showErrorPopupFadeInDown("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    confirmLabel.style.color = 'red';
    confirmLabel.textContent = 'Passwords do not match';
    showErrorPopupFadeInDown("Passwords do not match.");
    return;
  } else {
    confirmLabel.style.color = '';
    confirmLabel.textContent = 'Confirm Password';
  }

  // Prepare data
  const data = {
    userID: parseInt(userId),
    password: newPassword
  };

  // ✅ Try to update password
  try {
    console.log("elrbkgbljkb",data)
    updateUserData(data); // Your async backend function
    passwordForm.reset();
    showPopupFadeInDown('Password updated successfully!');
    
  passwordSection.classList.replace('visible-section', 'hidden-section');
  profileSection.classList.replace('hidden-section', 'visible-section');
  slideContainer.classList.remove('reversed');
  modalTitle.textContent = 'Profile Details';
  } catch (err) {
    console.error('Error updating password:', err);
    showErrorPopupFadeInDown(
      err.response?.data?.message || 'Failed to update password. Please try again later.'
    );
  }

});
// =========================================================================================
//                          Breadcrumb Dynamic Update
// =========================================================================================

   $(document).ready(function () {
    const breadcrumb = $('#breadcrumb');
    const originalBreadcrumb = breadcrumb.html(); // Save the original HTML once

    // Handle all breadcrumb actions
    $(document).on('click', '[data-breadcrumb]', function () {
      const action = $(this).data('breadcrumb');

      if (action && action.toLowerCase() === 'back') {
        // Restore original breadcrumb (Home > Talentpool)
        breadcrumb.html(originalBreadcrumb);
      } else {
        // Remove old dynamic breadcrumb if exists
        breadcrumb.find('.dynamic-breadcrumb').remove();

        // Append new one dynamically
        breadcrumb.append(`
          <li class="breadcrumb-item dynamic-breadcrumb">
            <a href="#">${action}</a>
          </li>
        `);
      }
    });

    // When modal closes (by Exit, backdrop, or X)
    $(document).on('hidden.bs.modal', function () {
      breadcrumb.html(originalBreadcrumb);
    });
  });




