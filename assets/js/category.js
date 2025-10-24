$(document).ready(async ()=>{


    handlePermission('#username');
    
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
        `<div class="container d-flex justify-content-center">
            <div class="toggle-btn ${data.status===true?'active':''}" onclick="toggleStatus(this,'${data.category_id}')">
                <div class="slider"></div>
            </div>
        </div>`
        ,
        `<div class="row d-flex justify-content-center">
            <span class="d-flex align-items-center justify-content-center p-0 edit-btn" style="cursor:pointer;" data-toggle="modal" data-target="#updateCategoryModal" onclick="loadUpdateCategory(${data.category_id})">
                <i class="fa-solid fa-pen-to-square" style="font-size: larger;"></i>
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


    $(document).ready(function () {
        
        var table = $('#myTable').DataTable({
            "paging": true,
            "pageLength": 25,
            "lengthMenu": [5, 10, 25, 50, 100],
              dom: '<"top"lBf>rt<"bottom"ip><"clear">', 
            buttons: [
        {
            extend: 'excelHtml5',
 text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
    className: "btn-excel",
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
    ]
        ,
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