
document.getElementById('logout-button').addEventListener('click',logout);
function logout(){
    sessionStorage.removeItem('token');
}



const adddesktopButton = document.getElementById('desktop_assets_btn');
const updateAssetsButton = document.getElementById('update_assets_btn');


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
adddesktopButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Add Laptop Button Clicked');

    let form = document.getElementById('laptop-asset-form');
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
updateAssetsButton.addEventListener('click', async (e) => {
    
    e.preventDefault();
    let form = document.getElementById('update-asset-form');
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

    // if(data.dateOfJoining){
    //     data.dateOfJoining=new Date(data.dateOfJoining).toLocaleDateString();
    // }else{
    //     data.dateOfJoining='';
    // }

    if(data.status){
        data.status=true;
    }else{
        data.status=false;
    }

    table.row.add([
      data.slNo,
      data.assetId,
      data.category,
      data.vendorName,
      data.userName,
      data.dept,
        `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.assetId}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
    <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
        style="width: 40px; height: 40px; cursor:pointer" 
        data-assets-id="${data.assetId}">
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
        let assetsID = button.getAttribute('data-assets-id');
        loadUpdateDetails(assetsID);
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

    await fetchAllData();
    
    handlePermission('#username');
});


// toggle status

async function toggleStatus(element, id) {

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
    }s
}

// fetch all data
async function fetchAllData() {
    try {
        const assets = await api.getAllAssets();
        console.log('assetsDetails',assets);

        assets.forEach(assets => {
            addRow(assets);

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

    const data=["Asset_ID","Category","Model_No","Serial_No","Processor_Type","RAM_GB","Storage_GB_TB","Graphics","OS_Type","Host_Name","IP_Address","MAC_Address","Port","Remark_Config","Project_No","PO_No","PO_Date","Vendor_Name","Invoice_No","Invoice_Date","SRB_No","User_Name","Dept","Remarks"];
    data.forEach(field=>{
        const value = formData.get(field)?.trim();
        if (!value) {
            errors.push(`${field} is required.`);
            showErrorPopupFadeInDown(`${field} is Required`);

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

        const response = await axiosInstance.get(API_ROUTES.getAssets(id));
        const data = response.data.assets;

        console.log(data);
        console.log(data.processorType);

        console.log(document.getElementById('assetId'));
    


document.querySelectorAll("#assetId")[0].value = data.assetId;
document.querySelectorAll("#category")[1].value = data.category;
document.querySelectorAll("#modelNo")[1].value = data.modelNo;
document.querySelectorAll("#serialNo")[1].value = data.serialNo;
document.querySelectorAll("#processorType")[1].value = data.processorType;
document.querySelectorAll("#ramGb")[1].value = Number(data.ramGb);
document.querySelectorAll("#storage")[1].value = data.storage;
document.querySelectorAll("#graphics")[1].value = data.graphics;
document.querySelectorAll("#osType")[1].value = data.osType;
document.querySelectorAll("#hostName")[1].value = data.hostName;
document.querySelectorAll("#ipAddress")[1].value = data.ipAddress;
document.querySelectorAll("#macAddress")[1].value = data.macAddress;
document.querySelectorAll("#port")[1].value = data.port;
document.querySelectorAll("#remarkConfig")[1].value = data.remarkConfig;
document.querySelectorAll("#projectNo")[1].value = data.projectNo;
document.querySelectorAll("#poNo")[1].value = data.poNo;
document.querySelectorAll("#poDate")[1].value = formatDate(data.poDate);
document.querySelectorAll("#vendorName")[1].value = data.vendorName;
document.querySelectorAll("#invoiceNo")[1].value = data.invoiceNo;
document.querySelectorAll("#invoiceDate")[1].value = formatDate(data.invoiceDate);
document.querySelectorAll("#srbNo")[1].value = data.srbNo;
// document.querySelectorAll("#userName")[1].value = data.userName;
document.querySelectorAll("#dept")[1].value = data.dept;
document.querySelectorAll("#remarks")[1].value = data.remarks;





      
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

    function toggleAccordion(button) {
        const content = button.parentElement.nextElementSibling;
        content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
        const icon = button.querySelector("i");
        icon.classList.toggle("fa-chevron-down");
        icon.classList.toggle("fa-chevron-up");
    }
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
  // Load all staff and populate dropdown
  api.getstaffid()
    .then(staffList => {
      staffList.forEach(staff => {
        $('.userName').append(
          $('<option>', { value: staff.id, text: `${staff.id}-${staff.name} ` })
        );
      });

      // Initialize Select2 after options are added
      $('.userName').select2({
        placeholder: 'Select Staff ID',
        allowClear: true
      });
    })
    .catch(error => {
      console.error('Error loading staff:', error);
    });
});
