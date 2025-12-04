let internName;
const updateInternButton = document.getElementById("update_intern_btn");
// add staff

let decidedPermission;

function capitalizeFirst(str) {
  if (!str) return "";
  str = str.trim(); // remove starting/ending spaces
  console.log("Cleaned:", str);
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

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
    document.getElementById("completedInternCount").innerText =
      completedInterns;

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
  if (!dateStr) return "";
  let date = new Date(dateStr);
  return date.toISOString().split("T")[0];
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
      if (!dateStr) return "";
      let date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    }

    console.log("datanew", data);

    reportingManagername = capitalizeFirst(
      (data.Reporting_Manager || "").split("-")[1]
    );
    secondaryReportingManagername = capitalizeFirst(
      (data.secondaryReportingManager || "").split("-")[1]
    );

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
    // document.getElementById("reportingManager").value =
    //   data.Reporting_Manager;

    $(".userName").val(data.Reporting_Manager).trigger("change");
    $(".userName").eq(1).val(data.secondaryReportingManager).trigger("change");

    // Store ID = 1
    document.getElementById("id1").value = Id || "";
    document.getElementById("stipendAmount").value = data.stipendAmount;

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
  const formattedIssueDate = formatDate(issueDateStr, "dd-mm-yyyy");

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
      This is to certify that <strong>${FullName}</strong> has successfully completed his/her internship at NTCPWC, IIT Madras from <strong>${formatDate(
    StartDate
  )}</strong> to <strong>${formatDate(EndDate)}</strong>.
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
  console.log;
  const refNo = `NTCPWC/INT/${internId}`;
  const formattedGenerateDate = formatDate(generateDateStr, "dd-mm-yyyy");
  let stipendHTML;

  console.log(stipend, "stipend");
  if (stipend != "null") {
    stipendHTML = `<p style="margin:0 0 12px 0;font-weight:bold;">Stipend Recommended: ₹${stipend}/month</p>`;
  } else {
    stipendHTML = "";
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
        <strong>Internship Duration:</strong> ${formatDate(
          StartDate
        )} to ${formatDate(EndDate)}
      </p>
      <p style="margin:0 0 5px 0;">
        <strong>Working Hours:</strong> 5 Hours
      </p>
      
      <p style="margin:0 0 3px 0;font-size: small;">
        <strong>Supervisors:</strong> ${reportingManagername}
      </p>
      <p style="margin:0 0 0 80px;font-size: small;">
        ${secondaryReportingManagername}
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
        <img src="assets/images/seal.png" alt="Official Seal" style="height:90px; width:auto; object-fit:contain; display:inline-block;">
      </div>

      <div style="text-align:right;">
        <img src="assets/images/sign.png" alt="Signature" style="height:45px; width:auto; object-fit:contain; margin-bottom:5px; display:inline-block;">
      </div>
      <br>
      
      <!-- Signatory Information -->
      <div style="margin-bottom:5px; text-align:right;">
        <p style="margin:0 0 2px 0; font-weight:bold;">M.J. Muthukumar</p>
        <p style="margin:0; font-size:10.5px;">(Principal Project Officer)</p>
      </div>
  </div>
    

   <!-- Footer Block -->
  <div style="position:absolute; bottom:-32mm; left:18mm; right:18mm; padding-top:10px; border-top:1px solid #ccc; font-size:10px; text-align:center; line-height:1.5;">
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

// //

// intern completion certificate
// MAIN FUNCTION

let reportingManagername;
let secondaryReportingManagername;
async function updateInternCertificateButtons(data) {
  try {
    const documentTableBody = document.getElementById("Certificatebody");
    let rowsHTML = "";

    // ================= COMPLETION CERTIFICATE BUTTONS =================

    let actionHTMLCompletion = `
      <button 
        id="generateBtn_${data.id}" 
        class="btn btn-sm text-white"
        style="
          background:${data.Completion_GenerateDate ? "gray" : "#4CAF50"};
          border:none;
        "
        onclick="generateCompletion(${data.id})"
        ${data.Completion_GenerateDate ? "disabled" : ""}
      >
        <i class="fa-solid fa-check me-1"></i>
        ${data.Completion_GenerateDate ? "Generated" : "Generate"}
      </button>

      <button 
        id="downloadBtn_${data.id}" 
        class="btn btn-sm text-white"
        style="
          background:${data.Completion_GenerateDate ? "#1E3FA0" : "#69A1FF"};
          border:none;
          opacity:${data.Completion_GenerateDate ? "1" : "0.5"};
          cursor:${data.Completion_GenerateDate ? "pointer" : "not-allowed"};
        "
        onclick="downloadCertificate('${data.FullName}','${data.StartDate}','${
      data.EndDate
    }','${data.Completion_GenerateDate}','${data.internId}')"
        ${data.Completion_GenerateDate ? "" : "disabled"}
      >
        <i class="fa-solid fa-download me-1"></i> Download
      </button>
    `;

    // ================= ONBOARDING CERTIFICATE BUTTONS =================

    let actionHTMLOnboarding = `
      <button 
        onclick="generateOnboardingCertificate(
          '${data.FullName}', 
          '${data.StartDate}', 
          '${data.EndDate}',
          '${data.id}',
          '${data.internId}',
          '${data.stipendAmount}'
        )"
        id="generateOnboardBtn_${data.id}"
        class="btn btn-sm text-white"
        style="
          background:${data.Acceptance_GenerateDate ? "gray" : "#4CAF50"};
          border:none;
        "
        ${data.Acceptance_GenerateDate ? "disabled" : ""}
      >
        <i class="fa-solid fa-check me-1"></i>
        ${data.Acceptance_GenerateDate ? "Generated" : "Generate"}
      </button>

      <button 
        onclick="downloadOnboardingCertificate(
          '${data.FullName}', 
          '${data.StartDate}',
          '${data.EndDate}',
          '${data.Acceptance_GenerateDate}',
          '${data.internId}',
          '${data.stipendAmount}'
        )"
        id="downloadOnboardBtn_${data.id}"
        class="btn btn-sm text-white"
        style="
          background:${data.Acceptance_GenerateDate ? "#1E3FA0" : "#69A1FF"};
          border:none;
          opacity:${data.Acceptance_GenerateDate ? "1" : "0.5"};
          cursor:${data.Acceptance_GenerateDate ? "pointer" : "not-allowed"};
        "
        ${data.Acceptance_GenerateDate ? "" : "disabled"}
      >
        <i class="fa-solid fa-download me-1"></i> Download
      </button>
    `;

    // =============== ONGOING BADGE =================

    let actionHTMLOngoing = `
      <span class="status-badge bg-warning text-dark">
        <i class="fa-solid fa-spinner fa-spin me-2"></i> Ongoing
      </span>
    `;

    // =============== DATE CHECK ===============

    const today = new Date();
    const endDate = new Date(data.EndDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Generate rows
    // Generate rows
    if (data.StartDate == null || data.EndDate == null) {
      rowsHTML += `
        <tr>
          <td>${data.FullName} Acceptance Letter</td>
          <td>${actionHTMLOngoing}</td>
        </tr>
      `;
    } else {
      rowsHTML += `
        <tr>
          <td>${data.FullName} Acceptance Letter</td>
          <td>${actionHTMLOnboarding}</td>
        </tr>
      `;
      if (today < endDate) {
        rowsHTML += `
        <tr>
          <td>${data.FullName} Completion Letter</td>
          <td>${actionHTMLOngoing}</td>
        </tr>
      `;
      } else {
        rowsHTML += `
        <tr>
          <td>${data.FullName} Completion Letter</td>
          <td>${actionHTMLCompletion}</td>
        </tr>
      `;
      }
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

// COMPLETION CERTIFICATE – GENERATE

async function generateCompletion(id) {
  const generateBtn = document.getElementById(`generateBtn_${id}`);
  const downloadBtn = document.getElementById(`downloadBtn_${id}`);

  generateBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  generateBtn.disabled = true;
  generateBtn.style.background = "gray";

  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await api.updateGenarateDate(id, {
      generateDate: now,
      generateName: "Completion_GenerateDate",
    });

    generateBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Generated';

    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.background = "#1E3FA0";

    Swal.fire({
      icon: "success",
      title: "Completion certificate generated!",
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (error) {
    generateBtn.innerHTML = "Generate";
    generateBtn.disabled = false;
    generateBtn.style.background = "#4CAF50";
  }
}

// COMPLETION CERTIFICATE – DOWNLOAD

function downloadCompletion(id) {
  console.log("Download completion for:", id);
  // Add your PDF code
}

// ONBOARDING CERTIFICATE – SAME LOGIC

async function generateOnboardingCertificate(
  fullName,
  startDate,
  endDate,
  id,
  internId,
  stipendAmount
) {
  const generateBtn = document.getElementById(`generateOnboardBtn_${id}`);
  const downloadBtn = document.getElementById(`downloadOnboardBtn_${id}`);

  generateBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-1"></i> Generating...';
  generateBtn.disabled = true;
  generateBtn.style.background = "gray";

  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await api.updateGenarateDate(id, {
      generateDate: now,
      generateName: "Acceptance_GenerateDate",
    });

    generateBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Generated';

    downloadBtn.disabled = false;
    downloadBtn.style.opacity = "1";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.background = "#1E3FA0";

    Swal.fire({
      icon: "success",
      title: "Onboarding certificate generated!",
      timer: 1800,
      showConfirmButton: false,
    });
  } catch (error) {
    generateBtn.innerHTML = "Generate";
    generateBtn.disabled = false;
    generateBtn.style.background = "#4CAF50";
  }
}

//
//
async function updateInternDocumentButtons(internId) {
  try {
    console.log("Loading document table for Intern ID:", internId);

    const res = await axiosInstance.get(
      API_ROUTES.getInternDocumentsMetadata(internId)
    );
    const documents = res.data;

    console.log("documents", documents);

    const documentTableBody = document.getElementById("documentTableBody");
    let rowsHTML = "";

    documents.forEach((doc) => {
      let actionHTML = "";

      if (doc.exists && doc.name != "Photo") {
        actionHTML = `
          <button 
            onclick="handleAction(this, () => downloadDocument('${internId}', '${doc.name}'))" 
            class="btn btn-sm text-white" 
            style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>

          <button 
          onclick="handleAction(this, () => viewDocument('${internId}', '${doc.name}'))"
          class="btn btn-sm text-white ms-2"
          style="background:linear-gradient(to bottom right, #10B981, #047857); border:none;">
          <i class="fa-solid fa-eye me-1"></i> View
        </button>

          <label class="btn btn-sm text-white ms-3 mb-0" 
                 style="background:linear-gradient(135deg, #ffe066, #fab005); border:none; cursor:pointer;">
            <i class="fa-solid fa-file-pen"></i> Edit
            <input type="file" accept=".pdf, .doc, .docx" style="display:none" 
                   onchange="uploadDocumentWrapper(this, '${internId}', '${doc.name}')">
          </label>
        `;
      } else if (doc.name == "Photo" && doc.exists) {
        actionHTML = `
          <button 
            onclick="handleAction(this, () => downloadDocument('${internId}', '${doc.name}'))" 
            class="btn btn-sm text-white" 
            style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
            <i class="fa-solid fa-download me-1"></i> Download
          </button>

          <button 
          onclick="handleAction(this, () => viewDocument('${internId}', '${doc.name}'))"
          class="btn btn-sm text-white ms-2"
          style="background:linear-gradient(to bottom right, #10B981, #047857); border:none;">
          <i class="fa-solid fa-eye me-1"></i> View
        </button>

          <label class="btn btn-sm text-white ms-3 mb-0" 
                 style="background:linear-gradient(135deg, #ffe066, #fab005); border:none; cursor:pointer;">
            <i class="fa-solid fa-file-pen"></i> Edit
            <input type="file" accept="image/png, image/jpeg" style="display:none" 
                   onchange="uploadDocumentWrapper(this, '${internId}', '${doc.name}')">
          </label>
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
async function viewDocument(internId, docName) {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.downloadInternDocument(internId, docName),
      {
        responseType: "blob",
      }
    );

    // Detect file type
    const contentType = res.headers["content-type"];
    const isImage = contentType?.includes("image");

    // Create Blob
    const blob = new Blob([res.data], { type: contentType });

    // Create URL
    const url = window.URL.createObjectURL(blob);

    // OPEN in NEW TAB 🆕
    window.open(url, "_blank");

    // Revoke URL after some time
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  } catch (error) {
    console.error("❌ Error viewing document:", error);
    Swal.fire({
      icon: "error",
      title: "View Failed",
      text: "Unable to open the document. Please try again.",
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
      setTimeout(() => {
        location.reload();
      }, 1000);
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

// update exit button functionality

  const exitButton2 = document.getElementById("exitButton2");

  let status2 = true;
async function handleExitClick1(e) {
  const el = e.currentTarget;
  if (el.getAttribute("data-breadcrumb") === "back" && status2) {
    status2 = false;
    return;
  }else{
    el.removeAttribute("data-breadcrumb");
    status2 = true;
  }
  const result = await Swal.fire({
    title: "Cancel Updating?",
    text: "Your unsaved changes will be lost. Do you want to exit?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Cancel",
    cancelButtonText: "No, Keep Editing",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    el.setAttribute("data-breadcrumb", "back");
    el.click();
    document.getElementById("tabWrapper")?.classList.add("d-none");
    const tableCard = document.getElementById("tableCard");
    if (tableCard) tableCard.style.display = "block";
  }
}

exitButton2.addEventListener("click", handleExitClick1);

// add exit button functionality

  const exitButton = document.getElementById("exitButton");

  let status1 = true;
async function handleExitClick(e) {
  const el = e.currentTarget;
  if (el.getAttribute("data-breadcrumb") === "back" && status1) {
    status1 = false;
    return;
  }else{
    el.removeAttribute("data-breadcrumb");
    status1 = true;
  }
  const result = await Swal.fire({
    title: "Cancel Editing?",
    text: "Your unsaved changes will be lost. Do you want to cancel?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Cancel",
    cancelButtonText: "No, Keep Editing",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    el.setAttribute("data-breadcrumb", "back");
    el.click();
    document.getElementById("tab")?.classList.add("d-none");
    const tableCard = document.getElementById("tableCard");
    if (tableCard) tableCard.style.display = "block";
  }
}

exitButton.addEventListener("click", handleExitClick);


