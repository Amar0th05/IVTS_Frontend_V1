async function addRow(data) {
    let table = $('#indentsTable').DataTable();
    if ($.fn.dataTable.isDataTable('#indentsTable')) {
      table = $('#indentsTable').DataTable();
    }
    if (!data) {
      console.error('no data to add');
      return;
    }
  
    data=replaceNullValuesWithDash(data);
    
    table.row.add([
      `<td>${data.IndentID}</td>`,
      `<td>${new Date(data.CreatedAt).toLocaleDateString('en-GB')}</td>`,
      `<td><span ${data.FundCheck >= 5 ? 'class="delayed"' : ""}>${data.FundCheck}</span></td>`,
      `<td><span ${data.LPC >= 5 ? 'class="delayed"' : ""}>${data.LPC}</span></td>`,
      `<td><span ${data.IndentApproval >= 5 ? 'class="delayed"' : ""}>${data.IndentApproval}</span></td>`,
      `<td><span ${data.POApproval >= 5 ? 'class="delayed"' : ""}>${data.POApproval}</span></td>`,
      `<td><span ${data.POGeneration >= 5 ? 'class="delayed"' : ""}>${data.POGeneration}</span></td>`,
      `<td><span ${data.SRB >= 5 ? 'class="delayed"' : ""}>${data.SRB}</span></td>`,
      `<td><span ${data.ICSR >= 5 ? 'class="delayed"' : ""}>${data.ICSR}</span></td>`,
    ]).draw(false);
  
  }

  function replaceNullValuesWithDash(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
            obj[key] = ' ';
        }
    });
    return obj;
}


  document.addEventListener('DOMContentLoaded',async ()=>{

    const data = await getData();
  // console.log(data);
  data.forEach(item => {
    addRow(item);
  })
    handlePermission('#username');
});


async function getData(){
    try{
        let response = await axiosInstance.get('/indents/stages/wt');
        return response.data;
    }catch(error){
        console.error(error);
    }
}
$(document).ready(function () {
  const datatable = $('#indentsTable').DataTable({
    dom: 'Bfrtip',
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
      searchPlaceholder: "Type to search..."
    },
    initComplete: function () {
      // Remove default label text
      $('#indentsTable_filter label').contents().filter(function () {
        return this.nodeType === 3;
      }).remove();

      // Wrap search input & add icon
      $('#indentsTable_filter input').wrap('<div class="search-wrapper"></div>');
      $('.search-wrapper').prepend('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });
});



