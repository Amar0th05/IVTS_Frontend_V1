let table;
function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
   
   if(!data){
    console.error('no data to add');
    return;
   }

   const procurement = {
    equipmentID: data.equipmentID ?? null,
    procurementId: data.procurementId ?? null,
    vendorFinalised: data.vendorFinalised ?? null,
    vendorReceivedQuotation: data.vendorReceivedQuotation ?? null,
    intendRaised: data.intendRaised ?? null,
    adminApproved: data.adminApproved ?? null,
    poReleased: data.poReleased ?? null,
    equipmentDeliveredAtNtcpwc: data.equipmentDeliveredAtNtcpwc ?? null,
    paymentSettledToVendorByNtcpwc: data.paymentSettledToVendorByNtcpwc ?? null,
    invoiceSubmittedByNtcpwc: data.invoiceSubmittedByNtcpwc ?? null,
    amountPaid: parseFloat(data.amountPaid) || 0,
    gst: parseFloat(data.gst) || 0,
    totalAmountPaid: parseFloat(data.totalAmountPaid) || 0,
    amountReceived: parseFloat(data.amountReceived) || 0,
    suppliedAtPort: data.suppliedAtPort ?? null,
    installedAtPort: data.installedAtPort ?? null,
};


   table.row.add([
    data.index,
    data.port,
    data.equipmentCategory,
    data.equipment,
    `<input type="number" min="0"  value="${data.totalQuantity}" class="form-control editElement" id="totalQuantity-${data.equipmentID}" data-equipmentId="${data.equipmentID}" data-deliveryId="${data.deliveryID}">`,
   `<input type="number" min="0" max="${data.totalQuantity}" value="${data.quantityDelivered}" class="form-control editElement" id="quantityPendingForDelivery-${data.equipmentID}" data-equipmentId="${data.equipmentID}" data-deliveryId="${data.deliveryID}" data-totalQuantity="${data.totalQuantity}">`,
    data.quantityPendingForDelivery,
    data.stage,
    data.reasonForPendingDelivery,
    `
    <button class="btn btn-info text-center rounded-circle p-2 d-flex justify-content-center align-items-center border mx-auto" 
        data-toggle="modal" 
        data-target="#updateModal"
       onclick=loadStageDetails('${JSON.stringify(procurement).replace(/'/g, "&apos;")}')>
<i class="fa-solid fa-info"></i>   </button>

    `,
    ]).draw(false);

};

document.querySelector('#myTable').addEventListener('change', async function(event) {
    if (event.target.classList.contains('form-control')) {
        const fieldId = event.target.id;
    
        const totalQuantity = event.target.value;
        const equipmentID = event.target.dataset.equipmentid;
        const deliveryID = event.target.dataset.deliveryid;
    
        if (fieldId.startsWith("totalQuantity-")) {
           
            if (parseInt(totalQuantity) < 0) {
                showErrorPopupFadeInDown('Total quantity cannot be negative.');
                await refreshTable();
                return;
            }
    
            await updateTotalQuantity(equipmentID, totalQuantity, deliveryID);
        }
    
        else if (fieldId.startsWith("quantityPendingForDelivery-")) {
            const quantityDelivered = totalQuantity;
            const maxQty = event.target.dataset.totalquantity;
    
            if (parseInt(quantityDelivered) > parseInt(maxQty)) {
                showErrorPopupFadeInDown('Quantity delivered cannot be greater than total quantity.');
                await refreshTable();
                return;
            }
    
            await updateQuantityDelivered(equipmentID, quantityDelivered, deliveryID);
        }
    }
    
});

async function fetchAllData(){
    try{
        
        var data=await api.getAllEquipmentList();

        const equipmentCategory=new Set();
        const port=new Set();
        const stages=new Set();

        data=data.map(item=>{
            if(item.equipmentCategory){
                item.equipmentCategory=item.equipmentCategory.trim();
            }
            if(item.port){
                item.port=item.port.trim();
            }
            if(item.stage){
                item.stage=item.stage.trim();
            }
            return item;
        })
        data.forEach(element => {
            if(element.equipmentCategory){
                equipmentCategory.add(element.equipmentCategory.trim());
            }
            if(element.port){
                port.add(element.port.trim());
            }
            if(element.stage){
                stages.add(element.stage.trim());
            }
        });

        

        equipmentCategory.forEach(equipmentCategory => {
            if(!equipmentCategory) return;
            $('#equipmentCategoryFilter').append(`<option value="${equipmentCategory}">${equipmentCategory}</option>`);
        });

        port.forEach(port => {
            if(!port) return;
            $('#portFilter').append(`<option value="${port}">${port}</option>`);
        });

        stages.forEach(stage => {
            if(!stage) return;
            $('#currentStageFilter').append(`<option value="${stage}">${stage}</option>`);
        }); 

        


        data = data.map((item, index) => ({
            ...item,
            index: index + 1
        }));
        
        data.forEach(element => {
            addRow(element);
            
        });
        handlePermission('#username');
    }catch(err){
        console.error(err);
    }
}

