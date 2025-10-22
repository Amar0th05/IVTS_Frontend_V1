
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
                <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
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


    $(document).ready(function () {
        // Initialize DataTable
        var table = $('#myTable').DataTable({
            "paging": true,
            "pageLength": 25,
            "lengthMenu": [5, 10, 25, 50, 100],
            dom: '<"top"l>frtip',
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
    className: "btn-pdf",
            orientation: 'landscape',
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
    ]
        });

        
        table.buttons().container().appendTo('#exportButtons');
    });
