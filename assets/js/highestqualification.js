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
        data.highestQualification,
        data.createdOn,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.qualID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateQualificationModal" onclick="loadUpdateQualification(${data.qualID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}


const addNewQualificationButton=document.getElementById('add_qualification_btn');
const updateQualificationButton=document.getElementById('update_qualification_btn');

//create qualification
addNewQualificationButton.addEventListener('click', async () => {
    try {
        const qualificationField = document.getElementById('qualification-name-input');
        const qualification = qualificationField.value;
        if (qualification.trim() === '') {
            showErrorPopupFadeInDown('Please enter a qualification name.');
            return;
        }
        await api.createHighestQualification(qualification);
        qualificationField.value='';
        await refreshTable();
        showSuccessPopupFadeInDown('Qualification added successfully.');
        
    }catch(error){
        console.error('error while adding qualification:',error);
        showErrorPopupFadeInDown('Failed to add qualification. Please try again later.');
    }
});


// toggle status
async function toggleStatus(element, id) {
    
    if (!id) return;


    try {
        const response = await axiosInstance.put(`/hq/togglestatus/${id}`);
        // showSucessPopupFadeInDownLong(response.data.message);
        if (element) {
            element.classList.toggle('active');
            
        }
       
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

async function fetchAllQualifications(){
    try{
        const highestQualifications=await api.getAllHighestQualifications();
        highestQualifications.forEach(addRow);
    }catch(error){
        console.error('Error fetching qualifications:', error);
        showErrorPopupFadeInDown('Failed to fetch qualifications. Please try again later.');
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


async function loadUpdateQualification(id) {
    try {
        id = parseInt(id);
        const highestQualification = await api.getQualificationById(id);
        if (!highestQualification) {
            showErrorPopupFadeInDown('qualification not found.');
            return;
        }
        document.getElementById('update-qualificationName').value = highestQualification.highestQualification;
        updateQualificationButton.dataset.qualID = id;
        

    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to fetch qualification. Please try again later.'  );
    }
}



updateQualificationButton.addEventListener('click',async ()=>{
    const id=updateQualificationButton.dataset.qualID;
   
    if(!id){
        showErrorPopupFadeInDown('Please select a qualification to update.');
        return;
    }
    const qualificationField=document.getElementById('update-qualificationName');
    const updatedQualificationName=qualificationField.value.trim();
    if(updatedQualificationName === ''){
        showErrorPopupFadeInDown('Please enter a qualification name.');
        return;
    }
    try{
        await api.updateHighestQualification(id, updatedQualificationName);
        showSucessPopupFadeInDownLong('Qualification updated successfully.');
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown(error.data.message);
    }
});


async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await fetchAllQualifications();
}