$(document).ready(async function() {
    await loadOrganisationOptions("portName");
    await loadEquipmentCategoryOptions('equipmentCategory');
    
    await fetchAllData();

   
    

});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await fetchAllData();
}

function loadStageDetails(obj) {
    
    let procurement = JSON.parse(obj);
    // console.log('procurement : ',procurement);
    if(!procurement) return;
    
    if (procurement.procurementId) {
      
        $('#vendorFinalised').val(procurement.vendorFinalised ? new Date(procurement.vendorFinalised).toISOString().split('T')[0] : '');
        $('#vendorReceivedQuotation').val(procurement.vendorReceivedQuotation ? new Date(procurement.vendorReceivedQuotation).toISOString().split('T')[0] : '');
        $('#intendRaised').val(procurement.intendRaised ? new Date(procurement.intendRaised).toISOString().split('T')[0] : '');
        $('#adminApproved').val(procurement.adminApproved ? new Date(procurement.adminApproved).toISOString().split('T')[0] : '');
        $('#poReleased').val(procurement.poReleased ? new Date(procurement.poReleased).toISOString().split('T')[0] : '');
        $('#equipmentDeliveredAtNtcpwc').val(procurement.equipmentDeliveredAtNtcpwc ? new Date(procurement.equipmentDeliveredAtNtcpwc).toISOString().split('T')[0] : '');
        $('#paymentSettledToVendorByNtcpwc').val(procurement.paymentSettledToVendorByNtcpwc ? new Date(procurement.paymentSettledToVendorByNtcpwc).toISOString().split('T')[0] : '');
        $('#invoiceSubmittedByNtcpwc').val(procurement.invoiceSubmittedByNtcpwc ? new Date(procurement.invoiceSubmittedByNtcpwc).toISOString().split('T')[0] : '');
        $('#amountPaid').val(procurement.amountPaid);
        $('#gst').val(procurement.gst);
        $('#totalAmountPaid').val(procurement.totalAmountPaid);
        $('#amountReceived').val(procurement.amountReceived);
        $('#suppliedAtPort').val(procurement.suppliedAtPort ? new Date(procurement.suppliedAtPort).toISOString().split('T')[0] : '');
        $('#installedAtPort').val(procurement.installedAtPort ? new Date(procurement.installedAtPort).toISOString().split('T')[0] : '');
        
    }else{
        $('#vendorFinalised').val(null);
        $('#vendorReceivedQuotation').val(null);
        $('#intendRaised').val(null);
        $('#adminApproved').val(null);
        $('#poReleased').val(null);
        $('#equipmentDeliveredAtNtcpwc').val(null);
        $('#paymentSettledToVendorByNtcpwc').val(null);
        $('#invoiceSubmittedByNtcpwc').val(null);
        $('#amountPaid').val(null);
        $('#gst').val(null);
        $('#totalAmountPaid').val(null);
        $('#amountReceived').val(null);
    }

    
    $('#submit_procurement_btn').off("click").on("click", function () {
        var data = {
            equipmentID: procurement.equipmentID,
            vendorFinalised: $('#vendorFinalised').val() ? formatDateForMSSQL($('#vendorFinalised').val()) : null,
            vendorReceivedQuotation: $('#vendorReceivedQuotation').val() ? formatDateForMSSQL($('#vendorReceivedQuotation').val()) : null,
            intendRaised: $('#intendRaised').val() ? formatDateForMSSQL($('#intendRaised').val()) : null,
            adminApproved: $('#adminApproved').val() ? formatDateForMSSQL($('#adminApproved').val()) : null,
            poReleased: $('#poReleased').val() ? formatDateForMSSQL($('#poReleased').val()) : null,
            equipmentDeliveredAtNtcpwc: $('#equipmentDeliveredAtNtcpwc').val() ? formatDateForMSSQL($('#equipmentDeliveredAtNtcpwc').val()) : null,
            paymentSettledToVendorByNtcpwc: $('#paymentSettledToVendorByNtcpwc').val() ? formatDateForMSSQL($('#paymentSettledToVendorByNtcpwc').val()) : null,
            invoiceSubmittedByNtcpwc: $('#invoiceSubmittedByNtcpwc').val() ? formatDateForMSSQL($('#invoiceSubmittedByNtcpwc').val()) : null,
            amountPaid: $('#amountPaid').val() ? parseFloat($('#amountPaid').val()) : 0,
            gst: $('#gst').val() ? parseFloat($('#gst').val()) : 0,
            totalAmountPaid: $('#totalAmountPaid').val() ? parseFloat($('#totalAmountPaid').val()) : 0,
            amountReceived: $('#amountReceived').val() ? parseFloat($('#amountReceived').val()) : 0,
            suppliedAtPort: $('#suppliedAtPort').val() ? formatDateForMSSQL($('#suppliedAtPort').val()) : null,
            installedAtPort: $('#installedAtPort').val() ? formatDateForMSSQL($('#installedAtPort').val()) : null
        };

        if (procurement.procurementId) {
            axiosInstance.put(`/procurements/${procurement.procurementId}`, data)
                .then(async response => {
                    await refreshTable();
                    showPopupFadeInDown('success');
                    console.log(response.data);
                })
                .catch(error => {
                    showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update procurement. Please try again later.');
                    console.error("Error updating procurement:", error);
                });
        } else {
           
            axiosInstance.post("/procurements", data)
                .then(async response => {
                    await refreshTable();
                    showPopupFadeInDown('success');
                    console.log(response.data);
                })
                .catch(error => {
                    showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update procurement. Please try again later.');
                    console.error("Error creating procurement:", error);
                });
        }
    });

  
}

