
const updateInternButton = document.getElementById('update_intern_btn');
// add staff 

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
let internId;
function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable1' ) ) {
        table = $('#myTable1').DataTable();
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
      data.Id,
      data.FullName,
      data.DateOfBirth,
      data.MobileNumber,
      data.Email,
      data.CollegeName,
      data.DegreeProgram,
        `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.Id}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
    <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
        style="width: 40px; height: 40px; cursor:pointer" 
        data-intern="${data.Id}">
        <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
    </div>
</div>
`,
        
    ]).draw(false);
};

// edit btn
document.querySelector('#myTable1').addEventListener('click', function (event) {
    if (event.target.closest('.edit-btn')) {
        let button = event.target.closest('.edit-btn');
        Id = button.getAttribute('data-inter-id');  
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

    if(element.classList.contains('editElement')) return;

    if (!id) return;

    try {
        const data=await api.toggleInternStatus(id);
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
        const intern = await api.getAllIntern();
        console.log('intern',intern);


        intern.forEach(e=>{addRow(e)});


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

    const data = ["fullName","dateOfBirth","gender","mobileNumber","currentLocation","email","portfolioLink","emergencyContactName","emergencyContactRelationship","emergencyContactNumber","collegeName","degreeProgram","isPartOfCurriculum","facultySupervisor","preferredStartDate","preferredEndDate","internshipMode","howHeardAboutUs","submissionDate",];

    console.log(formData.get("fullName")?.trim());
    data.forEach(field =>{
        console.log(field);
        const value=formData.get(field)?.trim();



        if(!value){
            errors.push(`${field} is Required`);
            showErrorPopupFadeInDown(`${field} is Required`);
        }
        if (field == "contactNumber" && !/^\d{10}$/.test(contactNumber)) {
        errors.push("Contact Number must be exactly 10 digits.");
       }

  
    if (field == "aadharNumber" && !/^\d{12}$/.test(aadharNumber)) {
        showErrorPopupFadeInDown('Aadhar Number must be exactly 12 digits.');
        errors.push("Aadhar Number must be exactly 12 digits.");
    }

    
    if (field == "mail" && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail)) {
        showErrorPopupFadeInDown('Invalid Email format');
        errors.push("Invalid email format.");
    }

    })
  
    if (errors.length > 0) {
        console.log("Form validation failed:", errors);
        return false;
    }

    return true;
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

// edit btn
$(document).on('click', '.edit-btn', function () {
    let Id = $(this).data('intern');   
    console.log("edit", Id)
    loadInternUpdateDetails(Id);
});

//generate pdf



async function loadInternUpdateDetails(Id) {
   
    try {
        // Assume API_ROUTES.getIntern(id) exists and fetches intern-specific data
        const response = await api.getInterById(Id);
        const data = response; // Assuming the intern details are directly in response.data

        console.log("data",data);
        
     
        // Populate the form fields based on the intern data and your HTML IDs
        document.getElementById('fullName1').value = data.FullName || '';
        document.getElementById('dateOfBirth1').value = data.DateOfBirth ? formatDate(data.DateOfBirth) : '';
        document.getElementById('gender1').value = data.Gender || '';
        document.getElementById('mobileNumber1').value = data.MobileNumber || '';
        document.getElementById('currentLocation1').value = data.CurrentLocation || '';
        document.getElementById('email1').value = data.Email || '';
        document.getElementById('portfolioLink1').value = data.PortfolioLink || '';
        document.getElementById('emergencyContactName1').value = data.EmergencyContactName || '';
        document.getElementById('emergencyContactRelationship1').value = data.EmergencyContactRelationship || '';
        document.getElementById('emergencyContactNumber1').value = data.EmergencyContactNumber || '';
        document.getElementById('collegeName1').value = data.CollegeName || '';
        document.getElementById('degreeProgram1').value = data.DegreeProgram || '';
        document.getElementById('isPartOfCurriculum1').value = data.IsPartOfCurriculum?"Yes":"No" || '';
        document.getElementById('facultySupervisor1').value = data.FacultySupervisor || '';
        document.getElementById('preferredStartDate1').value = data.PreferredStartDate ? formatDate(data.PreferredStartDate) : '';
        document.getElementById('preferredEndDate1').value = data.PreferredEndDate ? formatDate(data.PreferredEndDate) : '';
        document.getElementById('StartDate').value = data.StartDate ? formatDate(data.StartDate) : '';
        document.getElementById('EndDate').value = data.EndDate? formatDate(data.StartDate) : '';
        document.getElementById('internshipMode1').value = data.InternshipMode || '';
        document.getElementById('howHeardAboutUs1').value = data.HowHeardAboutUs || '';
        document.getElementById('submissionDate1').value = data.SubmissionDate ? formatDate(data.SubmissionDate) : '';
        // Store ID = 1
        document.getElementById('id1').value=Id || '';


       
        updateInternDocumentButtons(Id); // Call a function to update document-related buttons/links

     

    } catch (error) {
        console.error("Error loading intern details:", error);
       
    }
}




async function updateInternDocumentButtons(internId) {
    try {
        console.log("Loading document table for Intern ID:", internId);

        // 1. API call -> only metadata (not full binary)
        const res = await axiosInstance.get(API_ROUTES.getInternDocumentsMetadata(internId));
        const documents = res.data; 
        // Expected format: [{ name: "BonafideFileData", exists: true }, ...]

        console.log("documents", documents);

        // 2. Target tbody
        const documentTableBody = document.getElementById("documentTableBody");
        let rowsHTML = "";

        // 3. Loop through docs
        documents.forEach(doc => {
            let actionHTML = "";

            if (doc.exists) {
                // Download + Delete buttons
                actionHTML = `
                    <button onclick="downloadDocument('${internId}', '${doc.name}')" 
                            class="btn btn-sm btn-primary me-2">Download</button>
                    <button onclick="deleteDocument('${internId}', '${doc.name}')" 
                            class="btn btn-sm btn-danger">Delete</button>
                `;
            } else {
                // Upload button
                actionHTML = `
                    <label class="btn btn-sm btn-success mb-0">
                        Upload
                        <input type="file" style="display:none" 
                               onchange="uploadDocument('${internId}', '${doc.name}', this.files[0])">
                    </label>
                `;
            }

            // Build row
            rowsHTML += `
                <tr>
                    <td>${doc.name}</td>
                    <td>${actionHTML}</td>
                </tr>
            `;
        });

        // 4. Inject into table body
        documentTableBody.innerHTML = rowsHTML;

    } catch (error) {
        console.error("Error loading documents:", error);
    }
}


// Download document (binary to blob)
async function downloadDocument(internId, docName) {
    try {
        const res = await axiosInstance.get(API_ROUTES.downloadInternDocument(internId, docName), {
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
        updateInternDocumentButtons(internId);

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
async function deleteDocument(internId, docName) {
    if (!(await showDeleteMessage(`Delete ${docName}?`))) return;

    try {
        await axiosInstance.delete(API_ROUTES.deleteInternDocument(internId, docName));

        // Success message
        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${docName} deleted successfully`,
            timer: 2000,
            showConfirmButton: false
        });

        updateInternDocumentButtons(internId);
    } catch (error) {
        console.error("Error deleting document:", error);
    }
}
// Upload document
async function uploadDocument(internId, docName, file) {
    console.log("Uploading document:", docName);
    const formData = new FormData();
    formData.append("file", file);

    try {
        await axiosInstance.post(API_ROUTES.uploadInternDocument(internId, docName), formData);

        // SweetAlert2 success message
        Swal.fire({
            icon: 'success',
            title: 'Uploaded!',
            text: `${docName} uploaded successfully`,
            timer: 2000,
            showConfirmButton: false
        });

        updateInternDocumentButtons(internId);
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










updateInternButton.addEventListener('click', async (e) =>{
    console.log("enter");
    e.preventDefault();
    let form = document.getElementById('update-intern-form');



    let formData = new FormData(form);
   

    let Data = Object.fromEntries(formData.entries());

    console.log("intern",Data);

    if (validateForm(formData)) {
        try {
            const responseData=await api.updateIntern(Data.id,Data);
            table.clear();
            await fetchAllData();
            handlePermission('#username');
            showSucessPopupFadeInDownLong(responseData.message);
        } catch (error) {
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add staff. Please try again later.');
        }
    }
    
    const payload = new FormData();
    
     documentFormData.forEach((value, key) => {
        if (value instanceof File && value.name !== '') {
            payload.append(key, value);
        }a
    });
})


    
        $(document).ready(function () {
            const datatable = $('#myTable1').DataTable({
                "paging": true,
                "pageLength": 25,
                "lengthMenu": [5, 10, 25, 50, 100],
                dom: '<"top"l>frtip',
                buttons: ['excel', 'csv', 'pdf']
            });

            datatable.buttons().container().appendTo($('#exportButtons'));



            $('#designationFilter').on('change', function () {
                const selectedDesignation = $(this).val();
                datatable.column(5).search(selectedDesignation ? '^' + selectedDesignation + '$' : '', true, false).draw();
            });

            $('#locationFilter').on('change', function () {
                const selectedLocation = $(this).val();
                datatable.column(2).search(selectedLocation ? '^' + selectedLocation + '$' : '', true, false).draw();
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
            document.querySelector('#exitButton').addEventListener('click', function () {
                document.querySelector('#tab').classList.add('d-none');
                document.querySelector('#tableCard').style.display = 'block';
            });
        });

        // JavaScript to show/hide "Other Gender" input
        document.getElementById('gender1').addEventListener('change', function () {
            var otherGenderField = document.getElementById('otherGenderField1');
            if (this.value === 'other') {
                otherGenderField.style.display = 'block';
            } else {
                otherGenderField.style.display = 'none';
            }
        });
                document.getElementById('gender').addEventListener('change', function () {
            var otherGenderField = document.getElementById('otherGenderField');
            if (this.value === 'Other') {
                otherGenderField.style.display = 'block';
            } else {
                otherGenderField.style.display = 'none';
            }
        });

        // Set submission date to today's date automatically
        document.addEventListener('DOMContentLoaded', function () {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            document.getElementById('submissionDate').value = today;
        });
    

