// ================== Global variables ==================
let table;
let assetsTable;
let decidedPermission = '';
let assetVerifyId;

// ================== On DOM Load ==================
document.addEventListener('DOMContentLoaded',async ()=>{
    roles = await axiosInstance.get("/roles/role/perms");
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;   
await fetchAllData();
    handlePermission('#username');
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

// ================== Fetch All Data ==================
async function fetchAllData() {
    try {
        const talent = await api.getAssetsVerification();
        const assets=await api.getAllAssets();
        console.log(talent);
        assets.forEach(assets => addRowAssets(assets));
        talent.forEach(person => addRow(person));
        table.draw();
        assetsTable.draw();
    } catch (error) {
        console.error("Error fetching person details:", error);
    }
}

function formatDateToDMY(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function addRow(data) {
    if (!table) table = $('#myTable').DataTable();
    table.row.add([
        data.Verification_ID || '',
        formatDateToDMY(data.Verification_From_Date) || '',
        formatDateToDMY(data.Verification_End_Date),
        data.Verified_By,
        data.Status,
        `<button onclick="handleAction(this, () => downloadDocument()" 
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;border-radius: 25px;">
              <i class="fa-solid fa-download me-1"></i> Download
            </button>`
    ]);
}

function addRowAssets(data) {
  if (!assetsTable) assetsTable = $('#myTable1').DataTable();

  // Determine button based on verification status
  const isVerified = data.isVerification === true;

  const actionButton = isVerified
    ? `<button  
         class="btn btn-sm btn-warning text-white edit-btn1" 
         data-assetid="${data.assetId}" 
         style="border:none; border-radius:25px;">
         <i class="fa fa-edit"></i> Edit
       </button>`
    : `<button  
         class="btn btn-sm text-white verify-btn" 
         data-assetid="${data.assetId}" 
         style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none; border-radius:25px;">
         <i class="fa-solid fa-check" style="color: #FFD43B;"></i> Verify
       </button>`;

  const statusText = isVerified ? 'Verified' : 'Yet to be verified';

  assetsTable.row.add([
    data.slNo || '',
    data.assetId || '',
    data.serialNo || '',
    data.userName || '',
    data.category || '',
    statusText,
    actionButton
  ]).draw(false);
}


// assetsverification model 

$('#myTable1').on('click', '.verify-btn', function () {
    const assetId = $(this).data('assetid');
    $('#modalAssetId').val(assetId); // pass it into modal

    const modal = new bootstrap.Modal(document.getElementById('verifyAssetModal'));
    modal.show();
});



// ================== table row click ==================
$(document).on('click', '.edit-btn', function () {
    const personID = $(this).data('person-id');
    loadUpdateDetails(personID);
    loadDocumentTable(personID);
    document.querySelector('#tabWrapper').classList.remove('d-none');
    document.querySelector('#tableCard').style.display = 'none';
});

// update model btn

// document.querySelector('#exitButton2').addEventListener('click', () => {
//     document.querySelector('#tabWrapper').classList.add('d-none');
//     document.querySelector('#tableCard').style.display = 'block';
// });



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
         text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel"
      },
      {
        extend: 'pdf',
        text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
    className: "btn-pdf"
      },
      {
        extend: 'colvis',
        text: `
      <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns
    `,
    className: "btn-colvis"
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

    

// add assetsVerification

// ================== Verify / Edit Asset Modal ==================
const verifyModalEl = document.getElementById('verifyAssetModal');
const verifyModal = new bootstrap.Modal(verifyModalEl);

//  Always restore scroll after closing
verifyModalEl.addEventListener('hidden.bs.modal', () => {
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.documentElement.style.overflowY = 'auto';
  $('.modal-backdrop').remove();
});

// Global flag to track mode (verify/edit)
let isEditMode = false;

//  Open modal for verifying a new asset
$('#myTable1').on('click', '.verify-btn', function () {
  const assetId = $(this).data('assetid');

  isEditMode = false;
  $('#verifyModalTitle').html('<i class="fa fa-check-circle me-2"></i> Verify Asset');
  $('#saveVerificationBtn')
    .removeClass('btn-warning')
    .addClass('btn-success')
    .html('<i class="fa fa-save me-1"></i> Save');

  $('#modalAssetId').val(assetId);
  $('#verifiedStatus').val('');
  $('#verifiedReason').val('');

  verifyModal.show();
});

//  Open modal for editing an existing verification
$('#myTable1').on('click', '.edit-btn1', async function () {
  const assetId = $(this).data('assetid');

  isEditMode = true;
  $('#verifyModalTitle').html('<i class="fa fa-edit me-2"></i> Edit Verification');
  $('#saveVerificationBtn')
    .removeClass('btn-success')
    .addClass('btn-warning bg-warning')
    .html('<i class="fa fa-sync-alt me-1"></i> Update');

  $('#modalAssetId').val(assetId);

  try {
    // 🟩 Fetch existing verification data for that asset
    const res = await api.getAssetVerificationByAssetId(assetId);
      $('#verifiedStatus').val(res[0].Verified_Status);
      $('#verifiedReason').val(res[0].Reason);
  } catch (err) {
    console.error('❌ Failed to load previous verification:', err);
  }

  verifyModal.show();
});

//  Save or Update verification (depending on mode)
$('#saveVerificationBtn').on('click', async function () {
  const assetId = $('#modalAssetId').val();
  const verifiedStatus = $('#verifiedStatus').val();
  const reason = $('#verifiedReason').val().trim();
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  const verifiedBy = userData.name;

  if (!assetId || !verifiedStatus) {
    showWarningPopupFadeInDown('⚠️ Please select a status.');
    return;
  }

  let verificationId = localStorage.getItem('currentVerificationId');
  if (!verificationId || verificationId === "undefined" || verificationId === "null") {
    verificationId = await startVerificationCycle(verifiedBy);
    if (!verificationId) {
      showErrorPopupFadeInDown('❌ Could not start verification cycle.');
      return;
    }
  }

  const data = { assetId, verificationId, verifiedStatus, reason, verifiedBy };

 try {
  // backend call
  await api.updateAssetVerification(data);

  showSucessPopupFadeInDownLong(isEditMode
    ? ` Verification updated for Asset ${assetId}!`
    : ` Asset verified successfully!\nVerification ID: ${verificationId}`);

  verifyModal.hide();

  const table = $('#myTable1').DataTable();
  const rowBtn = $(`button[data-assetid="${assetId}"]`);
  const row = rowBtn.closest('tr');

  //  Update the verified status column (index 5)
  const statusText = 'Verified';
  table.cell(row, 5).data(statusText);

  //  Update button style and text immediately
  const editButtonHtml = `<button class="btn btn-warning edit-btn1 btn-sm" data-assetid="${assetId}">
      <i class="fa fa-edit"></i> Edit
    </button>`;

  // Replace the existing button HTML inside that row
  table.cell(row, 6).data(editButtonHtml); // column 6 = actions column
  table.row(row).invalidate().draw(false);

  //  Instantly update other buttons (like Resume Verification)
  updateVerificationButtons();

} catch (err) {
  console.error('❌ Error saving verification:', err);
  showErrorPopupFadeInDown('Error: ' + err.message);
}

});


// 🧠 Function: check if all rows verified & update button states
function updateVerificationButtons() {
  const table = $('#myTable1').DataTable();
  const data = table.rows().data().toArray();

  const allVerified = data.every(row => row[5]?.toLowerCase() === 'verified');
  const anyVerified = data.some(row => row[5]?.toLowerCase() === 'verified');

  const completeBtn = $('#completeVerificationBtn');
  const startBtn = $('#addNew');

  //  Enable or disable Complete button
  if (allVerified) {
    completeBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-danger');
  } else {
    completeBtn.prop('disabled', true).removeClass('btn-danger').addClass('btn-secondary');
  }

  //  Change Start Verification button if any verified
if (anyVerified) {
  startBtn
    .removeClass('btn-primary')
    .addClass('btn-warning btn-resume')
    .find('span')
    .text('Resume Verification');
} else {
  startBtn
    .removeClass('btn-warning btn-resume')
    .addClass('btn-primary')
    .find('span')
    .text('Start Verification');
}

}

// 🧩 Run check on page load or after table updates
$(document).ready(function () {
  const table = $('#myTable1').DataTable();

  table.on('draw', function () {
    updateVerificationButtons();
  });

  updateVerificationButtons();
});



//  Start a new verification cycle
async function startVerificationCycle(verifiedBy) {
  try {
    const data = { verifiedBy };
    const result = await api.addAssetVerification(data);
    const newVerificationId = result?.verificationId;
    if (newVerificationId) {
      localStorage.setItem('currentVerificationId', newVerificationId);
      return newVerificationId;
    }
    return null;
  } catch (err) {
    console.error('❌ Error starting verification:', err);
    return null;
  }
}

//  Handle completing a verification cycle
$('#completeVerificationBtn').on('click', async function () {
  const verificationId = localStorage.getItem('currentVerificationId');
  if (!verificationId) {
    showWarningPopupFadeInDown('⚠️ No active verification cycle found.');
    return;
  }

  if (!confirm('Are you sure you want to complete this verification cycle?')) return;

  try {
    await api.completeAssetVerification({verificationId});

      showSucessPopupFadeInDownLong(` Verification cycle ${verificationId} completed!`);
      localStorage.removeItem('currentVerificationId');
      setTimeout(() => {
      location.reload();
    }, 1000);



  } catch (err) {
    console.error('❌ Complete cycle error:', err);
    showErrorPopupFadeInDown('Error: ' + err.message);
  }
});


//  Check if all assets are verified
function checkIfAllAssetsVerified() {
  const totalRows = $('#myTable1 tbody tr').length;
  let verifiedCount = 0;

  $('#myTable1 tbody tr').each(function () {
    const statusCell = $(this).find('td').eq(5).text().trim(); // Column 6 = status text
    if (statusCell && statusCell !== 'Yet to be verified') {
      verifiedCount++;
    }
  });

  // If all verified → enable the Complete button
  if (verifiedCount === totalRows && totalRows > 0) {
    $('#completeVerificationBtn')
      .removeAttr('disabled')
      .removeClass('btn-secondary')
      .addClass('btn-danger');
  } else {
    $('#completeVerificationBtn')
      .attr('disabled', true)
      .removeClass('btn-danger')
      .addClass('btn-secondary');
  }
}

// edit update 

async function handleUpdateVerification(assetId, verificationId) {
  const verifiedStatus = $('#verifiedStatus').val();
  const reason = $('#verifiedReason').val().trim();
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  const verifiedBy = userData.name;

  if (!verifiedStatus) {
    showWarningPopupFadeInDown('⚠️ Please select a status.');
    return;
  }

  try {
    await api.updateAssetVerification({
      assetId,
      verificationId,
      verifiedStatus,
      reason,
      verifiedBy
    });

    verifyModal.hide();
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css('overflow', '');

    showSucessPopupFadeInDownLong(' Asset verification updated successfully!');

    // Update table text
    const rowBtn = $(`button[data-assetid="${assetId}"]`);
    rowBtn.closest('tr').find('td').eq(5).text(verifiedStatus);

  } catch (err) {
    console.error('❌ Error updating asset verification:', err);
    showErrorPopupFadeInDown('Error: ' + err.message);
  }
}


// 🔄 Refresh page when Exit button clicked
$('#exitButton').on('click', function () {
  location.reload(); // refresh the current page
});


// localStorage.removeItem('currentVerificationId');