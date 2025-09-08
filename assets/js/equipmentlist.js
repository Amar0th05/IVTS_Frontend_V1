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
        <i class="ti-info mx-auto"></i>
    </button>

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
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;

    handlePermission('#username');

    const sidebarContainer = document.getElementById('sidebar-placeholer');
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
    
    // const sidebarContainer = document.getElementById('sidebar-container');
    // if (sidebarContainer) {
    //     sidebarContainer.innerHTML = generateSidebar();
        
       
    //     const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    //     const navLinks = document.querySelectorAll('.pcoded-item a');
        
    //     navLinks.forEach(link => {
    //         if (link.getAttribute('href').includes(currentPage)) {
    //             link.parentElement.classList.add('active');
                
            
    //             const accordionContent = link.closest('.accordion-content');
    //             if (accordionContent) {
    //                 accordionContent.style.display = 'block';
    //                 const header = accordionContent.previousElementSibling;
    //                 const icon = header.querySelector('.accordion-icon');
    //                 if (icon) {
    //                     icon.classList.remove('fa-chevron-down');
    //                     icon.classList.add('fa-chevron-up');
    //                 }
    //             }
    //         }
    //     });
    // }
    
    // const user=JSON.parse(sessionStorage.getItem('user'));
    // const token = sessionStorage.getItem('token');
    // if (token === null || user === null) {
    //     window.location.replace("login.html");
    // } else if (user.role === 2) {
    //     window.location.replace("user-details.html");
    //     return;
    // }

    // document.getElementById('username').textContent=user.name;

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

