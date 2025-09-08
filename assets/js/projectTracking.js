let payments = [];
let NoOfDeliverables = 1;
let deliverablesTable;
let updateprojectButton = document.getElementById('update_project_btn');


deliverablesTable = $('#deliverablesTable').DataTable({
    "paging": true,
    "pageLength": 25,
    "lengthMenu": [5, 10, 25, 50, 100],
    dom: '<"top"l>frtip',
    buttons: ['excel', 'csv', 'pdf'],
    columnDefs: [
        {
            targets: '_all',
            className: "editable-cell"
        }
    ]
});



deliverablesTable.buttons().container().appendTo($('#deliverablesTableExportButtons'));

document.getElementById('logout-button').addEventListener('click', logout);

let updateProjectCostField = document.querySelector('#update-ProjectCost');
let updateGstField = document.querySelector('#update-GST');
let updateTotalCostField = document.querySelector('#update-TotalProjectCost');

updateProjectCostField.addEventListener('input', calculateUpdateTotalCost);
updateGstField.addEventListener('input', calculateUpdateTotalCost);

function calculateUpdateTotalCost() {
    let projectCost = updateProjectCostField.value;
    let gst = updateGstField.value;
    if (projectCost < 0) {
        updateProjectCostField.value = 0;
        projectCost = 0;
        showErrorPopupFadeInDown("Project cost cannot be negative.");
    }


    if (gst < 0) {
        updateGstField.value = 0;
        gst = 0;
        showErrorPopupFadeInDown("GST cannot be negative.");
    }

    let totalCost = Number(projectCost) + Number(gst);
    updateTotalCostField.value = totalCost;
}

document.querySelector('#update-NoOfDeliverables').addEventListener('change', function () {
    if (this.value <= 0) {
        showErrorPopupFadeInDown("Atleast one deliverable is required");
        this.value = 1;
    }
});

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location = 'login.html';
}



let table;
let decidedPermission;
document.addEventListener('DOMContentLoaded', async () => {
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    decidedPermission = handlePermission('#username');

});

function addRow(data) {




    if ($.fn.dataTable.isDataTable('#projectsTable')) {
        table = $('#projectsTable').DataTable();
    }

    if (!data) {
        console.error('no data to add');
        return;
    }


    if (data.StartDate) {
        data.StartDate = new Date(data.StartDate).toLocaleDateString('en-GB');
    } else {
        data.StartDate = '-'
    }
    if (data.EstEndDate) {
        data.EstEndDate = new Date(data.EstEndDate).toLocaleDateString('en-GB');
    } else {
        data.EstEndDate = '-'
    }
    if (data.ActualEndDate) {
        data.ActualEndDate = new Date(data.ActualEndDate).toLocaleDateString('en-GB');
    } else {
        data.ActualEndDate = '-'
    }



    let StatusRow;



    if (!data.ProjectStatus) {
        StatusRow = '-';
    } else {

        let bg;

        if (data.ProjectStatus === 'Ongoing') {
            bg = 'bg-warning';
        } else if (data.ProjectStatus === 'Completed') {
            bg = 'bg-success';
        } else if (data.ProjectStatus === 'Withdrawn') {
            bg = 'bg-danger';
        }

        StatusRow = `
                <div>
                    <p class="${bg} text-white text-center rounded mx-auto px-3 py-2 h-auto status-btn">${data.ProjectStatus}</p>
                </div>
    `;


    }


    table.row.add([
        data.index,
        data.ProjectID,
        data.ProjectName,
        data.ProjectIncharge,
        data.ClientName,
        data.StartDate,
        data.EstEndDate,
        data.ActualEndDate,
        data.ProjectCost,
        data.GST,
        data.TotalProjectCost,
        data.NoOfDeliverables,
        StatusRow,
        `
     <div class="d-flex align-items-center justify-content-center p-0 edit-btn ${decidedPermission} writeElement" 
      style="width: 40px; height: 40px; cursor:pointer">
       <i class="ti-pencil-alt text-inverse" data-id='${data.ID}' onclick="loadUpdateData(${data.ID})"  style="font-size: 20px;"></i>
    </div>

    `,
    ]).draw(false);


};


