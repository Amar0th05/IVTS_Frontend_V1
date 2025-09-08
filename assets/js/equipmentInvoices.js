

let equipmentInvoiceTable;

let equipmentInvoiceModalTable;

document.querySelector('#submit-btn').addEventListener('click', async (event) => {
    event.preventDefault();

    let port = $('#port').val();
    let projectNumber = $('#projectNumber').val();
    let invoiceNumber = $('#invoiceNumber').val();
    let invoiceSubject = $('#invoiceSubject').val();
    let invoiceAmount = $('#invoiceAmount').val();
    let gst = $('#gst').val();
    let totalInvoiceAmount = $('#totalInvoiceAmount').val();
    let invoiceSubmittedDate = $('#invoiceSubmittedDate').val();
    let fundReceivedFromPort = $('#fundRecievedFromPort').val();

    if (!port) {
        showErrorPopupFadeInDown('Please select a port');
        return;
    }

    if (!projectNumber) {
        showErrorPopupFadeInDown('Please enter project number');
        return;
    }

    if (!invoiceNumber) {
        showErrorPopupFadeInDown('Please enter invoice number');
        return;
    }
    if(!invoiceSubject){
        showErrorPopupFadeInDown('Please enter invoice subject');
        return;
    }
    
    if(!invoiceSubmittedDate){
        showErrorPopupFadeInDown('Please enter invoice submitted date');
        return;
    }

    if (!invoiceAmount) {
        showErrorPopupFadeInDown('Please enter invoice amount');
        return;
    }

    if (!gst) {
        showErrorPopupFadeInDown('Please enter GST');
        return;
    }

    if (!totalInvoiceAmount) {
        showErrorPopupFadeInDown('Please enter total invoice amount');
        return;
    }


    if (invoiceSubmittedDate) {
        let dateObj = new Date(invoiceSubmittedDate);
        if (!isNaN(dateObj.getTime())) {
            invoiceSubmittedDate = dateObj.toISOString().slice(0, 19).replace('T', ' '); 
        } else {
            showErrorPopupFadeInDown('Invalid date format');
            return;
        }
    } else {
        invoiceSubmittedDate = null;
    }

    const invoiceData = {
        port,
        projectNumber,
        invoiceNumber,
        invoiceSubject: invoiceSubject || null,
        invoiceAmount: invoiceAmount || null,
        gst: gst || null,
        totalInvoiceAmount: totalInvoiceAmount || null,
        invoiceSubmittedDate,
        fundReceivedFromPort: fundReceivedFromPort || null
    };

    try {
        const data = await api.createEquipmentInvoice(invoiceData);
        if (data) {
            showPopupFadeInDown('Invoice created successfully');
            await refreshEquipmentInvoiceTable();
            $('#port').val('');
            $('#projectNumber').val('');
            $('#invoiceNumber').val('');
            $('#invoiceSubject').val('');
            $('#invoiceAmount').val('');
            $('#gst').val('');
            $('#totalInvoiceAmount').val('');
            $('#invoiceSubmittedDate').val('');
            $('#fundRecievedFromPort').val('');
        }
    } catch (error) {
        console.error(error);
        showErrorPopupFadeInDown(error.response?.data?.message || 'Internal Server Error');
    }
});

document.addEventListener('DOMContentLoaded', async function () {
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

    // const token = sessionStorage.getItem('token');
    // const user = JSON.parse(sessionStorage.getItem('user'));
    // if (!token || !user) {
    //     window.location.href = 'login.html';
    //     return;
    // }
    // if(user.role===2){
    //     window.location.href = 'user-details.html';
    //     return;
    // }

    // document.getElementById('username').innerText = user.name;  

    await loadOrganisationOptions('port');
    initializeDataTables();
    await refreshEquipmentInvoiceTable();
});

function initializeDataTables() {
    equipmentInvoiceTable = $('#equipmentInvoiceTable').DataTable();
    equipmentInvoiceModalTable = $('#equipmentInvoiceModalTable').DataTable();
}

