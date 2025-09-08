let statuses;
let portSet=new Set();
let yearSet=new Set();
let monthSet=new Set();

let selectedPortId = null;


const date=new Date();
let month;
let year=date.getFullYear();

const months=['January','February','March','April','May','June','July','August','September','October','November','December'];




function addRow(data,i){
    if ( $.fn.dataTable.isDataTable( '#invoiceLogTable' ) ) {
        table = $('#invoiceLogTable').DataTable();
    }
   
   if(!data){
    console.error('no data to add');
    return;
   }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
   

    table.row.add([
      i,
      data.port,
      data.year,
      months[data.month],
      ` <button class="btn btn-facebook mx-auto rounded-1" onclick="downloadInvoice(${data.id})">
                                                                                <i class="fa fa-download "></i>
                                                                            </button> `,
        
    ]).draw(false);
};



document.getElementById("pdfForm").addEventListener("submit", async function (event) {
    event.preventDefault();



    const fileInput = document.getElementById("pdfInput");
    const file = fileInput.files[0];

    if (!file) {
        showErrorPopupFadeInDown("Please select a PDF file.");
        return;
    }

    if (file.type !== "application/pdf") {
        showErrorPopupFadeInDown("Only PDF files are allowed!");
        fileInput.value = "";
        return;
    }

    const user=JSON.parse(sessionStorage.getItem('user'));
    
    let formData = new FormData();
    formData.append("pdfFile", file);
    formData.append('id',user.id);      
    formData.append('port',selectedPortId);

    try {
        let response = await axiosInstance.post("/om/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        showPopupFadeInDown(response.data.message);
        fileInput.value = "";
        await refreshInvoiceLogTable();

    } catch (error) {
        console.error(error);
        showErrorPopupFadeInDown("Upload failed!");
    }
});


async function downloadInvoice(id){
    const invoiceId=id;
    try {
        const response = await axiosInstance.get(`/om/download/${invoiceId}`, {
            responseType: "blob" 
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading PDF:", error);
        alert("Download failed!");
    }
}

// document.getElementById("downloadBtn").addEventListener("click", async function () {
//     const invoiceId = prompt("Enter Invoice ID to download:");
//     if (!invoiceId) {
//         alert("Invoice ID is required!");
//         return;
//     }

//     try {
//         const response = await axiosInstance.get(`/om/download/${invoiceId}`, {
//             responseType: "blob" 
//         });

//         const blob = new Blob([response.data], { type: "application/pdf" });
//         const url = window.URL.createObjectURL(blob);

//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `invoice_${invoiceId}.pdf`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);

//         window.URL.revokeObjectURL(url);
//     } catch (error) {
//         console.error("Error downloading PDF:", error);
//         alert("Download failed!");
//     }
// });

async function getAllInvoiceLogs(){
    try{
        // const response=await axiosInstance.get('/om/all');
        const invoices=await api.getAllOMInvoices();

        portSet.clear();
        yearSet.clear();
        monthSet.clear();

        $('#portFilter').empty().append('<option value="">Show All</option>');
        $('#yearFilter').empty().append('<option value="">Show All</option>');
        $('#monthFilter').empty().append('<option value="">Show All</option>');

        let i = 0;
        invoices.forEach(data => {
            if (data.port) portSet.add(data.port.trim());
            if (data.year) yearSet.add(data.year);
            if (data.month) monthSet.add(data.month);
            addRow(data, ++i);
        });
        portSet.forEach(port => {
            $('#portFilter').append(`<option value="${port}">${port}</option>`);
        });

        yearSet.forEach(year => {
            $('#yearFilter').append(`<option value="${year}">${year}</option>`);
        });

        monthSet.forEach(month => {
            $('#monthFilter').append(`<option value="${months[month]}">${months[month]}</option>`);
        });
    }catch(err){
        // console.log(err);
        if(err.response.status===404){
            // console.clear();
            return;
        }
        showErrorPopupFadeInDown(err.message||'Error fetching invoices');
    }
}

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

    // const user=JSON.parse(sessionStorage.getItem('user'));
    // const token=sessionStorage.getItem('token');

    // if(token===null||user===null){
    //     window.location.href="login.html";
    // }

    // if(user.role===2){
    //     window.location.href="user-details.html";
    //     return;
    // }

    // document.getElementById('username').innerText=user.name;



    $('#year-title').text(date.getFullYear());

    if(date.getDate()>10){
        month=months[date.getMonth()] 
    }else{
        month=months[date.getMonth()-1];
    }
    

    if(date.getMonth()===0){
        year=date.getFullYear()-1;
        month=months[11];
    }

    $('#year-title').text(year);

    $('#month-title').text(month);





        try{
            statuses=await api.getMailSentStatus();
        }catch(err){
            console.log(err);
        }

        // if(statuses){
        //     console.log(statuses);
        // }else{
        //     console.log('no statuses');
        // }

        
    await refreshInvoiceLogTable();
    await refreshMonthlyStatusTable();
    
});



async function getAllOrganisations(){
    try{
        const organisations = await api.getAllOrganisationsInvoiceStatus();
        
       
        let i=1;
        organisations.forEach(item=>{
            addOrganisationsRow(item,i++);
        })

        handlePermission('#username');

    }catch(err){
        console.log(err);
    }
}





function addOrganisationsRow(data,i){



    let mailSentRow=`<input type="checkbox"  class="form-check-input editElement "  style="width: 30px; height: 30px; accent-color: blue; border-radius: 5px;" onchange="updateMailSentStatus(this.checked,'${data.org_id}')">`;
    if ( $.fn.dataTable.isDataTable( '#monthlyStatusTable' ) ) {
        table = $('#monthlyStatusTable').DataTable();
    }
    
    
   if(!data){
    console.error('no data to add');
    return;
   }

   if(statuses){

    let msrow=statuses.find(status=>status.org_id===data.org_id);
    if(msrow){
       mailSentRow=`<input type="checkbox" checked class="form-check-input editElement"  style="width: 30px; height: 30px; accent-color: blue; border-radius: 5px;" onchange="updateMailSentStatus(this.checked,'${data.org_id}')">`
    }else{
        mailSentRow=`<input type="checkbox" class="form-check-input editElement"  style="width: 30px; height: 30px; accent-color: blue; border-radius: 5px;" onchange="updateMailSentStatus(this.checked,'${data.org_id}')">`
    }
   }
  
   

    table.row.add([
        i,
      data.organisation_name,
      
     `
        <button class="btn btn-success mx-auto rounded-1 editElement" data-bs-toggle="modal" data-bs-target="#pdfModal" data-port-id="${data.org_id}">
                                                                                    <i class="fa fa-upload "></i>
                                                                                </button>  
     `,
      mailSentRow,
        
    ]).draw(false);
};



$(document).on("click", '[data-bs-target="#pdfModal"]', function () {
    selectedPortId = $(this).data("port-id"); 
    
});


async function refreshMonthlyStatusTable() {
    if ($.fn.dataTable.isDataTable('#monthlyStatusTable')) {
        table = $('#monthlyStatusTable').DataTable();
        table.clear();
    }

    await getAllOrganisations();
}


async function refreshInvoiceLogTable() {
    if ($.fn.dataTable.isDataTable('#invoiceLogTable')) {
        table = $('#invoiceLogTable').DataTable();
        table.clear();
    }

    await getAllInvoiceLogs();    
}

async function updateMailSentStatus(status,id){
    if(status===undefined){
        console.error('no status');
        return;
    }else if(!id){
        console.error('no id');
        return;
    }
    try{
        const result=await api.toggleMailSentStatus(id,status);
        
    }catch(err){
        // console.log(err);
        showErrorPopupFadeInDown(err.response?.data?.message||'Error updating status');
        await refreshMonthlyStatusTable();
    }
}


document.getElementById('logout-button').addEventListener('click',()=>{
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href="login.html";
});

document.getElementsByClassName('logout')[0].addEventListener('click',()=>{
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href="login.html";
});