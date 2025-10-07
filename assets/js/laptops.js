

const addLaptopButton = document.getElementById("add_laptop_btn");
const updateAssetsButton = document.getElementById("update_laptop_btn");


let storageHistory;




// add staff
addLaptopButton.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Add Laptop Button Clicked");

  let form = document.getElementById("laptop_add_form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());

  if (validateForm(formData)) {
    try {
      console.log("Submitting Payload...");
      const response = await api.addLaptops(Data);
      console.log("response",response);
      showSucessPopupFadeInDownLong(response.message || "Updated successfully!");

      table.clear();
      await fetchAllData();
      handlePermission("#username");
      form.reset();
      document.querySelector("#tab").classList.add("d-none");
      document.querySelector("#tableCard").style.display = "block";
          setTimeout(()=>{
        window.location.reload();
      },2000)
    } catch (error) {
      showErrorPopupFadeInDown(
        error.response?.data?.message ||
          "Failed to add staff. Please try again later."
      );
    }
  }
});

// update staff
updateAssetsButton.addEventListener("click", async (e) => {
  e.preventDefault();
  let form = document.getElementById("update-asset-form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());

  // 👉 Convert storageHistory array into string for DB
  if (Array.isArray(storageHistory)) {
    Data.storage = storageHistory.map(item => `${item.value} ${item.unit} ${item.type}`).join(" , ");
  }

  if (validateForm(formData)) {
    console.log("sending payload:", Data);
    try {
      const responseData = await api.updateLaptops(Data);
      table.clear();
      await fetchAllData();
      handlePermission("#username");
      showSucessPopupFadeInDownLong(responseData.message);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showErrorPopupFadeInDown(
        error.response?.data?.message ||
          "Failed to update staff. Please try again later."
      );
    }
  }
});


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
  // alert(decidedPermission)
}

let table;
function addRow(data) {
  if ($.fn.dataTable.isDataTable("#myTable")) {
    table = $("#myTable").DataTable();
  }

  if (!data) {
    console.error("no data to add");
    return;
  }

  // if(data.dateOfJoining){
  //     data.dateOfJoining=new Date(data.dateOfJoining).toLocaleDateString();
  // }else{
  //     data.dateOfJoining='';
  // }

  if (data.status) {
    data.status = true;
  } else {
    data.status = false;
  }

  table.row
    .add([
      data.slNo,
      data.assetId,
      data.category,
      data.vendorName,
      data.userName,
      data.dept,
      `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${
        data.status === true ? "active" : ""
      }" onclick="toggleStatus(this,'${data.assetId}')">
                <div class="slider"></div>
            </div>
        </div>`,
            `<div class="row d-flex justify-content-center">
      <div class="d-flex align-items-center justify-content-center p-0 download-btn"
          style="width: 40px; height: 40px; cursor:pointer"
          data-assets-id="${data.assetId}"
          onclick="downloadBarcode('${data.assetId}')">
        <i class="ti-download text-primary" style="font-size: larger;"></i>
      </div>
    </div>`,
      `<div class="row d-flex justify-content-center">
    <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
        style="width: 40px; height: 40px; cursor:pointer" 
        data-assets-id="${data.assetId}">
        <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
    </div>
</div>
`,
    ])
    .draw(false);
}

// download bar code

