
//table instance 
let table;

// add row
async function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
    if(!data){
        console.error('no data to add');
        return;
    }
    if(data.status){
        data.status=true;
    }else{
        data.status=false;
    }
    data.createdOn=new Date(data.createdOn).toLocaleDateString();
    table.row.add([
        data.designation,
        data.createdOn,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.designationID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateDesignationModal" onclick="loadUpdateDesignation(${data.designationID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}


const addNewDesignationButton=document.getElementById('add_designation_btn');
const updateDeisgnationButton=document.getElementById('update_designation_btn');

//add designation event handler
addNewDesignationButton.addEventListener('click',async ()=>{
    const designationField=document.getElementById('designation-name-input');
    const designation=designationField.value;
    if(designation.trim() === ''){
        showErrorPopupFadeInDown('Please enter a designation name.');
        return;
    }
});

//add new designation
addNewDesignationButton.addEventListener('click', async () => {
    try {
        const designationName = document.getElementById('designation-name-input').value.trim();
        if (designationName === '') {
            showErrorPopupFadeInDown('Please enter a designation name.');
            return;
        }
        
        const data = await api.createDesignation(designationName);
        
        showSucessPopupFadeInDownLong("Designation added successfully.");
        
        document.getElementById('designation-name-input').value = '';
        
        await refreshTable();

    }catch(error){
        console.error('Error adding designation:', error);
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add new designation. Please try again later.');
    }

});

async function getAllDesignations() {
    try {
        const designations = await api.getAllDesignations();
        designations.forEach(async (designation) => {
            await addRow(designation);
        });

    } catch (error) {
        console.error('Error fetching designations:', error);
    }
}



async function loadUpdateDesignation(id) {
    try {
        id = parseInt(id);
        const data = await api.getDesignationById(id);
        if (!data) {
            showErrorPopupFadeInDown('Designation not found.');
            return;
        }
        document.getElementById('update-deignationName').value = data.name;
        updateDeisgnationButton.dataset.designationId = id;

    } catch (error) {
        showErrorPopupFadeInDown(error.data.message);
    }
}

updateDeisgnationButton.addEventListener('click',async ()=>{
    const id=updateDeisgnationButton.dataset.designationId;
    if(!id){
        showErrorPopupFadeInDown('Please select a designation to update.');
        return;
    }
    const designationField=document.getElementById('update-deignationName');
    const updatedDesignationName=designationField.value.trim();
    if(updatedDesignationName === ''){
        showErrorPopupFadeInDown('Please enter a designation name.');
        return;
    }
    try{
        await api.updateDesignation(id, updatedDesignationName);
        showSucessPopupFadeInDownLong('Designation updated successfully.');
        designationField.value='';
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown(error.data.message);
    }
});


// //logout
// document.getElementById('logout-button').addEventListener('click', logout);
// function logout() {
//     sessionStorage.removeItem('token');
// }

// toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const response = await axiosInstance.put(`designations/togglestatus/${id}`);
        // showSucessPopupFadeInDownLong(response.data.message);
        if (element) {
            element.classList.toggle('active');
            
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

// dom loaded
document.addEventListener('DOMContentLoaded',async()=>{
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#user-name-dsiplay');

    // const user=JSON.parse(sessionStorage.getItem('user'));
    // const token = sessionStorage.getItem('token');
   
    // // document.getElementById('more-details').innerHTML=user.name;
    
    
    
    // if (token === null || user === null) {
    //     window.location.replace("login.html");
    // } else if (user.role !== 2) {
    //     window.location.replace("index.html");
    //     return;
    // }

    // document.getElementById('user-name-dsiplay').innerHTML=user.name;
    
    await refreshTable();

    const designations=await api.getAllDesignations();

    
});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllDesignations();
}

