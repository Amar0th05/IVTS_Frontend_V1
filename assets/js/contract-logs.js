
document.getElementById('logout-button').addEventListener('click',logout);
function logout(){
    sessionStorage.removeItem('token');
}

document.getElementById('staffId-select').addEventListener('change', (e) => {
    const text = e.target.options[e.target.selectedIndex].text;
    const match = text.match(/\((.*?)\)/);
    document.getElementById('staffName').value = match ? match[1] : '';
 });

const addLogButton = document.getElementById('add_log_btn');
const updateLogButton = document.getElementById('update_log_btn');


async function loadStaffOptions(id) {
    try {
        // const response = await axiosInstance.get(API_ROUTES.getActiveStaffs);  
        // const staffs = response.data.staffs;
        const staffs=await api.getActiveStaffs();
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Select staff id</option>';

        staffs.forEach(staff => {
            const option = document.createElement("option");
            option.value = staff.staff_id;
            option.textContent = `${staff.staff_id} (${staff.staff_name})`;
            select.appendChild(option);
        });
    } catch (error) {
        showErrorPopupFadeInDown(error.message);
    }
}
async function loadDesignationOptions(id) {
    try {
        // const response = await axiosInstance.get(API_ROUTES.getactiveDesignations);
        const designations = await api.getActiveDesignations();
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Select designation</option>';

        designations.forEach(designation => {
            const option = document.createElement("option");
            option.value = designation.des_id;
            option.textContent = designation.designation;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading designation options:", error);
    }
}



addLogButton.addEventListener('click', async (e) => {
    
    e.preventDefault();
    let form = document.getElementById('addNewLogForm');
    let formData = new FormData(form);

    const data={};
    
    const intFields = ["currentDesignation", "contractId"];


    formData.forEach((value, key) => {
        value = value.trim(); 
    
        if (value === "") {
            data[key] = null; 
            return;
        }
    
        if (intFields.includes(key)) {
            data[key] = parseInt(value, 10);
        }else {
            data[key] = value;
        }
    });
    
    data['currentDesignation'] = parseInt(data['designationSelect'], 10);
    if (validateForm(formData)) {
        try {
            // const response = await axiosInstance.post(API_ROUTES.contractLogs, {
            //     data: data
            // });
            
            
            await api.addContractLog(data);
            // console.log(data);
            table.clear();
            await fetchAllData();
            showPopupFadeInDown("contract log added successfully!");
            form.reset();
        } catch (error) {
            console.log(error);
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add log. Please try again later.');
        }
    }
});

updateLogButton.addEventListener('click', async (e) => {
    const id = updateLogButton.dataset.contractID;

    // console.log('from update: ',id);

    e.preventDefault();
    let form = document.getElementById('updateLogForm');
    let formData = new FormData(form);



    const data = {};

    const intFields = ["currentDesignation", "contractId"];
    const floatFields = ["basicPay", "allowance"];

    formData.forEach((value, key) => {
        value = value.trim();

        if (value === "") {
            data[key] = null;
            return;
        }

        if (intFields.includes(key)) {
            data[key] = parseInt(value, 10);
        } else if(floatFields.includes(key)){
            data[key] = parseFloat(value);
        }else{
            data[key] = value;
        }
        
    });

    const grossPayField = document.getElementById('update-grossPay');
    data.grossPay = parseFloat(grossPayField.value) || null;

    if (validateUpdateForm(formData)) {
        try {
            data.contractID = id;
            // console.log(data);
            const responseData=await api.updateContractLog(data);
        
            table.clear();
            await fetchAllData();
            showPopupFadeInDown(responseData.message);
            form.reset();
        } catch (error) {
            console.log(error);
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update log. Please try again later.');
        }
        

    }else{
        console.error('invalid form data');
    }
}
);
let table;
function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
   
   if(!data){
    console.error('no data to add');
    return;
   }

   if(data.contractStartDate){
    data.contractStartDate = new Date(data.contractStartDate).toLocaleDateString();
   }

   if(data.contractEndDate){
    data.contractEndDate = new Date(data.contractEndDate).toLocaleDateString();
   }

    table.row.add([
      data.staffID,
      data.contractStartDate,
      data.contractEndDate,
      data.basicPay,
      data.allowance,
      data.grossPay,
      data.currentDesignation,
        `<div class="row d-flex justify-content-center writeElement">
            <span class="d-flex align-items-center justify-content-center p-0 " style="width: 40px; height: 40px;cursor:pointer;" data-toggle="modal" data-target="#updateModal" onclick="loadUpdateLogs('${data.contractID}')">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`
    ]).draw(false);
};




async function fetchAllData() {
    try {
       const data=await api.getAllContractLogs();
        
       const designations=new Set();
       const ids=new Set();
    
       data.contractDetails.forEach(contractLog => {
            addRow(contractLog);

            handlePermission('#username');

            designations.add(contractLog.currentDesignation);
            ids.add(contractLog.staffID);
       
        });

        designations.forEach(designation => {
            if(!designation) return;
            $('#designationFilter').append(`<option value="${designation}">${designation}</option>`);
        });

        ids.forEach(id => {
            if(!id) return;
            $('#staffIdFilter').append(`<option value="${id}">${id}</option>`);
        });

    } catch (error) {
        console.error("Error fetching contract details:", error);
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

    // const token=sessionStorage.getItem('token');
    // const user=JSON.parse(sessionStorage.getItem('user'));
    // if(!token||!user){
    //     window.location.href = 'login.html';
    //     return;
    // }else if(user.role===2){
    //     window.location.href = 'user-details.html';
    //     return;
    // }


    // document.getElementById('username').innerText=user.name;
    // document.getElementById('more-details').innerText=user.name;

    await loadStaffOptions('staffId-select');
    await loadDesignationOptions('designationSelect');
    
    await fetchAllData();
    
});

function validateForm(formData) {
    let errors = [];

    const staffID = formData.get('staffID')?.trim();
    const contractStartDate = formData.get('contractStartDate')?.trim();
    const contractEndDate = formData.get('contractEndDate')?.trim();
    const basicPay = formData.get('basicPay')?.trim();
    const allowance = formData.get('allowance')?.trim();
    const grossPay=formData.get('grossPay')?.trim();
   
 

    
    if (contractStartDate && contractEndDate) {
        if (new Date(contractStartDate) >= new Date(contractEndDate)) {
            showErrorPopupFadeInDown('Contract End Date must be after Start Date.');
            errors.push("Contract End Date must be after Start Date.");
        }
    }

    
    if (basicPay && (isNaN(basicPay) || basicPay <= 0)) {
        showErrorPopupFadeInDown('Please enter a valid Basic Pay.');
        errors.push("Invalid Basic Pay.");
    }

    
    if (allowance && (isNaN(allowance) || allowance < 0)) {
        showErrorPopupFadeInDown('Please enter a valid Allowance.');
        errors.push("Invalid Allowance.");
    }

    
    if (!errors.length && (basicPay || allowance)) {
        document.getElementById("update-grossPay").value = 
            (parseFloat(basicPay) || 0) + (parseFloat(allowance) || 0);
            
    }

    return errors.length === 0;
}

async function loadUpdateLogs(id) {

    await loadStaffOptions('update-staffId');
    await loadDesignationOptions('update-designation');
    
    try {
        // const response = await axiosInstance.get(API_ROUTES.getLog(id));
        const response=await api.getLog(id);

        
        const data = response.contractLog;

        document.getElementById('update-staffId').value = data.staffID;
      
        const selectedOption = document.getElementById('update-staffId').options[
            document.getElementById('update-staffId').selectedIndex
        ];
        
        const match = selectedOption.text.match(/\((.*?)\)/);
        document.getElementById('update-staffName').value = match ? match[1] : '';
        document.getElementById('update-grossPay').value = data.grossPay ? parseFloat(data.grossPay) : '';
        document.getElementById('update-basicPay').value = data.basicPay ? parseFloat(data.basicPay) : '';
        document.getElementById('update-allowance').value = data.allowance ? parseFloat(data.allowance) : '';
    
        document.getElementById('update-designation').value = data.currentDesignation;
        updateLogButton.dataset.contractID = id;
    } catch (error) {
        console.error(error);
    }
}                          

document.getElementById('update-staffId').addEventListener('change', (e) => {
    const text = e.target.options[e.target.selectedIndex].text;
    const match = text.match(/\((.*?)\)/);
    document.getElementById('update-staffName').value = match ? match[1] : '';
 });

 
 document.getElementById('update-basicPay').addEventListener('input',updateGrossPay);
 document.getElementById('update-allowance').addEventListener('input',updateGrossPay);

 function updateGrossPay(){
     let basicPay=parseFloat(document.getElementById('update-basicPay').value) || 0.0;
     let allowance=parseFloat(document.getElementById('update-allowance').value) || 0.0;
     let grossPayField=document.getElementById('update-grossPay');
     grossPayField.value=parseFloat(basicPay+allowance);
 }
 
 function validateUpdateForm(formData) {
    let errors = [];

    
    const staffID = formData.get('staffID')?.trim();
    const contractStartDate = formData.get('contractStartDate')?.trim();
    const contractEndDate = formData.get('contractEndDate')?.trim();
    const basicPay = formData.get('basicPay')?.trim();
    const allowance = formData.get('allowance')?.trim();

    
    if (contractStartDate && contractEndDate) {
        if (new Date(contractStartDate) >= new Date(contractEndDate)) {
            showErrorPopupFadeInDown('Contract End Date must be after Start Date.');
            errors.push("Contract End Date must be after Start Date.");
        }
    }

   
    if (basicPay && (isNaN(basicPay) || parseFloat(basicPay) < 0)) {
        showErrorPopupFadeInDown('Please enter a valid Basic Pay.');
        errors.push("Invalid Basic Pay.");
    }

    
    if (allowance && (isNaN(allowance) || parseFloat(allowance) < 0)) {
        showErrorPopupFadeInDown('Please enter a valid Allowance.');
        errors.push("Invalid Allowance.");
    }

    
    if (errors.length === 0 && (basicPay || allowance)) {
        const grossPay = (parseFloat(basicPay) || 0) + (parseFloat(allowance) || 0);
        document.getElementById("update-grossPay").value = grossPay;
    }

    return errors.length === 0;
}