// Download barcode using axiosInstance
async function downloadBarcode(assetId) {
  try {
    const response = await axiosInstance.get(API_ROUTES.downloadBarCode(assetId), {
      responseType: 'blob', // important to get binary image data
    });

    // Create blob URL for the barcode image
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assetId}.png`; // name of the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // free up memory

  } catch (error) {
    console.error("Error downloading barcode:", error);
  }
}


// edit btn
document.querySelector("#myTable").addEventListener("click", function (event) {
  if (event.target.closest(".edit-btn")) {
    let button = event.target.closest(".edit-btn");
    let assetsID = button.getAttribute("data-assets-id");
    loadUpdateDetails(assetsID);
    // loadDocumentTable(staffID);
    document.querySelector("#tabWrapper").classList.remove("d-none");
    document.querySelector("#tableCard").style.display = "none";
  }
});

document.querySelector("#exitButton2").addEventListener("click", function () {
  document.querySelector("#tabWrapper").classList.add("d-none");
  document.querySelector("#tableCard").style.display = "block";
});

// side bar

document.addEventListener("DOMContentLoaded", async () => {
  roles = await axiosInstance.get("/roles/role/perms");
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
  await fetchAllData();

  handlePermission("#username");
});

// toggle status

async function toggleStatus(element, id) {
  if (element.classList.contains("editElement")) return;

  if (!id) return;

  try {
    const data = await api.toggleLaptopStatus(id);
    showSucessPopupFadeInDownLong(data.message);
    if (element) {
      element.classList.toggle("active");
    }
    await refreshTable();
  } catch (error) {
    showErrorPopupFadeInDown(error);
  }
}

// fetch all data
async function fetchAllData() {
  try {
    const assets = await api.getAllLaptops();
    console.log("assetsDetails", assets);

    assets.forEach((assets) => {
      addRow(assets);
    });

    handlePermission("#username");
  } catch (error) {
    console.error("Error fetching staff details:", error);
  }
}

function limitLength(str, length) {
  if (str.length > length) {
    return str.substring(0, length);
  }
  return str;
}
async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await fetchAllData();
}

function validateForm(formData) {
  let errors = [];

  const requiredFields = [
    "userName",
    "Model_No",
    "Serial_No",
    "Processor_Type",
    "RAM_GB",
    "Graphics",
    "OS_Type",
    "Host_Name",
    "IP_Address",
    "MAC_Address",
    "Project_No",
    "PO_No",
    "PO_Date",
    "Vendor_Name",
    "Invoice_No",
    "Invoice_Date",
    "SRB",
    "Dept",
    "Remarks",
  ];

  requiredFields.forEach((field) => {
    const value = formData.get(field)?.trim();
    if (!value) {
      errors.push(`${field} is required.`);
      showErrorPopupFadeInDown(`${field} is Required`);
    }
  });

  // ✅ Validate MAC address format
  const mac = formData.get("MAC_Address")?.trim();
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  if (mac && !macRegex.test(mac)) {
    errors.push("Invalid MAC address format. Use XX:XX:XX:XX:XX:XX");
    showErrorPopupFadeInDown("Invalid MAC address format (expected XX:XX:XX:XX:XX:XX)");
  }

  // ✅ Validate IP address (IPv4 / IPv6)
  const ip = formData.get("IP_Address")?.trim();
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;

  if (ip && !(ipv4Regex.test(ip) || ipv6Regex.test(ip))) {
    errors.push("Invalid IP address format.");
    showErrorPopupFadeInDown("Invalid IP address format (must be valid IPv4 or IPv6)");
  }

  if (errors.length > 0) {
    console.log("Form validation failed:", errors);
    return false;
  }

  return true;
}

// parase storage
function parseStorage(storageStr) {
  if (!storageStr) return [];

  return storageStr.split(',')
    .map(s => s.trim().replace(/\s+/g, ' ')) // normalize spaces
    .filter(Boolean)                         // remove empty entries
    .map(item => {
      const parts = item.split(' '); // ["1", "TB"]
      return {
        value: parts[0],
        unit: parts[1] || 'GB',
        type: parts[2] // default unit = GB
      };
    });
}
// convert db string 

function stringifyStorage(storageArr) {
  if (!Array.isArray(storageArr)) return "";

  return storageArr
    .map(item => `${item.value} ${item.unit}`)
    .join(' , ');
}


// update staff details
async function loadUpdateDetails(id) {
  try {
    const response = await axiosInstance.get(API_ROUTES.getAssets(id));
    const data = response.data.assets;

    console.log("Fetched asset:", data);
    console.log(document.querySelectorAll("#assetId"));

    // Asset Info
    document.querySelectorAll("#assetId")[0].value = data.assetId;
    document.querySelectorAll("#category")[0].value = data.category;
    // document.querySelectorAll("#userName2")[0].value = data.userName || "";
    // Suppose data.userName = "123 - John Doe"
    $('#userName2').val(data.userName).trigger('change'); 

    document.querySelectorAll("#modelNo")[1].value = data.modelNo;
    document.querySelectorAll("#serialNo")[1].value = data.serialNo;
    document.querySelectorAll("#processorType")[1].value = data.processorType;
  const ramValue = Number(data.ramGb.replace(/\D/g, '')); // removes everything except digits
document.querySelectorAll("#ramGb")[1].value = ramValue;


storageHistory = parseStorage(data.storage);

console.log(storageHistory);



if (storageHistory.length > 0) {
  const last = storageHistory[storageHistory.length - 1]; // last object
  document.querySelectorAll("#storage")[1].value = `${last.value} ${last.unit} ${last.type}`;
  // result: "1 TB"
}


    // Other Specs
    document.querySelectorAll("#graphics")[1].value = data.graphics;
    document.querySelectorAll("#osType")[1].value = data.osType;

    // Networking
    document.querySelectorAll("#hostName")[1].value = data.hostName;
    document.querySelectorAll("#ipAddress")[1].value = data.ipAddress;
    document.querySelectorAll("#macAddress")[1].value = data.macAddress;

    // Purchase / Vendor
    document.querySelectorAll("#projectNo")[1].value = data.projectNo;
    document.querySelectorAll("#poNo")[1].value = data.poNo;
    document.querySelectorAll("#poDate")[1].value = formatDate(data.poDate);
    document.querySelectorAll("#vendorName")[1].value = data.vendorName;
    document.querySelectorAll("#invoiceNo")[1].value = data.invoiceNo;
    document.querySelectorAll("#invoiceDate")[1].value = formatDate(data.invoiceDate);
    document.querySelectorAll("#srb")[1].value = data.srbNo || data.srb;

    // Organization Info
    document.querySelectorAll("#dept")[1].value = data.dept;
    document.querySelectorAll("#remarks")[1].value = data.remarks;



        const storageHistoryBtn = document.querySelectorAll("#storage")[1];
    const storageHistoryTable = document.querySelector('#storageHistoryTable tbody');
    const newStorageValue = document.getElementById('newStorageValue');
    const newStorageUnit = document.getElementById('newStorageUnit');

function renderStorageTable() {
    storageHistoryTable.innerHTML = '';

    storageHistory.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="storage-value text-center align-middle fw-semibold fs-6">${item.value}</td>
            <td class="storage-unit text-center align-middle fs-6">
                <span class="badge bg-light text-dark px-3 py-2 border rounded">${item.unit}</span>
            </td>
            <td class="storage-type text-center align-middle fs-6">
                <span class="badge ${item.type === 'HDD' ? 'bg-primary' : 'bg-success'} text-white px-3 py-2 rounded">
                    ${item.type}
                </span>
            </td>
            <td class="text-center align-middle" style="padding: 10px 0 !important;">
                <div class="btn-group">
                    <button class="btn btn-outline-primary btn-md px-3 py-2 edit-storage" title="Edit Storage">
                        <i class="fa-solid fa-pen-to-square fs-6"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-md px-3 py-2 delete-storage" title="Delete Storage">
                        <i class="fa-solid fa-trash fs-6"></i> Delete
                    </button>
                </div>
            </td>
        `;

        const tdValue = tr.querySelector('.storage-value');
        const tdUnit = tr.querySelector('.storage-unit');
        const tdType = tr.querySelector('.storage-type');
        const editBtn = tr.querySelector('.edit-storage');

        // ✏️ Edit button
        editBtn.addEventListener('click', function editHandler() {
            tdValue.innerHTML = `
                <input type="number" 
                       class="form-control form-control-lg edit-value text-center fw-semibold" 
                       value="${item.value}" 
                       min="1" 
                       style="width: 120px; margin: auto;">
            `;

            tdUnit.innerHTML = `
                <select class="form-select form-select-lg edit-unit text-center fw-semibold" 
                        style="width: 100px; margin: auto;">
                    <option value="GB" ${item.unit === 'GB' ? 'selected' : ''}>GB</option>
                    <option value="TB" ${item.unit === 'TB' ? 'selected' : ''}>TB</option>
                </select>`;

            tdType.innerHTML = `
                <select class="form-select form-select-lg edit-type text-center fw-semibold" 
                        style="width: 120px; margin: auto;">
                    <option value="SDD" ${item.type === 'SDD' ? 'selected' : ''}>SDD</option>
                    <option value="HDD" ${item.type === 'HDD' ? 'selected' : ''}>HDD</option>
                </select>`;

            // Change button to Save
            editBtn.innerHTML = `<i class="fa-solid fa-floppy-disk fs-6"></i> Save`;
            editBtn.classList.replace('btn-outline-primary', 'btn-success');
            editBtn.setAttribute('title', 'Save Changes');

            const saveHandler = () => {
                const newVal = tdValue.querySelector('.edit-value').value.trim();
                const newUnit = tdUnit.querySelector('.edit-unit').value;
                const newType = tdType.querySelector('.edit-type').value;
                if (!newVal || newVal < 1) {
                    alert('Enter valid value!');
                    return;
                }
                storageHistory[idx] = { value: newVal, unit: newUnit, type: newType };
                renderStorageTable();
            };

            editBtn.removeEventListener('click', editHandler);
            editBtn.addEventListener('click', saveHandler);
        });

        // 🗑️ Delete button
        tr.querySelector('.delete-storage').addEventListener('click', () => {
            storageHistory.splice(idx, 1);
            renderStorageTable();
        });

        storageHistoryTable.appendChild(tr);
    });
}


    // Open HDD modal
    storageHistoryBtn.addEventListener('click', () => {
        renderStorageTable();
        new bootstrap.Modal(document.getElementById('storageHistoryModal')).show();
    });

    // Add new HDD
    document.getElementById('addStorageBtnModal').addEventListener('click', () => {
        const val = newStorageValue.value.trim();
        const unit = newStorageUnit.value;
        const type = newStorageType.value;

        if (!val || val < 1) { alert('Enter valid value!'); return; }
        storageHistory.push({ value: val, unit: unit, type: type });
        newStorageValue.value = '';
        renderStorageTable();
    });

  } catch (error) {
    console.error("Error loading update details:", error);
  }
}