async function loadUpdateData(id) {

    if (id) {
        try {
            const project = await api.getProjectById(id);

            // console.log(project);

            document.querySelector('#update-ProjectID').value = project.ProjectID;
            document.querySelector('#update-ProjectName').value = project.ProjectName;
            document.querySelector('#update-ProjectIncharge').value = project.ProjectIncharge;
            document.querySelector('#update-ClientName').value = project.ClientName;
            document.querySelector('#update-StartDate').value = project.StartDate ? new Date(project.StartDate).toISOString().split('T')[0] : '';
            document.querySelector('#update-EstEndDate').value = project.EstEndDate ? new Date(project.EstEndDate).toISOString().split('T')[0] : '';
            document.querySelector('#update-ActualEndDate').value = project.ActualEndDate ? new Date(project.ActualEndDate).toISOString().split('T')[0] : '';
            document.querySelector('#update-ProjectCost').value = project.ProjectCost;
            document.querySelector('#update-GST').value = project.GST;
            document.querySelector('#update-TotalProjectCost').value = project.TotalProjectCost;
            document.querySelector('#update-NoOfDeliverables').value = project.NoOfDeliverables;
            document.querySelector('#update-ProjectStatus').value = project.ProjectStatus;
            document.querySelector('#update-ProjectID').dataset.id = id;


            deliverablesTable.clear().draw();

            if (project.deliverables) {
                // console.log((project.deliverables));
                project.deliverables.forEach(element => {
                    addDeliverablesRow(element);
                });
            }


        } catch (err) {
            console.log(err);
        }
        return;
    }

    console.log('No id found');

}



async function getAllProjects() {
    try {

        let clients = new Set();
        let incharges = new Set();
        let statuses = new Set();

        let projects = await api.getAllProjects();
        projects = projects.map((item, index) => ({
            ...item,
            index: index + 1
        }));

        projects.forEach(element => {
            addRow(element);

            clients.add(element.ClientName);
            incharges.add(element.ProjectIncharge);
            statuses.add(element.ProjectStatus);

        });


        clients.forEach(client => {
            if (!client) return;
            $('#clientFilter').append(`<option value="${client}">${client}</option>`);
        });

        incharges.forEach(incharge => {
            if (!incharge) return;
            $('#inchargeFilter').append(`<option value="${incharge}">${incharge}</option>`);
        });

        statuses.forEach(status => {
            if (!status) return;
            $('#statusFilter').append(`<option value="${status}">${status}</option>`);
        })
        // console.log(projects);




    } catch (err) {
        console.log(err);
    }
}


async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#projectsTable')) {
        table = $('#projectsTable').DataTable();
        table.clear();
    }

    await getAllProjects();
}



document.addEventListener('DOMContentLoaded', getAllProjects);

console.log('267');

let projectCostField = document.querySelector('#ProjectCost');
let gstField = document.querySelector('#GST');
let totalCostField = document.querySelector('#TotalProjectCost');

projectCostField.addEventListener('input', calculateTotalCost);
gstField.addEventListener('input', calculateTotalCost);

function calculateTotalCost() {
    let projectCost = projectCostField.value;
    let gst = gstField.value;
    let totalCost = Number(projectCost) + Number(gst);
    totalCostField.value = totalCost;
}


