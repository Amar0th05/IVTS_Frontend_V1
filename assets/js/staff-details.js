
document.getElementById('logout-button').addEventListener('click',logout);
function logout(){
    sessionStorage.removeItem('token');
}


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

addStaffButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Add Staff Button Clicked');

    let form = document.getElementById('new-staff-form');
    let insuranceForm = document.getElementById('new-insurance-form');
    let documentForm = document.getElementById('new-Document-form');

    let formData = new FormData(form);
    let insuranceFormData = new FormData(insuranceForm);
    let documentFormData = new FormData(documentForm);

    const data = {};
    const intFields = ["courses", "locationOfWork", "highestQualification"];
    const numericFields = ["aadharNumber", "contactNumber"];

    formData.forEach((value, key) => {
        value = value.trim?.() || value;
        if (value === "") {
            data[key] = null;
        } else if (intFields.includes(key)) {
            data[key] = parseInt(value, 10);
        } else if (numericFields.includes(key)) {
            data[key] = Number(value);
        } else {
            data[key] = value;
        }
    });

    data['status'] = true;
    const insuranceData = Object.fromEntries(insuranceFormData.entries());

    const payload = new FormData();
    payload.append('data', JSON.stringify(data));
    payload.append('insuranceData', JSON.stringify(insuranceData));
    console.log("documentFormData",documentFormData);
    // Append all file inputs
    documentFormData.forEach((value, key) => {
        if (value instanceof File && value.name !== '') {
            payload.append(key, value);
        }
    });

// other certificates handling
const nameInputs = document.querySelectorAll('input[name="otherCertName"]');
const fileInputs = document.querySelectorAll('input[name="otherCertFile"]');

