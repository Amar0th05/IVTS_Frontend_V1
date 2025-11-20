// let initalLoad=true;
let updating = false;
let isInitializing = true;
let updateRoleID = null;

// production 
const moduleGroups = {
  "NTCPWC FMS": [10, 11, 12, 13, 14, 15, 16, 17, 18, 2],
  "IVTMS MANAGEMENT": [3, 4, 5, 1, 6, 7, 21],
  "EMPLOYEE MANAGEMENT": [19, 20, 24],
  "ASSETS MANAGEMENT": [22, 23],
};

// developement
// GROUP DEFINITIONS
// const moduleGroups = {
//   "NTCPWC FMS": [10, 11, 12, 13, 14, 15, 16, 17, 18, 2],
//   "IVTMS MANAGEMENT": [3, 4, 5, 6, 7, 24],
//   "EMPLOYEE MANAGEMENT": [20, 21, 1026],
//   "ASSETS MANAGEMENT": [26, 1027],
// };

document.addEventListener("DOMContentLoaded", async function () {
  let modules = await axiosInstance.get("/modules/all");
  modules = modules.data.modules;

// Initialize permissions table
function initializePermissions() {
  const container = document.getElementById("permissionsContainer");
  container.innerHTML = "";

  Object.keys(moduleGroups).forEach((groupName) => {

// ------------------------------
// GROUP HEADER (toggle control)
// ------------------------------
const headerRow = document.createElement("tr");
headerRow.classList.add("group-header");
headerRow.dataset.group = groupName;

headerRow.innerHTML = `
  <td class="group-title" style="text-align: start;padding-left: 20px;">
    <i class="fa-solid fa-layer-group me-2"></i> ${groupName}
  </td>
  <td class="text-end" colspan="2" style="text-align: end;padding-right:20px;">
    <i class="fa-solid fa-chevron-right arrow"></i>
  </td>
`;


// Add header FIRST
container.appendChild(headerRow);

// ------------------------------
// COLUMN TITLE ROW (hidden initially)
// ------------------------------
const titleRow = document.createElement("tr");
titleRow.classList.add("module-row"); // hidden until expanded
titleRow.style.borderBottom = "2px solid #acc7f7ff";
titleRow.style
titleRow.dataset.group = groupName;

titleRow.innerHTML = `
  <td><b>Module</b></td>
  <td class="text-center"><b>Read</b></td>
  <td class="text-center"><b>Write</b></td>
`;

// Add title row AFTER header
container.appendChild(titleRow);



    // ------------------------------
    // MODULE ROWS (hidden initially)
    // ------------------------------
    moduleGroups[groupName].forEach((moduleId) => {
      const module = modules.find((m) => m.id == moduleId);
      if (!module) return;

      const row = document.createElement("tr");
      row.classList.add("module-row");      // hidden by default
      row.dataset.group = groupName;
      row.dataset.moduleId = module.id;
      row.dataset.moduleName = module.name;

      row.innerHTML = `
        <td>${module.name}</td>

        <td class="text-center">
          <input type="checkbox" checked class="read-toggle"
                 id="read_${module.id}"
                 style="width: 30px; height:30px; accent-color: blue;">
        </td>

        <td class="text-center">
          <input type="checkbox" class="write-toggle"
                 id="write_${module.id}"
                 style="width: 30px; height:30px; accent-color: blue;">
        </td>
      `;

      container.appendChild(row);

      
    });
  });
  

  // ------------------------------------------
  // COLLAPSE / EXPAND TOGGLE LOGIC (NEW)
  // ------------------------------------------
document.querySelectorAll(".group-header").forEach((header) => {
  header.addEventListener("click", () => {
    const group = header.dataset.group;
    const arrow = header.querySelector(".arrow");

    // Toggle class to rotate arrow
    header.classList.toggle("open");

    document
      .querySelectorAll(`tr.module-row[data-group="${group}"]`)
      .forEach((row) => {
        if (row.style.display === "none" || row.style.display === "") {
          row.style.display = "table-row";

          // slight delay for animation effect
          setTimeout(() => row.classList.add("showing"), 10);
        } else {
          row.classList.remove("showing");
          setTimeout(() => (row.style.display = "none"), 200);
        }
      });
  });
});


  // ------------------------------------------
  // EXISTING READ WRITE LOGIC (UNCHANGED)
  // ------------------------------------------
  document.querySelectorAll(".read-toggle").forEach((toggle) => {
    toggle.addEventListener("change", async function () {
      const moduleId = this.closest("tr").dataset.moduleId;
      const writeToggle = document.querySelector(`#write_${moduleId}`);

      if (this.checked) {
        writeToggle.disabled = false;
      } else {
        writeToggle.checked = false;
        writeToggle.disabled = true;
      }

      if (!isInitializing && updating && updateRoleID) {
        if (this.checked) {
          await updatePermission(updateRoleID, moduleId, "CanRead", 1);
        } else {
          await updatePermission(updateRoleID, moduleId, "CanRead", 0);
          await updatePermission(updateRoleID, moduleId, "CanWrite", 0);
        }
      }
    });
  });

  document.querySelectorAll(".write-toggle").forEach((toggle) => {
    toggle.addEventListener("change", async function () {
      const moduleId = this.closest("tr").dataset.moduleId;

      if (!isInitializing && updating && updateRoleID) {
        if (this.checked) {
          await updatePermission(updateRoleID, moduleId, "CanWrite", 1);
        } else {
          await updatePermission(updateRoleID, moduleId, "CanWrite", 0);
        }
      }
    });
  });

  // Ensure read controls write enable/disable on load
  document.querySelectorAll(".read-toggle").forEach((toggle) => {
    toggle.dispatchEvent(new Event("change"));
  });

  // Buttons
  document
    .getElementById("savePermissions")
    .addEventListener("click", savePermissions);
  document
    .getElementById("cancelPermissions")
    .addEventListener("click", cancelPermissions);
  document
    .getElementById("updatePermission")
    .addEventListener("click", updatePermissions);
}


  async function savePermissions() {
    const permissions = [];
    const roleName = document.querySelector("#rolenameInput").value.trim();

    // Validate role name
    if (!roleName) {
      showErrorPopupFadeInDown("Please enter a role name");
      return;
    }

    // Collect permissions and check if at least one is selected
    let hasPermission = false;
    document.querySelectorAll("tr[data-module-id]").forEach((row) => {
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
        canWrite: canWrite,
      });
    });

    // Validate at least one permission is selected
    if (!hasPermission) {
      showErrorPopupFadeInDown("Please select at least one permission");
      return;
    }

    const data = {
      name: roleName,
      permissions,
    };

    try {
      // Make the POST request to save the data
      const result = await axiosInstance.post("/roles", data);

      if (result.status === 200 || result.status === 201) {
        console.log("Permissions saved successfully:", result.data);
        showPopupFadeInDown("Permissions saved successfully!");
        await refreshTable();
      } else {
        console.error("Failed to save permissions:", result);
        showErrorPopupFadeInDown(
          "Failed to save permissions. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      showErrorPopupFadeInDown(
        error.response?.data?.message ||
          "An error occurred while saving permissions"
      );
    }
  }

  // Cancel button handler
  function cancelPermissions() {
    document.querySelector("#rolenameInput").value = "";

    document.querySelectorAll("tr[data-module-id]").forEach((row) => {
      const moduleId = row.dataset.moduleId;
      const readToggle = document.querySelector(`#read_${moduleId}`);
      const writeToggle = document.querySelector(`#write_${moduleId}`);

      readToggle.checked = true;
      writeToggle.checked = false;
      writeToggle.disabled = false;

      document.getElementById("viewSection").classList.remove("d-none");
      document.getElementById("addSection").classList.add("d-none");
    });

    // showPopupFadeInDown('Changes discarded');
  }

  initializePermissions();
});

