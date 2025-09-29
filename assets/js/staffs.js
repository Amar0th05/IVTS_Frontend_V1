const addStaffButton = document.getElementById('add_staff_btn');
const updateStaffButton = document.getElementById('update_staff_btn');


async function loadCourseOptions(id) {
    try {
        // const response = await axiosInstance.get(API_ROUTES.courses);
        const courses = await api.getCourses();
        const select = document.getElementById(id);

        select.innerHTML = '<option value="">Select Course</option>';
        courses.forEach(course => {
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


async function loadHighestQualificationsOptions(id) {
    try {
        // const response = await axiosInstance.get(API_ROUTES.getHighestQualifications);
        const highestQualifications = await api.getHighestQualifications();
        const select = document.getElementById(id);

        select.innerHTML = '<option value="">Select Highest Qualification</option>';
        highestQualifications.forEach(qualification => {
            const option = document.createElement("option");
            option.value = qualification.qual_id;
            option.textContent = qualification.highest_qualification;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading highest qualifications:", error);
    }
}

// add staff 
addStaffButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Add Staff Button Clicked');

    let form = document.getElementById('new-staff-form');
    let formData = new FormData(form);
    
    let Data = Object.fromEntries(formData.entries());


    

    if (validateForm(formData)) {
        try {
            console.log('Submitting Payload...');
            const response = await api.addIITStaff(Data);

            table.clear();
            await fetchAllData();
            handlePermission('#username');
            showSucessPopupFadeInDownLong(response.data.message);
            form.reset();
            insuranceForm.reset();
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
        } catch (error) {
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add staff. Please try again later.');
        }
    }
});

// update staff
updateStaffButton.addEventListener('click', async (e) => {
    
    e.preventDefault();
    let form = document.getElementById('update-staff-form');
    let formData = new FormData(form);

    let Data = Object.fromEntries(formData.entries());

    if (validateForm(formData)) {
        console.log("enter",formData);
        try {
            const responseData=await api.updateIITStaff(Data);
            table.clear();
            await fetchAllData();
            handlePermission('#username');
            showSucessPopupFadeInDownLong(responseData.message);
        } catch (error) {
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update staff. Please try again later.');
        }
    }
    
});

let decidedPermission;
document.addEventListener('DOMContentLoaded',async ()=>{
    roles = await axiosInstance.get('/roles/role/perms');
roles = roles.data.roles;
// console.log(roles);
window.roles = roles;
    decidedPermission=handlePermission('#username');
});

if(decidedPermission!==''){
    decidedPermission='editElement';
    // alert(decidedPermission)
}

let table;
function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
   
   if(!data){
    console.error('no data to add');
    return;
   }

    if(data.dateOfJoining){
        data.dateOfJoining=new Date(data.dateOfJoining).toLocaleDateString();
    }else{
        data.dateOfJoining='';
    }

    if(data.status){
        data.status=true;
    }else{
        data.status=false;
    }
    let statusText = (data.status === true || data.status === "true" || data.status === 1)
  ? "active"
  : "inactive";

table.row.add([
  data.employeeId,
  data.staffName,
  data.designation,
  data.department,
  data.contactNumber,
  data.workLocation,
  `
    <span class="d-none">${statusText}</span> <!-- hidden filter text -->
    <div class="container">
      <div class="toggle-btn ${decidedPermission} ${data.status===true?'active':''}" 
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
        <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
      </div>
    </div>
  `,
]).draw(false);

};

// edit btn
document.querySelector('#myTable').addEventListener('click', function (event) {
    if (event.target.closest('.edit-btn')) {
        let button = event.target.closest('.edit-btn');
        let staffID = button.getAttribute('data-staff-id');
        loadUpdateDetails(staffID);
        // loadDocumentTable(staffID);
        document.querySelector('#tabWrapper').classList.remove('d-none');
        document.querySelector('#tableCard').style.display = 'none';
    }
});

document.querySelector('#exitButton2').addEventListener('click', function () {
    document.querySelector('#tabWrapper').classList.add('d-none');
    document.querySelector('#tableCard').style.display = 'block';
});

// side bar 

document.addEventListener('DOMContentLoaded',async ()=>{
  roles = await axiosInstance.get("/roles/role/perms");
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
    await fetchAllData();

  handlePermission("#username");
});


// toggle status

async function toggleStatus(element, id) {

    console.log('Toggle status for ID:', id);
    if(element.classList.contains('editElement')) return;

    if (!id) return;

    try {
        const data=await api.toggleIITStaffStatus(id);
        showSucessPopupFadeInDownLong(data.message);
        if (element) {
            element.classList.toggle('active');
        }
    } catch (error) {
        showErrorPopupFadeInDown(error);
    }
}

// fetch all data
async function fetchAllData() {
    try {
        const staffs = await api.getAllStaff();
        console.log('staffDetails',staffs);

        staffs.forEach(staffs => {
            addRow(staffs);

        });

        handlePermission('#username');
        
                        
    } catch (error) {
        console.error("Error fetching staff details:", error);
    }
}


function limitLength(str, length) {
    if (str.length > length) {
        return str.substring(0, length);
    }
    return str;
};




function validateForm(formData) {
    let errors = [];

    const data=["employeeId","staffName","dateOfBirth","gender","contactNumber","personalEmail","emergencyContactName","permanentAddress","dateOfJoining","workLocation","department","designation","employmentType","reportingManager","highestQualification","specialization"];
    data.forEach(field=>{
        const value = formData.get(field)?.trim();
        if (!value) {
            errors.push(`${field} is required.`);
            showErrorPopupFadeInDown(`${field} is Required`);

        }
        if (field === "contactNumber" && !/^\d{10}$/.test(value)) {
            errors.push("Contact Number must be exactly 10 digits.");
            showErrorPopupFadeInDown('Invalid Contact Number format');


        }
        if (field === "personalEmail" && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        showErrorPopupFadeInDown('Invalid Email format');
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
        console.log("id",typeof(id));

        const response = await axiosInstance.get(API_ROUTES.getIITStaff(id));
        const data = response.data.staffs;

        console.log(data);
        console.log(data.staffName);

        console.log(document.getElementById('employeeId'));
    


document.querySelectorAll("#employeeId")[1].value = data.employeeId;
document.querySelectorAll("#staffName")[1].value = data.staffName;
document.querySelectorAll("#dateOfBirth")[1].value = formatDate(data.dob);
document.querySelectorAll("#gender")[1].value = data.gender;
document.querySelectorAll("#contactNumber")[1].value = Number(data.contactNumber);
document.querySelectorAll("#personalEmail")[1].value = data.personalEmail;
document.querySelectorAll("#emergencyContactName")[1].value = data.emergencyContactName;
document.querySelectorAll("#emergencyContactNumber")[1].value = Number(data.emergencyContactNumber);
document.querySelectorAll("#permanentAddress")[1].value = data.address;
document.querySelectorAll("#dateOfJoining")[1].value = formatDate(data.dateOfJoining);
document.querySelectorAll("#workLocation")[1].value = data.workLocation;
document.querySelectorAll("#department")[1].value = data.department;
document.querySelectorAll("#designation")[1].value = data.designation;
document.querySelectorAll("#employmentType")[1].value = data.employmentType;
document.querySelectorAll("#reportingManager")[1].value = data.reportingManager;
document.querySelectorAll("#highestQualification")[1].value = data.education;
document.querySelectorAll("#specialization")[1].value = data.specialization;
document.querySelectorAll("#previousCompany")[1].value = data.previousCompany;
document.querySelectorAll("#experience")[1].value = data.experience;
document.querySelectorAll("#portfolio")[1].value = data.linkedin;
document.querySelectorAll("#officeAssets")[1].value = data.assets;
document.querySelectorAll("#officialEmail")[1].value = data.officialEmail;



      
    } catch (error) {
        console.error(error);
    }
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
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
        if (!Array.isArray(res) || res.length === 0) throw new Error("No staff data available");

        const tableBody = [
            ["ID", "Name", "Date Of Birth", "Aadhar Number", "Contact Number", "Mail", "Permanent Address", "Salary At Joining", "Qualifications", "Highest Qualification", "Location Of Work", "Date of Joining", "Certifications", "Courses", "Current Salary", "Current Designation", "Status"],
            ...res.map(staff => [
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
                staff.status || "N/A"
            ])
        ];

        const docDefinition = {
            pageOrientation: "landscape", 
            content: [
                { text: "Staff Details", style: "header" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["5%", "5%", "10%", "10%", "10%", "5%", "5%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "15%", "10%"],
                        body: tableBody
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10]}
            },
            defaultStyle: {
                fontSize: 6 
            }
        };

        pdfMake.createPdf(docDefinition).download("Staff_List.html");
        
    } catch (err) {
        console.error("Error fetching or generating PDF:", err);
        showErrorPopupFadeInDown(err.message || "Can't download the staff details.");
    }
}

// generate excel
async function fetchDataAndGenerateExcel() {
    try {
        const res = await api.downloadIITStaffData();

        
        const headers = [
            "Employee ID", "Staff Name", "Date of Birth", "Gender", "Contact Number", "Personal Email",
            "Emergency Contact Name", "Emergency Contact Number", "Permanent Address", "Date of Joining",
            "Work Location", "Department", "Designation", "Employment Type",
            "Reporting Manager", "Highest Educational Qualification", "Specialization","Previous Company","Total Years of Experience","LinkedIn / GitHub / Portfolio Link","Office Assets","Official Email Address"
        ];

       
        const data = res.map(staff => [
            staff.employeeId, staff.staffName, new Date(staff.dob).toLocaleDateString('eng-GB'), staff.gender, 
            staff.contactNumber, staff.personalEmail, staff.address,new Date(staff.dateOfJoining).toLocaleDateString('eng-GB'), 
            staff.department, staff.designation, staff.employmentType, 
            , staff.reportingManager, staff.workLocation, staff.education, 
            staff.specialization, staff.previousCompany,staff.experience,staff.linkedin,staff.assets,staff.officialEmail,staff.emergencyContactName,staff.emergencyContactNumber,staff.status
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
        dom: '<"top"l>frtip',
        buttons: ['excel', 'csv', 'pdf'],

        columnDefs: [
            {
                targets: 6, // status column index
                render: function (data, type, row) {
                    if (type === 'filter' || type === 'search' || type === 'sort') {
                        // Only return plain text ("active"/"inactive")
                        return $(data).text().trim();
                    }
                    return data; // for display/export keep original HTML
                }
            }
        ]
    });

    // show raw column data (the HTML strings you added)
console.log( datatable.column(6).data().toArray() );

// show the actual table header indexes so you don't have the wrong column index
$('#myTable thead th').each(function(i){ console.log(i, $(this).text().trim()); });

    datatable.buttons().container().appendTo($('#exportButtons'));

    // Status filter
    $('#statusFilter').on('change', function () {
        const selectedStatus = $(this).val();
        datatable.column(6).search(
            selectedStatus ? '^' + selectedStatus + '$' : '',
            true,
            false
        ).draw();
    });
});


    // Designation filter
    $('#designationFilter').on('change', function () {
        const selectedDesignation = $(this).val();
        datatable.column(0).search(
            selectedDesignation ? '^' + selectedDesignation + '$' : '',
            true,
            false
        ).draw();
    });

    // Location filter
    $('#locationFilter').on('change', function () {
        const selectedLocation = $(this).val();
        datatable.column(5).search(
            selectedLocation ? '^' + selectedLocation + '$' : '',
            true,
            false
        ).draw();
    });

    $('#statusFilter').on('change', function () {
    const selectedStatus = $(this).val();
    datatable.column(6).search(
        selectedStatus ? '^' + selectedStatus + '$' : '',
        true,
        false
    ).draw();

    // Category filter (this was outside, now inside)
    $('#filter').on('change', function () {
        const selectedCategory = $(this).val();
        datatable.column(1).search(
            selectedCategory ? selectedCategory : ''
        ).draw();
    });
});

    document.querySelector('#addNew').addEventListener('click', function () {
        document.querySelector('#tab').classList.remove('d-none');
        document.querySelector('#tableCard').style.display = 'none';
        document.querySelector('#exitButton').addEventListener('click',function(){
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
        });
    });



