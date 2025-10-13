

// side bar 
document.addEventListener('DOMContentLoaded',async ()=>{

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
    handlePermission('#username');


    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = generateSidebar();
        
       
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const navLinks = document.querySelectorAll('.pcoded-item a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.parentElement.classList.add('active');
                
            
                const accordionContent = link.closest('.accordion-content');
                if (accordionContent) {
                    accordionContent.style.display = 'block';
                    const header = accordionContent.previousElementSibling;
                    const icon = header.querySelector('.accordion-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }
        });
    }

    
    
    handlePermission('#username');
});
// side bar end

// Leave Management JS
$(document).ready(function () {
    const table = $('#myTable').DataTable({
        columns: [
            { title: "Leave ID" },       // NEW column
            { title: "Emp. ID" },
            { title: "Employee Name" },
            { title: "Month" },
            { title: "Leave Type" },
            { title: "Status" }
        ],
        responsive: true,
        paging: true,
        searching: true,
        info: true,
        order: [[0, 'asc']],
        buttons: ['excel', 'csv', 'pdf']
    });

    // Fetch leave data from backend
    async function fetchLeaveSummary() {
        try {
            const leaves = await api.getAllLeave();
            

            table.clear();

            leaves.forEach(leave => {
                table.row.add([
                    leave.leaveId,          // NEW column
                    leave.employeeId,
                    leave.employeeName,
                    leave.month,
                    leave.leaveType,
                    leave.leaveStatus
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
    const month = $('#monthFilter').val().toLowerCase();       // convert filter to lowercase
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

    table.rows().every(function () {
        const data = this.data();

        // Map leaveType from table to display value and convert to lowercase
        const tableLeaveType = (leaveTypeMap[data[4].toLowerCase()] || data[4]).toLowerCase();
        const tableMonth = data[3].toLowerCase();
        const tableStatus = data[5].toLowerCase();
        const tableEmployeeName = data[2].toLowerCase();
        const tableEmployeeId = data[1].toString().toLowerCase();

        const matchesMonth = !month || tableMonth === month;
        const matchesType = !leaveType || tableLeaveType === leaveType;
        const matchesEmployee =
            !employee || 
            tableEmployeeName.includes(employee) || 
            tableEmployeeId.includes(employee);
        const matchesStatus = !status || tableStatus === status;

        if (matchesMonth && matchesType && matchesStatus && matchesEmployee) {
            $(this.node()).show();
        } else {
            $(this.node()).hide();
        }
    });
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

// Export Leave Management to PDF
function exportToPDF() {
    const table = $('#myTable').DataTable();
    const data = table.rows({ search: 'applied' }).data().toArray(); // only filtered rows

    const tableBody = [
        ["Leave ID", "Employee ID", "Employee Name", "Month", "Leave Type", "Status"],
        ...data.map(row => [
            row[0], // Leave ID
            row[1], // Employee ID
            row[2], // Employee Name
            row[3], // Month
            leaveTypeMap[row[4]] || row[4], // full Leave Type
            row[5]  // Status
        ])
    ];

    const docDefinition = {
        pageOrientation: "landscape",
        content: [
            { text: "Leave Summary", style: "header" },
            { table: { headerRows: 1, widths: ["10%", "15%", "25%", "15%", "20%", "15%"], body: tableBody } }
        ],
        styles: { header: { fontSize: 16, bold: true, margin: [0,0,0,10] } },
        defaultStyle: { fontSize: 10 }
    };

    pdfMake.createPdf(docDefinition).download("Leave_Summary.pdf");
}

// Export Leave Management to Excel
function exportToExcel() {
    const table = $('#myTable').DataTable();
    const data = table.rows({ search: 'applied' }).data().toArray(); // only filtered rows

    const headers = ["Leave ID", "Employee ID", "Employee Name", "Month", "Leave Type", "Status"];
    const excelData = data.map(row => [
        row[0], // Leave ID
        row[1], // Employee ID
        row[2], // Employee Name
        row[3], // Month
        leaveTypeMap[row[4]] || row[4], // full Leave Type
        row[5]  // Status
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Summary");
    XLSX.writeFile(wb, "Leave_Summary.xlsx");
}



