// let initalLoad=true;
let updating=false;
let isInitializing = true;
let updateRoleID=null;


document.addEventListener('DOMContentLoaded', async function() {
    let modules = await axiosInstance.get('/modules/all');
    modules = modules.data.modules;
  
    // Initialize permissions table with switches
    function initializePermissions() {
      const table = document.getElementById('permissionsTable');
      table.innerHTML = '';
  
      modules.forEach(module => {
        const row = document.createElement('tr');
        row.dataset.moduleId = module.id;
        // Add this line to store the module name in data-module-name
        row.dataset.moduleName = module.name; // <-- This is the change
  
        row.innerHTML = `
          <td>${module.name}</td>
          <td class="text-center">
            <div class="form-check form-switch d-inline-block">
              <input class="form-check-input read-toggle" type="checkbox" 
                     id="read_${module.id}" checked style="width: 3em; height: 1.5em;">
            </div>
          </td>
          <td class="text-center">
            <div class="form-check form-switch d-inline-block">
              <input class="form-check-input write-toggle" type="checkbox" 
                     id="write_${module.id}" style="width: 3em; height: 1.5em;">
            </div>
          </td>
        `;
        isInitializing = false;
        table.appendChild(row);
      });

      
  
      // Set up event listeners
      document.querySelectorAll('.read-toggle').forEach(toggle => {
        toggle.addEventListener('change', async function() {
          const moduleId = this.closest('tr').dataset.moduleId;
          const writeToggle = document.querySelector(`#write_${moduleId}`);
          // console.log(updating);
          

          if (this.checked) {
            writeToggle.disabled = false;
          } else {
            writeToggle.checked = false;
            writeToggle.disabled = true;
          }

          if(!isInitializing && updating && updateRoleID){
            if(this.checked){
              
              console.log(moduleId,' permitted read for ',updateRoleID);
                await updatePermission(updateRoleID,moduleId,'CanRead',1);
            }else{
              await updatePermission(updateRoleID,moduleId,'CanRead',0);
              await updatePermission(updateRoleID,moduleId,'CanWrite',0);
              console.log(moduleId,' not permitted read for ',updateRoleID);
              console.log(moduleId,'not permitted write for ',updateRoleID);
            }
          } 
        });
      });
      document.querySelectorAll('.write-toggle').forEach(toggle => {
        toggle.addEventListener('change', async function() {
          const moduleId = this.closest('tr').dataset.moduleId;
          const writeToggle = document.querySelector(`#write_${moduleId}`);
          // console.log(updating);
          

          // if (this.checked) {
          //   writeToggle.disabled = false;
          // } else {
          //   writeToggle.checked = false;
          //   writeToggle.disabled = true;
          // }

          if(!isInitializing && updating && updateRoleID){
            if(this.checked){
              await updatePermission(updateRoleID,moduleId,'CanWrite',1);
              console.log(moduleId,' permitted write for ',updateRoleID);
            }else{
              await updatePermission(updateRoleID,moduleId,'CanWrite',0);
              console.log(moduleId,' not permitted write for ',updateRoleID);
            }
          }
        });
      });

     
      // Initialize write toggles based on read toggles
      document.querySelectorAll('.read-toggle').forEach(toggle => {
        // console.log('65');
        toggle.dispatchEvent(new Event('change'));
      });
  
      // Save button handler
      document.getElementById('savePermissions').addEventListener('click', savePermissions);
      document.getElementById('cancelPermissions').addEventListener('click', cancelPermissions);
      document.getElementById('updatePermission').addEventListener('click', updatePermissions);
    }
  
    async function savePermissions() {
      const permissions = [];
      const roleName = document.querySelector('#rolenameInput').value.trim();
  
      // Validate role name
      if (!roleName) {
        showErrorPopupFadeInDown('Please enter a role name');
        return;
      }
  
      // Collect permissions and check if at least one is selected
      let hasPermission = false;
      document.querySelectorAll('tr[data-module-id]').forEach(row => {
        const moduleId = row.dataset.moduleId;
        const readToggle = document.querySelector(`#read_${moduleId}`);
        const writeToggle = document.querySelector(`#write_${moduleId}`);
        const canRead = readToggle.checked;
        const canWrite = canRead && writeToggle.checked;
  
        if (canRead || canWrite) {
          hasPermission = true;
        }
  
        permissions.push({
          moduleId: parseInt(moduleId),
          canRead: canRead,
          canWrite: canWrite
        });
      });
  
      // Validate at least one permission is selected
      if (!hasPermission) {
        showErrorPopupFadeInDown('Please select at least one permission');
        return;
      }
  
      const data = {
        name: roleName,
        permissions
      };
  
      try {
        // Make the POST request to save the data
        const result = await axiosInstance.post('/roles', data);
  
        if (result.status === 200 || result.status === 201) {
          console.log('Permissions saved successfully:', result.data);
          showPopupFadeInDown('Permissions saved successfully!');
          await refreshTable();
        } else {
          console.error('Failed to save permissions:', result);
          showErrorPopupFadeInDown('Failed to save permissions. Please try again.');
        }
      } catch (error) {
        console.error('Error saving permissions:', error);
        showErrorPopupFadeInDown(error.response?.data?.message || 'An error occurred while saving permissions');
      }
    }
  
    // Cancel button handler
    function cancelPermissions() {
      
      document.querySelector('#rolenameInput').value = '';
  
     
      document.querySelectorAll('tr[data-module-id]').forEach(row => {
        const moduleId = row.dataset.moduleId;
        const readToggle = document.querySelector(`#read_${moduleId}`);
        const writeToggle = document.querySelector(`#write_${moduleId}`);
  
        readToggle.checked = true;
        writeToggle.checked = false;
        writeToggle.disabled = false;
  
        document.getElementById('viewSection').classList.remove('d-none');
        document.getElementById('addSection').classList.add('d-none');
      });
  
      // showPopupFadeInDown('Changes discarded');
    }
    
    initializePermissions();
   
  });
  
  let table;
  
  //add row
  async function addRow(data) {
    if(data.roleID!==2){
    if ($.fn.dataTable.isDataTable('#myTable')) {
      table = $('#myTable').DataTable();
    }
    if (!data) {
      console.error('no data to add');
      return;
    }
    table.row.add([
      data.role.toUpperCase(),
      `<div class="d-flex justify-content-center">
        <button class="btn btn-facebook btn-sm rounded-pill shadow " onclick="loadUpdateRoles(${data.roleID})"><i class="ti ti-eye p-1"></i>View</button>
      </div>`,
    ]).draw(false);
  }
  }
  
  async function getAllRoles() {
    try {
      const roles = await api.getAllRoles();
      roles.map(role => addRow(role));
    } catch (error) {
      console.log(error);
    }
  }
  
  async function getRoleById(roleId) {
    try {
      const role = await api.getRoleById(roleId);
      return role;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  async function loadUpdateRoles(id) {
    updating=true;
    // initalLoad=false;
    updateRoleID=id;
    isInitializing=true;
    id = parseInt(id);
    let role = await axiosInstance.get('/roles/role/perms/' + id);
    role = role.data.roles;
    // console.log(role);
  
    if (!role) {
      showErrorPopupFadeInDown('Role not found.');
      return;
    }
  
    document.getElementById('roleIdInput').value = id;
  
    role = Object.values(role)[0]; // Important change
    const roleNameField = document.getElementById('rolenameInput');
    roleNameField.value = role.name; // role.role => role.name
  
    document.querySelectorAll('tr[data-module-id]').forEach(row => {
      const moduleId = row.dataset.moduleId;
      const readToggle = document.querySelector(`#read_${moduleId}`);
      const writeToggle = document.querySelector(`#write_${moduleId}`);
  
      readToggle.checked = false;
      writeToggle.checked = false;
      writeToggle.disabled = true;
    });
  
    let permissions = [];
  
    let allModules = new Set([...role.writes || [], ...role.reads || []]);
  
    allModules.forEach(moduleName => {
      const moduleRow = document.querySelector(`tr[data-module-name="${moduleName}"]`);
      if (!moduleRow) return;
  
      const moduleId = moduleRow.dataset.moduleId;
      if (!moduleId) return;
  
      permissions.push({
        moduleId: parseInt(moduleId),
        canRead: role.reads && role.reads.includes(moduleName),
        canWrite: role.writes && role.writes.includes(moduleName)
      });

     
    });
  
    
    permissions.forEach(permission => {
      const moduleId = permission.moduleId;
      const canRead = permission.canRead;
      const canWrite = permission.canWrite;
  
      const readToggle = document.querySelector(`#read_${moduleId}`);
      const writeToggle = document.querySelector(`#write_${moduleId}`);
  
      if (readToggle) {
        readToggle.checked = canRead;
        // console.log('261');
        readToggle.dispatchEvent(new Event('change'));
        // initalLoad=false;
      }
  
      if (writeToggle && canRead) {
        writeToggle.checked = canWrite;
      }
      
    });

    // initializeUpdatePermissions(allModules);
    isInitializing=false;
  
    document.getElementById('viewSection').classList.add('d-none');
    document.getElementById('addSection').classList.remove('d-none');
    document.getElementById('updatePermission').classList.add('d-none');
    document.getElementById('savePermissions').classList.add('d-none');
    document.getElementById('cancelPermissions').textContent='Close';
  }
  
  async function updatePermissions() {
    const roleId = document.getElementById('roleIdInput').value;
    const roleName = document.getElementById('rolenameInput').value.trim();
    const permissions = [];
  
    document.querySelectorAll('tr[data-module-id]').forEach(row => {
      const moduleId = row.dataset.moduleId;
      const readToggle = document.querySelector(`#read_${moduleId}`);
      const writeToggle = document.querySelector(`#write_${moduleId}`);
      const canRead = readToggle.checked;
      const canWrite = writeToggle.checked;
  
      permissions.push({
        moduleId: parseInt(moduleId),
        canRead: canRead,
        canWrite: canWrite
      });
    });
  
    const data = {
      name: roleName,
      permissions: permissions
    };
  
    try {
      const response = await axiosInstance.put(`/roles/${roleId}`, data);
  
      if (response.status === 200) {
        showPopupFadeInDown('Role updated successfully!');
        await refreshTable();
      }
    } catch (error) {
      showErrorPopupFadeInDown('Failed to update role.');
      console.error('Error updating role:', error);
    }
  }
  
  async function refreshTable() {
    if ($.fn.dataTable.isDataTable('#myTable')) {
      table = $('#myTable').DataTable();
      table.clear();
    }
  
    await getAllRoles();
  }
  
  $(document).ready(async function () {
    await refreshTable();
  });
  
  document.getElementById('add_course_btn').addEventListener('click', async function () {
    updating=false;
    updateRoleID=null;
    document.getElementById('viewSection').classList.add('d-none');
    document.getElementById('addSection').classList.remove('d-none');
    document.getElementById('updatePermission').classList.add('d-none');
    document.getElementById('savePermissions').classList.remove('d-none');
    document.getElementById('cancelPermissions').textContent='Cancel';
  });
  

  async function updatePermission(roleID, moduleID, permission, value) {
    try {
      if (!roleID || !moduleID || !permission || value === undefined || value === null) {
        throw new Error("Missing required parameters.");
      }
  
      const response = await axiosInstance.put(`/roles/perms/${roleID}`, {
        permission: permission,
        value: value,
        ModuleID: moduleID
      });
  
      
      return response.data;
  
    } catch (err) {
      showErrorPopupFadeInDown(err.response.data.message);
      // console.log(err.response.data.message);
      // console.error("Error in updating permission:", err.message || err);
      throw new Error(err.response?.data?.message || "Something went wrong");
    }
  }
  