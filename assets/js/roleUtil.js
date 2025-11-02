let roleId;

let roles = window.roles;
console.log("Roles loaded:", window);

const moduleMaps = {
  DASHBOARD: ["index"],
  "PROJECT TRACKING": ["projectsDashboard", "projectTracking"],
  "O&M INVOICES": ["o&mInvoices"],
  "EQUIPMENT INVOICES": ["equipment-invoices"],
  EQUIPMENTS: ["procurementStagesDashboard", "equipmentlist"],
  "STAFF DETAILS": ["staff-details"],
  "IIT STAFF": ["employeeDashboard", "staffs"],
  INTERNS: ["interns"],
  "CONTRACT LOGS": ["contract-logs"],
  "TALENT POOL": ["talentPool"],
  "USER MANAGEMENT": ["user-details", "roles"],
  "MASTER MANAGEMENT": [
    "clients",
    "courses",
    "designations",
    "equipmentCategory",
    "highestqualifications",
    "organisations",
    "stages",
  ],
  "INDENTS DASHBOARD": ["indentDashboard"],
  "INDENT CREATION": ["indents"],
  "FUND CHECK": ["indents"],
  "LPC COMPLETED": ["indents"],
  "INDENT APPROVAL": ["indents"],
  "PO APPROVAL": ["indents"],
  "PO GENERATED": ["indents"],
  "SRB CREATED": ["indents"],
  "IC & SR SUBMISSION": ["indents"],
  "ASSETS": ["assetsDashboard", "laptops", "desktops", "server","printer"],
  "ASSETS VERIFICATION":["assetsVerfication"],
  "LEAVE":["LeaveTracking"]

  // 'USER ROLES': ['roles']
};

function getRoleKeyById(id) {
  console.log(Object.keys(roles));
  return Object.keys(roles).find((key) => {
    console.log(roles[key].id);
    return roles[key].id === id;
  });
}

function getAllowedPages(roleId) {
  console.log("Getting allowed pages for role ID:", roleId);
  const roleKey = getRoleKeyById(roleId);
  const role = roles[roleKey];
  console.log("Role details:", role);
  const permissions = {};

  if (role.writes) {
    for (const module of role.writes) {
      permissions[module] = { permission: "write", module };
    }
  }

  for (const module of role.reads) {
    if (!permissions[module]) {
      permissions[module] = { permission: "read", module };
    }
  }

  const allowedPages = [];

  for (const module in permissions) {
    const pages = moduleMaps[module] || [];
    for (const page of pages) {
      allowedPages.push({
        // page: "worksphere/" + page,
        page: page,
        permission: permissions[module].permission,
        module: permissions[module].module,
      });
    }
  }

  return allowedPages;
}

function getModulePermissions(roleId) {
  const roleKey = getRoleKeyById(roleId);
  const role = roles[roleKey];
  const permissions = {};

  if (role.writes) {
    for (const module of role.writes) {
      permissions[module] = "write";
    }
  }

  for (const module of role.reads) {
    permissions[module] =
      permissions[module] === "write" ? "read-write" : "read";
  }

  return permissions;
}

function getPagePermissions(roleId) {
  const modulePerms = getModulePermissions(roleId);
  const pagePerms = {};

  for (const module in modulePerms) {
    const pages = moduleMaps[module] || [];
    for (const page of pages) {
      if (!(pagePerms[page] === "write" || pagePerms[page] === "read-write")) {
        pagePerms[page] = modulePerms[module];
      }
    }
  }

  return pagePerms;
}

function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf("/") + 1); // e.g., "index.html"
  const cleanName = filename.split("?")[0].split("#")[0]; // remove query/hash
  return cleanName.split(".")[0]; // "index"
}

function loginRedirect(role) {
  const pages = getAllowedPages(role);
  if (pages.length > 0) {
    const firstPage = pages[0].page;
    const currentPage = getCurrentPage();

    if (currentPage !== firstPage) {
      window.location.href = `${firstPage}.html`;
    }
  }
}

