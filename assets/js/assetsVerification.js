
// ================== Global variables ==================
let table;
let assetsTable;
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
        const talent = await api.getAllPersons();
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

function addRow(data) {
    if (!table) table = $('#myTable').DataTable();
    table.row.add([
        data.personID || '',
        formatDate(data.dateOfBirth) || '',
        formatDate(data.dateOfBirth),
        'Naresh Kumar',
        `<button onclick="handleAction(this, () => downloadDocument()" 
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;border-radius: 25px;">
              <i class="fa-solid fa-download me-1"></i> Download
            </button>`
    ]);
}

function addRowAssets(data) {
    if (!assetsTable) assetsTable = $('#myTable1').DataTable();
    assetsTable.row.add([
        data.slNo || '',
        data.assetId || '',
        data.serialNo,
        data.userName || '',
        data.category || '',
        'Yet to be verfied',
        `<button onclick="handleAction(this, () => downloadDocument()" 
                    class="btn btn-sm text-white" 
                    style="background:linear-gradient(to bottom right, #69A1FF, #1E3FA0); border:none;border-radius: 25px;">
              <i class="fa-solid fa-spinner fa-spin" style="color: #FFD43B;"></i> pending
            </button>`
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




