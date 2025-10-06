
// ================== Global variables ==================
let table;
let decidedPermission = '';

// ================== On DOM Load ==================
document.addEventListener('DOMContentLoaded',async ()=>{
    roles = await axiosInstance.get("/roles/role/perms");
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;   
await fetchAllData();
    handlePermission('#username');
});

// ================== Validation Function ==================
function validateForm(formData) {
    const errors = [];
    const personID = formData.get('personID')?.trim();
    const personName = formData.get('personName')?.trim();
    const dateOfBirth = formData.get('dateOfBirth')?.trim();
    const contactNumber = formData.get('contactNumber')?.trim();
    const aadharNumber = formData.get('aadharNumber')?.trim();
    const mail = formData.get('mail')?.trim();

    if (!personID) errors.push('Person ID is required.');
    if (!personName) errors.push('Person Name is required.');
    if(!contactNumber) errors.push('Contact Number is required.');
    if(!aadharNumber) errors.push('Aadhar Number is required.');
    if(!mail) errors.push('Email is required.');
    if(!dateOfBirth) errors.push('Date of Birth is required.');


    if (contactNumber && !/^\d{10}$/.test(contactNumber)) errors.push('Contact Number must be exactly 10 digits.');
    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) errors.push('Aadhar Number must be exactly 12 digits.');
    if (mail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail)) errors.push('Invalid Email format.');

    if (errors.length) {
        errors.forEach(err => showErrorPopupFadeInDown(err));
        return false;
    }
    return true;
}

// ================== File validation ==================
const MAX_SIZE_MB = 20;

function validateFileInput(fileInput) {
    const file = fileInput.files[0];
    if (!file) return false; // No file selected

    // Check file type
    if (file.type !== "application/pdf") {
        showErrorPopupFadeInDown(`${fileInput.name} must be a PDF file.`);
        fileInput.value = ""; // Clear invalid file
        return false;
    }

    // Check file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showErrorPopupFadeInDown(`${fileInput.name} cannot exceed ${MAX_SIZE_MB} MB.`);
        fileInput.value = ""; // Clear invalid file
        return false;
    }

    return true;
}

// ================== Check all fields + files ==================
function checkRequiredFields() {
    const form = document.getElementById('new-person-form');
    const documentForm = document.getElementById('new-Document-form');
    const formData = new FormData(form);

    // ✅ required text fields must be filled
    const requiredFields = ["personID","personName","dateOfBirth","aadharNumber","contactNumber","mail"];
    const requiredTextValid = requiredFields.every(f => formData.get(f)?.trim());

    // ✅ required files must be present and valid
    const requiredFiles = ["aadhaarFile","resumeFile","panFile","academicFile","idCardFile"];
    const requiredFilesValid = requiredFiles.every(f => {
        const fileInput = documentForm.querySelector(`[name="${f}"]`);
        return fileInput && fileInput.files.length > 0 && validateFileInput(fileInput);
    });

    // ✅ optional files (only if provided) must also be valid
    const allFileInputs = documentForm.querySelectorAll('input[type="file"]');
    const optionalFilesValid = Array.from(allFileInputs).every(fileInput => {
        return fileInput.files.length === 0 || validateFileInput(fileInput);
    });

    // 👉 Final check (separate + combine)
    const allValid = requiredTextValid && requiredFilesValid;

    document.getElementById('add_person_btn').disabled = !allValid;
}



// ================== Attach listeners ==================
function attachValidationListeners() {
    const form = document.getElementById('new-person-form');
    const documentForm = document.getElementById('new-Document-form');

    form.querySelectorAll('input[required]').forEach(input => input.addEventListener('input', checkRequiredFields));

    documentForm.querySelectorAll('input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener('change', () => checkRequiredFields());
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    attachValidationListeners();
    checkRequiredFields();
});


// ================== Submit New Person ==================
document.getElementById('add_person_btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const form = document.getElementById('new-person-form');
    const documentForm = document.getElementById('new-Document-form');
    const formData = new FormData(form);
    const documentFormData = new FormData(documentForm);

    if (!validateForm(formData)) return;

    const data = {};
    const numericFields = ["aadharNumber","contactNumber"];
    formData.forEach((value,key) => {
        value = value?.trim() || value;
        data[key] = value === "" ? null : (numericFields.includes(key) ? Number(value) : value);
    });

    const payload = new FormData();
    payload.append('data', JSON.stringify(data));
    documentFormData.forEach((value,key) => {
        if (value instanceof File && value.name) payload.append(key, value);
    });

    try {
        const response = await axiosInstance.post(API_ROUTES.talentpool, payload, { headers:{ 'Content-Type':'multipart/form-data' } });
        table.clear();
        await fetchAllData();
        showSucessPopupFadeInDownLong(response.data.message);
        form.reset();
        documentForm.reset();
        checkRequiredFields();
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to add person.');
    }
});

