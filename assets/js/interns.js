let internName;
const updateInternButton = document.getElementById("update_intern_btn");
// add staff

let decidedPermission;
document.addEventListener("DOMContentLoaded", async () => {
  roles = await axiosInstance.get("/roles/role/perms");
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
  decidedPermission = handlePermission("#username");
});

const storedUser = JSON.parse(sessionStorage.getItem("user"));
document.getElementById("username").textContent = storedUser.name;

if (decidedPermission !== "") {
  decidedPermission = "editElement";
  // alert(decidedPermission)
}

let table;
let internId;
function addRow(data) {
  if ($.fn.dataTable.isDataTable("#myTable1")) {
    table = $("#myTable1").DataTable();
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
      data.internId,
      data.FullName,
      formatDate(data.DateOfBirth),
      data.MobileNumber,
      data.Email,
      data.CollegeName,
      data.DegreeProgram,
      `<div class="container">
            <div class="toggle-btn ${decidedPermission}  ${
        data.status === true ? "active" : ""
      }" onclick="toggleStatus(this,'${data.Id}')">
                <div class="slider"></div>
            </div>
        </div>`,
      `<div class="row d-flex justify-content-center">
    <div class="d-flex align-items-center justify-content-center p-0 edit-btn" 
        style="width: 40px; height: 40px; cursor:pointer" 
        data-intern="${data.Id}">
        <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
    </div>
</div>
`,
    ])
    .draw(false);
}
// edit btn
document.querySelector("#myTable1").addEventListener("click", function (event) {
  if (event.target.closest(".edit-btn")) {
    let button = event.target.closest(".edit-btn");
    Id = button.getAttribute("data-inter-id");
    document.querySelector("#tabWrapper").classList.remove("d-none");
    document.querySelector("#tableCard").style.display = "none";
    document.querySelector(".show").classList.add("d-none");
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
  if (element.classList.contains("editElement")) return;

  if (!id) return;

  try {
    const data = await api.toggleInternStatus(id);
    showSucessPopupFadeInDownLong(data.message);

    if (element) {
      element.classList.toggle("active");
    }
    await refreshTable();
  } catch (error) {
    showErrorPopupFadeInDown(error);
  }
}

async function refreshTable() {
  if ($.fn.dataTable.isDataTable("#myTable1")) {
    table = $("#myTable1").DataTable();
    table.clear();
  }

  await fetchAllData();
}

// fetch all data
async function fetchAllData() {
  try {
    const interns = await api.getAllIntern();
    console.log("intern", interns);

    // Clear and populate DataTable if needed
    if ($.fn.dataTable.isDataTable("#myTable1")) {
      const table = $("#myTable1").DataTable();
      table.clear().draw();
    }

    // Add each intern as a row
    interns.forEach((e) => addRow(e));

    // ✅ Count interns correctly
    const totalInterns = interns.length;
    const currentInterns = interns.filter((i) => Number(i.status) === 1).length;
    const completedInterns = interns.filter(
      (i) => Number(i.status) === 0
    ).length;

    // ✅ Update the HTML cards
    document.getElementById("totalInternCount").innerText = totalInterns;
    document.getElementById("currentInternCount").innerText = currentInterns;
    document.getElementById("completedInternCount").innerText =completedInterns;
  

    handlePermission("#username");
  } catch (error) {
    console.error("Error fetching intern details:", error);
  }
}

function limitLength(str, length) {
  if (str.length > length) {
    return str.substring(0, length);
  }
  return str;
}

function validateForm(formData) {
  let errors = [];

  const data = [
    "fullName",
    "dateOfBirth",
    "gender",
    "mobileNumber",
    "currentLocation",
    "email",
    "portfolioLink",
    "emergencyContactName",
    "emergencyContactRelationship",
    "emergencyContactNumber",
    "collegeName",
    "degreeProgram",
    "isPartOfCurriculum",
    "facultySupervisor",
    "preferredStartDate",
    "preferredEndDate",
    "internshipMode",
    "howHeardAboutUs",
    "submissionDate1",
  ];

  console.log(formData.get("fullName")?.trim());
  data.forEach((field) => {
    console.log(field);
    const value = formData.get(field)?.trim();

    if (!value) {
      errors.push(`${field} is Required`);
      showErrorPopupFadeInDown(`${field} is Required`);
    }
    if (field == "contactNumber" && !/^\d{10}$/.test(contactNumber)) {
      errors.push("Contact Number must be exactly 10 digits.");
    }

    if (field == "aadharNumber" && !/^\d{12}$/.test(aadharNumber)) {
      showErrorPopupFadeInDown("Aadhar Number must be exactly 12 digits.");
      errors.push("Aadhar Number must be exactly 12 digits.");
    }

    if (
      field == "mail" &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail)
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

function formatDate(dateStr) {
  console.log("date");
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

// edit btn
$(document).on("click", ".edit-btn", function () {
  let Id = $(this).data("intern");
  console.log("edit", Id);
  loadInternUpdateDetails(Id);
});

//generate pdf

async function loadInternUpdateDetails(Id) {
  try {
    // Assume API_ROUTES.getIntern(id) exists and fetches intern-specific data
    const response = await api.getInterById(Id);
    const data = response; // Assuming the intern details are directly in response.data
function formatDate(dateStr) {
  console.log("date");
    if (!dateStr) return '';
    let date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

    console.log("datanew", data);

    internName = data.FullName;

    // Populate the form fields based on the intern data and your HTML IDs
    document.getElementById("fullName1").value = data.FullName || "";
    document.getElementById("dateOfBirth1").value = data.DateOfBirth
      ? formatDate(data.DateOfBirth)
      : "";
    document.getElementById("gender1").value = data.Gender || "";
    document.getElementById("mobileNumber1").value = data.MobileNumber || "";
    document.getElementById("currentLocation1").value =
      data.CurrentLocation || "";
    document.getElementById("email1").value = data.Email || "";
    document.getElementById("portfolioLink1").value = data.PortfolioLink || "";
    document.getElementById("emergencyContactName1").value =
      data.EmergencyContactName || "";
    document.getElementById("emergencyContactRelationship1").value =
      data.EmergencyContactRelationship || "";
    document.getElementById("emergencyContactNumber1").value =
      data.EmergencyContactNumber || "";
    document.getElementById("collegeName1").value = data.CollegeName || "";
    document.getElementById("degreeProgram1").value = data.DegreeProgram || "";
    document.getElementById("isPartOfCurriculum1").value =
      data.IsPartOfCurriculum ? "Yes" : "No" || "";
    document.getElementById("facultySupervisor1").value =
      data.FacultySupervisor || "";
    document.getElementById("preferredStartDate1").value =
      data.PreferredStartDate ? formatDate(data.PreferredStartDate) : "";
    document.getElementById("preferredEndDate1").value = data.PreferredEndDate
      ? formatDate(data.PreferredEndDate)
      : "";
    document.getElementById("StartDate").value = data.StartDate
      ? formatDate(data.StartDate)
      : "";
    document.getElementById("EndDate").value = data.EndDate
      ? formatDate(data.EndDate)
      : "";
    document.getElementById("internshipMode1").value =
      data.InternshipMode || "";
    document.getElementById("howHeardAboutUs1").value =
      data.HowHeardAboutUs || "";
    document.getElementById("submissionDate1").value = data.SubmissionDate
      ? formatDate(data.SubmissionDate)
      : "";
    document.getElementById("reportingManager").value =
      data.Reporting_Manager || "";

    // Store ID = 1
    document.getElementById("id1").value = Id || "";
    document.getElementById("stipendAmount").value= data.stipendAmount;

    updateInternDocumentButtons(Id); // Call a function to update document-related buttons/links
    updateInternCertificateButtons(data);
  } catch (error) {
    console.error("Error loading intern details:", error);
  }
}

function formatDate(date, formatType = "short") {
  if (!date) return "";
  const d = new Date(date);
  if (formatType === "short") {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } else if (formatType === "dd-mm-yyyy") {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return d.toLocaleDateString("en-GB"); // Default fallback
}

function downloadCertificate(
  FullName,
  StartDate,
  EndDate,
  issueDateStr,
  internId
) {
  console.log("vjhvi", FullName, StartDate, EndDate, issueDateStr, internId);
  if (!FullName && !StartDate && !EndDate && !internId) {
    console.error("❌ No data provided to downloadCertificate()");
    return;
  }

  const refNo = `NTCPWC/INT/${internId}`;
  const formattedIssueDate = formatDate(issueDateStr,"dd-mm-yyyy");

  const container = document.createElement("div");
  container.style.width = "210mm";
  container.style.minHeight = "285mm";
  container.style.maxHeight = "297mm";
  container.style.background = "#fff";
  container.style.padding = "18mm";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.position = "relative";
  container.style.overflow = "hidden";

  container.innerHTML = `
  <!-- Header Section -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;margin-top:25px;">
    <div style="flex:1;">
      <p style="margin:0; font-size:12px; font-weight:bold; margin-bottom:4px; color:#3f51b5; line-height:1.3;">
        National Technology Centre for Ports, Waterways and Coasts<br>(NTCPWC)
      </p>
      <p style="margin:0; font-size:11px; color:#555; margin-bottom:8px;">
        Indian Institute of Technology Madras, Chennai, India
      </p>
      <p style="margin:0; font-size:11px; font-weight:bold; margin-top:8px;">
        M.J. Muthukumar, Principal Project Officer
      </p>
    </div>
    <div style="flex-shrink:0;">
      <img src="assets/images/image.jpeg" alt="NTCPWC Logo" style="height:50px; width:auto; display:block;" />
    </div>
  </div>

  <!-- Reference Number and Date -->
  <div style="display:flex; justify-content:space-between; margin:15px 0 25px 0; font-size:11px;">
    <div style="font-weight:bold;">${refNo}</div>
    <div>${formattedIssueDate}</div>
  </div>

  <!-- Certificate Title -->
  <div style="text-align:center; font-size:12px; font-weight:bold; margin:20px 0; text-decoration:underline; letter-spacing:0.5px;">
    TO WHOM IT MAY CONCERN
  </div>

  <!-- Body Content -->
  <div style="line-height:1.7; font-size:11px; text-align:justify; font-family:'Times New Roman', Times, serif;">
    <p style="margin:0 0 12px 0;">
      This is to certify that <strong>${FullName}</strong> has successfully completed his/her internship at NTCPWC, IIT Madras from <strong>${formatDate(StartDate)}</strong> to <strong>${formatDate(EndDate)}</strong>.
    </p>
    <p style="margin:0 0 12px 0;">
      During his/her internship, he/she demonstrated exceptional enthusiasm and professionalism in all assigned tasks and a proactive approach to problem-solving.
    </p>
    <p style="margin:0 0 12px 0;">
      His/Her ability to adapt quickly, collaborate effectively with the team, and maintain a consistent work ethic was commendable. He/She delivered high-quality work within timelines and showed a keen interest in learning and contributing beyond the assigned scope.
    </p>
    <p style="margin:0 0 12px 0;">
      We wish him/her the very best for his/her future academic and professional endeavors.
    </p>
  </div>

  <!-- Signature Block -->
  <div style="margin-top:50px; font-size:11px; line-height:1.6;">
    <p style="margin:0 0 6px 0;">Sincerely,</p>
    <p style="margin:0 0 20px 0;">For National Technology Centre for Ports, Waterways and Coasts</p>

    <!-- Seal and Signature Images - Corrected alignment -->
    <div style="text-align: left; margin:20px 0;">
      <img src="assets/images/seal.png"
           alt="Official Seal"
           style="height:90px; width:auto; object-fit:contain; display:block; margin-bottom: 10px;"> <!-- seal on top, with bottom margin -->
      <img src="assets/images/sign.png"
           alt="Signature"
           style="height:45px; width:auto; object-fit:contain; display:block;"> <!-- sign below -->
    </div>


    <!-- Signatory Information -->
    <div style="margin-top:10px;">
      <p style="margin:0 0 2px 0; font-weight:bold;">M.J. Muthukumar</p>
      <p style="margin:0; font-size:10.5px;">(Principal Project Officer)</p>
    </div>
  </div>

  <!-- Footer Block -->
  <div style="position:absolute; bottom:15mm; left:18mm; right:18mm; padding-top:10px; border-top:1px solid #ccc; font-size:10px; text-align:center; line-height:1.5;">
    <p style="margin:0 0 4px 0;">
      <strong>Tel:</strong> 091-44-22578918; <strong>Mobile:</strong> +91-9080056974
    </p>
    <p style="margin:0;">
      <strong>E-mail:</strong> 
      <a href="mailto:jmuthu86@ntcpwc.iitm.ac.in" style="color:#3f51b5; text-decoration:none;">
        jmuthu86@ntcpwc.iitm.ac.in
      </a> | 
      <strong>Web:</strong> 
      <a href="http://www.ntcpwc.iitm.ac.in" style="color:#3f51b5; text-decoration:none;">
        www.ntcpwc.iitm.ac.in
      </a>
    </p>
  </div>
`;

  document.body.appendChild(container);

  const filename = `${
    FullName.replace(/\s+/g, "_") || "Intern"
  }_Completion_Certificate.pdf`;

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
    .then(() => {
      document.body.removeChild(container);
      Swal.fire({
        icon: "success",
        title: "Certificate Downloaded!",
        text: "The completion certificate has been successfully downloaded.",
        timer: 2000,
        showConfirmButton: false,
      });
    })
    .catch((err) => {
      console.error("❌ PDF generation failed:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Could not download the completion certificate. Please try again.",
      });
    });
}

function downloadOnboardingCertificate(
  FullName,
  StartDate,
  EndDate,
  generateDateStr,
  internId,
  stipend
) {
  if (!FullName && !StartDate && !EndDate && !internId) {
    console.error("❌ No data provided to downloadOnboardingCertificate()");
    return;
  }
  console.log
  const refNo = `NTCPWC/INT/${internId}`;
  const formattedGenerateDate = formatDate(generateDateStr, "dd-mm-yyyy");
  let stipendHTML;

  console.log(stipend,"stipend")
  if(stipend != 'null'){
    stipendHTML=`<p style="margin:0 0 12px 0;font-weight:bold;">Stipend Recommended: ₹${stipend}/month</p>`
  }
  else{
    stipendHTML=""
  }

  const container = document.createElement("div");
  container.style.width = "210mm";
  container.style.minHeight = "285mm";
  container.style.background = "#fff";
  // container.style.border = "1px solid #eee";
  container.style.boxShadow = "0 0 6px rgba(0,0,0,0.1)";
  container.style.padding = "14mm 18mm 14mm 18mm";
  container.style.boxSizing = "border-box";
  container.style.position = "relative";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.overflow = "hidden";

  container.innerHTML = `
  <div style="
    width:100%;
    height:100%;
    position:relative;
    font-family:'Arial, sans-serif;
    padding:0;
    box-sizing:border-box;">
 
    <!-- Header Section -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;margin-top:25px;">
    <div style="flex:1;">
      <p style="margin:0; font-size:12px; font-weight:bold; margin-bottom:4px; color:#3f51b5; line-height:1.3;">
        National Technology Centre for Ports, Waterways and Coasts<br>(NTCPWC)
      </p>
      <p style="margin:0; font-size:11px; color:#555; margin-bottom:8px;">
        Indian Institute of Technology Madras, Chennai, India
      </p>
      <p style="margin:0; font-size:11px; font-weight:bold; margin-top:8px;">
        M.J. Muthukumar, Principal Project Officer
      </p>
    </div>
    <div style="flex-shrink:0;">
      <img src="assets/images/image.jpeg" alt="NTCPWC Logo" style="height:50px; width:auto; display:block;" />
    </div>
  </div>
 
    <!-- Reference Number -->
    <div style="font-size:11px; font-weight:bold; margin-bottom:35px;">
      ${refNo}
    </div>

    <!-- Date (Right Aligned) -->
    <div style="text-align:right; font-size:11px; margin-bottom:25px;">
      ${formattedGenerateDate}
    </div>
 
    <!-- Title -->
    <div style="text-align:center; font-size:12px; font-weight:bold; margin-bottom:20px; text-decoration:underline; letter-spacing:0.5px;">
      TO WHOM IT MAY CONCERN
    </div>
 
    <!-- Main Content -->
    <div style="font-size:11px; line-height:1.7; text-align:justify;">
      
      <!-- Subject Line -->
      <p style="margin:0 0 12px 0;">
        <strong>Subject:</strong> Internship Confirmation
      </p>
      
      <!-- Salutation -->
      <p style="margin:0 0 12px 0;">
        Dear Mr./Ms. <strong>${FullName}</strong>
      </p>

      <!-- Introduction Paragraph -->
      <p style="margin:0 0 15px 0;">
        We are pleased to confirm that you have been selected for an internship at NTCPWC, IITM. 
        Below are the details of your internship:
      </p>

      <!-- Internship Details -->
      <p style="margin:0 0 5px 0;">
        <strong>Internship Duration:</strong> ${formatDate(StartDate)} to ${formatDate(EndDate)}
      </p>
      <p style="margin:0 0 5px 0;">
        <strong>Working Hours:</strong> 5 Hours
      </p>
      
      <p style="margin:0 0 3px 0;">
        <strong>Supervisors:</strong> M.J. Muthukumar
      </p>
      <p style="margin:0 0 0 80px;">
        S Pradhiksha
      </p>

       
       ${stipendHTML}
      

      <!-- Body Paragraphs -->
      <p style="margin:0 0 12px 0;">
        During your internship, you will work on various projects and gain practical experience. 
        We believe this will be an excellent opportunity for you to apply your academic knowledge 
        and develop your professional skill.
      </p>

      <p style="margin:0 0 40px 0;">
        We look forward to welcoming you to our team and wish you a productive and rewarding internship.
      </p>
    </div>

    <!-- Signature Block -->
    <div style="margin-top:30px; font-size:11px;">
      <div style="text-align:right; margin-bottom:25px;">
        <p style="margin:0 0 5px 0; font-weight:bold;">Thanking you</p>
        <p style="margin:0;">With Regards</p>
      </div>
      
      <!-- Signature and Seal (Right Aligned) -->
      <div style="text-align:right; margin-bottom:10px;">
        <img src="assets/images/sign.png" alt="Signature" style="height:45px; width:auto; object-fit:contain; margin-bottom:5px; display:inline-block;">
      </div>
      <br>
      
      <div style="text-align:right;">
        <img src="assets/images/seal.png" alt="Official Seal" style="height:90px; width:auto; object-fit:contain; display:inline-block;">
      </div>
      <!-- Signatory Information -->
      <div style="margin-bottom:5px; text-align:right;">
        <p style="margin:0 0 2px 0; font-weight:bold;">M.J. Muthukumar</p>
        <p style="margin:0; font-size:10.5px;">(Principal Project Officer)</p>
      </div>
  </div>
    

   <!-- Footer Block -->
  <div style="position:absolute; bottom:-35mm; left:18mm; right:18mm; padding-top:10px; border-top:1px solid #ccc; font-size:10px; text-align:center; line-height:1.5;">
    <p style="margin:0 0 4px 0;">
      <strong>Tel:</strong> 091-44-22578918; <strong>Mobile:</strong> +91-9080056974
    </p>
    <p style="margin:0;">
      <strong>E-mail:</strong> 
      <a href="mailto:jmuthu86@ntcpwc.iitm.ac.in" style="color:#3f51b5; text-decoration:none;">
        jmuthu86@ntcpwc.iitm.ac.in
      </a> | 
      <strong>Web:</strong> 
      <a href="http://www.ntcpwc.iitm.ac.in" style="color:#3f51b5; text-decoration:none;">
        www.ntcpwc.iitm.ac.in
      </a>
    </p>
  </div>
`;

  document.body.appendChild(container);

  const filename = `${
    FullName.replace(/\s+/g, "_") || "Intern"
  }_Onboarding_Certificate.pdf`;

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
    .then(() => {
      document.body.removeChild(container);
      Swal.fire({
        icon: "success",
        title: "Certificate Downloaded!",
        text: "The onboarding certificate has been successfully downloaded.",
        timer: 2000,
        showConfirmButton: false,
      });
    })
    .catch((err) => {
      console.error("❌ PDF generation failed:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Could not download the onboarding certificate. Please try again.",
      });
    });
}

// intern completion certificate
async function updateInternCertificateButtons(data) {
  console.log(data.id);
  try {
    const documentTableBody = document.getElementById("Certificatebody");
    let rowsHTML = "";

    // acceptance generated date (for completion)
    let actionHTMLCompletionGenerated = `
      <button class="btn btn-sm text-white" disabled
                  style="background:linear-gradient(to bottom right, #A9A9A9, #A9A9A9); border:none; opacity:0.8; cursor:not-allowed;">
            <i class="fa-solid fa-check me-1"></i> Generated
          </button>
            <button onclick="downloadCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}',
    '${data.Completion_GenerateDate}','${data.internId}')"
                  class="btn btn-sm text-white"
                  style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>
    `;

    // acceptance not generated (for completion)
    let actionHTMLCompletionNotGenerated = `
    <div id='certificateActions_${data.id}'>
      <button onclick="generateCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}','${data.id}','${data.internId}')" class="btn btn-sm text-white"
                  style="background:linear-gradient(to bottom right, #90EE90, #4CAF50); border:none;">
            <i class="fa-solid fa-check me-1"></i> Generate
          </button>
            <button onclick="downloadCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}','${data.Completion_GenerateDate}','${data.internId}')"
                  class="btn btn-sm text-white d-none"
                  style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>
      </div>    
    `;

    // acceptance generated date (for onboarding)
    let actionHTMLOnboardingGenerated = `
      <button class="btn btn-sm text-white" disabled
                  style="background:linear-gradient(to bottom right, #A9A9A9, #A9A9A9); border:none; opacity:0.8; cursor:not-allowed;">
            <i class="fa-solid fa-check me-1"></i> Generated
          </button>
            <button onclick="downloadOnboardingCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}','${data.Acceptance_GenerateDate}','${data.internId}','${data.stipendAmount}')"
                  class="btn btn-sm text-white"
                  style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>
    `;

    // acceptance not generated (for onboarding)
    let actionHTMLOnboardingNotGenerated = `
    <div id='onboardingActions_${data.id}'>
      <button onclick="generateOnboardingCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}','${data.id}','${data.internId}','${data.stipendAmount}')" class="btn btn-sm text-white"
                  style="background:linear-gradient(to bottom right, #90EE90, #4CAF50); border:none;">
            <i class="fa-solid fa-check me-1"></i> Generate
          </button>
            <button onclick="downloadOnboardingCertificate('${data.FullName}', '${data.StartDate}', '${data.EndDate}','${data.Acceptance_GenerateDate}','${data.internId}','${data.stipendAmount}')"
                  class="btn btn-sm text-white d-none"
                  style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>
    </div>
    `;

    // Pending status for ongoing internships
    let actionHTMLOngoing = `
      <div class="text-start">
        <span class="status-badge bg-warning text-dark">
          <i class="fa-solid fa-spinner fa-spin me-2"></i> <span class="status-text">Ongoing</span>
        </span>
      </div>
    `;

    const today = new Date();
    const endDate = new Date(data.EndDate);

    if (today < endDate) {
      // Internship is ongoing
      rowsHTML += `
        <tr>
          <td>${data.FullName} Acceptance Letter</td>
          <td>${actionHTMLOngoing}</td>
        </tr>
        <tr>
          <td>${data.FullName} Completion Letter</td>
          <td>${actionHTMLOngoing}</td>
        </tr>
      `;
    } else {
      // Internship has ended
      rowsHTML += `
        <tr>
          <td>${data.FullName} Acceptance Letter</td>
          <td>${
            data.Acceptance_GenerateDate != null
              ? actionHTMLOnboardingGenerated
              : actionHTMLOnboardingNotGenerated
          }</td>
        </tr>
        <tr>
          <td>${data.FullName} Completion Letter</td>
          <td>${
            data.Completion_GenerateDate != null
              ? actionHTMLCompletionGenerated
              : actionHTMLCompletionNotGenerated
          }</td>
        </tr>
      `;
    }
    documentTableBody.innerHTML = rowsHTML;
  } catch (error) {
    console.error("Error loading documents:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load certificate buttons. Please try again.",
    });
  }
}

async function generateCertificate(fullName, startDate, endDate, id, internId) {
  const container = document.getElementById(`certificateActions_${id}`);
  const btn = container.querySelector("button");

  btn.style.background = "linear-gradient(to bottom right, #90EE90, #4CAF50)";
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  btn.disabled = true;

  try {
    const date = new Date();
    const generateDate = date.toISOString().slice(0, 19).replace("T", " ");
    const generateName = "Completion_GenerateDate";

    await api.updateGenarateDate(id, { generateDate, generateName }); // Assuming api is defined globally

    // Update the button state after successful generation
    container.innerHTML = `
      <div id='certificateActions_${id}'>
        <button class="btn btn-sm text-white" disabled
                style="background:linear-gradient(to bottom right, #A9A9A9, #A9A9A9); border:none; opacity:0.8; cursor:not-allowed;">
          <i class="fa-solid fa-check me-1"></i> Generated
        </button>
        <button onclick="downloadCertificate('${fullName}', '${startDate}', '${endDate}','${generateDate}','${internId}')"
                class="btn btn-sm text-white"
                style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
          <i class="fa-solid fa-download me-1"></i> Download
        </button>
      </div>
    `;
    Swal.fire({
      icon: "success",
      title: "Certificate Generated!",
      text: "The completion certificate is now available for download.",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Generate'; // Revert button on error
    Swal.fire({
      icon: "error",
      title: "Generation Failed",
      text: "Could not generate the completion certificate. Please try again.",
    });
  }
}

async function generateOnboardingCertificate(
  fullName,
  startDate,
  endDate,
  id,
  internId,
  stipendAmount
) {
  const container = document.getElementById(`onboardingActions_${id}`);
  const btn = container.querySelector("button");

  btn.style.background = "linear-gradient(to bottom right, #90EE90, #4CAF50)";
  btn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  btn.disabled = true;

  try {
    const date = new Date();
    const generateDate = date.toISOString().slice(0, 19).replace("T", " ");
    const generateName = "Acceptance_GenerateDate";

    await api.updateGenarateDate(id, { generateDate, generateName }); // Assuming api is defined globally

    container.innerHTML = `
      <div id='onboardingActions_${id}'>
        <button class="btn btn-sm text-white" disabled
                style="background:linear-gradient(to bottom right, #A9A9A9, #A9A9A9); border:none; opacity:0.8; cursor:not-allowed;">
          <i class="fa-solid fa-check me-1"></i> Generated
        </button>
        <button onclick="downloadOnboardingCertificate('${fullName}', '${startDate}', '${endDate}','${generateDate}','${internId}','${stipendAmount}')"
                class="btn btn-sm text-white"
                style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
          <i class="fa-solid fa-download me-1"></i> Download
        </button>
      </div>
    `;
    Swal.fire({
      icon: "success",
      title: "Certificate Generated!",
      text: "The onboarding certificate is now available for download.",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error generating onboarding certificate:", error);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Generate'; // Revert button on error
    Swal.fire({
      icon: "error",
      title: "Generation Failed",
      text: "Could not generate the onboarding certificate. Please try again.",
    });
  }
}

async function updateInternDocumentButtons(internId) {
  try {
    console.log("Loading document table for Intern ID:", internId);

    // Assuming axiosInstance and API_ROUTES are defined elsewhere
    const res = await axiosInstance.get(
      API_ROUTES.getInternDocumentsMetadata(internId)
    );
    const documents = res.data;

    console.log("documents", documents);

    const documentTableBody = document.getElementById("documentTableBody");
    let rowsHTML = "";

    documents.forEach((doc) => {
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
        actionHTML = `
          <label class="btn btn-sm text-white mb-0" 
                 style="background:linear-gradient(to bottom right, #34D399, #059669); border:none; cursor:pointer;">
            <i class="fa-solid fa-upload me-1"></i> Upload
            <input type="file" style="display:none" 
                   onchange="uploadDocumentWrapper(this, '${internId}', '${doc.name}')">
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
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load document buttons. Please try again.",
    });
  }
}

// Wrapper for uploadDocument to correctly pass the button element to handleAction
async function uploadDocumentWrapper(fileInput, internId, docName) {
  const labelButton = fileInput.parentElement;
  await handleAction(labelButton, () =>
    uploadDocument(internId, docName, fileInput.files[0])
  );
}

async function handleAction(btnElement, actionFn) {
  let originalHTML = btnElement.innerHTML;
  let originalStyle = btnElement.style.cssText; // Store original style for restoration

  btnElement.disabled = true;
  btnElement.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Processing...`;
  btnElement.style.cssText += "opacity: 0.7; cursor: not-allowed;"; // Add processing style

  try {
    await actionFn();
    // Success actions (handled by individual functions with Swal.fire)
  } catch (err) {
    console.error("Action failed:", err);
    Swal.fire({
      icon: "error",
      title: "Action Failed",
      text: `Something went wrong: ${err.message || "Please try again."}`,
    });
  } finally {
    // Restore original state regardless of success or failure
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.innerHTML = originalHTML;
      btnElement.style.cssText = originalStyle;
    }
  }
}

// Download document (binary to blob)
async function downloadDocument(internId, docName) {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.downloadInternDocument(internId, docName),
      {
        responseType: "blob",
      }
    );

    // 👇 Auto-detect file type from response headers
    const contentType = res.headers["content-type"];
    const isImage = contentType?.includes("image");
    const fileExtension = isImage ? "png" : "pdf";

    // Create Blob with the correct MIME type
    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    // Create and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    // Sweet alert success message 💫
    Swal.fire({
      icon: "success",
      title: "✨ Download Complete!",
      text: `${docName}.${fileExtension} has been downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false,
    });

    // Optional: refresh intern document buttons
    await updateInternDocumentButtons(internId);
  } catch (error) {
    console.error("❌ Error downloading document:", error);
    Swal.fire({
      icon: "error",
      title: "Download Failed",
      text: "Unable to download the document. Please try again.",
      timer: 2500,
      showConfirmButton: false,
    });
  }
}


async function uploadDocument(internId, docName, file) {
  if (!file) {
    Swal.fire({
      icon: "warning",
      title: "No file selected",
      text: "Please select a file to upload.",
    });
    throw new Error("No file selected.");
  }

  const formData = new FormData();
  formData.append("file", file); // 'file' is the key expected by the backend

  try {
    // Assuming API_ROUTES.uploadInternDocument returns a URL for the specific document
    await axiosInstance.post(
      API_ROUTES.uploadInternDocument(internId, docName),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Upload Successful!",
      text: `${docName} has been uploaded successfully.`,
      timer: 2000,
      showConfirmButton: false,
    });
    await updateInternDocumentButtons(internId); // Refresh the buttons to reflect changes
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Upload failed."); // Re-throw to be caught by handleAction
  }
}

async function deleteDocument(internId, docName) {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete ${docName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await axiosInstance.delete(
        API_ROUTES.deleteInternDocument(internId, docName)
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${docName} has been deleted.`,
        timer: 2000,
        showConfirmButton: false,
      });
      await updateInternDocumentButtons(internId); // Refresh the buttons to reflect changes
    } else {
      throw new Error("Deletion cancelled."); // User cancelled, so don't show error to user but stop execution
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    // Only show error if it wasn't a user cancellation
    if (error.message !== "Deletion cancelled.") {
      throw new Error("Delete failed."); // Re-throw to be caught by handleAction
    }
  }
}

// Delete document
async function deleteDocument(internId, docName) {
  if (!(await showDeleteMessage(`Delete ${docName}?`))) return;

  try {
    await axiosInstance.delete(
      API_ROUTES.deleteInternDocument(internId, docName)
    );

    // Success message
    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: `${docName} deleted successfully`,
      timer: 2000,
      showConfirmButton: false,
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
    await axiosInstance.post(
      API_ROUTES.uploadInternDocument(internId, docName),
      formData
    );

    // SweetAlert2 success message
    Swal.fire({
      icon: "success",
      title: "Uploaded!",
      text: `${docName} uploaded successfully`,
      timer: 2000,
      showConfirmButton: false,
    });

    updateInternDocumentButtons(internId);
  } catch (error) {
    console.error("Error uploading document:", error);

    // SweetAlert2 error message
    Swal.fire({
      icon: "error",
      title: "Upload Failed",
      text: `Could not upload ${docName}. Please try again.`,
    });
  }
}

updateInternButton.addEventListener("click", async (e) => {
  console.log("enter");
  e.preventDefault();

  let form = document.getElementById("update-intern-form");
  let formData = new FormData(form);

  let Data = Object.fromEntries(formData.entries());

  // ✅ Fix: convert empty strings to null for SQL Date columns
  ["StartDate", "EndDate"].forEach((field) => {
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
      handlePermission("#username");
      showSucessPopupFadeInDownLong(responseData.message);
      // setTimeout(() => {
      //   location.reload();
      // }, 1000);
    } catch (error) {
      showErrorPopupFadeInDown(
        error.response?.data?.message ||
          "Failed to add staff. Please try again later."
      );
    }
  }

  const payload = new FormData();
  documentFormData.forEach((value, key) => {
    if (value instanceof File && value.name !== "") {
      payload.append(key, value);
    }
  });
});
$(document).ready(function () {
  const table1 = $("#myTable1").DataTable({
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
      paginate: { first: "«", last: "»", next: "›", previous: "‹" },
    },
    initComplete: function () {
      // Remove default "Search:" text
      $("#myTable1")
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .remove();

      // Wrap search input & add search icon
      $("#myTable1_filter input").wrap('<div class="search-wrapper"></div>');
      $(".search-wrapper").prepend(
        '<i class="fa-solid fa-magnifying-glass"></i>'
      );
    },
  });

  // Move export buttons into custom div
  table1.buttons().container().appendTo($("#exportButtons"));

  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.nTable.id !== "myTable1") return true; // Apply only to second table

    const selectedStatus = $("#statusFilter").val(); // '', 'active', 'inactive'
    const row = $("#myTable1").DataTable().row(dataIndex).node();
    const isActive = $(row).find(".toggle-btn").hasClass("active");

    if (selectedStatus === "") return true; // Show all
    if (selectedStatus === "active" && isActive) return true;
    if (selectedStatus === "inactive" && !isActive) return true;
    return false;
  });

  // Redraw when filters change
  $("#statusFilter").on("change", function () {
    table1.draw();
  });

  // ---------------------------
  // 🔹 OTHER FILTERS (Table 2)
  // ---------------------------
  $("#designationFilter").on("change", function () {
    const val = $(this).val();
    table1
      .column(5)
      .search(val ? "^" + val + "$" : "", true, false)
      .draw();
  });

  $("#locationFilter").on("change", function () {
    const val = $(this).val();
    table1
      .column(2)
      .search(val ? "^" + val + "$" : "", true, false)
      .draw();
  });

  $("#filter").on("change", function () {
    const val = $(this).val();
    table1
      .column(1)
      .search(val || "")
      .draw();
  });
});

// JavaScript to show/hide "Other Gender" input
document.getElementById("gender1").addEventListener("change", function () {
  var otherGenderField = document.getElementById("otherGenderField1");
  if (this.value === "other") {
    otherGenderField.style.display = "block";
  } else {
    otherGenderField.style.display = "none";
  }
});

// Set submission date to today's date automatically
document.addEventListener("DOMContentLoaded", function () {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  document.getElementById("submissionDate1").value = today;
});

$(document).ready(function () {
  console.log("enter");
  // Load all staff and populate dropdown
  api
    .getReportingManger()
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


document.getElementById("exitButton2").addEventListener("click", async function () {
  const result = await Swal.fire({
    title: "Cancel Editing?",
    text: "You have unsaved changes. Are you sure you want to cancel?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",     // Red for confirm
    cancelButtonColor: "#3085d6",   // Blue for cancel
    confirmButtonText: "Yes, Cancel",
    cancelButtonText: "No, Keep Editing",
    reverseButtons: true,
    customClass: {
      popup: "swal2-custom-popup",
      title: "swal2-custom-title"
    }
  });
  if(result.isConfirmed){
    // document.location.reload();
      document.querySelector('#tabWrapper').classList.add('d-none');
    document.querySelector('#tableCard').style.display = 'block';
  }
  else{
  }
});

document.getElementById("exitButton").addEventListener("click", async function () {
  const result = await Swal.fire({
    title: "Cancel Editing?",
    text: "Your unsaved changes will be lost. Do you want to cancel?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",     // Red for confirm
    cancelButtonColor: "#3085d6",   // Blue for cancel
    confirmButtonText: "Yes, Cancel",
    cancelButtonText: "No, Keep Editing",
    reverseButtons: true,
    customClass: {
      popup: "swal2-custom-popup",
      title: "swal2-custom-title"
    }
  });
  if(result.isConfirmed){
     
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
  }
  else{
  }
});