fileInputs.forEach((fileInput, index) => {
    const file = fileInput.files[0];
    console.log('File:', file);
    const name = nameInputs[index]?.value?.trim();

    if (file && name) {
        // 👇 remove the brackets
        payload.append('otherCertFile', file);
        payload.append('otherCertName', name);
    }
});



    if (validateForm(formData)) {
        try {
            console.log('Submitting Payload...');
            const response = await axiosInstance.post(API_ROUTES.staff, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

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


updateStaffButton.addEventListener('click', async (e) => {
    
    e.preventDefault();
    let form = document.getElementById('update-staff-form');
    let formData = new FormData(form);

    const data={};
    
    const intFields = ["courses", "locationOfWork", "highestQualification"];
    const numericFields = ["aadharNumber", "contactNumber"];

    formData.forEach((value, key) => {
        value = value.trim(); 
    
        if (value === "") {
            data[key] = null; 
            return;
        }
    
        if (intFields.includes(key)) {
            data[key] = parseInt(value, 10);
        } else if (numericFields.includes(key)) {
            data[key] = Number(value);
        } else {
            data[key] = value;
        }
    });
    data['status']=true;

    if (validateForm(formData)) {
        try {
            const responseData=await api.updateStaff(data);
            table.clear();
            await fetchAllData();
            handlePermission('#username');
            showSucessPopupFadeInDownLong(responseData.message);
        } catch (error) {
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add staff. Please try again later.');
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

    table.row.add([
      data.staffID,
      data.staffName,
      data.locationOfWork,
      data.dateOfJoining,
      data.currentSalary,
      data.currentDesignation,
        `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.staffID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
    <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
        style="width: 40px; height: 40px; cursor:pointer" 
        data-staff-id="${data.staffID}">
        <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
    </div>
</div>
`,
        
    ]).draw(false);
};

document.querySelector('#myTable').addEventListener('click', function (event) {
    if (event.target.closest('.edit-btn')) {
        let button = event.target.closest('.edit-btn');
        let staffID = button.getAttribute('data-staff-id');
        loadUpdateDetails(staffID);
        loadDocumentTable(staffID);
        document.querySelector('#tabWrapper').classList.remove('d-none');
        document.querySelector('#tableCard').style.display = 'none';
    }
});

document.querySelector('#exitButton2').addEventListener('click', function () {
    document.querySelector('#tabWrapper').classList.add('d-none');
    document.querySelector('#tableCard').style.display = 'block';
});


document.addEventListener('DOMContentLoaded',async ()=>{

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#username');


    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = generateSidebar();
        
       
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const navLinks = document.querySelectorAll('.pcoded-item a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.parentElement.classList.add('active');
                
            
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
    // } else if (user.role === 2) {
    //     window.location.href = 'user-details.html';
    // }

    // document.querySelector('#username').textContent = user.name;
    

    await loadCourseOptions('courseSelect');
    await loadOrganisationOptions("locationSelect");
    await loadHighestQualificationsOptions("highestQualificationSelect");
    await fetchAllData();
    
    handlePermission('#username');
});




async function toggleStatus(element, id) {

    if(element.classList.contains('editElement')) return;

    if (!id) return;

    try {
        const data=await api.toggleStaffStatus(id);
        // showSucessPopupFadeInDownLong(data.message);

        if (element) {
            element.classList.toggle('active');
        }
    } catch (error) {
        showErrorPopupFadeInDown(error);
    }
}


async function fetchAllData() {
    try {
        const staffDetails = await api.getAllStaffs();
        const designations = new Set();
        const locations = new Set();

        staffDetails.forEach(staffDetail => {
            addRow(staffDetail);

            designations.add(staffDetail.currentDesignation);
            locations.add(staffDetail.locationOfWork);
        });

        handlePermission('#username');
            

            designations.forEach(designation => {
            if(!designation) return;
            $('#designationFilter').append(`<option value="${designation}">${designation}</option>`);
        });
        


        
        locations.forEach(location => {
            if(!location) return;
            $('#locationFilter').append(`<option value="${location}">${location}</option>`);
        });

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

// document.querySelector('.reload-card').addEventListener('click', async () => {
//     table.clear();
//     await fetchAllData();
// });


function validateForm(formData) {
    let errors = [];

    
    const staffID = formData.get('staffID')?.trim();
    const contactNumber = formData.get('contactNumber')?.trim();
    const aadharNumber = formData.get('aadharNumber')?.trim();
    const mail = formData.get('mail')?.trim();
    const locationOfWork = formData.get('locationOfWork')?.trim();
    

  
    if (!staffID){
        showErrorPopupFadeInDown('Staff ID is required.');
        errors.push("Staff ID is required.");
    }

    if (!locationOfWork) {
        showErrorPopupFadeInDown('Location of Work is required.');
        errors.push("Location of Work is required.");
    }
    

   
    if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
        showErrorPopupFadeInDown('Contact Number must be exactly 10 digits.');
        errors.push("Contact Number must be exactly 10 digits.");
    }

  
    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
        showErrorPopupFadeInDown('Aadhar Number must be exactly 12 digits.');
        errors.push("Aadhar Number must be exactly 12 digits.");
    }

    
    if (mail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail)) {
        showErrorPopupFadeInDown('Invalid Email format');
        errors.push("Invalid email format.");
    }

    
    if (errors.length > 0) {
        return false;
    }


    return true;
}

async function loadUpdateDetails(id) {
    await loadCourseOptions('update-courseSelect');
    await loadHighestQualificationsOptions('update-highestQualification');
    await loadOrganisationOptions('update-location');

    try {
        const response = await axiosInstance.get(API_ROUTES.getStaff(id));
        const data = response.data.staffDetail;
        const insurance = response.data.insuranceDetail;

        document.getElementById('update-staffId').value = data.staffID;
        document.getElementById('update-staffName').value = data.staffName;
        document.getElementById('update-contactNumber').value = data.contactNumber;
        document.getElementById('update-aadharNumber').value = data.aadharNumber;
        document.getElementById('update-mail').value = data.mail;
        document.getElementById('update-dateOfBirth').value = formatDate(data.dateOfBirth);
        document.getElementById('update-location').value = data.locationOfWork;
        document.getElementById('update-highestQualification').value = data.highestQualification;
        document.getElementById('update-qualifications').value = data.qualifications;
        document.getElementById('update-courseSelect').value = data.courses;
        document.getElementById('update-dateOfJoining').value = formatDate(data.dateOfJoining);
        document.getElementById('update-certifications').value = data.certifications;
        document.getElementById('update-salary').value = data.salary ? parseFloat(data.salary) : '';
        document.getElementById('update-permanentAddress').value = data.permanentAddress;

       
        let table = $('#policyTable').DataTable();
        table.clear().draw();

        if (insurance) {
            insurance.forEach(ins=>{
                table.row.add([
                    formatDate(ins.policyStartDate),
                    ins.policyNumber || 'N/A',
                    ins.insuranceProvider || 'N/A',
                    formatDate(ins.policyStartDate),
                    formatDate(ins.policyExpiryDate),
                    ins.updatedBy || '-',
                ]).draw(false);
            });
            
        }
    } catch (error) {
        console.error(error);
    }
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}


$(document).on('click', '.edit-btn', function () {
    let staffId = $(this).data('staff-id');
    loadUpdateDetails(staffId);

});

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

async function fetchDataAndGenerateExcel() {
    try {
        const res = await api.downloadStaffData();

        
        const headers = [
            "ID", "Name", "Date Of Birth", "Aadhar Number", "Contact Number", "Mail",
            "Permanent Address", "Salary At Joining", "Qualifications", "Highest Qualification",
            "Location Of Work", "Date of Joining", "Certifications", "Courses",
            "Current Salary", "Current Designation", "Status"
        ];

       
        const data = res.map(staff => [
            staff.staffID, staff.staffName, new Date(staff.dateOfBirth).toLocaleDateString('eng-GB'), staff.aadharNumber, 
            staff.contactNumber, staff.email, staff.permanentAddress, staff.salaryAtJoining, 
            staff.qualification, staff.highestQualification, staff.locationOfWork, 
            new Date(staff.dateOfJoining).toLocaleDateString('eng-GB')
            , staff.certifications, staff.course, staff.currentSalary, 
            staff.currentDesignation, staff.status
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

async function loadDocumentTable(staffId) {
    try {
        console.log("Loading document table for staff ID:", staffId);
        // Fetch metadata only (no full binary for all files)
        const res = await axiosInstance.get(API_ROUTES.getStaffDocumentsMetadata(staffId));
        const documents = res.data; // [{ name: "AadhaarFile", exists: true }, ...]
        console.log("documents",    documents);

        const documentTableBody = document.getElementById("documentTableBody");
        let rowsHTML = "";

        documents.forEach(doc => {
            let actionHTML = "";

            if (doc.exists) {
                // Download + Delete
                actionHTML = `
                    <button onclick="downloadDocument('${staffId}', '${doc.name}')" class="btn btn-sm btn-primary">Download</button>
                    <button onclick="deleteDocument('${staffId}', '${doc.name}')" class="btn btn-sm btn-danger">Delete</button>
                `;
            } else {
                // Upload
                actionHTML = `        <label class="btn btn-sm btn-success mb-0">
            Upload
            <input type="file" style="display:none" 
                   onchange="uploadDocument('${staffId}', '${doc.name}', this.files[0])">
        </label>
    `;
            }

            rowsHTML += `
                <tr>
                    <td>${doc.name}</td>
                    <td>${actionHTML}</td>
                </tr>
            `;
        });

        documentTableBody.innerHTML = rowsHTML;

    } catch (error) {
        console.error("Error loading documents:", error);
    }
}

// Download document (binary to blob)
async function downloadDocument(staffId, docName) {
    try {
        const res = await axiosInstance.get(API_ROUTES.downloadDocument(staffId, docName), {
            responseType: 'blob'
        });

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${docName}.pdf`; // always save with .pdf extension
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

        // SweetAlert2 success popup
        Swal.fire({
            icon: 'success',
            title: 'Download Complete',
            text: `${docName} has been downloaded successfully.`,
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error downloading document:", error);

        // SweetAlert2 error popup
        Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            text: `Could not download ${docName}. Please try again.`,
        });
    }
}


// Delete document
async function deleteDocument(staffId, docName) {
    if (!(await showDeleteMessage(`Delete ${docName}?`))) return;

    try {
        await axiosInstance.delete(API_ROUTES.deleteDocument(staffId, docName));

        // Success message
        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${docName} deleted successfully`,
            timer: 2000,
            showConfirmButton: false
        });

        loadDocumentTable(staffId);
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}
// Upload document
async function uploadDocument(staffId, docName, file) {
    console.log("Uploading document:", docName);
    const formData = new FormData();
    formData.append("file", file);

    try {
        await axiosInstance.post(API_ROUTES.uploadDocument(staffId, docName), formData);

        // SweetAlert2 success message
        Swal.fire({
            icon: 'success',
            title: 'Uploaded!',
            text: `${docName} uploaded successfully`,
            timer: 2000,
            showConfirmButton: false
        });

        loadDocumentTable(staffId);
    } catch (error) {
        console.error("Error uploading document:", error);

        // SweetAlert2 error message
        Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: `Could not upload ${docName}. Please try again.`,
        });
    }
}



// add more btn dynamic
document.getElementById('addMoreBtn').addEventListener('click', function () {
    let container = document.getElementById('other-certificates');

    let newRow = document.createElement('div');
    newRow.classList.add('row', 'g-1', 'align-items-center', 'mb-3', 'other-cert-row');

    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control" name="otherCertName[]" placeholder="Certification Name">
        </div>
        <div class="col-md-6">
            <input type="file" class="form-control" name="otherCertFile" required>
        </div>
        <div class="col-md-2 text-center">
        
            <button type="button" class="btn btn-danger rounded remove-other-cert">
                <i class="ti-minus"></i> Remove
            </button>
        </div>
    `;

    container.appendChild(newRow);
});

// Event delegation for remove buttons
document.getElementById('other-certificates').addEventListener('click', function (e) {
    if (e.target.closest('.remove-other-cert')) {
        e.target.closest('.other-cert-row').remove();
    }
});


// Event delegation for remove buttons
document.getElementById('other-certificates').addEventListener('click', function (e) {
    if (e.target.closest('.remove-other-cert')) {
        e.target.closest('.other-cert-row').remove();
    }
});