document.querySelector('#add_project_btn').addEventListener('click', function () {

    let form = document.querySelector('#new-project-form');
    let client = document.querySelector('#ClientName').dataset.selectedId;

    let formData = new FormData(form);
    formData.set('Client', client);
    let data = Object.fromEntries(formData.entries());


    if (data.EstEndDate && data.EstEndDate < data.StartDate) {
        showErrorPopupFadeInDown('Estimated End Date must be after Start Date.');
        return;
    }

    if (data.ActualEndDate && data.StartDate && data.ActualEndDate < data.StartDate) {
        showErrorPopupFadeInDown('Actual End Date must be after Start Date.');
        return;
    }

    if (data.ProjectCost != undefined) {
        data.ProjectCost = Number(data.ProjectCost);

        if (data.ProjectCost < 0) {
            showErrorPopupFadeInDown('Project Cost cannot be negative.');
            return;
        }
    }

    if (data.GST != undefined) {

        data.GST = Number(data.GST);

        if (data.GST < 0) {
            showErrorPopupFadeInDown('GST cannot be negative.');
            return;
        }
    }

    if (data.TotalProjectCost != undefined) {
        data.TotalProjectCost = Number(data.TotalProjectCost);

        if (data.TotalProjectCost < 0) {
            showErrorPopupFadeInDown('Total Project Cost cannot be negative.');
            return;
        }
    }

    if (data.Client != undefined) {
        data.Client = Number(data.Client);
    }
    if (NoOfDeliverables != undefined) {
        NoOfDeliverables = Number(NoOfDeliverables);
    }
    data.NoOfDeliverables = NoOfDeliverables;

    let requiredFields = ['ProjectID', 'ProjectName', 'ProjectIncharge', 'ClientName', 'StartDate', 'ActualEndDate', 'ProjectCost', 'GST', 'TotalProjectCost', 'NoOfDeliverables', 'ProjectStatus'];

    let fieldsMap = ['Project ID', 'Project Name', 'Project Incharge', 'Client Name', 'Start Date', 'End Date', 'Project Cost', 'GST', 'Total Project Cost', 'No of Deliverables', 'Project Status'];

    let errs = [];

    if (data || data.length > 0) {
        // console.log({data});
        requiredFields.forEach((element, index) => {
            if (requiredFields.includes(element)) {
                if (data[element] === null || data[element] === '' || data[element] === ' ' || data[element] === undefined) {
                    errs.push(fieldsMap[index]);
                }
            }

        });
    }

    if (errs.length > 0) {
        showErrorPopupFadeInDown(`Please enter  ${errs[0]}`);
        errs = [];
        return;
    }


    data.deliverables = [];

    let isValid = true;
    let deliverables = [];

    document.querySelectorAll(".deliverable-item").forEach(deliverable => {
        const name = deliverable.querySelector(".deliverable-name").value.trim();
        const date = deliverable.querySelector(".deliverable-date").value.trim();
        const remarks = deliverable.querySelector(".deliverable-remarks").value.trim();
        const cost = deliverable.querySelector(".deliverable-cost").value;


        if (name === "" || date === "" || cost === "" || cost === null || cost === undefined) {
            showErrorPopupFadeInDown("Please fill in all the deliverables data.");
            isValid = false;
            return;
        }


        if (isNaN(cost) || Number(cost) < 0) {
            showErrorPopupFadeInDown("Deliverable cost cannot be negative.");
            deliverable.querySelector(".deliverable-cost").value = "0";
            isValid = false;
            return;
        }


        deliverables.push({
            name,
            estimatedDeliveryDate: date,
            remarks,
            totalCost: parseFloat(cost),
        });
    });

    if (payments.length === 0) {
        showErrorPopupFadeInDown("Please add at least one payment.");
        return;
    }

    if (!isValid) return;

    let apiFormData = new FormData();
    apiFormData.set('data', JSON.stringify(data));
    apiFormData.set('deliverables', JSON.stringify(deliverables));
    apiFormData.set('payments', JSON.stringify(payments));


    data.deliverables = deliverables;
    data.payments = payments;
    formData.set('deliverables', JSON.stringify(deliverables));
    formData.set('payments', JSON.stringify(payments));

    payments.forEach((payment, index) => {
        apiFormData.set(`payment_invoice_${index}`, payment.invoice);
    });

    console.log(Object.fromEntries(apiFormData.entries()));


    axiosInstance.post('/projects', apiFormData).then(async res => {
        if (res.data.message) {
            showPopupFadeInDown(res.data.message);
            await refreshTable();
            form.reset();
            window.location.reload();
        } else {
            showErrorPopupFadeInDown("No response from the server");
        }
    }).catch(err => {
        console.log(err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add new project. Please try again later.');
    });


});

document.querySelector('#update_project_btn').addEventListener('click', function () {

    let form = document.querySelector('#update-project-form');
    let client = document.querySelector('#update-ClientName').dataset.selectedId;

    let id = document.querySelector('#update-ProjectID').dataset.id;


    let formData = new FormData(form);
    formData.set('Client', client);
    let data = Object.fromEntries(formData.entries());


    if (data.EstEndDate && data.EstEndDate < data.StartDate) {
        showErrorPopupFadeInDown('Estimated End Date must be after Start Date.');
        return;
    }

    if (data.ActualEndDate && data.StartDate && data.ActualEndDate < data.StartDate) {
        showErrorPopupFadeInDown('Actual End Date must be after Start Date.');
        return;
    }

    if (data.ProjectCost != undefined) {
        data.ProjectCost = Number(data.ProjectCost);

        if (data.ProjectCost < 0) {
            showErrorPopupFadeInDown('Project Cost cannot be negative.');
            return;
        }
    }

    if (data.GST != undefined) {

        data.GST = Number(data.GST);

        if (data.GST < 0) {
            showErrorPopupFadeInDown('GST cannot be negative.');
            return;
        }
    }

    if (data.TotalProjectCost != undefined) {
        data.TotalProjectCost = Number(data.TotalProjectCost);

        if (data.TotalProjectCost < 0) {
            showErrorPopupFadeInDown('Total Project Cost cannot be negative.');
            return;
        }
    }

    if (data.Client != undefined) {
        data.Client = Number(data.Client);
    }
    if (NoOfDeliverables != undefined) {
        NoOfDeliverables = Number(NoOfDeliverables);
    }
    data.NoOfDeliverables = NoOfDeliverables;
    data.ID = id;

    let requiredFields = ['ProjectID', 'ProjectName', 'ProjectIncharge', 'ClientName', 'StartDate', 'ActualEndDate', 'ProjectCost', 'GST', 'TotalProjectCost', 'NoOfDeliverables', 'ProjectStatus'];

    let fieldsMap = ['Project ID', 'Project Name', 'Project Incharge', 'Client Name', 'Start Date', 'End Date', 'Project Cost', 'GST', 'Total Project Cost', 'No of Deliverables', 'Project Status'];

    let errs = [];

    if (data || data.length > 0) {
        // console.log({data});
        requiredFields.forEach((element, index) => {
            if (requiredFields.includes(element)) {
                if (data[element] === null || data[element] === '' || data[element] === ' ' || data[element] === undefined) {
                    errs.push(fieldsMap[index]);
                }
            }

        });
    }

    if (errs.length > 0) {
        showErrorPopupFadeInDown(`Please enter  ${errs[0]}`);
        errs = [];
        return;
    }




    console.log({ data });


    axiosInstance.put('/projects', data).then(async res => {
        if (res.data.message) {
            console.log(res.data.message);
            showPopupFadeInDown(res.data.message);
        } else {
            showErrorPopupFadeInDown("No response from the server");
        }
    }).catch(err => {
        console.log(err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add new project. Please try again later.');
    });


});



document.querySelector("#deliverablesIncrementBtn").addEventListener("click", () => {

    NoOfDeliverables++;
    document.getElementById("deliverablesCountInput").value = NoOfDeliverables;

    const container = document.querySelector("#deliverablesDynamicContainer");
    const existingCount = container.children.length;


    addDeliverableFields("deliverablesDynamicContainer", NoOfDeliverables - existingCount);


});

var columnTypes = {
    0: "text",
    1: "date",
    2: "number",
    3: "text",
};






$('#deliverablesTable').on('click', '.edit-row', function () {
    enableEditMode($(this).closest('tr'));
});

$('#deliverablesTable').on('click', '.cancel-row', function () {
    const $row = $(this).closest('tr');
    if ($row.hasClass('new-deliverable')) {
        deliverablesTable.row($row).remove().draw();
    } else {
        cancelEditMode($row);
    }
});

$('#deliverablesTable').on('click', '.save-row', function () {
    saveDeliverableRow($(this).closest('tr'));
});


$('#addRowBtn').click(function () {
    addDeliverablesRow(null, true);
});



function enableEditMode($row) {
    originalRowData[$row.index()] = {
        name: $row.find('td:eq(0)').text(),
        date: $row.find('td:eq(1)').text(),
        cost: $row.find('td:eq(2)').text(),
        remarks: $row.find('td:eq(3) span').text(),
        id: $row.data('id')
    };

    $row.find('td:eq(0)').html(`<input type="text" class="form-control" value="${originalRowData[$row.index()].name}">`);
    $row.find('td:eq(1)').html(`<input type="date" class="form-control" value="${originalRowData[$row.index()].date}">`);
    $row.find('td:eq(2)').html(`<input type="number" class="form-control" value="${originalRowData[$row.index()].cost}" min="0" step="0.01">`);
    $row.find('td:eq(3)').html(`
        <div class="d-flex align-items-center">
            <input type="text" class="form-control" value="${originalRowData[$row.index()].remarks}" style="flex:1">
            <button class="btn btn-success btn-sm save-row ml-2">Save</button>
            <button class="btn btn-danger btn-sm cancel-row ml-1">Cancel</button>
        </div>
    `);
}


function cancelEditMode($row) {
    const rowIndex = $row.index();
    if (originalRowData[rowIndex]) {

        const rowContent = [
            originalRowData[rowIndex].name,
            originalRowData[rowIndex].date,
            originalRowData[rowIndex].cost,
            '<div class="d-flex align-items-center">' +
            '<span style="flex:1">' + (originalRowData[rowIndex].remarks || '-') + '</span>' +
            '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
            '</div>'
        ];

        deliverablesTable.row($row).data(rowContent).draw();

        if (originalRowData[rowIndex].id) {
            $row.attr('data-id', originalRowData[rowIndex].id);
        }

        delete originalRowData[rowIndex];
    }
}

function cancelEditModeForUpdate($row) {
    const rowIndex = $row.index();


    const name = $row.find('td:eq(0) input').val() || $row.find('td:eq(0)').text();
    const date = $row.find('td:eq(1) input').val() || $row.find('td:eq(1)').text();
    const cost = $row.find('td:eq(2) input').val() || $row.find('td:eq(2)').text();
    const remarks = $row.find('td:eq(3) input').val() || $row.find('td:eq(3) span').text();

    const currentRowContent = [
        name,
        date,
        cost,
        '<div class="d-flex align-items-center">' +
        '<span style="flex:1">' + (remarks || '-') + '</span>' +
        '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
        '</div>'
    ];

    deliverablesTable.row($row).data(currentRowContent).draw();
}


async function saveDeliverableRow($row) {
    const inputs = {
        name: $row.find('td:eq(0) input').val(),
        date: $row.find('td:eq(1) input').val(),
        cost: $row.find('td:eq(2) input').val(),
        remarks: $row.find('td:eq(3) input').val()
    };


    if (!inputs.name || !inputs.cost) {
        alert('Name and Cost are required!');
        return;
    }


    const saveData = {
        DeliverableName: inputs.name,
        EstDeliveryDate: inputs.date,
        TotalCost: parseFloat(inputs.cost),
        Remarks: inputs.remarks
    };

    const isNew = $row.hasClass('new-deliverable');
    const rowId = $row.data('id');

    if (isNew) {
        saveData.ProjectID = $('#update-ProjectID').val();
        axiosInstance.post('/deliverables', saveData)
            .then(async response => {
                console.log(response);
                const rowContent = [
                    saveData.DeliverableName,
                    saveData.EstDeliveryDate,
                    saveData.TotalCost,
                    '<div class="d-flex align-items-center">' +
                    '<span style="flex:1">' + (saveData.Remarks || '-') + '</span>' +
                    '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
                    '</div>'
                ];

                deliverablesTable.row($row).data(rowContent).draw();
                $row.removeClass('new-deliverable');
                $row.attr('data-id', response.data.id);
            })
            .catch(err => {
                console.log(err);
                showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add deliverable. Please try again later.');
            })
    } else {

        saveData.ID = rowId;
        await api.updateProjectDeliverable(saveData);
        cancelEditModeForUpdate($row);
    }
}



function refreshRowAfterSave($row, data) {
    const rowContent = [
        data.DeliverableName,
        data.EstDeliveryDate ? data.EstDeliveryDate.split('T')[0] : 'N/A',
        data.TotalCost || '0',
        '<div class="d-flex align-items-center">' +
        '<span style="flex:1">' + (data.Remarks || '-') + '</span>' +
        '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
        '</div>'
    ];

    deliverablesTable.row($row).data(rowContent).draw();
}

function deleteDeliverableRow($row) {
    if (!confirm('Are you sure you want to delete this deliverable?')) return;

    const id = $row.data('id');
    if (id) {
        axios.delete('/deliverables/' + id)
            .then(() => {
                deliverablesTable.row($row).remove().draw();
            })
            .catch(error => {
                alert('Failed to delete deliverable');
            });
    } else {
        deliverablesTable.row($row).remove().draw();
    }
}

let originalRowData = {};

function addDeliverablesRow(data, isNew = false) {
    if (!data && !isNew) return;

    let rowContent;
    if (isNew) {
        rowContent = [
            '<input type="text" class="form-control deliverable-name" placeholder="Name" required>',
            '<input type="date" class="form-control deliverable-date">',
            '<input type="number" class="form-control deliverable-cost" placeholder="Cost" min="0" step="0.01" required>',
            '<div class="d-flex align-items-center">' +
            '<input type="text" class="form-control deliverable-remarks" placeholder="Remarks" style="flex:1">' +
            '<button class="btn btn-success btn-sm save-row ml-2">Save</button>' +
            '<button class="btn btn-danger btn-sm cancel-row ml-1">Cancel</button>' +
            '</div>'
        ];
    } else {
        rowContent = [
            data.DeliverableName || 'N/A',
            data.EstDeliveryDate ? data.EstDeliveryDate.split('T')[0] : 'N/A',
            data.TotalCost || '0',
            '<div class="d-flex align-items-center">' +
            '<span style="flex:1">' + (data.Remarks || '-') + '</span>' +
            '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
            '</div>'
        ];
    }

    let rowNode = deliverablesTable.row.add(rowContent).draw(false).node();

    if (isNew) {
        $(rowNode).addClass('new-deliverable');
    } else if (data.ID) {
        $(rowNode).attr('data-id', data.ID);
    }
}


async function updateDeliverableRow($row) {


    const data = {
        ID: $row.data('id'),
        DeliverableName: $row.find('td:eq(0) input').val().trim(),
        EstDeliveryDate: $row.find('td:eq(1)').text().trim(),
        TotalCost: parseFloat($row.find('td:eq(2)').text().trim()),
        Remarks: $row.find('td:eq(3)').text().trim()
    };

    try {
        await api.updateProjectDeliverable(data);
    } catch (err) {
        console.error("Update failed:", err);
    }
}



function refreshRowAfterSave($row, data) {
    const rowContent = [
        data.DeliverableName,
        data.EstDeliveryDate ? data.EstDeliveryDate.split('T')[0] : 'N/A',
        data.TotalCost || '0',
        data.Remarks || '-',
        `<button class="btn btn-sm btn-primary edit-row">Edit</button>
         <button class="btn btn-sm btn-danger delete-row ml-1">Delete</button>`
    ];

    deliverablesTable.row($row).data(rowContent).draw();
}

async function deleteDeliverableRow($row) {
    if (!confirm('Are you sure you want to delete this deliverable?')) return;

    try {
        await api.deleteProjectDeliverable($row.data('id'));
        deliverablesTable.row($row).remove().draw();
    } catch (error) {
        console.error("Error deleting deliverable:", error);
        showErrorPopupFadeInDown('Failed to delete deliverable');
    }
}


// async function refreshTable() {
//    deliverablesTable.clear();

//     await getAllCourses();
// }




document.addEventListener('DOMContentLoaded', async () => {
    console.log('834');


});


function calculateTotalPaymentCost() {
    let projectCost = document.querySelector('#costExcGST').value;
    let gst = document.querySelector('#-GST').value;


    let totalCost = Number(projectCost) + Number(gst);
    document.querySelector('#-totalCost').value = totalCost;
}

document.querySelector('#costExcGST').addEventListener('input', calculateTotalPaymentCost);
document.querySelector('#-GST').addEventListener('input', calculateTotalPaymentCost);





let paymentTerms = document.querySelector('#paymentTerms');
let costExcGST = document.querySelector('#costExcGST');
let GST = document.querySelector('#-GST');
let totalCost = document.querySelector('#-totalCost');
let paymentDate = document.querySelector('#paymentDate');
let invoice = document.querySelector('#invoice');
let addPRBtn = document.querySelector('#addPRBtn');
let paymentReceived = document.querySelector('#paymentReceived');
let paymentsTable = document.querySelector('#paymentsTable');


function addPaymentsRow() {

    const invoiceFile = invoice.files[0];

    let paymentTermValue = paymentTerms.value;
    let costExcGSTValue = costExcGST.value;
    let GSTValue = GST.value;
    let totalCostValue = totalCost.value;
    let paymentDateValue = paymentDate.value;
    let paymentReceivedValue = paymentReceived.value;
    // let invoiceFileValue=invoice.value;

    if (!invoiceFile) {
        showErrorPopupFadeInDown("Please Select invoice file");
        return;
    }

    if (!paymentTermValue) {
        showErrorPopupFadeInDown("Please Enter Payment Term");
        return;
    }

    if (!paymentDateValue) {
        showErrorPopupFadeInDown("Please Enter Payment Date");
        return;
    }






    payments.push({
        paymentTerm: paymentTermValue,
        costExcGST: costExcGSTValue,
        GST: GSTValue,
        totalCost: totalCostValue,
        paymentDate: paymentDateValue,
        paymentReceived: paymentReceivedValue,
        invoice: invoiceFile
    });

    renderPaymentsTable();

    paymentTerms.value = "";
    costExcGST.value = "0";
    GST.value = "0";
    totalCost.value = "0";
    paymentReceived.value = "0";
    paymentDate.value = "";
    invoice.value = "";
}

function renderPaymentsTable() {
    paymentsTable.querySelector('tbody').innerHTML = payments.map((payment, index) => {
        const fileURL = payment.invoice ? URL.createObjectURL(payment.invoice) : "#";
        const fileName = payment.invoice ? payment.invoice.name : "No File";

        return `
            <tr>
                <td>${payment.paymentTerm}</td>
                <td>${payment.costExcGST}</td>
                <td>${payment.GST}</td>
                <td>${payment.totalCost}</td>
                <td>${payment.paymentReceived}</td>
                <td>${payment.paymentDate}</td>
                <td><a href="${fileURL}" download="${fileName}">${fileName}</a></td>
                <td><button class="btn btn-danger btn-sm" onclick="deletePaymentRow(${index})">Delete</button></td>
            </tr>
        `;
    }).join('');
}

function deletePaymentRow(index) {
    payments.splice(index, 1);
    renderPaymentsTable();
}


document.getElementById('addPRBtn').addEventListener('click', addPaymentsRow);



window.NoOfDeliverables = NoOfDeliverables;