// Format date for <input type="date">
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().split("T")[0];
}


function formatDate(dateStr) {
  if (!dateStr) return "";
  let date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

// edit btn
// $(document).on('click', '.edit-btn', function () {
//     let staffId = $(this).data('data-staff-id');
//     loadUpdateDetails(staffId);

// });

//generate pdf

async function fetchDataAndGeneratePDF() {
  try {
    const res = await api.downloadStaffData();
    if (!Array.isArray(res) || res.length === 0)
      throw new Error("No staff data available");

    const tableBody = [
      [
        "ID",
        "Name",
        "Date Of Birth",
        "Aadhar Number",
        "Contact Number",
        "Mail",
        "Permanent Address",
        "Salary At Joining",
        "Qualifications",
        "Highest Qualification",
        "Location Of Work",
        "Date of Joining",
        "Certifications",
        "Courses",
        "Current Salary",
        "Current Designation",
        "Status",
      ],
      ...res.map((staff) => [
        staff.staffID || "N/A",
        staff.staffName || "N/A",
        staff.dateOfBirth || "N/A",
        staff.aadharNumber || "N/A",
        staff.contactNumber || "N/A",
        staff.mail || "N/A",
        staff.permanentAddress || "N/A",
        staff.salaryAtJoining || "N/A",
        staff.qualifications || "N/A",
        staff.highestQualification || "N/A",
        staff.locationOfWork || "N/A",
        staff.dateOfJoining || "N/A",
        staff.certifications || "N/A",
        staff.courses || "N/A",
        staff.currentSalary || "N/A",
        staff.currentDesignation || "N/A",
        staff.status || "N/A",
      ]),
    ];

    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        { text: "Staff Details", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: [
              "5%",
              "5%",
              "10%",
              "10%",
              "10%",
              "5%",
              "5%",
              "10%",
              "10%",
              "10%",
              "10%",
              "10%",
              "10%",
              "10%",
              "10%",
              "15%",
              "10%",
            ],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: {
        fontSize: 6,
      },
    };

    pdfMake.createPdf(docDefinition).download("Staff_List.html");
  } catch (err) {
    console.error("Error fetching or generating PDF:", err);
    showErrorPopupFadeInDown(
      err.message || "Can't download the staff details."
    );
  }
}

// generate excel
async function fetchDataAndGenerateExcel() {
  try {
    const res = await api.downloadIITStaffData();

    const headers = [
      "Employee ID",
      "Staff Name",
      "Date of Birth",
      "Gender",
      "Contact Number",
      "Personal Email",
      "Emergency Contact Name",
      "Emergency Contact Number",
      "Permanent Address",
      "Date of Joining",
      "Work Location",
      "Department",
      "Designation",
      "Employment Type",
      "Reporting Manager",
      "Highest Educational Qualification",
      "Specialization",
      "Previous Company",
      "Total Years of Experience",
      "LinkedIn / GitHub / Portfolio Link",
      "Office Assets",
      "Official Email Address",
    ];

    const data = res.map((staff) => [
      staff.employeeId,
      staff.staffName,
      new Date(staff.dob).toLocaleDateString("eng-GB"),
      staff.gender,
      staff.contactNumber,
      staff.personalEmail,
      staff.address,
      new Date(staff.dateOfJoining).toLocaleDateString("eng-GB"),
      staff.department,
      staff.designation,
      staff.employmentType,
      ,
      staff.reportingManager,
      staff.workLocation,
      staff.education,
      staff.specialization,
      staff.previousCompany,
      staff.experience,
      staff.linkedin,
      staff.assets,
      staff.officialEmail,
      staff.emergencyContactName,
      staff.emergencyContactNumber,
      staff.status,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Details");

    XLSX.writeFile(wb, "Staff_List.xlsx");
  } catch (err) {
    console.error("Error fetching or generating Excel:", err);
    showErrorPopupFadeInDown("Can't download the staff details.");
  }
}
$(document).ready(function () {
  const datatable = $('#myTable').DataTable({
    paging: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    // dom: 'Bfrtip',
    buttons: [
      {
        extend: 'excel',
        text: '<i class="fa-solid fa-file-excel"></i> Excel',
        className: 'btn-excel'
      },
      {
        extend: 'pdf',
        text: '<i class="fa-solid fa-file-pdf"></i> PDF',
        className: 'btn-pdf'
      },
      {
        extend: 'colvis',
        text: '<i class="fa-solid fa-eye"></i> Columns',
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
      $('#myTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#myTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Move export buttons into custom div
  datatable.buttons().container().appendTo($('#exportButtons'));

  // Dropdown filters logic
  function addColumnFilter(selectId, colIndex) {
    $(`#${selectId}`).on('change', function () {
      const value = $(this).val();
      datatable.column(colIndex).search(value ? '^' + value + '$' : '', true, false).draw();
    });
  }

  // Hook up filters
  addColumnFilter("locationFilter",0);
  addColumnFilter("designationFilter",6);
  addColumnFilter("statusFilter",5);
});


    
    document.querySelector('#addNew').addEventListener('click', function () {
        document.querySelector('#tab').classList.remove('d-none');
        document.querySelector('#tableCard').style.display = 'none';
        document.querySelector('#exitButton').addEventListener('click',function(){
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
        });
    });
    // Show/Hide "Other" input dynamically
    document.getElementById("category").addEventListener("change", function () {
        let otherDiv = document.getElementById("otherCategoryDiv");
        if (this.value === "Other") {
            otherDiv.style.display = "block";
        } else {
            otherDiv.style.display = "none";
            document.getElementById("otherCategory").value = "";
        }
    });
$(document).ready(function () {
    // Load staff and populate dropdown
    api.getstaffid()
        .then(staffList => {
            staffList.forEach(staff => {
                $('.userName').append(
                    $('<option>', { value: `${staff.id} - ${staff.name}`, text: `${staff.id}-${staff.name}` })
                );
            });

            // Initialize Select2
            $('.userName').select2({
                placeholder: 'Select Staff ID',
                allowClear: true,
                width: '100%'
            });
        })
        .catch(error => {
            console.error('Error loading staff:', error);
        });

    // Prevent Select2 dropdown clicks from bubbling
    $('.userName').on('select2:open select2:closing', function(event) {
        event.stopPropagation();
    });

    // Prevent regular click on the select from bubbling
    $('.userName').on('click', function(e){
        e.stopPropagation();
    });


});



