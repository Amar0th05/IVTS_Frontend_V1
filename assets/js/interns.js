
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
      formatDate(data.DateOfBirth),
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
        <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
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

function downloadCertificate(FullName, StartDate, EndDate) {
  if (!FullName && !StartDate && !EndDate) {
    console.error("❌ No data provided to downloadCertificate()");
    return;
  }

  const refNo = "NTCPWC/INT/009";
  const issueDate =
    new Date().toLocaleDateString("en-GB")?.replace(/\//g, "-") || "";

  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Certificate container
  const container = document.createElement("div");
  container.style.width = "210mm";
  container.style.minHeight = "285mm"; // ✅ slightly less than A4 height
  container.style.maxHeight = "297mm"; // ✅ keep within A4 boundary
  container.style.background = "#fff";
  container.style.padding = "18mm"; // ✅ reduced padding to prevent overflow
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.position = "relative";
  container.style.overflow = "hidden"; // ✅ prevents spill to new page

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
      <div>
        <p style="margin:0; font-size:12px; font-weight:bold; margin-bottom:4px; color:#3f51b5;">
          National Technology Centre for Ports, Waterways and Coasts<br>(NTCPWC)
        </p>
        <p style="margin:0; font-size:11px; color:#555;">Indian Institute of Technology Madras, Chennai, India</p>
        <p style="font-size:11px;margin-top:10px;"><strong>M.J. Muthukumar, Principal Project Officer</strong></p>
      </div>
      <img src="assets/images/image.jpeg" alt="NTCPWC Logo" style="height:45px; width:auto;" />
    </div>

    <div style="display:flex; justify-content:space-between; margin-top:10px; margin-bottom:25px; font-size:11px;">
      <div style="font-weight:bold;">${refNo}</div>
      <div>${issueDate}</div>
    </div>

    <div style="text-align:center; font-size:12px; font-weight:bold; margin-bottom:15px; text-decoration:underline;">
      TO WHOM IT MAY CONCERN
    </div>

    <div style="line-height:1.5; font-size:11px; text-align:justify;">
      <p>This is to certify that <strong>${FullName}</strong> has successfully completed
      his/her internship at NTCPWC, IIT Madras from <b>${formatDate(
        StartDate
      )}</b> to <b>${formatDate(EndDate)}</b>.</p>

      <p>During his/her internship, he/she demonstrated exceptional enthusiasm and professionalism in all assigned tasks and a proactive approach to problem-solving.</p>

      <p>His/Her ability to adapt quickly, collaborate effectively with the team, and maintain a consistent work ethic was commendable. He/She delivered high-quality work within timelines and showed a keen interest in learning and contributing beyond the assigned scope.</p>

      <p>We wish him/her the very best for his/her future academic and professional endeavors.</p>
    </div>

    <div style="margin-top:30px; font-size:11px;">
      <p>Sincerely,</p>
      <p>For National Technology Centre for Ports Waterways and Coasts</p>
      <p style="font-weight:bold;">M.J. Muthukumar</p>
      <p>(Principal Project Officer)</p>
    </div>

    <div style="position:absolute;bottom:15mm;left:18mm;right:18mm;padding-top:8px;border-top:1px solid #ddd;font-size:10px;text-align:center;">
      <p style="margin:0 0 3px 0;"><strong>Tel: 091-44-22578918; Mobile: +91-9080056974</strong></p>
      <p style="margin:0;"><strong>
        E-mail: <a href="mailto:jmutu86@ntcpwc.iitm.ac.in" style="color:#3f51b5;text-decoration:none;">jmutu86@ntcpwc.iitm.ac.in</a>;
        Web: <a href="http://www.ntcpwc.iitm.ac.in" style="color:#3f51b5;text-decoration:none;">www.ntcpwc.iitm.ac.in</a>
      </strong></p>
    </div>
  `;

  document.body.appendChild(container);

  const filename = `${FullName.replace(/\s+/g, "_") || "Intern"}_Certificate.pdf`;

  const opt = {
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid"] }, // ✅ prevent any page break
  };

  html2pdf()
    .set(opt)
    .from(container)
    .save()
    .then(() => document.body.removeChild(container))
    .catch((err) => console.error("❌ PDF generation failed:", err));
}


function downloadOnboardingCertificate(FullName, StartDate, EndDate) {
  if (!FullName && !StartDate && !EndDate) {
    console.error("❌ No data provided to downloadOnboardingCertificate()");
    return;
  }

  const refNo = "NTCPWC/INT/009";
  const issueDate = new Date()
    .toLocaleDateString("en-GB")
    ?.replace(/\//g, "-") || "";

  // Helper for date formatting
  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ✅ Container within A4 height
  const container = document.createElement("div");
  container.innerHTML = `
  <div style="
    width:210mm;
    min-height:285mm;       /* ✅ slightly smaller than A4 */
    background:#fff;
    border:1px solid #eee;
    box-shadow:0 0 6px rgba(0,0,0,0.1);
    padding:18mm 18mm 20mm 18mm;  /* ✅ reduced padding */
    box-sizing:border-box;
    position:relative;
    font-family:Arial, sans-serif;
    overflow:hidden;">
 
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
      <div>
        <p style="margin:0;font-size:12px;line-height:1.3;font-weight:bold;color:#3F51B5;">
          National Technology Centre for Ports, Waterways and Coasts<br>(NTCPWC)
        </p>
        <p style="margin:0;font-size:11px;color:#555;">Indian Institute of Technology Madras, Chennai, India</p>
        <p style="font-size:11px;margin-top:10px;"><strong>M.J. Muthukumar, Principal Project Officer</strong></p>
      </div>
      <img src="assets/images/image.jpeg" alt="NTCPWC Logo" style="height:45px;width:auto;object-fit:contain;">
    </div>
 
    <!-- Ref No and Date -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin:15px 0 25px 0;font-size:11px;">
      <div style="font-weight:bold;">${refNo}</div>
      <div>${issueDate}</div>
    </div>
 
    <!-- Title -->
    <div style="text-align:center;font-size:12px;font-weight:bold;margin-bottom:15px;text-decoration:underline;">
      TO WHOM IT MAY CONCERN
    </div>
 
    <!-- Main Content -->
    <div style="font-size:11px;line-height:1.6;">
      <p style="margin:0 0 10px 0;"><strong>Subject:</strong> Internship Confirmation</p>
      <p style="margin:0 0 10px 0;">Dear Mr./Ms. <strong>${FullName}</strong>,</p>

      <p style="margin:0 0 12px 0;text-align:justify;">
        We are pleased to confirm that you have been selected for an internship at NTCPWC, IIT Madras. 
        Below are the details of your internship:
      </p>

      <p style="margin:0 0 6px 0;">Internship Duration: <strong>${formatDate(StartDate)} to ${formatDate(EndDate)}</strong></p>
      <p style="margin:0 0 6px 0;">Working Hours: <strong>5 Hours / day</strong></p>
      <p style="margin:0 0 6px 0;">Supervisors:</p>
      <p style="margin:0 0 4px 40px;"><strong>M.J. Muthukumar</strong></p>
      <p style="margin:0 0 8px 40px;"><strong>S. Pradhiksha</strong></p>
      <p style="margin:0 0 12px 0;font-weight:bold;">Stipend Recommended: ₹10,000/month</p>

      <p style="margin:0 0 12px 0;text-align:justify;">
        During your internship, you will work on various projects and gain practical experience. 
        This will be an excellent opportunity to apply academic knowledge and develop professional skills.
      </p>

      <p style="margin:0 0 25px 0;text-align:justify;">
        We look forward to welcoming you to our team and wish you a productive and rewarding internship.
      </p>
    </div>

    <!-- Signature -->
    <div style="margin-top:25px;text-align:right;font-size:11px;">
      <p style="margin:0 0 20px 0;font-weight:bold;">Thanking you</p>
      <p style="margin:0;">With Regards,</p>
      <p style="margin:25px 0 0 0;font-weight:bold;">M.J. Muthukumar</p>
      <p style="margin:0;">(Principal Project Officer)</p>
    </div>

    <!-- Footer -->
    <div style="
      position:absolute;
      bottom:15mm;
      left:18mm;
      right:18mm;
      padding-top:6px;
      border-top:1px solid #ddd;
      font-size:10px;
      text-align:center;">
      <p style="margin:0 0 3px 0;"><strong>Tel: 091-44-22578918; Mobile: +91-9080056974</strong></p>
      <p style="margin:0;">
        <strong>
          E-mail: <a href="mailto:jmutu86@ntcpwc.iitm.ac.in" style="color:#3F51B5;text-decoration:none;">jmutu86@ntcpwc.iitm.ac.in</a>;
          Web: <a href="http://www.ntcpwc.iitm.ac.in" style="color:#3F51B5;text-decoration:none;">www.ntcpwc.iitm.ac.in</a>
        </strong>
      </p>
    </div>
  </div>`;

  document.body.appendChild(container);

  const filename = `${FullName.replace(/\s+/g, "_") || "Intern"}_Onboarding_Certificate.pdf`;

  const opt = {
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid"] },
  };

  html2pdf()
    .set(opt)
    .from(container)
    .save()
    .then(() => document.body.removeChild(container))
    .catch(err => console.error("❌ PDF generation failed:", err));
}


// intern completion certificate
async function updateInternCertificateButtons(data) {
  try {
    const documentTableBody = document.getElementById("Certificatebody");
    let rowsHTML = "";

    // ✅ Pass data.FullName safely as a string
 let actionHTML1 = `
   <div class="text-start">
    <span class="status-badge bg-warning text-dark">
      <i class="fa-solid fa-spinner  fa-spin spin-icon me-2"></i> <span class="status-text">Ongoing</span>
    </span>
  </div>
`;
let actionHTML2 = `
  <button onclick="downloadCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}')"
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
              <i class="fa-solid fa-download me-1"></i> Download
            </button>
`;
let actionHTML3 = `
<button onclick="downloadOnboardingCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}')"
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
              <i class="fa-solid fa-download me-1"></i> Download
            </button>
`;


    if(formatDate(new Date) < formatDate(data.EndDate)){
      rowsHTML += `
      <tr>
        <td>Onboarding Certificate</td>
        <td>${actionHTML3}</td>
      </tr>
      <tr>
        <td>Completion Certificate</td>
        <td>${actionHTML1}</td>
      </tr>
    `;
    }
    else{
      rowsHTML += `
      <tr>
        <td>Onboarding Certificate</td>
        <td>${actionHTML3}</td>
      </tr>
        <tr>
        <td>Completion Certificate</td>
        <td>${actionHTML2}</td>
      </tr>
    `;
    }

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
  const table1 = $('#myTable1').DataTable({
    paging: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: 'excel',
        text: `
          <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
          Excel
        `,
        className: 'btn-excel'
      },
      {
        extend: 'pdf',
        text: `
          <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
          PDF
        `,
        className: 'btn-pdf'
      },
      {
        extend: 'colvis',
        text: `
          <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
          <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
          Columns
        `,
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
      $('#myTable1').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#myTable1_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Move export buttons into custom div
  table1.buttons().container().appendTo($('#exportButtons'));

  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.nTable.id !== 'myTable1') return true; // Apply only to second table

    const selectedStatus = $('#statusFilter').val(); // '', 'active', 'inactive'
    const row = $('#myTable1').DataTable().row(dataIndex).node();
    const isActive = $(row).find('.toggle-btn').hasClass('active');

    if (selectedStatus === '') return true; // Show all
    if (selectedStatus === 'active' && isActive) return true;
    if (selectedStatus === 'inactive' && !isActive) return true;
    return false;
  });

  // Redraw when filters change
  $('#statusFilter').on('change', function () {
    table1.draw();
  });

  // ---------------------------
  // 🔹 OTHER FILTERS (Table 2)
  // ---------------------------
  $('#designationFilter').on('change', function () {
    const val = $(this).val();
    table1.column(5).search(val ? '^' + val + '$' : '', true, false).draw();
  });

  $('#locationFilter').on('change', function () {
    const val = $(this).val();
    table1.column(2).search(val ? '^' + val + '$' : '', true, false).draw();
  });

  $('#filter').on('change', function () {
    const val = $(this).val();
    table1.column(1).search(val || '').draw();
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

        // Set submission date to today's date automatically
        document.addEventListener('DOMContentLoaded', function () {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
 
            today = yyyy + '-' + mm + '-' + dd;
            document.getElementById('submissionDate1').value = today;
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




