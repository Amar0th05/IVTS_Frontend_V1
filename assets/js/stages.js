$(document).ready(async ()=>{
    // const user=JSON.parse(sessionStorage.getItem('user'));
    // const token=sessionStorage.getItem('token');

    // if(!token||!user){
    //     window.location.replace("login.html");
    // }

    // if(user.role!==2){
    //     window.location.replace("index.html");
    // }

    // $('#user-name-display').text(user.name);
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#user-name-display');

                    
});


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
        data.stage,
        data.createdOn,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.stageID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateStageModal" onclick="loadUpdateStage(${data.stageID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}



//toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const response = await axiosInstance.put(`/stages/status/${id}`);
        if (element) {
            element.classList.toggle('active');
            
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

const updateStageButton = document.getElementById('update_stage_btn');
const createStageButton = document.getElementById('create_stage_btn');

document.querySelector('#update_stage_btn').addEventListener('click', async () => {
    const id = updateStageButton.dataset.stageID;
    const stage=document.getElementById('update-stageName').value;
    
    try{
        const response=await api.updateStage(id,stage);
        showPopupFadeInDown(response.message);
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown('Failed to update stage. Please try again later.');
    }
});


createStageButton.addEventListener('click', async () => {
    const stage=document.getElementById('stage-name-input').value;
    if(!stage){
        showErrorPopupFadeInDown('Stage is required.');
        return;
    }
    try{
        await api.createStage(stage);
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown('Failed to create stage. Please try again later.');
    }
});

//update course
async function loadUpdateStage(id) {
    id = parseInt(id);
    const course = await api.getStage(id);

    if (!course) {
        showErrorPopupFadeInDown('Course not found.');
        return;
    }

    const StageNameField = document.getElementById('update-stageName');
    StageNameField.value = course.stage;

    updateStageButton.dataset.stageID = id;
}


async function getAllStages(){
    try{
       const stages=await api.getAllStages();
       stages.forEach(stage=>addRow(stage));
    }catch(error){
        console.error('Error fetching stages:', error);
    }
}

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllStages();
}

$(document).ready(async function() {
    await refreshTable();
});