async function addRow(data) {
    let table = $('#indentsTable').DataTable();
    if ($.fn.dataTable.isDataTable('#indentsTable')) {
      table = $('#indentsTable').DataTable();
    }
    if (!data) {
      console.error('no data to add');
      return;
    }
  
    data=replaceNullValuesWithDash(data);
    
    table.row.add([
      `<td>${data.IndentID}</td>`,
      `<td>${new Date(data.CreatedAt).toLocaleDateString('en-GB')}</td>`,
      `<td><span ${data.FundCheck >= 5 ? 'class="delayed"' : ""}>${data.FundCheck}</span></td>`,
      `<td><span ${data.LPC >= 5 ? 'class="delayed"' : ""}>${data.LPC}</span></td>`,
      `<td><span ${data.IndentApproval >= 5 ? 'class="delayed"' : ""}>${data.IndentApproval}</span></td>`,
      `<td><span ${data.POApproval >= 5 ? 'class="delayed"' : ""}>${data.POApproval}</span></td>`,
      `<td><span ${data.POGeneration >= 5 ? 'class="delayed"' : ""}>${data.POGeneration}</span></td>`,
      `<td><span ${data.SRB >= 5 ? 'class="delayed"' : ""}>${data.SRB}</span></td>`,
      `<td><span ${data.ICSR >= 5 ? 'class="delayed"' : ""}>${data.ICSR}</span></td>`,
    ]).draw(false);
  
  }

  function replaceNullValuesWithDash(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
            obj[key] = ' ';
        }
    });
    return obj;
}


function toggleAccordion(button) {
    const content = button.parentElement.nextElementSibling;
    content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
  
    const icon = button.querySelector("i");
    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }
  
  document.querySelector('#logout-button').addEventListener('click', () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  

  document.addEventListener('DOMContentLoaded',async ()=>{

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#username');


    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = generateSidebar();
        
       
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const navLinks = document.querySelectorAll('.pcoded-item a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.parentElement.classList.add('active');
                
            
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

    // const token = sessionStorage.getItem('token');
    // const user = JSON.parse(sessionStorage.getItem('user'));
    // if (!token || !user) {
    //     window.location.href = 'login.html';
    // } else if (user.role === 2) {
    //     window.location.href = 'user-details.html';
    // }

    // document.querySelector('#username').textContent = user.name;
    

    const data = await getData();
  // console.log(data);
  data.forEach(item => {
    addRow(item);
  })
    handlePermission('#username');
});


async function getData(){
    try{
        let response = await axiosInstance.get('/indents/stages/wt');
        return response.data;
    }catch(error){
        console.error(error);
    }
}