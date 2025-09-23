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
      if(token===null||user===null){
        window.location.href="login.html";
      }else{
            
    roles=await axiosInstance.get('/roles/role/perms');
    roles=roles.data.roles;
    // console.log(roles); 
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