// let payments = [];
let NoOfDeliverables = 1;
let NoOfPayments = 1;
let paymentTable;
let deliverablesData;
let paymentsData;
let deliverablesTable;
let updateprojectButton = document.getElementById("update_project_btn");

deliverablesTable = $("#deliverablesTable").DataTable({
  paging: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    // dom: 'Bfrtip',
    buttons: [
      {
        extend: 'excel',
        text: `<span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel`,
        className: 'btn-excel'
      },
      {
        extend: 'pdf',
        text: ` <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF`,
        className: 'btn-pdf'
      },
      {
        extend: 'colvis',
       text: `<span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns`,
        className: 'btn-colvis'
      }
    ],
    language: {
      search: "",
      searchPlaceholder: "Type to search...",
    paginate: { first: "«", last: "»", next: "›", previous: "‹" }

    },
    initComplete: function () {
      // Remove default "Search:" text
      $('#deliverablesTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#deliverablesTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Move export buttons into custom div
  deliverablesTable.buttons().container().appendTo($('#deliverablesTableExportButtons'));

  
paymentTable = $("#paymentTable").DataTable({
  paging: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    // dom: 'Bfrtip',
    buttons: [
      {
        extend: 'excel',
        text: `<span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel`,
        
        className: 'btn-excel'
      },
        
      {
        extend: 'pdf',
        text: ` <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF`,
        className: 'btn-pdf'
      },
      {
        extend: 'colvis',
        text: `<span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns`,
        className: 'btn-colvis'
      }
    ],
    language: {
      search: "",
      searchPlaceholder: "Type to search...",
    paginate: { first: "«", last: "»", next: "›", previous: "‹" }

    },
    initComplete: function () {
      // Remove default "Search:" text
      $('#paymentTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#paymentTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Move export buttons into custom div
  // deliverablesTable.buttons().container().appendTo($('#deliverablesTableExportButtons'));
  paymentTable.buttons().container().appendTo($('#paymentTableExportButtons'));

let updateProjectCostField = document.querySelector("#update-ProjectCost");
let updateGstField = document.querySelector("#update-GST");
let updateTotalCostField = document.querySelector("#update-TotalProjectCost");

updateProjectCostField.addEventListener("input", calculateUpdateTotalCost);
updateGstField.addEventListener("input", calculateUpdateTotalCost);

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

document
  .querySelector("#update-NoOfDeliverables")
  .addEventListener("change", function () {
    if (this.value <= 0) {
      showErrorPopupFadeInDown("Atleast one deliverable is required");
      this.value = 1;
    }
  });
document
  .querySelector("#update-NoOfPayments")
  .addEventListener("change", function () {
    if (this.value <= 0) {
      showErrorPopupFadeInDown("Atleast one payment is required");
      this.value = 1;
    }
  });

let table;
let decidedPermission;
document.addEventListener("DOMContentLoaded", async () => {
  roles = await axiosInstance.get("/roles/role/perms");
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
  decidedPermission = handlePermission("#username");
});


if (decidedPermission !== "") {
  decidedPermission = "editElement";
}
function addRow(data) {
  if ($.fn.dataTable.isDataTable("#projectsTable")) {
    table = $("#projectsTable").DataTable();
  }

  if (!data) {
    console.error("no data to add");
    return;
  }

  if (data.EstStartDate) {
    data.EstStartDate = new Date(data.EstStartDate).toLocaleDateString("en-GB");
  } else {
    data.EstStartDate = "-";
  }
  if (data.EstEndDate) {
    data.EstEndDate = new Date(data.EstEndDate).toLocaleDateString("en-GB");
  } else {
    data.EstEndDate = "-";
  }
  if(data.ActualStartDate) {
    data.ActualStartDate = new Date(data.ActualStartDate).toLocaleDateString("en-GB");
  } else {
    data.ActualStartDate = "-";
  }
  if (data.ActualEndDate) {
    data.ActualEndDate = new Date(data.ActualEndDate).toLocaleDateString(
      "en-GB"
    );
  } else {
    data.ActualEndDate = "-";
  }

  let StatusRow;

  if (!data.ProjectStatus) {
    StatusRow = "-";
  } else {
    let bg;
if (data.ProjectStatus === "Ongoing") {
  bg = "bg-warning text-dark";
  icon = '<i class="fa-solid fa-spinner spin-icon me-2"></i>';
} else if (data.ProjectStatus === "Completed") {
  bg = "bg-success text-white";
  icon = '<i class="fa-solid fa-circle-check complete-icon me-2"></i>';
} else if (data.ProjectStatus === "Withdrawn") {
  bg = "bg-danger text-white";
  icon = '<i class="fa-solid fa-circle-xmark flip-icon me-2"></i>';
} else {
  bg = "bg-secondary text-white";
  icon = '<i class="fa-solid fa-question-circle me-2"></i>';
}

StatusRow = `
  <div class="text-center">
    <span class="status-badge ${bg}">
      ${icon}<span class="status-text">${data.ProjectStatus}</span>
    </span>
  </div>
`;


  }

  table.row
    .add([
      data.index,
      data.ProjectID,
      data.ProjectName,
      data.ProjectIncharge,
      data.ClientName,
      data.EstStartDate,
      data.EstEndDate,
      data.ActualEndDate,
      data.ProjectCost,
      data.GST,
      data.TotalProjectCost,
      data.NoOfDeliverables,
      StatusRow,
      `
     <div class="d-flex align-items-center justify-content-center p-0 edit-btn ${decidedPermission} writeElement" 
      style="width: 40px; height: 40px; cursor:pointer" data-id='${data.ID}' onclick="loadUpdateData(${data.ID})">
       <i class="fa-solid fa-pen-to-square" style="font-size: 20px;"></i>
    </div>
    `,
    ])
    .draw(false);
}
$(document).ready(function () {
  console.log("enter");
  // Load all staff and populate dropdown
  api
    .getProjectIncharge()
    // api.getstaffid()
    // api.getReportingid()
    .then((staffList) => {
      staffList.forEach((staff) => {
        $(".userName").append(
          $("<option>", {
            value: `${staff.id} - ${staff.name}`,
            text: `${staff.id}-${staff.name} `,
          })
        );
      });

      // Initialize Select2 after options are added
      $(".userName").select2({
        placeholder: "Select Reporting Manager",
        allowClear: true,
      });
    })
    .catch((error) => {
      console.log("error");
      console.error("Error loading staff:", error);
    });
});

let originalId;

async function loadUpdateData(id) {
  originalId=id;
  console.log("enter load")
  if (id) {
    try {
      const project = await api.getProjectById(id);

      // console.log(project);

      document.querySelector("#update-ProjectID").value = project.ProjectID;
      document.querySelector("#update-ProjectName").value = project.ProjectName;
      // document.querySelector("#update-ProjectIncharge").value =project.ProjectIncharge;
      $("#update-ProjectIncharge")
  .val(project.ProjectIncharge)
  .trigger("change");

   
    console.log("project.ClientName",  $("#update-ClientName"));
$("#update-ClientName").val(project.ClientID).trigger("change");


// input.dispatchEvent(new Event("change"));

      document.querySelector("#update-EstStartDate").value = project.EstStartDate
        ? new Date(project.EstStartDate).toISOString().split("T")[0]
        : "";
      document.querySelector("#update-EstEndDate").value = project.EstEndDate
        ? new Date(project.EstEndDate).toISOString().split("T")[0]
        : "";
      document.querySelector("#update-ActualStartDate").value = project.ActualStartDate
        ? new Date(project.ActualStartDate).toISOString().split("T")[0]
        : "";
      document.querySelector("#update-ActualEndDate").value =
        project.ActualEndDate
          ? new Date(project.ActualEndDate).toISOString().split("T")[0]
          : "";
      document.querySelector("#update-ProjectCost").value = project.ProjectCost;
      document.querySelector("#update-GST").value = project.GST;
      document.querySelector("#update-TotalProjectCost").value =
        project.TotalProjectCost;
      deliverablesData =Number(project.NoOfDeliverables);
      document.querySelector("#update-NoOfDeliverables").value =deliverablesData;
       
        paymentsData =Number(project.NoOfPayments);
      document.querySelector("#update-NoOfPayments").value = paymentsData;
      // document.querySelector("#update-ProjectStatus").value =
      //   project.ProjectStatus;
      document.querySelector("#update-ProjectID").dataset.id = id;

      deliverablesTable.clear().draw();

      if (project.deliverables) {
        // console.log((project.deliverables));
        project.deliverables.forEach((element) => {
          addDeliverablesRow(element);
        });
      }
        if (project.Payments) {
        // console.log((project.deliverables));
        project.Payments.forEach((element) => {
          addPaymentsRow(element);
        });
      }
    } catch (err) {
      console.log(err);
    }
    return;
  }

  console.log("No id found");
}


async function loadUpdateData1(id) {
  console.log("enter load")
  if (id) {
    try {
      const project = await api.getProjectById(id);

      deliverablesTable.clear().draw();

      if (project.deliverables) {
        // console.log((project.deliverables));
        project.deliverables.forEach((element) => {
          addDeliverablesRow(element);
        });
      }
      paymentTable.clear().draw();
        if (project.Payments) {
        // console.log((project.deliverables));
        project.Payments.forEach((element) => {
          addPaymentsRow(element);
        });
      }
    } catch (err) {
      console.log(err);
    }
    return;
  }

  console.log("No id found");
}



async function getAllProjects() {
  try {
    let clients = new Set();
    let incharges = new Set();
    let statuses = new Set();

    let projects = await api.getAllProjects();
    projects = projects.map((item, index) => ({
      ...item,
      index: index + 1,
    }));

    projects.forEach((element) => {
      addRow(element);

      clients.add(element.ClientName);
      incharges.add(element.ProjectIncharge);
      statuses.add(element.ProjectStatus);
    });

    clients.forEach((client) => {
      if (!client) return;
      $("#clientFilter").append(`<option value="${client}">${client}</option>`);
    });

    incharges.forEach((incharge) => {
      if (!incharge) return;
      $("#inchargeFilter").append(
        `<option value="${incharge}">${incharge}</option>`
      );
    });

    statuses.forEach((status) => {
      if (!status) return;
      $("#statusFilter").append(`<option value="${status}">${status}</option>`);
    });
    // console.log(projects);
  } catch (err) {
    console.log(err);
  }
}

async function refreshTable() {
  if ($.fn.dataTable.isDataTable("#projectsTable")) {
    table = $("#projectsTable").DataTable();
    table.clear();
  }

  await getAllProjects();
}

document.addEventListener("DOMContentLoaded", getAllProjects);

console.log("267");

let projectCostField = document.querySelector("#ProjectCost");
let gstField = document.querySelector("#GST");
let totalCostField = document.querySelector("#TotalProjectCost");

projectCostField.addEventListener("input", calculateTotalCost);
gstField.addEventListener("input", calculateTotalCost);

function calculateTotalCost() {
  let projectCost = projectCostField.value;
  let gst = gstField.value;
  let totalCost = Number(projectCost) + Number(gst);
  totalCostField.value = totalCost;
}

document
  .querySelector("#add_project_btn")
  .addEventListener("click", function () {
    let form = document.querySelector("#new-project-form");
let client = document.getElementById("ClientName").value;
console.log("client", client);

    let formData = new FormData(form);
    formData.set("Client", client);
    let data = Object.fromEntries(formData.entries());

    if (data.EstEndDate && data.EstEndDate < data.EstStartDate) {
      showErrorPopupFadeInDown("Estimated End Date must be after Estimated Start Date.");
      return;
    }
        if (data.ActualEndDate && data.ActualEndDate < data.ActualStartDate) {
      showErrorPopupFadeInDown("Actual End Date must be after Actual Start Date.");
      return;
    }

    // if (
    //   data.ActualEndDate &&
    //   data.EstStartDate &&
    //   data.ActualEndDate < data.EstStartDate
    // ) {
    //   showErrorPopupFadeInDown("Actual End Date must be after Start Date.");
    //   return;
    // }


    if (data.ProjectCost != undefined) {
      data.ProjectCost = Number(data.ProjectCost);

      if (data.ProjectCost < 0) {
        showErrorPopupFadeInDown("Project Cost cannot be negative.");
        return;
      }
    }

    if (data.GST != undefined) {
      data.GST = Number(data.GST);

      if (data.GST < 0) {
        showErrorPopupFadeInDown("GST cannot be negative.");
        return;
      }
    }

    if (data.TotalProjectCost != undefined) {
      data.TotalProjectCost = Number(data.TotalProjectCost);

      if (data.TotalProjectCost < 0) {
        showErrorPopupFadeInDown("Total Project Cost cannot be negative.");
        return;
      }
    }

    if (data.Client != undefined) {
      data.Client = Number(data.Client);
    }
            console.log(data.Client);

    if (NoOfDeliverables != undefined) {
      NoOfDeliverables = Number(NoOfDeliverables);
    }
    data.NoOfDeliverables = NoOfDeliverables;

        if (NoOfPayments != undefined) {
      NoOfPayments = Number(NoOfPayments);
    }
    data.NoOfPayments = NoOfPayments;

    let requiredFields = [
      "ProjectID",
      "ProjectName",
      "ProjectIncharge",
      "ClientName",
      "EstStartDate",
      "ActualEndDate",
      "ProjectCost",
      "GST",
      "TotalProjectCost",
      "NoOfDeliverables",
      "NoOfPayments",
      "ProjectStatus",
    ];

    let fieldsMap = [
      "Project ID",
      "Project Name",
      "Project Incharge",
      "Client Name",
      "Start Date",
      "End Date",
      "Project Cost",
      "GST",
      "Total Project Cost",
      "No of Deliverables",
      "No of Payments",
      "Project Status",
    ];

    let errs = [];

    if (data || data.length > 0) {
      // console.log({data});
      requiredFields.forEach((element, index) => {
        if (requiredFields.includes(element)) {
          if (
            data[element] === null ||
            data[element] === "" ||
            data[element] === " " ||
            data[element] === undefined
          ) {
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

    document.querySelectorAll(".deliverable-item").forEach((deliverable) => {
      const name = deliverable.querySelector(".deliverable-name").value.trim();
      const date = deliverable.querySelector(".deliverable-date").value.trim();
      const remarks = deliverable
        .querySelector(".deliverable-remarks")
        .value.trim();
      const cost = deliverable.querySelector(".deliverable-cost").value;

      if (
        name === "" ||
        date === "" ||
        cost === "" ||
        cost === null ||
        cost === undefined
      ) {
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

    data.payments = [];

    let isValidPayment = true;
    let payments = [];

    document.querySelectorAll(".payment-item").forEach((payment) => {
      const description = payment.querySelector(".payment-description").value.trim();
      const amount = payment.querySelector(".payment-amount").value.trim();
      const PaymentStatus = payment.querySelector(".payment-status").value;

      if (
        description === "" ||
        amount === "" ||
        PaymentStatus === null
      ) {
        showErrorPopupFadeInDown("Please fill in all the Payments data.");
        isValidPayment = false;
        return;
      }

      if (isNaN(amount) || Number(amount) < 0) {
        showErrorPopupFadeInDown("Payment amount cannot be negative.");
        payment.querySelector(".payment-amount").value = "0";
        isValidPayment = false;
        return;
      }

      payments.push({
        description,
        PaymentAmount: parseFloat(amount),
        PaymentStatus,
      });
    });

    if (!isValidPayment) return;

    if (!isValid) return;

    let apiFormData = new FormData();
    apiFormData.set("data", JSON.stringify(data));
    apiFormData.set("deliverables", JSON.stringify(deliverables));
    apiFormData.set("payments", JSON.stringify(payments));

    data.deliverables = deliverables;
    data.payments = payments;
    formData.set("deliverables", JSON.stringify(deliverables));
    formData.set("payments", JSON.stringify(payments));

    // payments.forEach((payment, index) => {
    //   apiFormData.set(`payment_invoice_${index}`, payment.invoice);
    // });

    console.log(Object.fromEntries(apiFormData.entries()));

    axiosInstance
      .post("/projects", apiFormData)
      .then(async (res) => {
        if (res.data.message) {
          showPopupFadeInDown(res.data.message);
          await refreshTable();
          form.reset();
          window.location.reload();
        } else {
          showErrorPopupFadeInDown("No response from the server");
        }
      })
      .catch((err) => {
        console.log(err);
        showErrorPopupFadeInDown(
          err.response?.data?.message ||
            "Failed to add new project. Please try again later."
        );
      });
  });

document
  .querySelector("#update_project_btn")
  .addEventListener("click", function () {
    let form = document.querySelector("#update-project-form");
    let client =
      document.querySelector("#update-ClientName").value;

    let id = document.querySelector("#update-ProjectID").dataset.id;

    let formData = new FormData(form);
    formData.set("Client", client);
    let data = Object.fromEntries(formData.entries());

    if (data.EstEndDate && data.EstEndDate < data.EstStartDate) {
      showErrorPopupFadeInDown("Estimated End Date must be after Start Date.");
      return;
    }

    // if (
    //   data.ActualEndDate &&
    //   data.EstStartDate &&
    //   data.ActualEndDate < data.EstStartDate
    // ) {
    //   showErrorPopupFadeInDown("Actual End Date must be after Start Date.");
    //   return;
    // }

    if (data.ProjectCost != undefined) {
      data.ProjectCost = Number(data.ProjectCost);

      if (data.ProjectCost < 0) {
        showErrorPopupFadeInDown("Project Cost cannot be negative.");
        return;
      }
    }

    if (data.GST != undefined) {
      data.GST = Number(data.GST);

      if (data.GST < 0) {
        showErrorPopupFadeInDown("GST cannot be negative.");
        return;
      }
    }

    if (data.TotalProjectCost != undefined) {
      data.TotalProjectCost = Number(data.TotalProjectCost);

      if (data.TotalProjectCost < 0) {
        showErrorPopupFadeInDown("Total Project Cost cannot be negative.");
        return;
      }
    }

    if (data.Clients != undefined) {
      data.Client = Number(data.Clients);
    }

    if (NoOfDeliverables != undefined) {
      NoOfDeliverables = Number(NoOfDeliverables);
    }
    data.NoOfDeliverables = NoOfDeliverables;
    data.ID = id;

    let requiredFields = [
      "ProjectID",
      "ProjectName",
      "ProjectIncharge",
      "ClientName",
      "EstStartDate",
      "ActualStartDate",
      "ActualEndDate",
      "ProjectCost",
      "GST",
      "TotalProjectCost",
      "NoOfDeliverables",
      "ProjectStatus",
    ];

    let fieldsMap = [
      "Project ID",
      "Project Name",
      "Project Incharge",
      "Client Name",
      "Start Date",
      "End Date",
      "Project Cost",
      "GST",
      "Total Project Cost",
      "No of Deliverables",
      "Project Status",
    ];

    let errs = [];

    if (data || data.length > 0) {
      // console.log({data});
      requiredFields.forEach((element, index) => {
        if (requiredFields.includes(element)) {
          if (
            data[element] === null ||
            data[element] === "" ||
            data[element] === " " ||
            data[element] === undefined
          ) {
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

    axiosInstance
      .put("/projects", data)
      .then(async (res) => {
        if (res.data.message) {
          console.log(res.data.message);
          showPopupFadeInDown(res.data.message);
        } else {
          showErrorPopupFadeInDown("No response from the server");
        }
      })
      .catch((err) => {
        console.log(err);
        showErrorPopupFadeInDown(
          err.response?.data?.message ||
            "Failed to add new project. Please try again later."
        );
      });
  });

document.querySelector("#deliverablesIncrementBtn").addEventListener("click", () => {
    NoOfDeliverables++;
    document.getElementById("deliverablesCountInput").value = NoOfDeliverables;

  // Get table body instead of full container
  const tbody = document.querySelector("#deliverablesDynamicContainer tbody");
  const existingCount = tbody.children.length;

  // Add missing rows if needed
    addDeliverableFields("deliverablesDynamicContainer", NoOfDeliverables - existingCount);
});
document.querySelector("#paymentIncrementBtn").addEventListener("click", () => {
    NoOfPayments++;
    document.getElementById("paymentCountInput").value = NoOfPayments;

  // Get table body instead of full container
  const tbody = document.querySelector("#paymentDynamicContainer tbody");
  const existingCount = tbody.children.length;

  // Add missing rows if needed
    addPaymentFields("paymentDynamicContainer", NoOfPayments - existingCount);
});

var columnTypes = {
  0: "text",
  1: "date",
  2: "number",
  3: "text",
};
var columnPaymentTypes = {
  0: "text",
  1: "number",
  2: "text",
};
let originalPaymentRowData = {};


$("#paymentTable").on("click", ".edit-row1", function () {
  enableEditPaymentMode($(this).closest("tr"));
});

$("#paymentTable").on("click", ".cancel-row1", function () {
  const $row = $(this).closest("tr");
  if ($row.hasClass("new-payment")) {
    paymentTable.row($row).remove().draw();
  } else {
    cancelEditPaymentMode($row);
  }
});

$("#paymentTable").on("click", ".save-row1", function () {
  savePaymentRow($(this).closest("tr"));
});

$("#addRowBtnPayment").click(function () {
  addPaymentsRow(null, true);
});


/* ------------------------------------------------------------------
    ENABLE EDIT MODE
------------------------------------------------------------------ */
function enableEditPaymentMode($row) {

  originalPaymentRowData[$row.index()] = {
    description: $row.find("td:eq(0)").text().trim(),
    amount: $row.find("td:eq(1)").text().trim(),
    status: $row.find("td:eq(2) span").text().trim(),
    id: $row.data("id"),
  };

  // DESCRIPTION
  $row.find("td:eq(0)").html(`
      <input type="text" class="form-control" value="${originalPaymentRowData[$row.index()].description}">
  `);

  // AMOUNT
  $row.find("td:eq(1)").html(`
      <input type="number" class="form-control" min="0" step="0.01" value="${originalPaymentRowData[$row.index()].amount}">
  `);

  // STATUS DROPDOWN
  $row.find("td:eq(2)").html(`
    <div class="d-flex align-items-center">
        <select class="form-control payment-status" style="flex:1">
            <option value="Received" ${originalPaymentRowData[$row.index()].status === "Received" ? "selected" : ""}>Received</option>
            <option value="Not Received" ${originalPaymentRowData[$row.index()].status === "Not Received" ? "selected" : ""}>Not Received</option>
        </select>

        <button class="btn btn-green btn-sm save-row1 ml-2">Save</button>
        <button class="btn btn-red btn-sm cancel-row1 ml-1">Cancel</button>
    </div>
  `);
}


/* ------------------------------------------------------------------
    CANCEL EDIT MODE
------------------------------------------------------------------ */
function cancelEditPaymentMode($row) {
  const rowIndex = $row.index();
  let d = originalPaymentRowData[rowIndex];

  const rowContent = [
    d.description,
    d.amount,
    `<div class="d-flex align-items-center">
        <span style="flex:1">${d.status}</span>
        <button class="btn btn-primary btn-sm edit-row1 ml-2">Edit</button>
     </div>`
  ];

  paymentTable.row($row).data(rowContent).draw();

  if (d.id) $row.attr("data-id", d.id);

  delete originalPaymentRowData[rowIndex];
}


/* ------------------------------------------------------------------
    SAVE ROW (NEW + UPDATE)
------------------------------------------------------------------ */
async function savePaymentRow($row) {

  const description = $row.find("td:eq(0) input").val()?.trim();
  const amount = $row.find("td:eq(1) input").val()?.trim();
  const status = $row.find("td:eq(2) select").val()?.trim();

  if (!description || !amount) {
    alert("Description and Amount are required!");
    return;
  }

  const saveData = {
    Description: description,
    PaymentAmount: parseFloat(amount),
    PaymentStatus: status
  };

  const isNew = $row.hasClass("new-payment");
  const rowId = $row.data("id");

  // ------------------------ NEW ROW ------------------------
  if (isNew) {
    saveData.ProjectID = $("#update-ProjectID").val();

    axiosInstance
      .post("/deliverables/payments", saveData)
      .then((response) => {
        paymentsData += 1;
        document.querySelector("#update-NoOfPayments").value=paymentsData;
        let rowContent = [

          saveData.Description,
          saveData.PaymentAmount,
          `<div class="d-flex align-items-center">
              <span style="flex:1">${saveData.PaymentStatus}</span>
              <button class="btn btn-primary btn-sm edit-row1 ml-2">Edit</button>
           </div>`
        ];

        paymentTable.row($row).data(rowContent).draw();

        $row.removeClass("new-payment");
        $row.attr("data-id", response.data.id);
        loadUpdateData1(originalId);
      })
      .catch((err) => {
        showErrorPopupFadeInDown("Failed to add payment.");
      });

  }
  // ------------------------ UPDATE EXISTING ------------------------
  else {
    saveData.ID = rowId;
    await api.updateProjectPayment(saveData);
    refreshRowAfterPaymentSave($row, saveData);
  }
}


/* ------------------------------------------------------------------
    REFRESH ROW AFTER SAVE
------------------------------------------------------------------ */
function refreshRowAfterPaymentSave($row, data) {

  const rowContent = [
    data.Description,
    data.PaymentAmount,
    `<div class="d-flex align-items-center">
        <span style="flex:1">${data.PaymentStatus}</span>
        <button class="btn btn-primary btn-sm edit-row1 ml-2">Edit</button>
     </div>`
  ];

  paymentTable.row($row).data(rowContent).draw();
}

// async function updatePaymentRow($row) {

//   // Read values from row
//   const description = $row.find("td:eq(0) input").val()?.trim();
//   const amount = $row.find("td:eq(1) input").val()?.trim();
//   const status = $row.find("td:eq(2) select").val()?.trim();

//   // Prepare data object
//   const data = {
//     ID: $row.data("id"),
//     Description: description,
//     PaymentAmount: parseFloat(amount),
//     PaymentStatus: status
//   };

//   try {
//     await api.updateProjectPayment(data); // corrected API name
//   } catch (err) {
//     console.error("Update failed:", err);
//   }
// }


/* ------------------------------------------------------------------
    ADD NEW PAYMENT ROW
------------------------------------------------------------------ */
function addPaymentsRow(data, isNew = false) {

  let rowContent;

  if (isNew) {
    rowContent = [
      `<input type="text" class="form-control payment-description" placeholder="Description">`,
      `<input type="number" class="form-control payment-amount" placeholder="Amount" min="0" step="0.01">`,
      `<div class="d-flex align-items-center">
          <select class="form-control payment-status me-2">
              <option value="Received">Received</option>
              <option value="Not Received">Not Received</option>
          </select>

          <button class="btn btn-green btn-sm save-row1 ml-2">Save</button>
          <button class="btn btn-red btn-sm cancel-row1 ml-1">Cancel</button>
      </div>`
    ];
  } else {
    rowContent = [
      data.Description,
      data.PaymentAmount,
      `<div class="d-flex align-items-center">
          <span style="flex:1">${data.PaymentStatus}</span>
          <button class="btn btn-primary btn-sm edit-row1 ml-2">Edit</button>
       </div>`
    ];
  }

  let rowNode = paymentTable.row.add(rowContent).draw(false).node();

  if (isNew) $(rowNode).addClass("new-payment");
  else if (data.ID) $(rowNode).attr("data-id", data.ID);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Payment script loaded.");
});
























$("#deliverablesTable").on("click", ".edit-row", function () {
  enableEditMode($(this).closest("tr"));
});

$("#deliverablesTable").on("click", ".cancel-row", function () {
  const $row = $(this).closest("tr");
  if ($row.hasClass("new-deliverable")) {
    deliverablesTable.row($row).remove().draw();
  } else {
    cancelEditMode($row);
  }
});

$("#deliverablesTable").on("click", ".save-row", function () {
  saveDeliverableRow($(this).closest("tr"));
});

$("#addRowBtn").click(function () {
  addDeliverablesRow(null, true);
});

function enableEditMode($row) {
  originalRowData[$row.index()] = {
    name: $row.find("td:eq(0)").text(),
    date: $row.find("td:eq(1)").text(),
    cost: $row.find("td:eq(2)").text(),
    remarks: $row.find("td:eq(3) span").text(),
    id: $row.data("id"),
  };

  $row
    .find("td:eq(0)")
    .html(
      `<input type="text" class="form-control" value="${
        originalRowData[$row.index()].name
      }">`
    );
  $row
    .find("td:eq(1)")
    .html(
      `<input type="date" class="form-control" value="${
        originalRowData[$row.index()].date
      }">`
    );
  $row
    .find("td:eq(2)")
    .html(
      `<input type="number" class="form-control" value="${
        originalRowData[$row.index()].cost
      }" min="0" step="0.01">`
    );
  $row.find("td:eq(3)").html(`
        <div class="d-flex align-items-center">
            <input type="text" class="form-control" value="${
              originalRowData[$row.index()].remarks
            }" style="flex:1">
            <button class="btn btn-green btn-sm save-row ml-2">Save</button>
            <button class="btn btn-red btn-sm cancel-row ml-1">Cancel</button>
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
        '<span style="flex:1">' +
        (originalRowData[rowIndex].remarks || "-") +
        "</span>" +
        '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
        "</div>",
    ];

    deliverablesTable.row($row).data(rowContent).draw();

    if (originalRowData[rowIndex].id) {
      $row.attr("data-id", originalRowData[rowIndex].id);
    }

    delete originalRowData[rowIndex];
  }
}

function cancelEditModeForUpdate($row) {
  const rowIndex = $row.index();

  const name =
    $row.find("td:eq(0) input").val() || $row.find("td:eq(0)").text();
  const date =
    $row.find("td:eq(1) input").val() || $row.find("td:eq(1)").text();
  const cost =
    $row.find("td:eq(2) input").val() || $row.find("td:eq(2)").text();
  const remarks =
    $row.find("td:eq(3) input").val() || $row.find("td:eq(3) span").text();

  const currentRowContent = [
    name,
    date,
    cost,
    '<div class="d-flex align-items-center">' +
      '<span style="flex:1">' +
      (remarks || "-") +
      "</span>" +
      '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
      "</div>",
  ];

  deliverablesTable.row($row).data(currentRowContent).draw();
}

async function saveDeliverableRow($row) {
  const inputs = {
    name: $row.find("td:eq(0) input").val(),
    date: $row.find("td:eq(1) input").val(),
    cost: $row.find("td:eq(2) input").val(),
    remarks: $row.find("td:eq(3) input").val(),
  };

  if (!inputs.name || !inputs.cost) {
    alert("Name and Cost are required!");
    return;
  }

  const saveData = {
    DeliverableName: inputs.name,
    EstDeliveryDate: inputs.date,
    TotalCost: parseFloat(inputs.cost),
    Remarks: inputs.remarks,
  };

  const isNew = $row.hasClass("new-deliverable");
  const rowId = $row.data("id");

  if (isNew) {
    saveData.ProjectID = $("#update-ProjectID").val();
    axiosInstance
      .post("/deliverables", saveData)
      .then(async (response) => {
        deliverablesData += 1;
        document.querySelector("#update-NoOfDeliverables").value=deliverablesData;
        console.log(response);
        const rowContent = [
          saveData.DeliverableName,
          saveData.EstDeliveryDate,
          saveData.TotalCost,
          '<div class="d-flex align-items-center">' +
            '<span style="flex:1">' +
            (saveData.Remarks || "-") +
            "</span>" +
            '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
            "</div>",
        ];

        deliverablesTable.row($row).data(rowContent).draw();
        $row.removeClass("new-deliverable");
        $row.attr("data-id", response.data.id);
        loadUpdateData1(originalId);
      })
      .catch((err) => {
        console.log(err);
        showErrorPopupFadeInDown(
          err.response?.data?.message ||
            "Failed to add deliverable. Please try again later."
        );
      });
  } else {
    saveData.ID = rowId;
    await api.updateProjectDeliverable(saveData);
    cancelEditModeForUpdate($row);
  }
}

function refreshRowAfterSave($row, data) {
  const rowContent = [
    data.DeliverableName,
    data.EstDeliveryDate ? data.EstDeliveryDate.split("T")[0] : "N/A",
    data.TotalCost || "0",
    '<div class="d-flex align-items-center">' +
      '<span style="flex:1">' +
      (data.Remarks || "-") +
      "</span>" +
      '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
      "</div>",
  ];

  deliverablesTable.row($row).data(rowContent).draw();
}

function deleteDeliverableRow($row) {
  if (!confirm("Are you sure you want to delete this deliverable?")) return;

  const id = $row.data("id");
  if (id) {
    axios
      .delete("/deliverables/" + id)
      .then(() => {
        deliverablesTable.row($row).remove().draw();
      })
      .catch((error) => {
        alert("Failed to delete deliverable");
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
        '<button class="btn btn-green btn-sm save-row ml-2">Save</button>' +
        '<button class="btn btn-red btn-sm cancel-row ml-1">Cancel</button>' +
        "</div>",
    ];
  } else {
    rowContent = [
      data.DeliverableName || "N/A",
      data.EstDeliveryDate ? data.EstDeliveryDate.split("T")[0] : "N/A",
      data.TotalCost || "0",
      '<div class="d-flex align-items-center">' +
        '<span style="flex:1">' +
        (data.Remarks || "-") +
        "</span>" +
        '<button class="btn btn-primary btn-sm edit-row ml-2">Edit</button>' +
        "</div>",
    ];
  }

  let rowNode = deliverablesTable.row.add(rowContent).draw(false).node();

  if (isNew) {
    $(rowNode).addClass("new-deliverable");
  } else if (data.ID) {
    $(rowNode).attr("data-id", data.ID);
  }
}

// async function updateDeliverableRow($row) {
//   const data = {
//     ID: $row.data("id"),
//     DeliverableName: $row.find("td:eq(0) input").val().trim(),
//     EstDeliveryDate: $row.find("td:eq(1)").text().trim(),
//     TotalCost: parseFloat($row.find("td:eq(2)").text().trim()),
//     Remarks: $row.find("td:eq(3)").text().trim(),
//   };

//   try {
//     await api.updateProjectDeliverable(data);
//   } catch (err) {
//     console.error("Update failed:", err);
//   }
// }

function refreshRowAfterSave($row, data) {
  const rowContent = [
    data.DeliverableName,
    data.EstDeliveryDate ? data.EstDeliveryDate.split("T")[0] : "N/A",
    data.TotalCost || "0",
    data.Remarks || "-",
    `<button class="btn btn-sm btn-primary edit-row">Edit</button>
         <button class="btn btn-sm btn-red delete-row ml-1">Delete</button>`,
  ];

  deliverablesTable.row($row).data(rowContent).draw();
}

// async function deleteDeliverableRow($row) {
//   if (!confirm("Are you sure you want to delete this deliverable?")) return;

//   try {
//     await api.deleteProjectDeliverable($row.data("id"));
//     deliverablesTable.row($row).remove().draw();
//   } catch (error) {
//     console.error("Error deleting deliverable:", error);
//     showErrorPopupFadeInDown("Failed to delete deliverable");
//   }
// }

document.addEventListener("DOMContentLoaded", async () => {
  console.log("834");
});


window.NoOfDeliverables = NoOfDeliverables;
$(document).ready(function () {
  // console.log("✅ Project Table Initialized");

  // ===== DataTable Initialization =====
  const datatable = $("#projectsTable").DataTable({
    paging: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: "excelHtml5",
         text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel",
        exportOptions: {
          columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        }
      },
      {
        extend: "pdfHtml5",
        text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
    className: "btn-pdf",
        orientation: "landscape",
        exportOptions: {
          columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        }
      },
      {
        extend: "colvis",
       text: `
      <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns
    `,
    className: "btn-colvis"
      }
    ],
    language: {
  search: "", // removes the 'Search:' label text
  searchPlaceholder: "Type to search...",
  paginate: {
    first: "«",
    last: "»",
    next: "›",
    previous: "‹"
  }
},
initComplete: function () {
 $('#projectsTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#projectsTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
},
    columnDefs: [
      { targets: [5, 6, 7, 8, 9, 10, 11], visible: false }
    ]
  });

  // Append export buttons to custom div
  datatable.buttons().container().appendTo($("#exportButtons"));

  // ===== Dropdown Filters =====
  $("#clientFilter").on("change", function () {
    const value = $(this).val();
    datatable.column(4).search(value ? "^" + value + "$" : "", true, false).draw();
  });

  $("#inchargeFilter").on("change", function () {
    const value = $(this).val();
    datatable.column(3).search(value ? "^" + value + "$" : "", true, false).draw();
  });

  $("#statusFilter").on("change", function () {
    const selectedStatus = $(this).val();
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      if (!selectedStatus) return true;
      const cell = datatable.cell(dataIndex, 12).nodes().to$();
      const statusText = cell.find(".status-btn").text().trim();
      return statusText === selectedStatus;
    });
    datatable.draw();
    $.fn.dataTable.ext.search.pop();
  });

  // ===== Optional Category Filter =====
  $("#filter").on("change", function () {
    const value = $(this).val();
    datatable.column(1).search(value || "", true, false).draw();
  });
});

document.querySelector("#addNew").addEventListener("click", function () {
  document.querySelector("#tab").classList.remove("d-none");
  document.querySelector("#tableCard").style.display = "none";
  document.querySelector("#exitButton").addEventListener("click", function () {
    document.querySelector("#new-project-form").reset();
    document.querySelector("#tab").classList.add("d-none");
    document.querySelector("#tableCard").style.display = "block";
  });
});
document
  .querySelector("#projectsTable")
  .addEventListener("click", function (event) {
    if (event.target.closest(".edit-btn")) {
      let button = event.target.closest(".edit-btn");
      document.querySelector("#tabWrapper").classList.remove("d-none");
      document.querySelector("#tableCard").style.display = "none";
    }
  });

document.querySelector("#exitButton2").addEventListener("click", function () {
  document.querySelector("#tabWrapper").classList.add("d-none");
  document.querySelector("#tableCard").style.display = "block";
});
document.addEventListener("DOMContentLoaded", () => {
  console.log("1274");
  addDeliverableFields("deliverablesDynamicContainer", 1);
});
function adjustDeliverableFields(inputElement) {
  let value = parseInt(inputElement.value) || 1;
  if (value < 1) {
    inputElement.value = 1;
    value = 1;
  }

  document.querySelector("#deliverablesCountInput").value = value;

  const container = document.querySelector("#deliverablesDynamicContainer");
  const existingCount = container.children.length;

  if (value > existingCount) {
    addDeliverableFields("deliverablesDynamicContainer", value - existingCount);
  } else {
    while (tbody.children.length > value) {
      tbody.removeChild(tbody.lastChild);
    }
  }
}

function addDeliverableFields(tableId, count) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    row.classList.add("deliverable-item", "align-middle");

    row.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm deliverable-name" placeholder="Enter Deliverable Name">
      </td>
      <td>
        <input type="date" class="form-control form-control-sm deliverable-date">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm deliverable-remarks" placeholder="Enter Remarks">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm deliverable-designation" placeholder="Enter Designation">
      </td>
      <td>
        <div class="d-flex align-items-center justify-content-between">
          <input type="number" class="form-control form-control-sm deliverable-cost me-2" placeholder="Enter Total Cost">
          <button type="button" class="btn btn-red btn-sm remove-deliverable">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    row.querySelector(".remove-deliverable").addEventListener("click", () => {
      const rowCount = tbody.children.length;
      if (rowCount > 1) {
        row.remove();
        NoOfDeliverables--;
        document.getElementById("deliverablesCountInput").value =
          NoOfDeliverables;
      } else {
        showErrorPopupFadeInDown("At least one deliverable is required.");
      }
    });

    tbody.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("1274");
  addPaymentFields("paymentDynamicContainer", 1);
});
function adjustPaymentFields(inputElement) {
  let value = parseInt(inputElement.value) || 1;
  if (value < 1) {
    inputElement.value = 1;
    value = 1;
  }

  document.querySelector("#paymentCountInput").value = value;

  const container = document.querySelector("#paymentDynamicContainer");
  const existingCount = container.children.length;

  if (value > existingCount) {
    addPaymentFields("paymentDynamicContainer", value - existingCount);
  } else {
    while (tbody.children.length > value) {
      tbody.removeChild(tbody.lastChild);
    }
  }
}

function addPaymentFields(tableId, count) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    row.classList.add("payment-item", "align-middle");

    row.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm payment-description" placeholder="Enter Payment Description">
      </td>
      <td>
        <input type="number" class="form-control form-control-sm payment-amount" placeholder="Enter Amount">
      </td>
      <td>
      <div class="d-flex align-items-center justify-content-between">
<select class="form-control form-control-sm payment-status me-2">
              <option value="" selected>-- Select Status --</option>
    <option value="Received">Received</option>
    <option value="Not Received">Not Received</option>
  </select>          
 <button type="button" class="btn btn-red btn-sm remove-payment ms-2">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
  
</td>

    `;

    row.querySelector(".remove-payment").addEventListener("click", () => {
      const rowCount = tbody.children.length;
      if (rowCount > 1) {
        row.remove();
        NoOfPayments--;
        document.getElementById("paymentCountInput").value =
          NoOfPayments;
      } else {
        showErrorPopupFadeInDown("At least one Payment is required.");
      }
    });

    tbody.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await axiosInstance.get("/clients/all/active");
    const clients = response.data.clients;
    console.log("Fetched clients:", clients);

    if (clients && clients.length > 0) {

      const elements = document.getElementsByClassName("ClientName");

      Array.from(elements).forEach(select => {

        const select2Data = clients.map(client => ({
          id: client.ID,                // FIXED
          text: client.ClientName
        }));

        $(select).select2({
          data: select2Data,
          placeholder: "-- Select Client --",
          allowClear: true,
          width: "100%"
        });
      });
    }

  } catch (error) {
    console.error("Error fetching clients:", error);
  }
});




function setupClientInput(inputId, datalistId) {
  document.getElementById(inputId).addEventListener("change", function () {
    delete this.dataset.selectedId;
    const selectedValue = this.value;
    const options = document.getElementById(datalistId).options;
    const selectedOption = Array.from(options).find(
      (opt) => opt.value === selectedValue
    );
    if (selectedOption) {
      this.dataset.selectedId = selectedOption.dataset.id;
      console.log(`Stored ID for ${inputId}:`, this.dataset.selectedId);
      this.dataset.displayName = selectedValue;
    } else {
      showErrorPopupFadeInDown("No Matching Client Found.");
      this.value = "";
      delete this.dataset.selectedId;
      delete this.dataset.displayName;
    }
  });
}
