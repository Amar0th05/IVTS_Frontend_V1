 
let table;

//add row
async function addRow(data){

    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
    if(!data){
        console.error('no data to add');
        return;
    }
    if(data.Status){
        data.Status=true;
    }else{
        data.Status=false;
    }

    data.CreatedAt=new Date(data.CreatedAt).toLocaleDateString();

    table.row.add([
        data.ClientName,
        data.CreatedAt,
        `<div class="container">
            <div class="toggle-btn ${data.Status===true?'active':''}" onclick="toggleStatus(this,'${data.ID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateclientModal" onclick="loadUpdateClient(${data.ID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}


const addNewClientButton=document.getElementById('add_client_btn');
const updateClientButton=document.getElementById('update_client_btn');



//add course event handler
addNewClientButton.addEventListener('click',async ()=>{
    const clientNameField=document.getElementById('client-name-input');
    const ClientName=clientNameField.value;
    if(ClientName.trim() === ''){
        showErrorPopupFadeInDown('Please enter a client name.');
        return;
    }
    
    await refreshTable();
    addNewClient(ClientName);
   clientNameField.value='';
})




//add course
async function addNewClient(clientName){
    try {
        const data = await api.createClient(clientName);
        if(data.message){
            showSucessPopupFadeInDownLong(data.message);
        }
        await refreshTable();

    } catch (err) {
        console.error('Error adding client:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add new client. Please try again later.');
    }
}


//update course
async function loadUpdateClient(id) {
    id = parseInt(id);
    const client = await getClient(id);

    if (!client) {
        showErrorPopupFadeInDown('Client not found.');
        return;
    }

    const clientNameField = document.getElementById('update-clientName');
    clientNameField.value = client.ClientName;

    updateClientButton.dataset.Id = id;
}


updateClientButton.addEventListener('click', async () => {
    const id = updateClientButton.dataset.Id;
    if (!id) {
        showErrorPopupFadeInDown('No client selected.');
        return;
    }

    const clientNameField = document.getElementById('update-clientName');
    const updatedClientName = clientNameField.value.trim();

    if (updatedClientName === '') {
        showErrorPopupFadeInDown('Please enter a client name.');
        return;
    }

    try {
        await axiosInstance.put(`/clients/${id}`, { ClientName: updatedClientName });
        showSucessPopupFadeInDownLong("Client updated");
        await refreshTable();
    } catch (err) {
        console.error('Error updating client:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to update client. Please try again later.');
    }
});





async function getAllClients(){
 
    const clients=await api.getAllClients();
    clients.forEach(addRow);
}


//get course
async function getClient(id){
    try {
        const response=await axiosInstance.get(`/clients/${id}`);
        return response.data.client;
    } catch (error) {
        console.error('Error getting client:', error);
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to get client. Please try again later.');
    }
}

//logout
document.getElementById('logout-button').addEventListener('click', logout);
function logout() {
    sessionStorage.removeItem('token');
}

//toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const response = await axiosInstance.put(`/clients/status/${id}`);
        if (element) {
            element.classList.toggle('active');
            
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

//dom loaded
document.addEventListener('DOMContentLoaded',async()=>{
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
   
    handlePermission('#user-name-display');
    
    // const token = sessionStorage.getItem('token');
    // const user=JSON.parse(sessionStorage.getItem('user'));
    // if (token === null||user===null) {
    //     window.location.href = "login.html";
    // }else if(user.role!==2){
    //     window.location.href = "index.html";
    //     return;
    // }

    // document.getElementById('user-name-display').innerText=user.name;
    // document.getElementById('more-details').innerText=user.name;
    
    await getAllClients();
    
    
});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllClients();
}