function handlePermission(usernameDisplayId) {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  const pages = getAllowedPages(user.role);
  roleId = user.role;
  const currentPage = getCurrentPage();
  const pageObj = pages.find((p) => p.page === currentPage);

  if (!pageObj) {
    // Redirect only if you're not already at the first allowed page
    if (currentPage !== pages[0].page) {
      window.location.href = `${pages[0].page}.html`;
    }
    return;
  }

  if (pageObj.permission === "read") {
    document
      .querySelectorAll(".writeElement")
      .forEach((el) => el.classList.add("hidden"));
    document.querySelectorAll(".editElement").forEach((el) => {
      el.disabled = true;
      el.style.backgroundColor = "white";
    });
  }

  document.querySelector(usernameDisplayId).textContent = user.name;
}

function generateSidebar() {
  const roleKey = getRoleKeyById(roleId);
  const role = roles[roleKey];
  const allowedModules = role.writes
    ? [...new Set([...role.reads, ...role.writes])]
    : [...new Set([...role.reads])];

  const categories = {
    "NTCPWC FMS": {
      FMS: [
        "INDENTS DASHBOARD",
        "INDENT CREATION",
        "FUND CHECK",
        "LPC COMPLETED",
        "INDENT APPROVAL",
        "PO APPROVAL",
        "PO GENERATED",
        "SRB CREATED",
        "IC & SR SUBMISSION",
      ],
      "Project Tracking": ["PROJECT TRACKING"],
    },
    "IVTMS Management": {
      Invoices: ["O&M INVOICES", "EQUIPMENT INVOICES"],
      Equipments: ["EQUIPMENTS"],
      "Man Power": [
        "DASHBOARD",
        "STAFF DETAILS",
        "CONTRACT LOGS",
        "TALENT POOL",
      ],
    },
    "Employee Management": ["IIT STAFF", "INTERNS","LEAVE"],
    "User Management": [
      // "USER ROLES",
      "USER MANAGEMENT",
    ],
    "MASTER MANAGEMENT": ["MASTER MANAGEMENT"],
    "Assets management":{
      "Asset Master":["ASSETS"],
      "Asset Verification":["ASSETS VERIFICATION"]
    } ,
  };

  let sidebarHTML = "";

  for (const [categoryName, subCategories] of Object.entries(categories)) {
    let categoryHTML = "";

    if (Array.isArray(subCategories)) {
      const allowedModulesInCategory = subCategories.filter((module) =>
        allowedModules.includes(module)
      );
      if (allowedModulesInCategory.length > 0) {
        categoryHTML = `
                    <ul class="pcoded-item pcoded-left-item"${
                      categoryName === "Employee Management" ||
                      categoryName === "User Management" ||
                      categoryName === "MASTER MANAGEMENT"
                        ? ""
                        : ' style="padding-left:25px;"'
                    }>
                        ${generateModuleLinks(allowedModulesInCategory)}
                    </ul>
                `;
      }
    } else {
      for (const [subCategoryName, modules] of Object.entries(subCategories)) {
        const allowedModulesInCategory = modules.filter((module) =>
          allowedModules.includes(module)
        );

        if (allowedModulesInCategory.length === 0) continue;

        categoryHTML += `
                    <div class="accordion">
                        <div class="accordion-header">
                            <div class="pcoded-navigation-label accordion-toggle text-dark"
                                onclick="toggleAccordion(this)"
                                style="display: flex; align-items: center; justify-content: space-between; padding-left:25px; color:black;">
                                ${subCategoryName}
                                <i class="accordion-icon fas fa-chevron-down"></i>
                            </div>
                        </div>
                        <div class="accordion-content text-dark" style="display: none;">
                            <ul class="pcoded-item pcoded-left-item">
                                ${generateModuleLinks(allowedModulesInCategory)}
                            </ul>
                        </div>
                    </div>
                `;
      }
    }

    if (categoryHTML) {
      sidebarHTML += `
                <div class="category-section">
                    <div class="category-header">
                        <div class="pcoded-navigation-label text-dark waves-effect waves-dark" style="color: #2f3985 !important;">
                            ${categoryName}
                        </div>
                    </div>
                    <div class="category-content">
                        ${categoryHTML}
                    </div>
                </div>
            `;
    }
  }

  return sidebarHTML;
}

function toggleAccordion(element) {
  const accordionHeader = element.closest(".accordion-header");
  const accordionContent = accordionHeader.nextElementSibling;
  const icon = element.querySelector(".accordion-icon");

  const isOpen = accordionContent.style.display === "block";
  accordionContent.style.display = isOpen ? "none" : "block";
  icon.className = isOpen
    ? "accordion-icon fas fa-chevron-down"
    : "accordion-icon fas fa-chevron-up";
}

