
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
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.courseID}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updatecourseModal" onclick="loadUpdateCourse(${data.courseID})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
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
    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;
   
    handlePermission('#user-name-display');
    
    // const token = sessionStorage.getItem('token');
    // const user=JSON.parse(sessionStorage.getItem('user'));
    // if (token === null||user===null) {
    //     window.location.href = "login.html";
    // }else if(user.role!==2){
    //     window.location.href = "index.html";
    //     return;
    // }

    // document.getElementById('user-name-display').innerText=user.name;
    // // document.getElementById('more-details').innerText=user.name;
    
    await getAllCourses();
    
    
});

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllCourses();
}