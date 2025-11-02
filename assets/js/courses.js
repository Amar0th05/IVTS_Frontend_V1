
//table instance 
let table;

//add row
async function addRow(data){
    if ( $.fn.dataTable.isDataTable( '#myTable' ) ) {
        table = $('#myTable').DataTable();
    }
    if(!data){
        console.error('no data to add');
        return;
    }
    if(data.status){
        data.status=true;
    }else{
        data.status=false;
    }
    data.createdOn=new Date(data.createdOn).toLocaleDateString();
    table.row.add([
        data.courseName,
        data.createdOn,
        `<div class="container d-flex justify-content-center">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.courseID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 edit-btn" style="cursor:pointer;" data-toggle="modal" data-target="#updatecourseModal" onclick="loadUpdateCourse(${data.courseID})">
                <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}


const addNewCourseButton=document.getElementById('add_course_btn');
const updateCourseButton=document.getElementById('update_course_btn');



//add course event handler
addNewCourseButton.addEventListener('click',async ()=>{
    const courseNameField=document.getElementById('course-name-input');
    const courseName=courseNameField.value;
    if(courseName.trim() === ''){
        showErrorPopupFadeInDown('Please enter a course name.');
        return;
    }
    await refreshTable();
    addNewCourse(courseName);
    courseNameField.value='';
})




//add course
async function addNewCourse(courseName){
    try {
        const data = await api.createCourse(courseName);
        if(data.message){
            showSucessPopupFadeInDownLong(data.message);
        }
        await refreshTable();

    } catch (err) {
        console.error('Error adding course:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to add new course. Please try again later.');
    }
}


//update course
async function loadUpdateCourse(id) {
    id = parseInt(id);
    const course = await getCourse(id);

    if (!course) {
        showErrorPopupFadeInDown('Course not found.');
        return;
    }

    const courseNameField = document.getElementById('update-courseName');
    courseNameField.value = course.course_name;

    updateCourseButton.dataset.courseId = id;
}


updateCourseButton.addEventListener('click', async () => {
    const id = updateCourseButton.dataset.courseId;
    if (!id) {
        showErrorPopupFadeInDown('No course selected.');
        return;
    }

    const courseNameField = document.getElementById('update-courseName');
    const updatedCourseName = courseNameField.value.trim();

    if (updatedCourseName === '') {
        showErrorPopupFadeInDown('Please enter a course name.');
        return;
    }

    try {
        await axiosInstance.put(`/courses/${id}`, { courseName: updatedCourseName });
        showSucessPopupFadeInDownLong("Course updated");
        await refreshTable();
    } catch (err) {
        console.error('Error updating course:', err);
        showErrorPopupFadeInDown(err.response?.data?.message || 'Failed to update course. Please try again later.');
    }
});




//get all courses
async function getAllCourses(){
 
    const courses=await api.getAllCourses();
    courses.forEach(addRow);
}


//get course
async function getCourse(id){
    try {
        const response=await axiosInstance.get(`/courses/${id}`);
        return response.data.course;
    } catch (error) {
        console.error('Error getting course:', error);
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to get course. Please try again later.');
    }
}

//logout
document.getElementById('logout-button').addEventListener('click', logout);
function logout() {
    sessionStorage.removeItem('token');
}

//toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const response = await axiosInstance.put(`/courses/status/${id}`);
        if (element) {
            element.classList.toggle('active');
            
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

//dom loaded
document.addEventListener('DOMContentLoaded',async()=>{
    await getAllCourses();
});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllCourses();
}
$(document).ready(function () {
        // Initialize DataTable
        var table = $('#myTable').DataTable({
            "paging": true,
            "pageLength": 25,
            "lengthMenu": [5, 10, 25, 50, 100],
              dom: '<"top"lBf>rt<"bottom"ip><"clear">', // Define the layout
            buttons: [
        {
            extend: 'excelHtml5',
 text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel",            exportOptions: {
                columns: [0,1,2],
                format: {
                    body: function (data, row, column, node) {
                        
                        if ($(node).find('.toggle-btn').length) {
                            return $(node).find('.toggle-btn').hasClass('active') ? 'True' : 'False';
                        }
                        return data;
                    }
                }
            }
        },
        {
            extend: 'pdfHtml5',
            text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
    className: "btn-pdf",
            exportOptions: {
                columns: [0,1,2],
                format: {
                    body: function (data, row, column, node) {
                        if ($(node).find('.toggle-btn').length) {
                            return $(node).find('.toggle-btn').hasClass('active') ? 'True' : 'False';
                        }
                        return data;
                    }
                }
            }
        }
    ],
        // Append buttons to the specified container
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

        // Append buttons to the specified container
        table.buttons().container().appendTo('#exportButtons');
    });