function generateModuleLinks(modules) {
  const pageMap = {};
  for (const module of modules) {
    const pages = moduleMaps[module] || [];
    const modulePerm = getModulePermissions(roleId)[module];

    for (const page of pages) {
      if (!pageMap[page] || modulePerm === "write") {
        pageMap[page] = {
          info: getPageInfo(page),
          permission: modulePerm,
        };
      }
    }
  }

  return Object.entries(pageMap)
    .filter(([_, data]) => data.info)
    .map(
      ([page, data]) => `
            <li>
                <a href="${page}.html" class="waves-effect waves-dark">
                    <span class="pcoded-micon"><i class="${data.info.icon}"></i></span>
                    <span class="pcoded-mtext">${data.info.title}</span>
                </a>
            </li>
        `
    )
    .join("");
}

function getPageInfo(page) {
  const pageInfoMap = {
    index: { title: "Dashboard", icon: "fa-solid fa-chart-line" },
    projectTracking: { title: "Projects", icon: "fa-solid fa-diagram-project" },
    projectsDashboard: { title: "Dashboard", icon: "fa-solid fa-chart-line" },
    "o&mInvoices": { title: "O&M", icon: "fa-solid fa-file-invoice-dollar" },
    "equipment-invoices": {
      title: "Equipment",
      icon: "fa-solid fa-truck-ramp-box",
    },
    equipmentlist: { title: "Delivery Status", icon: "fa-solid fa-truck-fast" },
    procurementStagesDashboard: {
      title: "Dashboard",
      icon: "fa-solid fa-chart-pie",
    },
    "staff-details": { title: "Staff Details", icon: "fa-solid fa-id-card" },
    "contract-logs": {
      title: "Contract Logs",
      icon: "fa-solid fa-file-contract",
    },
    "user-details": { title: "User Details", icon: "fa-solid fa-users-gear" },
    indents: { title: "FMS Process", icon: "fa-solid fa-clipboard-list" },
    indentDashboard: { title: "Dashboard", icon: "fa-solid fa-chart-bar" },

    talentPool: { title: "Talent Pool", icon: "fa-solid fa-user-group" },
    interns: { title: "Interns", icon: "fa-solid fa-user-graduate" },
    staffs: { title: "Staffs", icon: "fa-solid fa-user-tie" },
    roles: { title: "User Roles", icon: "fa-solid fa-user-tag" },
    // employeeDashboard: {
    //   title: "Employee Dashboard",
    //   icon: "fa-solid fa-users-rectangle",
    // },

    // MASTER MANAGEMENT submodules
    clients: { title: "Clients", icon: "fa-solid fa-building" },
    courses: { title: "Courses", icon: "fa-solid fa-book-open" },
    designations: { title: "Designations", icon: "fa-solid fa-user-tie" },
    equipmentCategory: {
      title: "Equipment Category",
      icon: "fa-solid fa-truck-ramp-box",
    },
    highestqualifications: {
      title: "Qualifications",
      icon: "fa-solid fa-graduation-cap",
    },
    organisations: { title: "Organisations", icon: "fa-solid fa-sitemap" },
    stages: { title: "Stages", icon: "fa-solid fa-layer-group" },
    // assetsDashboard: {
    //   title: "Assets Dashboard",
    //   icon: "fa-solid fa-table-columns",
    // },
    laptops: { title: "Laptops", icon: "fa-solid fa-laptop" }, // laptops
    desktops: { title: "Desktops and Monitors", icon: "fa-solid fa-desktop" }, // desktops
    server: { title: "Server And Storage", icon: "fa-solid fa-server" }, // servers
    printer: { title: "Printer And Scanners", icon: "fa-solid fa-copy" }, // printer
    assetsVerfication: {
      title: "Dashboard",
      icon: "fa-solid fa-copy",
    }, // assets verfication dashboard
    LeaveTracking: { title: "Leave Tracking", icon: "fa-solid fa-calendar-days"}, // leave tracking dashboard
  };
  return pageInfoMap[page];
}

window.roleUtil = {
  getAllowedPages,
  getRoleKeyById,
  getPagePermissions,
  getModulePermissions,
  loginRedirect,
};

window.generateSidebar = generateSidebar;
window.handlePermission = handlePermission;