// ================== Tab Navigation ==================
document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const form = document.getElementById('new-person-form');
        if (!validateForm(new FormData(form))) return;
        new bootstrap.Tab(document.querySelector('[data-bs-target="#tab3"]')).show();
    });
});
document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => new bootstrap.Tab(document.querySelector('[data-bs-target="#tab1"]')).show());
});
document.querySelectorAll('.exit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('tab').closest('.modal'));
        modal.hide();
    });
});

// ================== Utility: Format Date ==================
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
}

// ================== update Person Modal ==================
document.getElementById('update_person_btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const form = document.getElementById('update-person-form');
    const formData = new FormData(form);

    if (!validateForm(formData)) return; // use new validation

    const data = formatPersonData(formData);

    try {
        const response = await api.updatePerson(data);
        table.clear();
        await fetchAllData();
        showSucessPopupFadeInDownLong(response.message);
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update person.');
    }
});

function formatPersonData(formData) {
    const numericFields = ["aadharNumber","contactNumber"];
    const data = {};
    formData.forEach((value,key) => {
        value = value?.trim() || value;
        data[key] = value === "" ? null : (numericFields.includes(key) ? Number(value) : value);
    });
    return data;
}

// ================== Fetch All Data ==================
async function fetchAllData() {
    try {
        const talent = await api.getAllPersons();
        console.log(talent);
        talent.forEach(person => addRow(person));
        table.draw();
    } catch (error) {
        console.error("Error fetching person details:", error);
    }
}

function addRow(data) {
    if (!table) table = $('#myTable').DataTable();
    table.row.add([
        data.personID || '',
        data.personName || '',
        formatDate(data.dateOfBirth),
        data.contactNumber || '',
        data.mail || '',
        `<div class="row d-flex justify-content-center">
            <div class="d-flex align-items-center justify-content-center p-0 edit-btn"
                style="width: 40px; height: 40px; cursor:pointer"
                data-person-id="${data.personID}">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </div>
        </div>`
    ]);
}
// ================== table row click ==================
$(document).on('click', '.edit-btn', function () {
    const personID = $(this).data('person-id');
    loadUpdateDetails(personID);
    loadDocumentTable(personID);
    document.querySelector('#tabWrapper').classList.remove('d-none');
    document.querySelector('#tableCard').style.display = 'none';
});

document.querySelector('#exitButton2').addEventListener('click', () => {
    document.querySelector('#tabWrapper').classList.add('d-none');
    document.querySelector('#tableCard').style.display = 'block';
});

async function loadUpdateDetails(id) {
    try {
        const res = await axiosInstance.get(API_ROUTES.getPerson(id));
        const data = res.data.person;
        document.getElementById('update-personID').value = data.personID;
        document.getElementById('update-personName').value = data.personName;
        document.getElementById('update-contactNumber').value = data.contactNumber;
        document.getElementById('update-aadharNumber').value = data.aadharNumber;
        document.getElementById('update-mail').value = data.mail;
        document.getElementById('update-dateOfBirth').value = formatDate(data.dateOfBirth);
        document.getElementById('update-permanentAddress').value = data.permanentAddress;
    } catch (err) {
        console.error("Error loading update details:", err);
    }
}
// ================== Doument upload, download, delete ==================
async function loadDocumentTable(personId) {
    try {
        const res = await axiosInstance.get(API_ROUTES.getPersonDocumentsMetadata(personId));
        const documentTableBody = document.getElementById("documentTableBody");
        documentTableBody.innerHTML = res.data.map(doc => `
           <tr>
  <td>${doc.name}</td>
  <td>
    ${doc.exists ? `
  <button onclick="handleAction(this, () => downloadDocument('${personId}','${doc.name}'))" 
          class="btn btn-sm text-white" 
          style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;">
    <i class="fa-solid fa-download me-1"></i> Download
  </button>
  <button onclick="handleAction(this, () => deleteDocument('${personId}','${doc.name}'))" 
          class="btn btn-sm text-white ms-3" 
          style="background:linear-gradient(to bottom right, #EF4444, #B91C1C); border:none;">
    <i class="fa-solid fa-trash me-1"></i> Delete
  </button>
    ` : `
      <label class="btn btn-sm text-white mb-0" 
             style="background:linear-gradient(to bottom right, #34D399, #059669); border:none; cursor:pointer;">
        <i class="fa-solid fa-upload me-1"></i> Upload
        <input type="file" style="display:none" onchange="handleAction(this.parentElement, () => uploadDocument('${personId}','${doc.name}', this.files[0]))">
      </label>
    `}
  </td>
</tr>


        `).join('');
    } catch(err) {
        console.error(err);
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

async function uploadDocument(personId, docName, file) {
    // Validate file first
    const isValid = validateFileInput({ files: [file], name: docName });
    if (!isValid) return;

    // Proceed with upload
    const formData = new FormData();
    formData.append("file", file);

    try {
        await axiosInstance.post(API_ROUTES.uploadDocumentTalentPool(personId, docName), formData);
        Swal.fire({
            icon: 'success',
            title: 'Uploaded!',
            text: `${docName} uploaded successfully`,
            timer: 2000,
            showConfirmButton: false
        });
        loadDocumentTable(personId);
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: `Could not upload ${docName}`
        });
    }
}