function formatDateForMSSQL(date) {
    let d = new Date(date);
    return d.toISOString().slice(0, 10);
}

$('#amountPaid, #gst').on('input', function () {
    var amountPaid = parseFloat($('#amountPaid').val()) || 0;
    var gst = parseFloat($('#gst').val()) || 0;
    var totalAmountPaid = amountPaid + gst;
    $('#totalAmountPaid').val(totalAmountPaid);
});


async function getAllEquipmentDeliveries(){
    try{
        const deliveries=await api.getAllEquipmentDeliveries();
        console.log(deliveries);
    }catch(err){
        console.log(err);
    }
}



async function updateQuantityDelivered(equipmentID, quantityDelivered,deliveryID){
    try{
        const data={
            quantity_delivered:quantityDelivered
        }
        const message=await api.updateQuantityDelivered(deliveryID,data);
        await refreshTable();
    }catch(err){
        console.log(err);
    }
}


async function updateTotalQuantity(equipmentID, totalQuantity,deliveryID){
    try{
        const data={
            totalQuantity:totalQuantity
        }
        const response=await axiosInstance.put('/equipments/tq/'+equipmentID,{
            data
        });
        
        await refreshTable();
    }catch(err){
        console.log(err);
    }
}


async function loadOrganisationOptions(id) {
    try {
        const organisations = await api.getOrganisations();
        const select = document.getElementById(id);

        select.innerHTML = '<option value="">Select Organisation</option>';
        organisations.forEach(organisation => {
            const option = document.createElement("option");
            option.value = organisation.org_id;
            option.textContent = organisation.organisation_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading organisations:", error);
    }
}

async function loadEquipmentCategoryOptions(id) {
    try {
        const categories = await api.getAllActiveEquipmentCategory();
        const select = document.getElementById(id);

        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.category_id;
            option.textContent = category.category_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


document.querySelector("#add_equipment_btn").addEventListener('click', async () => {
    try{
        const port=$('#portName').val();
        const equipment_category=$('#equipmentCategory').val();    
        const assetsCount=$('#assetsCount').val();
        const sparesCount=$('#sparesCount').val();    
        const total_quantity=$('#totalCount').val();
        const equipment=$('#equipmentName').val();
        const { assets, spares } = getSerialNumbers();
       
        
        const data={
            port,
            equipment_category,
            total_quantity,
            equipment,
            assets,
            spares,
        }

        console.log(data);

        if(!equipment){
            showErrorPopupFadeInDown('Please enter equipment name');
            return;
        }
       
        await api.createEquipment({port,equipment_category,total_quantity,equipment,assets,spares});
       
        await refreshTable();

        showPopupFadeInDown('success');
        
        document.getElementById('dynamicForm').reset();

    }catch(err){

        console.log(err);

        showErrorPopupFadeInDown(err.message||'error inserting data');
    }
});



$(document).ready(async function () {
    var table = $('#myTable').DataTable({
        "paging": true,
        "pageLength": 50,
        "lengthMenu": [5, 10, 25, 50, 100],
        dom: '<"top"l>frtip',
        buttons: ['excel', 'csv', {
            extend: 'pdf',
            text: 'PDF',
            orientation: 'landscape', 
            exportOptions: {
                columns: ':visible',
                search: 'applied',
                order: 'applied',
                page: 'all',
            }
        },{
            extend: 'colvis',
            hidestart:[ 8],
            // columns: [8],
           
            text: 'Column Visibility',
        }],
        
        "columnDefs": [
        { "targets": [8], "visible": false } 
        ]
    });


    
    table.buttons().container().appendTo($('#exportButtons'));


    $('#currentStageFilter').on('change', function () {
        const selectedStage = $(this).val();
        table.column(7).search(selectedStage ? '^' + selectedStage + '$' : '', true, false).draw();
    });


    $('#portFilter').on('change', function () {
        const selectedPort = $(this).val();
        table.column(1).search(selectedPort ? '^' + selectedPort + '$' : '', true, false).draw();
    });
    $('#equipmentCategoryFilter').on('change', function () {
        const selectedCategory = $(this).val();
        table.column(2).search(selectedCategory ? '^' + selectedCategory + '$' : '', true, false).draw();
    });




});

    document.addEventListener('DOMContentLoaded', () => {
      const assetsCountInput = document.getElementById('assetsCount');
      const sparesCountInput = document.getElementById('sparesCount');
      const assetsFieldsContainer = document.getElementById('assetsFields');
      const sparesFieldsContainer = document.getElementById('sparesFields');
      const totalCountDisplay = document.getElementById('totalCount');
    
      const createFields = (container, count, label) => {
        
        if(count<=0){
            return;
        }

    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.style.padding = '10px';
    tableWrapper.style.border = '1px solid #ddd';
    tableWrapper.style.borderRadius = '5px';
    tableWrapper.style.margin = '10px auto'; 
    tableWrapper.style.maxWidth = '100%'; 
    // tableWrapper.style.backgroundColor = '#f9f9f9';

    const table = document.createElement('table');
    table.className = 'table table-bordered';
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';
    table.style.margin = '0 auto';

    //header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="text-align: center;">
            <th style="width: 50%; padding: 8px;">${label}</th>
            <th style="width: 50%; padding: 8px;">Serial No.</th>
        </tr>
    `;
    thead.className='bg-primary text-white'
    table.appendChild(thead);

    
    const tbody = document.createElement('tbody');
    for (let i = 1; i <= count; i++) {
        const row = document.createElement('tr');

        const td1 = document.createElement('td');
        td1.style.textAlign = 'center';
        td1.style.padding = '5px';
        td1.innerText = `${label} ${i}`;
        row.appendChild(td1);

        const td2 = document.createElement('td');
        td2.style.textAlign = 'center';
        td2.style.padding = '5px';

        const input = document.createElement('input');
        input.type = "text";
        input.style.width = '100%';
        input.style.height = '30px';
        input.style.textAlign = 'center';
        input.style.border = '1px solid #ccc';
        input.placeholder = `Enter ${label} Serial No.`;
        input.className = 'form-control';

        td2.appendChild(input);
        row.appendChild(td2);

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
};


     
    
      assetsCountInput.addEventListener('input', () => {
        createFields(assetsFieldsContainer, parseInt(assetsCountInput.value) || 0, 'Asset');
        updateTotal();
      });
    
      sparesCountInput.addEventListener('input', () => {
        createFields(sparesFieldsContainer, parseInt(sparesCountInput.value) || 0, 'Spare');
        updateTotal();
      });
    
      const updateTotal = () => {
        const assetsCount = parseInt(assetsCountInput.value) || 0;
        const sparesCount = parseInt(sparesCountInput.value) || 0;
        totalCountDisplay.value = assetsCount + sparesCount;
      };


     const getSerialNumbers = () => {
        
        const assetInputs = assetsFieldsContainer.querySelectorAll('input');
        const spareInputs = sparesFieldsContainer.querySelectorAll('input');

        const assets = Array.from(assetInputs).map(input => input.value.trim()).filter(val => val !== "");
        const spares = Array.from(spareInputs).map(input => input.value.trim()).filter(val => val !== "");

        return { assets, spares };
        
    };

    window.getSerialNumbers=getSerialNumbers;

    });
    
    