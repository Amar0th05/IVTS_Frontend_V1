

// side bar 
document.addEventListener('DOMContentLoaded',async ()=>{

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#username');
});
// side bar end

// Leave Management JS
  $(document).ready(function () {
  const table = $('#myTable').DataTable({
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
  table.buttons().container().appendTo($('#exportButtons'));



    // Fetch leave data from backend
   async function fetchLeaveSummary() {
    try {
        const leaves = await api.getAllLeave();
        table.clear();

        leaves.forEach(leave => {
            // 🎨 Style the Leave Status
            let statusBadge = '';
            switch (leave.leaveStatus.toLowerCase()) {
                case 'approved':
                    statusBadge = `<span class="status-badge rounded-pill fs-5 bg-success ">
                                      <i class="fa-solid fa-circle-check me-1"></i> Approved
                                   </span>`;
                    break;
                case 'pending':
                    statusBadge = `<span class="status-badge rounded-pill bg-warning text-dark">
                                      <i class="fa-solid fa-spinner spin-icon me-1"></i> Pending
                                   </span>`;
                    break;
                case 'rejected':
                    statusBadge = `<span class="status-badge rounded-pill bg-danger">
                                      <i class="fa-solid fa-circle-xmark me-1"></i> Rejected
                                   </span>`;
                    break;
                default:
                    statusBadge = `<span class="status-badge rounded-pill bg-secondary">
                                      <i class="fa-solid fa-circle-question me-1"></i> ${leave.leaveStatus}
                                   </span>`;
            }

            table.row.add([
                leave.leaveId,
                leave.employeeId,
                leave.employeeName,
                leave.month,
                leave.totalDays,
                leave.leaveType,
                statusBadge // 👈 styled badge added here
            ]);
        });

        table.draw();
    } catch (error) {
        console.error("Error fetching leave summary:", error);
        toastr.error("Failed to load leave summary");
    }
}


    fetchLeaveSummary();

    function applyFilters() {
    const month = $('#monthFilter').val().toLowerCase();
    const leaveType = $('#leaveTypeFilter').val().toLowerCase();
    const status = $('#statusFilter').val().toLowerCase();
    const employee = $('#employeeFilter').val().toLowerCase();

    const leaveTypeMap = {
        'cl': 'casual',
        'sl': 'sick',
        'el': 'earned',
        'comp-off': 'compensatory off (comp-off)',
        'other': 'other'
    };

    // ✅ Use DataTables built-in search filter
    $.fn.dataTable.ext.search = []; // clear old filters

    $.fn.dataTable.ext.search.push(function (settings, data) {
        const tableMonth = data[3]?.toLowerCase() || '';
        const tableLeaveType = (leaveTypeMap[data[4]?.toLowerCase()] || data[4])?.toLowerCase() || '';
        const tableStatus = $('<div>').html(data[5]).text().trim().toLowerCase();
        const tableEmployeeName = data[2]?.toLowerCase() || '';
        const tableEmployeeId = data[1]?.toString().toLowerCase() || '';

        const matchesMonth = !month || tableMonth === month;
        const matchesType = !leaveType || tableLeaveType === leaveType;
        const matchesEmployee =
            !employee || 
            tableEmployeeName.includes(employee) || 
            tableEmployeeId.includes(employee);
        const matchesStatus = !status || tableStatus === status;

        return matchesMonth && matchesType && matchesStatus && matchesEmployee;
    });

    table.draw(); // ✅ Redraw with filter applied
}


$('#monthFilter, #leaveTypeFilter, #statusFilter').on('change', applyFilters);
$('#employeeFilter').on('keyup', applyFilters);
});

// Map short leave types to full names
const leaveTypeMap = {
    "CL": "Casual Leave (CL)",
    "SL": "Sick Leave (SL)",
    "EL": "Earned Leave (EL)",
    "Comp-off": "Compensatory Off (Comp-off)",
    "Other": "Other"
};