async function downloadDocument(personId, docName) {
    try {
        const res = await axiosInstance.get(API_ROUTES.downloadDocumentTalentPool(personId, docName), { responseType:'blob' });
        const url = URL.createObjectURL(new Blob([res.data], { type:'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        Swal.fire({icon:'success', title:'Download Complete', text:`${docName} downloaded successfully`, timer:2000, showConfirmButton:false});
    } catch {
        Swal.fire({icon:'error', title:'Download Failed', text:`Could not download ${docName}`});
    }
}

async function deleteDocument(personId, docName) {
    if (!(await showDeleteMessage(`Delete ${docName}?`))) return;
    try {
        await axiosInstance.delete(API_ROUTES.deleteDocumentTalentPool(personId, docName));
        Swal.fire({icon:'success', title:'Deleted!', text:`${docName} deleted successfully`, timer:2000, showConfirmButton:false});
        loadDocumentTable(personId);
    } catch {
        Swal.fire({icon:'error', title:'Delete Failed', text:`Could not delete ${docName}`});
    }
}
// ================== export ===================
async function fetchDataAndGeneratePDF() {
    try {
        const res = await api.downloadPersonData();
        if (!Array.isArray(res) || !res.length) throw new Error("No person data");

        const tableBody = [["ID","Name","Date Of Birth","Contact Number","Mail"],
            ...res.map(p => [p.personID||"N/A", p.personName||"N/A", p.dateOfBirth||"N/A", p.contactNumber||"N/A", p.mail||"N/A"])
        ];

        const docDefinition = {
            pageOrientation:"landscape",
            content:[{text:"Talentpool Details", style:"header"}, {table:{headerRows:1, body:tableBody}}],
            styles:{header:{fontSize:18, bold:true, margin:[0,0,0,10]}},
            defaultStyle:{fontSize:8}
        };

        pdfMake.createPdf(docDefinition).download("Talentpool_List.pdf");
    } catch {
        showErrorPopupFadeInDown("Can't download talentpool details.");
    }
}

async function fetchDataAndGenerateExcel() {
    try {
        const res = await api.downloadPersonData();
        const headers = ["ID","Name","Date Of Birth","Aadhar Number","Contact Number","Mail","Permanent Address"];
        const data = res.map(p => [p.personID, p.personName, new Date(p.dateOfBirth).toLocaleDateString('en-GB'), p.aadharNumber, p.contactNumber, p.mail, p.permanentAddress]);
        const ws = XLSX.utils.aoa_to_sheet([headers,...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws,"Talentpool Details");
        XLSX.writeFile(wb,"Talentpool_List.xlsx");
    } catch {
        showErrorPopupFadeInDown("Can't download talentpool details.");
    }
}
// ================== Export Button Listeners ==================

  $(document).ready(function () {
  const datatable = $('#myTable').DataTable({
    paging: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: 'excel',
        text: '<i class="fa-solid fa-file-excel"></i> Excel',
        className: 'btn-excel'
      },
      {
        extend: 'pdf',
        text: '<i class="fa-solid fa-file-pdf"></i> PDF',
        className: 'btn-pdf'
      },
      {
        extend: 'colvis',
        text: '<i class="fa-solid fa-eye"></i> Columns',
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
      $('#myTable').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add search icon
      $('#myTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Move export buttons into custom div
  datatable.buttons().container().appendTo($('#exportButtons'));

});
// ================== Add New Person Button ==================
    document.querySelector('#addNew').addEventListener('click', function () {
        document.querySelector('#tab').classList.remove('d-none');
        document.querySelector('#tableCard').style.display = 'none';
        document.querySelector('#exitButton').addEventListener('click',function(){
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
        });
    });
// ================== Exit Button ==================
 document.querySelector('#exitButton1').addEventListener('click',function(){
            document.querySelector('#tab').classList.add('d-none');
            document.querySelector('#tableCard').style.display = 'block';
        });



