

const addDesktopButton = document.getElementById("add_printer_btn");
const updateAssetsButton = document.getElementById("update_printer_btn");



// add staff
addDesktopButton.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Add Laptop Button Clicked");

  let form = document.getElementById("printer_add_form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());

  if (validateForm(formData)) {
    try {
      console.log("Submitting Payload...");
      const response = await api.addPrinter(Data);
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

  if (validateForm(formData)) {
    console.log("enter", formData);
    try {
      const responseData = await api.updatePrinter(Data);
      table.clear();
      await fetchAllData();
      handlePermission("#username");
      showSucessPopupFadeInDownLong(responseData.message);
      setTimeout(()=>{
        window.location.reload();
      },2000)
    } catch (error) {
      showErrorPopupFadeInDown(
        error.response?.data?.message ||
          "Failed to update Printer. Please try again later."
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
      data.serialNo,
      data.assetId,
      data.category,
      data.vendorName,
      data.userName,
      data.projectNo,
      `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${
        data.status === true ? "active" : ""
      }" onclick="toggleStatus(this,'${data.assetId}')">
                <div class="slider"></div>
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
  } catch (error) {
    showErrorPopupFadeInDown(error);
  }
}

// fetch all data
async function fetchAllData() {
  try {
    const assets = await api.getAllPrinter();
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

function validateForm(formData) {
    console.log("enter");
  let errors = [];

  const requiredFields = [
    // "userName",
    // "Model_No",
    // "Serial_No",
    // "IP_Address",
    // "MAC_Address",
    // "Project_No",
    // "PO_No",
    // "PO_Date",
    // "Vendor_Name",
    // "Invoice_No",
    // "Invoice_Date",
    // "SRB",
    // "Remarks",
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


// update staff details
async function loadUpdateDetails(id) {
    console.log("id",id);
  try {
    const response = await await axiosInstance.get(API_ROUTES.getAssets(id));
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

    // Networking
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
    document.querySelectorAll("#remarks")[1].value = data.remarks;

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
           "paging": true,
           "pageLength": 25,
           "lengthMenu": [5, 10, 25, 50, 100],
           dom: '<"top"l>frtip',
           buttons: ['excel', 'csv', 'pdf']
       });

       datatable.buttons().container().appendTo($('#exportButtons'));



 $('#designationFilter').on('change', function () {
        const selectedDesignation = $(this).val();
        datatable.column(0).search(selectedDesignation ? '^' + selectedDesignation + '$' : '', true, false).draw();
    });

    $('#locationFilter').on('change', function () {
        const selectedLocation = $(this).val();
        datatable.column(5).search(selectedLocation ? '^' + selectedLocation + '$' : '', true, false).draw(); 
    });

   });


    
    $('#filter').on('change', function () {
        const selectedCategory = $(this).val();
        if (selectedCategory) {
            datatable.column(1).search(selectedCategory).draw();
        } else {
            datatable.column(1).search('').draw(); 
        }
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
