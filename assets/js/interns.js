
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

const storedUser = JSON.parse(sessionStorage.getItem('user'));
document.getElementById("username").textContent = storedUser.name;

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
                    await refreshTable();

    } catch (error) {
        showErrorPopupFadeInDown(error);
    }
}

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable1')) {
        table = $('#myTable1').DataTable();
        table.clear();
    }

    await fetchAllData();
}


// fetch all data
async function fetchAllData() {
    try {
        const interns = await api.getAllIntern();
        console.log('intern', interns);

        // Clear and populate DataTable if needed
        if ($.fn.dataTable.isDataTable('#myTable1')) {
            const table = $('#myTable1').DataTable();
            table.clear().draw();
        }

        // Add each intern as a row
        interns.forEach(e => addRow(e));

        // ✅ Count interns correctly
        const totalInterns = interns.length;
        const currentInterns = interns.filter(i => Number(i.status) === 1).length;
        const completedInterns = interns.filter(i => Number(i.status) === 0).length;

        // ✅ Update the HTML cards
        document.getElementById("totalInternCount").innerText = totalInterns;
        document.getElementById("currentInternCount").innerText = currentInterns;
        document.getElementById("completedInternCount").innerText = completedInterns;

        handlePermission('#username');

    } catch (error) {
        console.error("Error fetching intern details:", error);
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

    const data = ["fullName","dateOfBirth","gender","mobileNumber","currentLocation","email","portfolioLink","emergencyContactName","emergencyContactRelationship","emergencyContactNumber","collegeName","degreeProgram","isPartOfCurriculum","facultySupervisor","preferredStartDate","preferredEndDate","internshipMode","howHeardAboutUs","submissionDate1",];

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

        console.log("datanew",data);
        
     
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
        document.getElementById('EndDate').value = data.EndDate? formatDate(data.EndDate) : '';
        document.getElementById('internshipMode1').value = data.InternshipMode || '';
        document.getElementById('howHeardAboutUs1').value = data.HowHeardAboutUs || '';
        document.getElementById('submissionDate1').value = data.SubmissionDate ? formatDate(data.SubmissionDate) : '';
        document.getElementById('reportingManager').value = data.Reporting_Manager || '';

        // Store ID = 1
        document.getElementById('id1').value=Id || '';


       
        updateInternDocumentButtons(Id); // Call a function to update document-related buttons/links
        updateInternCertificateButtons(data);

     

    } catch (error) {
        console.error("Error loading intern details:", error);
       
    }
}
function formatDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}
function downloadCertificate(FullName,StartDate,EndDate) {
  

  if (!FullName && !StartDate && !EndDate) {
    console.error("❌ No data provided to downloadCertificate()");
    return;
  }
const  refNo = "NTCPWC/INT/009"
  // ✅ Safely format issueDate
  const issueDate = new Date()
    .toLocaleDateString("en-GB")
    ?.replace(/\//g, "-") || "";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Internship Certificate</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:'Times New Roman', Times, serif; line-height:1.6; color:#333; margin:0; padding:0; background-color:#f8f8f8; display:flex; justify-content:center; align-items:center; min-height:100vh;">
  <div style="width:210mm; min-height:240mm; background-color:#fff; border:1px solid #eee; box-shadow:0 0 10px rgba(0,0,0,0.1); padding:20mm 15mm 10mm 15mm; box-sizing:border-box; position:relative;">

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
      <div style="flex-grow:1;">
        <p style="margin:0; font-size:12px; font-weight:bold; margin-bottom:5px; color:#3f51b5;">
          National Technology Centre for Ports, Waterways and Coasts<br>(NTCPWC)
        </p>
        <p style="margin:0; font-size:12px; color:#555;">
          Indian Institute of Technology Madras, Chennai, India
        </p>
        <p style="font-size:12px;margin-top:15px;font-weight:normal;">
          <strong>M.J. Muthukumar, Principal Project Officer</strong>
        </p>
      </div>
      <div style="display:flex; gap:10px; align-items:flex-start;">
        <img src="./All Logo.png" alt="Sagar Mala Logo" style="height:50px; width:auto; object-fit:contain;" />
      </div>
    </div>

    <!-- Ref No & Date -->
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:15px; margin-bottom:40px; font-size:12px;">
      <div style="font-weight:bold;">${refNo}</div>
      <div style="white-space:nowrap;">${issueDate}</div>
    </div>

    <!-- Title -->
    <div style="text-align:center; font-size:12px; font-weight:bold; margin-bottom:20px;">
      TO WHOM IT MAY CONCERN
    </div>

    <!-- Content -->
    <div>
      <p style="margin-bottom:1em; text-align:justify; font-size:12px;">
        This is to certify that <span style="font-weight:bold; color:#000;">${FullName}</span> has successfully completed
        his/her internship at NTCPWC, IIT Madras from <b>${formatDate(StartDate)}</b> to <b>${formatDate(EndDate)}</b>.
      </p>

      <p style="margin-bottom:1em; text-align:justify; font-size:12px;">
        During his/her internship, he/she demonstrated exceptional enthusiasm and professionalism in all assigned tasks and a proactive approach to problem-solving.
      </p>

      <p style="margin-bottom:1em; text-align:justify; font-size:12px;">
        His/Her ability to adapt quickly, collaborate effectively with the team, and maintain a consistent work ethic was commendable. He/She delivered high-quality work within timelines and showed a keen interest in learning and contributing beyond the assigned scope.
      </p>

      <p style="margin-bottom:1em; text-align:justify; font-size:12px;">
        We wish him/her the very best for his/her future academic and professional endeavors.
      </p>
    </div>

    <!-- Signature -->
    <div style="margin-top:40px; display:flex; flex-direction:column; align-items:flex-start; font-size:12px;">
      <p style="margin:0 0 20px 0;">Sincerely,</p>
      <p style="margin:0;">For National Technology Centre for Ports Waterways and Coasts</p>
      <p style="margin:10px 0 0 0; font-weight:bold;">M.J.Muthukumar</p>
      <p style="margin:0; font-size:12px; font-weight:normal;">(Principal Project Officer)</p>
    </div>

    <!-- Footer -->
    <div style="position:absolute;bottom:20mm;left:20mm;right:20mm;padding-top:6px;font-size:12px;text-align:left;">
      <p style="margin:0;line-height:1.4;text-align:center;">
        <strong>Tel: 091-44-22578918; Mobile: +91-9080056974</strong>
      </p>
      <p style="margin:0;line-height:1.4;text-align:center;">
        <strong>
          E-mail: <a href="mailto:jmutu86@ntcpwc.iitm.ac.in">jmutu86@ntcpwc.iitm.ac.in</a>; 
          Web: <a href="http://www.ntcpwc.iitm.ac.in">www.ntcpwc.iitm.ac.in</a>
        </strong>
      </p>
    </div>
  </div>
</body>
</html>`;

  // 🧾 Convert to Blob and trigger download
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${FullName || "Intern"}_Certificate.html`;
  link.click();
  URL.revokeObjectURL(url);
}

// intern completion certificate
async function updateInternCertificateButtons(data) {
  try {
    const documentTableBody = document.getElementById("Certificatebody");
    let rowsHTML = "";

    // ✅ Pass data.FullName safely as a string
 let actionHTML = `
  <button onclick="downloadCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}')" 
          class="btn btn-sm btn-primary me-2">
    Download
  </button>
`;


    rowsHTML += `
      <tr>
        <td>Certificate</td>
        <td>${actionHTML}</td>
      </tr>
    `;

    documentTableBody.innerHTML = rowsHTML;
  } catch (error) {
    console.error("Error loading documents:", error);
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
          actionHTML = `
            <button onclick="handleAction(this, () => downloadDocument('${internId}', '${doc.name}'))" 
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
              <i class="fa-solid fa-download me-1"></i> Download
            </button>
            <button onclick="handleAction(this, () => deleteDocument('${internId}', '${doc.name}'))" 
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #EF4444, #B91C1C); border:none;">
              <i class="fa-solid fa-trash me-1"></i> Delete
            </button>
        `;
      } else {
        // ✅ Upload with gradient
        actionHTML = `
          <label class="btn btn-sm text-white mb-0" 
                 style="background:linear-gradient(to bottom right, #34D399, #059669); border:none; cursor:pointer; color:white !important; fontsize:0px !important;">
            <i class="fa-solid fa-upload me-1"></i> Upload
            <input type="file" style="display:none" 
                   onchange="handleAction(this.parentElement, () => uploadDocument('${internId}', '${doc.name}', this.files[0]))">
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
function handleAction(btn, actionFn) {
  let originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Processing...`;

  // Run the async action
  Promise.resolve(actionFn())
    .then(() => {
      // ✅ Success: restore button
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    })
    .catch(err => {
      console.error("Action failed:", err);
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      alert("Something went wrong, please try again.");
    });
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

updateInternButton.addEventListener('click', async (e) => {
    console.log("enter");
    e.preventDefault();

    let form = document.getElementById('update-intern-form');
    let formData = new FormData(form);

    let Data = Object.fromEntries(formData.entries());

    // ✅ Fix: convert empty strings to null for SQL Date columns
    ["StartDate", "EndDate"].forEach(field => {
        if (Data[field] === "") {
            Data[field] = null;
        }
    });

    console.log("intern", Data);

    if (validateForm(formData)) {
        try {
            const responseData = await api.updateIntern(Data.id, Data);
            table.clear();
            await fetchAllData();
            handlePermission('#username');
            showSucessPopupFadeInDownLong(responseData.message);
            setTimeout(()=>{
              location.reload();
            },1000);
        } catch (error) {
            showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add staff. Please try again later.');
        }
    }

    const payload = new FormData();
    documentFormData.forEach((value, key) => {
        if (value instanceof File && value.name !== '') {
            payload.append(key, value);
        }
    });
});

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



$(document).ready(function () {
    console.log("enter");
  // Load all staff and populate dropdown
  api.getReportingManger()
    // api.getstaffid()
    // api.getReportingid()
    .then(staffList => {
      staffList.forEach(staff => {
        $('.userName').append(
          $('<option>', { value: `${staff.id} - ${staff.name}`, text: `${staff.id}-${staff.name} ` })
        );
      });

      // Initialize Select2 after options are added
      $('.userName').select2({
        placeholder: 'Select Reporting Manager',
        allowClear: true
      });
    })
    .catch(error => {
        console.log("error")
      console.error('Error loading staff:', error);
    });
});



require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Import cors

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes (important for front-end access)

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // e.g., 'localhost', 'YOUR_SERVER_NAME\SQLEXPRESS'
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure SQL Database, false for local dev
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Change to true for local dev / self-signed certs
    }
};

// Connect to the database
sql.connect(dbConfig)
    .then(pool => {
        if (pool.connected) {
            console.log('Connected to SQL Server');
        }
        return pool;
    })
    .catch(err => console.error('Database Connection Failed:', err));

// API Endpoint to get intern applicants
app.get('/api/interns-ending-soon', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig); // Ensure pool is connected
        const result = await pool.request().query(`
            SELECT id, FullName, Email, EndDate, StartDate, DegreeProgram, Reporting_Manager
            FROM dbo.internApplicants
            WHERE EndDate IS NOT NULL
              AND DATEDIFF(day, GETDATE(), EndDate) = 10;
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching intern applicants:', err);
        res.status(500).send('Error fetching intern applicants');
    }
});


app.post('/api/submit-and-refresh', async (req, res) => {
    console.log('Submit button clicked on frontend, triggering data refresh.');
   
    res.status(200).json({ message: 'Submission received, please refresh data.' });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});