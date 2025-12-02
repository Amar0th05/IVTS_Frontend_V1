const addStaffButton = document.getElementById("add_staff_btn");
const updateStaffButton = document.getElementById("update_staff_btn");

async function loadCourseOptions(id) {
  try {
    // const response = await axiosInstance.get(API_ROUTES.courses);
    const courses = await api.getCourses();
    const select = document.getElementById(id);

    select.innerHTML = '<option value="">Select Course</option>';
    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.course_id;
      option.textContent = course.course_name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

async function loadOrganisationOptions(id) {
  try {
    const organisations = await api.getOrganisations();
    const select = document.getElementById(id);

    select.innerHTML = '<option value="">Select Organisation</option>';
    organisations.forEach((organisation) => {
      const option = document.createElement("option");
      option.value = organisation.org_id;
      option.textContent = organisation.organisation_name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading organisations:", error);
  }
}

async function loadHighestQualificationsOptions(id) {
  try {
    // const response = await axiosInstance.get(API_ROUTES.getHighestQualifications);
    const highestQualifications = await api.getHighestQualifications();
    const select = document.getElementById(id);

    select.innerHTML = '<option value="">Select Highest Qualification</option>';
    highestQualifications.forEach((qualification) => {
      const option = document.createElement("option");
      option.value = qualification.qual_id;
      option.textContent = qualification.highest_qualification;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading highest qualifications:", error);
  }
}


$(document).ready(function () {
  api.getReportingManger()
    .then((staffList) => {
      staffList.forEach((staff) => {
        $(".userName").append(
          $("<option>", {
            value: `${staff.id} - ${staff.name}`,
            text: `${staff.id}-${staff.name}`,
          })
        );
      });

      $(".userName").select2({
        placeholder: "Select Reporting Manager",
        allowClear: true,
      });
    })
    .catch((error) => {
      console.error("Error loading staff:", error);
    });
});

// add staff
addStaffButton.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("Add Staff Button Clicked");

  let form = document.getElementById("new-staff-form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());
  // console.log("Form Data:",formData);

  if (validateForm(formData)) {
    try {
      // console.log("Submitting Payload...",data);
      const response = await api.addIITStaff(Data);
      showSucessPopupFadeInDownLong(response?.message || "Staff Added Successfully");
      form.reset();
      setTimeout(() => {
      window.location.reload();

      },2000);
    } catch (error) {
      console.log("Error Adding Staff:", error);
      showErrorPopupFadeInDown(
        error.response?.message ||
          "Failed to add staff. Please try again later."
      );
    }
  }
});

// update staff
updateStaffButton.addEventListener("click", async (e) => {
  e.preventDefault();
  let form = document.getElementById("update-staff-form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());

  if (validateForm(formData)) {
    console.log("enter", formData);
    try {
      const responseData = await api.updateIITStaff(Data);
      showSucessPopupFadeInDownLong(responseData.message);

    } catch (error) {
      showErrorPopupFadeInDown(
        error.response?.message ||
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

  if (data.dateOfJoining) {
    data.dateOfJoining = new Date(data.dateOfJoining).toLocaleDateString();
  } else {
    data.dateOfJoining = "";
  }

  if (data.status) {
    data.status = true;
  } else {
    data.status = false;
  }

  table.row
    .add([
      data.employeeId,
      data.staffName,
      data.designation,
      data.department,
      data.contactNumber,
      data.workLocation,
      `
    <div class="container d-flex justify-content-center">
      <div class="toggle-btn ${decidedPermission} ${
        data.status === true ? "active" : ""
      }" 
           onclick="toggleStatus(this,'${data.employeeId}')">
        <div class="slider"></div>
      </div>
    </div>
  `,
      `
    <div class="row d-flex justify-content-center">
      <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
           style="width: 40px; height: 40px; cursor:pointer" 
           data-staff-id="${data.employeeId}">
        <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
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
    let staffID = button.getAttribute("data-staff-id");
    loadUpdateDetails(staffID);
    // loadDocumentTable(staffID);
    document.querySelector("#tabWrapper").classList.remove("d-none");
    document.querySelector("#tableCard").style.display = "none";
  }
});

// document.querySelector('#exitButton2').addEventListener('click', function () {
//     document.querySelector('#tabWrapper').classList.add('d-none');
//     document.querySelector('#tableCard').style.display = 'block';
// });

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
  console.log("Toggle status for ID:", id);
  if (element.classList.contains("editElement")) return;

  if (!id) return;

  try {
    const data = await api.toggleIITStaffStatus(id);
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
    const staffs = await api.getAllStaff();
    console.log("Fetched Staffs:", staffs);
    const designations = new Set();
    const locations = new Set();

    let table;
    if ($.fn.dataTable.isDataTable("#myTable")) {
      table = $("#myTable").DataTable();
      table.clear().draw();
    } else {
      table = $("#myTable").DataTable();
    }

    // Clear existing filters
    $("#designationFilter")
      .empty()
      .append('<option value="">Show all</option>');
    $("#locationFilter").empty().append('<option value="">Show all</option>');
    // $("#statusFilter").empty().append('<option value="">Show all</option>');

    // Add rows and collect unique filter values
    staffs.forEach((staff) => {
      addRow(staff);

      if (staff.designation) designations.add(staff.designation);

      if (staff.workLocation) locations.add(staff.workLocation);
    });

    // Populate filters
    designations.forEach((designation) => {
      $("#designationFilter").append(
        `<option value="${designation}">${designation}</option>`
      );
    });

    locations.forEach((location) => {
      $("#locationFilter").append(
        `<option value="${location}">${location}</option>`
      );
    });
    // ✅ Count staff types
    const total = staffs.filter((i) => Number(i.status) === 1).length;
    const fullTime = staffs
      .filter(
        (s) =>
          s.employmentType &&
          s.employmentType.toLowerCase().includes("full-time")
      )
      .filter((i) => Number(i.status) === 1).length;
    const partTime = staffs
      .filter(
        (s) =>
          s.employmentType &&
          s.employmentType.toLowerCase().includes("part-time")
      )
      .filter((i) => Number(i.status) === 1).length;

    // ✅ Update the cards
    document.getElementById("totalCount").innerText = total;
    document.getElementById("fullTimeCount").innerText = fullTime;
    document.getElementById("partTimeCount").innerText = partTime;

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
  if ($.fn.dataTable.isDataTable("#myTable")) {
    table = $("#myTable").DataTable();
    table.clear();
  }

  await fetchAllData();
}

function validateForm(formData) {
  let errors = [];

  const data = [
    "employeeId",
    "staffName",
    "dateOfBirth",
    "gender",
    "contactNumber",
    "personalEmail",
    "emergencyContactName",
    "permanentAddress",
    "dateOfJoining",
    "workLocation",
    "department",
    "designation",
    "employmentType",
    "reportingManager",
    "highestQualification",
    "specialization",
  ];
  data.forEach((field) => {
    const value = formData.get(field)?.trim();
    if (!value) {
      errors.push(`${field} is required.`);
      showErrorPopupFadeInDown(`${field} is Required`);
    }
    if (field === "contactNumber" && !/^\d{10}$/.test(value)) {
      errors.push("Contact Number must be exactly 10 digits.");
      showErrorPopupFadeInDown("Invalid Contact Number format");
    }
    if (
      field === "personalEmail" &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    ) {
      showErrorPopupFadeInDown("Invalid Email format");
      errors.push("Invalid email format.");
    }
  });

  if (errors.length > 0) {
    console.log("Form validation failed:", errors);
    return false;
  }

  return true;
}

// update staff details

async function loadUpdateDetails(id) {
  try {
    console.log("id", typeof id);

    const response = await axiosInstance.get(API_ROUTES.getIITStaff(id));
    const data = response.data.staffs;

    console.log(data);
    console.log(data.staffName);

    console.log(document.getElementById("employeeId"));

    document.querySelectorAll("#employeeId")[1].value = data.employeeId;
    document.querySelectorAll("#staffName")[1].value = data.staffName;
    document.querySelectorAll("#dateOfBirth")[1].value = formatDate(data.dob);
    document.querySelectorAll("#gender")[1].value = data.gender;
    document.querySelectorAll("#contactNumber")[1].value = Number(
      data.contactNumber
    );
    document.querySelectorAll("#personalEmail")[1].value = data.personalEmail;
    document.querySelectorAll("#emergencyContactName")[1].value =
      data.emergencyContactName;
    document.querySelectorAll("#emergencyContactNumber")[1].value = Number(
      data.emergencyContactNumber
    );
    document.querySelectorAll("#permanentAddress")[1].value = data.address;
    document.querySelectorAll("#dateOfJoining")[1].value = formatDate(
      data.dateOfJoining
    );
    document.querySelectorAll("#workLocation")[1].value = data.workLocation;
    document.querySelectorAll("#department")[1].value = data.department;
    document.querySelectorAll("#designation")[1].value = data.designation;
    document.querySelectorAll("#employmentType")[1].value = data.employmentType;
    $("#reportingManager_2")
  .val(data.reportingManager)
  .trigger("change");

    document.querySelectorAll("#highestQualification")[1].value =
      data.education;
    document.querySelectorAll("#specialization")[1].value = data.specialization;
    document.querySelectorAll("#previousCompany")[1].value =
      data.previousCompany;
    document.querySelectorAll("#experience")[1].value = data.experience;
    document.querySelectorAll("#portfolio")[1].value = data.linkedin;
    document.querySelectorAll("#officeAssets")[1].value = data.assets;
    document.querySelectorAll("#officialEmail")[1].value = data.officialEmail;
  } catch (error) {
    console.error(error);
  }
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
// document.querySelector("#myTable").addEventListener("click", function (event) {
//   if (event.target.closest(".edit-btn")) {
//     let button = event.target.closest(".edit-btn");
//     let staffID = button.getAttribute("data-staff-id");
//     loadUpdateDetails(staffID);
//     // loadDocumentTable(staffID);
//     document.querySelector("#tabWrapper").classList.remove("d-none");
//     document.querySelector("#tableCard").style.display = "none";
//   }
// });

// document.querySelector('#exitButton2').addEventListener('click', function () {
//     document.querySelector('#tabWrapper').classList.add('d-none');
//     document.querySelector('#tableCard').style.display = 'block';
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
  const datatable = $("#myTable").DataTable({
    paging: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: "excel",
        text: `
          <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
          Excel
        `,
        className: "btn-excel",
      },
      {
        extend: "pdf",
        text: `
          <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
          PDF
        `,
        className: "btn-pdf",
      },
      {
        extend: "colvis",
        text: `
          <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
          Columns
        `,
        className: "btn-colvis",
      },
    ],
    language: {
      search: "",
      searchPlaceholder: "Type to search...",
      paginate: {
        first: "«",
        last: "»",
        next: "›",
        previous: "‹",
      },
    },
    initComplete: function () {
      // Wrap search input & add search icon
      $("#myTable_filter input").wrap('<div class="search-wrapper"></div>');
      $(".search-wrapper").prepend(
        '<i class="fa-solid fa-magnifying-glass"></i>'
      );
    },
  });

  // Move export buttons into custom div
  datatable.buttons().container().appendTo($("#exportButtons"));

  // ================================
  // 🔹 DROPDOWN FILTERS
  // ================================

  // Designation Filter
  $("#designationFilter").on("change", function () {
    const selectedDesignation = $(this).val();
    datatable
      .column(2) // Change to your actual column index for Designation
      .search(selectedDesignation ? selectedDesignation : "", true, false)
      .draw();
  });

  // Location Filter
  $("#locationFilter").on("change", function () {
    const selectedLocation = $(this).val();
    datatable
      .column(5) // Change to your actual column index for Location
      .search(selectedLocation ? "^" + selectedLocation + "$" : "", true, false)
      .draw();
  });

  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.datatable == "myTable") return true; // Apply only to second table

    const selectedStatus = $("#statusFilter").val(); // '', 'active', 'inactive'
    const row = $("#myTable").DataTable().row(dataIndex).node();
    const isActive = $(row).find(".toggle-btn").hasClass("active");

    if (selectedStatus === "") return true; // Show all
    if (selectedStatus === "active" && isActive) return true;
    if (selectedStatus === "inactive" && !isActive) return true;
    return false;
  });

  // Redraw when filters change
  $("#statusFilter").on("change", function () {
    datatable.draw();
  });
});

document.querySelector("#addNew").addEventListener("click", function () {
  document.querySelector("#tab").classList.remove("d-none");
  document.querySelector("#tableCard").style.display = "none";
});

// popup message

document
  .getElementById("exitButton2")
  .addEventListener("click", async function () {
    const result = await Swal.fire({
      title: "Cancel Updating?",
      text: "Your unsaved changes will be lost. Do you want to exit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red for confirm
      cancelButtonColor: "#3085d6", // Blue for cancel
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep Editing",
      reverseButtons: true,
      customClass: {
        popup: "swal2-custom-popup",
        title: "swal2-custom-title",
      },
    });
    if (result.isConfirmed) {
      // document.location.reload();
    document.querySelector(".cls").setAttribute("data-breadcrumb", "back");
      document.querySelector("#tabWrapper").classList.add("d-none");
      document.querySelector("#tableCard").style.display = "block";
    } else {
    }
  });

document
  .getElementById("exitButton")
  .addEventListener("click", async function () {
    const result = await Swal.fire({
      title: "Cancel Editin?",
      text: "Your unsaved changes will be lost. Do you want to cancel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red for confirm
      cancelButtonColor: "#3085d6", // Blue for cancel
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Keep Editing",
      reverseButtons: true,
      customClass: {
        popup: "swal2-custom-popup",
        title: "swal2-custom-title",
      },
    });
    if (result.isConfirmed) {
      document.querySelector(".cls").setAttribute("data-breadcrumb", "back");
      document.querySelector("#tab").classList.add("d-none");
      document.querySelector("#tableCard").style.display = "block";
    } else {
    }
  });