let table;

//add row
async function addRow(data) {
  if (data.roleID !== 2) {
    if ($.fn.dataTable.isDataTable("#myTable")) {
      table = $("#myTable").DataTable();
    }
    if (!data) {
      console.error("no data to add");
      return;
    }
    table.row
      .add([
        data.role.toUpperCase(),
        `<div class="d-flex justify-content-center">
  <button class="btn-green view-btn btn-sm rounded-pill shadow"
      onclick="loadUpdateRoles(${data.roleID})">
      <i class="fa-solid fa-eye"></i> 
  </button>
</div>`,
      ])
      .draw(false);
  }
}

async function getAllRoles() {
  try {
    const roles = await api.getAllRoles();
    roles.map((role) => addRow(role));
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
  updating = true;
  // initalLoad=false;
  updateRoleID = id;
  isInitializing = true;
  id = parseInt(id);
  let role = await axiosInstance.get("/roles/role/perms/" + id);
  role = role.data.roles;
  // console.log(role);

  if (!role) {
    showErrorPopupFadeInDown("Role not found.");
    return;
  }

  document.getElementById("roleIdInput").value = id;

  role = Object.values(role)[0]; // Important change
  const roleNameField = document.getElementById("rolenameInput");
  roleNameField.value = role.name; // role.role => role.name

  document.querySelectorAll("tr[data-module-id]").forEach((row) => {
    const moduleId = row.dataset.moduleId;
    const readToggle = document.querySelector(`#read_${moduleId}`);
    const writeToggle = document.querySelector(`#write_${moduleId}`);

    readToggle.checked = false;
    writeToggle.checked = false;
    writeToggle.disabled = true;
  });

  let permissions = [];

  let allModules = new Set([...(role.writes || []), ...(role.reads || [])]);

  allModules.forEach((moduleName) => {
    const moduleRow = document.querySelector(
      `tr[data-module-name="${moduleName}"]`
    );
    if (!moduleRow) return;

    const moduleId = moduleRow.dataset.moduleId;
    if (!moduleId) return;

    permissions.push({
      moduleId: parseInt(moduleId),
      canRead: role.reads && role.reads.includes(moduleName),
      canWrite: role.writes && role.writes.includes(moduleName),
    });
  });

  permissions.forEach((permission) => {
    const moduleId = permission.moduleId;
    const canRead = permission.canRead;
    const canWrite = permission.canWrite;

    const readToggle = document.querySelector(`#read_${moduleId}`);
    const writeToggle = document.querySelector(`#write_${moduleId}`);

    if (readToggle) {
      readToggle.checked = canRead;
      // console.log('261');
      readToggle.dispatchEvent(new Event("change"));
      // initalLoad=false;
    }

    if (writeToggle && canRead) {
      writeToggle.checked = canWrite;
    }
  });

  // initializeUpdatePermissions(allModules);
  isInitializing = false;

  document.getElementById("viewSection").classList.add("d-none");
  document.getElementById("addSection").classList.remove("d-none");
  document.getElementById("updatePermission").classList.add("d-none");
  document.getElementById("savePermissions").classList.add("d-none");
  document.getElementById("cancelPermissions").textContent = "Close";
}

async function updatePermissions() {
  const roleId = document.getElementById("roleIdInput").value;
  const roleName = document.getElementById("rolenameInput").value.trim();
  const permissions = [];

  document.querySelectorAll("tr[data-module-id]").forEach((row) => {
    const moduleId = row.dataset.moduleId;
    const readToggle = document.querySelector(`#read_${moduleId}`);
    const writeToggle = document.querySelector(`#write_${moduleId}`);
    const canRead = readToggle.checked;
    const canWrite = writeToggle.checked;

    permissions.push({
      moduleId: parseInt(moduleId),
      canRead: canRead,
      canWrite: canWrite,
    });
  });

  const data = {
    name: roleName,
    permissions: permissions,
  };

  try {
    const response = await axiosInstance.put(`/roles/${roleId}`, data);

    if (response.status === 200) {
      showPopupFadeInDown("Role updated successfully!");
      await refreshTable();
    }
  } catch (error) {
    showErrorPopupFadeInDown("Failed to update role.");
    console.error("Error updating role:", error);
  }
}

async function refreshTable() {
  if ($.fn.dataTable.isDataTable("#myTable")) {
    table = $("#myTable").DataTable();
    table.clear();
  }

  await getAllRoles();
}

$(document).ready(async function () {
  await refreshTable();
});

document
  .getElementById("add_course_btn")
  .addEventListener("click", async function () {
    updating = false;
    updateRoleID = null;
    document.getElementById("viewSection").classList.add("d-none");
    document.getElementById("addSection").classList.remove("d-none");
    document.getElementById("updatePermission").classList.add("d-none");
    document.getElementById("savePermissions").classList.remove("d-none");
    document.getElementById("cancelPermissions").textContent = "Cancel";
  });

async function updatePermission(roleID, moduleID, permission, value) {
  try {
    if (
      !roleID ||
      !moduleID ||
      !permission ||
      value === undefined ||
      value === null
    ) {
      throw new Error("Missing required parameters.");
    }

    const response = await axiosInstance.put(`/roles/perms/${roleID}`, {
      permission: permission,
      value: value,
      ModuleID: moduleID,
    });

    showPopupFadeInDown(response.data.message);
    return response.data;
  } catch (err) {
    showErrorPopupFadeInDown(err.response.data.message);
    // console.log(err.response.data.message);
    // console.error("Error in updating permission:", err.message || err);
    throw new Error(err.response?.data?.message || "Something went wrong");
  }
}
$(document).ready(function () {
  // Initialize DataTable
  let user =
    JSON.parse(sessionStorage.getItem("user")) ||
    sessionStorage.getItem("user");
  document.getElementById("username").textContent = user.name;
  var table = $("#myTable").DataTable({
    paging: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    dom: '<"top"lBf>rt<"bottom"ip><"clear">',
    buttons: [
      {
        extend: "excelHtml5",
        text: `
      <span class="icon-default"><i class="fa-solid fa-file-excel"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      Excel
    `,
        className: "btn-excel",
        exportOptions: {
          columns: [0, 1, 2, 3],
          format: {
            body: function (data, row, column, node) {
              const $node = $(node);
              if ($node.find(".toggle-btn").length) {
                return $node.find(".toggle-btn").hasClass("active")
                  ? "True"
                  : "False";
              }
              return data;
            },
          },
        },
      },
      {
        extend: "pdfHtml5",
        text: `
      <span class="icon-default"><i class="fa-solid fa-file-pdf"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-download"></i></span>
      PDF
    `,
        className: "btn-pdf",
        exportOptions: {
          columns: [0, 1, 2, 3],
          format: {
            body: function (data, row, column, node) {
              const $node = $(node);
              if ($node.find(".toggle-btn").length) {
                return $node.find(".toggle-btn").hasClass("active")
                  ? "True"
                  : "False";
              }
              return data;
            },
          },
        },
      },
      {
        extend: "colvis",
        text: `
      <span class="icon-default"><i class="fa-solid fa-eye"></i></span>
      <span class="icon-extra"><i class="fa-solid fa-gear"></i></span>
      Columns
    `,
        className: "btn-colvis",
      },
    ],
    language: {
      search: "",
      searchPlaceholder: "Type to search...",
      paginate: {
        first: "«",
        last: "»",
        next: "›",
        previous: "‹",
      },
    },
    initComplete: function () {
      // Remove default "Search:" text
      $("#myTable")
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .remove();

      // Wrap search input & add search icon
      $("#myTable_filter input").wrap('<div class="search-wrapper"></div>');
      $(".search-wrapper").prepend(
        '<i class="fa-solid fa-magnifying-glass"></i>'
      );
    },
  });

  // Append export buttons to custom container
  table.buttons().container().appendTo("#exportButtons");
});
