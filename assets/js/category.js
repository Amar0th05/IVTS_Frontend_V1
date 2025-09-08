$(document).ready(async ()=>{

    roles = await axiosInstance.get('/roles/role/perms');
    roles = roles.data.roles;
    // console.log(roles);
    window.roles = roles;

    handlePermission('#user-name-display');

    // const user=JSON.parse(sessionStorage.getItem('user'));
    // const token=sessionStorage.getItem('token');

    // if(!token||!user){
    //     window.location.replace("login.html");
    // }

    // if(user.role!==2){
    //     window.location.replace("index.html");
    // }

    // $('#user-name-display').text(user.name);

    

                    
});


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
    data.created_on=new Date(data.created_on).toLocaleDateString();
    table.row.add([
        data.category_name,
        data.created_on,
        `<div class="container">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.category_id}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 " style="cursor:pointer;" data-toggle="modal" data-target="#updateCategoryModal" onclick="loadUpdateCategory(${data.category_id})">
                <i class="ti-pencil-alt text-inverse" style="font-size: larger;"></i>
            </span>
        </div>`,
        
    ]).draw(false);

}



//toggle status
async function toggleStatus(element, id) {
    if (!id) return;

    try {
        const response = await axiosInstance.put(`/equipmentCategories/status/${id}`);
        if (element) {
            element.classList.toggle('active');
            
        }
    } catch (error) {
        showErrorPopupFadeInDown(error.response?.data?.message || 'Failed to update status. Please try again later.');
    }
}

const updateCategoryButton = document.getElementById('update_category_btn');
const createCategoryButton = document.getElementById('create_category_btn');

document.querySelector('#update_category_btn').addEventListener('click', async () => {
    const id = updateCategoryButton.dataset.categoryID;
    const category=document.getElementById('update-categoryName').value;
    
    try{
        const response=await api.updateCategory(id,category);
        showPopupFadeInDown(response.message);
        await refreshTable();
    }catch(error){
        showErrorPopupFadeInDown('Failed to update stage. Please try again later.');
    }
});


createCategoryButton.addEventListener('click', async () => {
    const category=document.getElementById('category-name-input').value;
    if(!category){
        showErrorPopupFadeInDown('Catagory is required');
        return;
    }
    console.log(category);
   try{
        await api.createcategory(category);
        await refreshTable();
   }catch(error){
       showErrorPopupFadeInDown('Failed to create stage. Please try again later.');
   }
   
});

//update course
async function loadUpdateCategory(id) {
    id = parseInt(id);
    const category = await api.getCategory(id);

    if (!category) {
        showErrorPopupFadeInDown('Equipment Category Not Found.');
        return;
    }

    const categoryNameField = document.getElementById('update-categoryName');
    categoryNameField.value = category.category_name;

    updateCategoryButton.dataset.categoryID = id;
}


async function getAllEquipmentCategory(){
    try{
       const categories=await api.getAllEquipmentCategories();
       categories.forEach(category=>addRow(category));
    }catch(error){
        console.error('Error fetching stages:', error);
    }
}

async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
        table = $('#myTable').DataTable();
        table.clear();
    }

    await getAllEquipmentCategory();
}

$(document).ready(async function() {
    await refreshTable();
});