async function loadOrganisationOptions(selectId) {
    try {
        const organisations = await api.getAllActiveOrganisationsExceptHQ();
        const selectElement = document.getElementById(selectId);

        selectElement.innerHTML = '<option value="">Select Organisation</option>';
        organisations.forEach(organisation => {
            const option = document.createElement("option");
            option.value = organisation.org_id;
            option.textContent = organisation.organisation_name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading organisations:", error);
    }
}

function addRow(data, i) {
    if (!data) {
        console.error('No data to add');
        return;
    }

    const row = [
        i,
        data.organisation,
        data.projectNO,
        `<p class="invoice-link " data-bs-toggle="modal" data-bs-target="#invoiceModal" data-project-no="${data.projectNO}" style="color:blue !important; font-weight:600 !important; text-decoration:underline !important;">${data.count}</p>`
    ];

    equipmentInvoiceTable.row.add(row).draw(false);

    
    const rowNode = equipmentInvoiceTable.row(':last').node();
    $(rowNode).find('.invoice-link').on('click', function () {
        const projectNO = $(this).data('project-no');
        loadInvoices(projectNO);
    });
}

function invoiceRow(data) {
    if (!data) {
        console.error('No data to add');
        return;
    }
    

    const rowNode = equipmentInvoiceModalTable.row.add([
        data.invoiceNumber || 'N/A',
        data.invoiceSubject || 'N/A',
        data.invoiceAmount || 0,
        data.gst || 0,
        data.totalInvoiceAmount,
        data.invoiceSubmittedDate 
            ? data.invoiceSubmittedDate.split('T')[0] 
            : 'N/A',
        data.fundReceivedFromPort || 0
    ]).draw(false).node();
    

    rowNode.dataset.invoiceId = data.invoiceID;


}

async function refreshEquipmentInvoiceTable() {
    try {
        equipmentInvoiceTable.clear();
        const result = await api.groupEquipmentInvoiceByProjectNumber();
        result.forEach((data, i) => {
            addRow(data, i + 1);
        });

        

    } catch (error) {
        console.error("Error refreshing equipment invoice table:", error);
    }
}

async function loadInvoices(projectNO) {
    try {
        equipmentInvoiceModalTable.clear();
        const result = await api.getInvoicesByProjectNumber(projectNO);
        result.forEach((data) => {
            invoiceRow(data);
        });
        handlePermission('#username');

        


    } catch (error) {
        console.error("Error loading invoices:", error);
    }
}

function formatDateForMSSQL(date) {
    let d = new Date(date);
    return d.toISOString().slice(0, 10);
}

$('#logout-button').on('click', function () {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
});



var columnTypes = {
    0: "text",
    1: "text",
    2: "number",
    3: "number",
    4: "number",
    5: "date", 
    6: "number"
};


$('#equipmentInvoiceModalTable tbody').on('click', 'td', function () {

    let decidedPermission=handlePermission('#username');

    if(decidedPermission!==''){
        return;
    }

 
    var $cell = $(this);
    var colIndex = $cell.index();
    var currentValue = $cell.text().trim();

    var invoiceID = $cell.closest('tr').data('invoiceId');
    // console.log("Invoice ID:", invoiceID);

    if (!invoiceID) {
        console.error("Invoice ID not found");
        return;
    }

    if (colIndex === 4) return;

    if (!$cell.find('input').length) {
        var inputType = columnTypes[colIndex] || "text";
        var input = $('<input>').attr({
            type: inputType,
            class: 'form-control',
            value: currentValue
        });

        $cell.empty().append(input);
        input.focus();

        input.on('blur', function () {
            var newValue = $(this).val();
            $cell.text(newValue);
            updateSum($cell.closest('tr')); 

            var columnNames = [
                "invoiceNumber",
                "invoiceSubject",
                "invoiceAmount",
                "gst",
                "totalInvoiceAmount",
                "invoiceSubmittedDate",
                "fundReceivedFromPort"
            ];

            var columnName = columnNames[colIndex]; 
            if (!columnName) {
                console.error("Column name not found for index:", colIndex);
                return;
            }

            updateInvoice(parseInt(invoiceID), columnName, newValue);
        });

        input.on('keypress', function (e) {
            if (e.which === 13) { 
                input.blur();
            }
        });
    }
});


function updateSum(row) {
    var thirdValue = parseFloat(row.find('td:eq(2)').text()) || 0;
    var fourthValue = parseFloat(row.find('td:eq(3)').text()) || 0;
    row.find('td:eq(4)').text(thirdValue + fourthValue);
}

async function updateInvoice(id, column, value) {
    let data = { invoiceID: id };

    if (column === "invoiceAmount" || column === "gst" || column === "totalInvoiceAmount") {
        value = parseFloat(value);
    }

    if (column === "invoiceSubmittedDate" || column === "fundReceivedFromPort") {
        let dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
            value = dateObj.toISOString().split("T")[0]; 
        } else {
            console.error("Invalid date format:", value);
            return;
        }
    }

    data[column] = value; 

    try{
        const res=await api.updateEquipmentInvoice(data);
    }catch(error){
        showErrorPopupFadeInDown(error.data.message);
    }
    
    
}
