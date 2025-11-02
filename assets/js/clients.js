 
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
        `<div class="container d-flex justify-content-center">
            <div class="toggle-btn ${data.Status===true?'active':''}" onclick="toggleStatus(this,'${data.ID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 edit-btn" style="cursor:pointer;" data-toggle="modal" data-target="#updateclientModal" onclick="loadUpdateClient(${data.ID})">
                <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
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
    
    await getAllClients();
    
    
});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllClients();
}
    $(document).ready(function () {
        // Initialize DataTable
        var table = $('#myTable').DataTable({
            "paging": true,
            "pageLength": 25,
            "lengthMenu": [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
            buttons: [
        {
            extend: 'excelHtml5',
 text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel",            
    exportOptions: {
                columns: [0,1,2],
                format: {
                    body: function (data, row, column, node) {
                        
                        if ($(node).find('.toggle-btn').length) {
                            return $(node).find('.toggle-btn').hasClass('active') ? 'True' : 'False';
                        }
                        return data;
                    }
                }
            }
        },
        {
            extend: 'pdfHtml5',
 text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
    className: "btn-pdf"   ,         
    exportOptions: {
                columns: [0,1,2],
                format: {
                    body: function (data, row, column, node) {
                        if ($(node).find('.toggle-btn').length) {
                            return $(node).find('.toggle-btn').hasClass('active') ? 'True' : 'False';
                        }
                        return data;
                    }
                }
            }
        }
    ],
     language: {
      search: "",
      searchPlaceholder: "Type to search...",
    paginate: { first: "«", last: "»", next: "›", previous: "‹" }

    },
    initComplete: function () {
      // Remove default "Search:" text
      $('#myTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#myTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
        });

        // Append buttons to the specified container
        table.buttons().container().appendTo('#exportButtons');
    });

