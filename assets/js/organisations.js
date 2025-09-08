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
        data.organisation,
        data.createdOn,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.orgID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateorganisationsModal" onclick="loadUpdateOrganisation(${data.orgID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}


const addNewOrganisationButton=document.getElementById('add_organisation_btn');
const updateOrganisationButton=document.getElementById('update_organisation_btn');

//create Organisation
addNewOrganisationButton.addEventListener('click', async () => {
    try {
        const organisationField = document.getElementById('organisation-name-input');
        const organisation = organisationField.value;
        if (organisation.trim() === '') {
            showErrorPopupFadeInDown('Please enter a organisation name.');
            return;
        }
        await api.createOrganisation(organisation);
       organisationField.value='';
        await refreshTable();
        showPopupFadeInDown('Organisation added successfully.');
        
    }catch(error){
        console.error('error while adding organisation:',error);
        showErrorPopupFadeInDown('Failed to add organisation. Please try again later.');
    }
});


// toggle status
async function toggleStatus(element, id) {
    
    if (!id) return;


    try {
        const response = await axiosInstance.put(`organisations/togglestatus/${id}`);
        // showSucessPopupFadeInDownLong(response.data.message);
        if (element) {
            element.classList.toggle('active');
            
        }
       
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

async function fetchAllOrganisations(){
    try{
        const organisations=await api.getAllOrganisations();
        organisations.forEach(addRow);
    }catch(error){
        console.error('Error fetching organisations:', error);
        showErrorPopupFadeInDown('Failed to fetch organisations. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded',async ()=>{
    

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

});


async function loadUpdateOrganisation(id) {
    try {
        id = parseInt(id);
        const organisation = await api.getOrganisationById(id);
        if (!organisation) {
            showErrorPopupFadeInDown('organisation not found.');
            return;
        }
        document.getElementById('update-organisationName').value = organisation.organisation;
        updateOrganisationButton.dataset.orgID = id;
        

    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to fetch organisation. Please try again later.'  );
    }
}



updateOrganisationButton.addEventListener('click',async ()=>{
    const id=updateOrganisationButton.dataset.orgID;
   
    if(!id){
        showErrorPopupFadeInDown('Please select a organisation to update.');
        return;
    }
    const organisationField=document.getElementById('update-organisationName');
    const updatedOrganisationName=organisationField.value.trim();
    if(updatedOrganisationName === ''){
        showErrorPopupFadeInDown('Please enter a organisation name.');
        return;
    }
    try{
        await api.updateOrganisation(id, updatedOrganisationName);
        showPopupFadeInDown('Organisation updated successfully.');
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown(error.data.error||'Failed to update organisation. Please try again later.'  );
    }
});


async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await fetchAllOrganisations();
    
}
