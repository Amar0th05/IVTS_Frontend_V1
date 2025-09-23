let roleId;

const modules = [

    'PROJECT TRACKING',
    'O&M INVOICES',
    'EQUIPMENT INVOICES',
    'EQUIPMENTS',
    'STAFF DETAILS',
    'CONTRACT LOGS',
    'MASTER MANAGEMENT',
    'USER MANAGEMENT',
    'INDENT CREATION',
    'FUND CHECK',
    'LPC COMPLETED',
    'INDENT APPROVAL',
    'PO APPROVAL',
    'PO GENERATED',
    'SRB CREATED',
    'IC & SR SUBMISSION',
    'IIT STAFF',
    'INTERNS',
    'TALENT POOL',
    'ASSETS'
];


let roles=window.roles;


const moduleMaps={
    'DASHBOARD':['index'],
    'PROJECT TRACKING':['projectsDashboard','projectTracking'],
    'O&M INVOICES': ['o&mInvoices'],
    'EQUIPMENT INVOICES':['equipment-invoices'],
    'EQUIPMENTS': ['procurementStagesDashboard','equipmentlist'],
    'STAFF DETAILS':['staff-details'],
    'CONTRACT LOGS': ['contract-logs'],
    'USER MANAGEMENT': ['user-details'],
    'MASTER MANAGEMENT':[
                            'clients',
                            'courses',
                            'designations',
                            'equipmentCategory',
                            'highestqualifications',
                            'organisations',
                            'stages',
                        ],
    'INDENT CREATION': ['indents'],
    'INDENTS DASHBOARD': ['indentsDashboard'],
    'FUND CHECK': ['indents'],
    'LPC COMPLETED': ['indents'],
    'INDENT APPROVAL': ['indents'],
    'PO APPROVAL': ['indents'],
    'PO GENERATED': ['indents'],
    'SRB CREATED': ['indents'],
    'IC & SR SUBMISSION': ['indents'],
    'IIT STAFF': ['employeeDashboard','staffs'],
    'INTERNS':['interns'],
    'NEW JOINIES':['talentPool'],
    'ASSETS':['assetsDashboard','laptops','desktops','server']
}


function getRoleKeyById(id){
    // console.log(Object.keys(roles));
    return Object.keys(roles).find(key => roles[key].id===id);
}

function getAllowedPages(roleId) {
    // console.log('called from get Allowed pages');
    const roleKey = getRoleKeyById(roleId);
    const role = roles[roleKey];

    const permissions = {};

    if(role.writes){
        for (const module of role.writes) {
            permissions[module] = {
                permission: 'write',
                module: module
            };
        }
    }

   

    
    for (const module of role.reads) {
        if (permissions[module] && permissions[module].permission === 'write') {
          
        } else {
            permissions[module] = {
                permission: 'read',
                module: module
            };
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
                module: permissions[module].module  
            });
        }
    }

    return allowedPages;
}



function getModulePermissions(roleId) {
    // console.log('called from getModulePermissions');
    const roleKey = getRoleKeyById(roleId);
    const role = roles[roleKey];

    const permissions = {};

    if(role.writes){
        for (const module of role.writes) {
            permissions[module] = 'write';
        }
    }
   

 
    for (const module of role.reads) {
        if (permissions[module] === 'write') {
            permissions[module] = 'read-write';
        } else {
            permissions[module] = 'read';
        }
    }

    // console.log('from permissions : ',permissions);
    return permissions; 
}


function getPagePermissions(roleId) {
    const modulePerms = getModulePermissions(roleId);
    const pagePerms = {};

    for (const module in modulePerms) {
        const pages = moduleMaps[module] || [];
        for (const page of pages) {
            const existing = pagePerms[page];
            if (existing === 'write' || existing === 'read-write') continue;
            pagePerms[page] = modulePerms[module];
        }
    }

    return pagePerms;
}

function loginRedirect(role){
    const pages = getAllowedPages(role);
    window.location.href= "/" + pages[0].page+'.html';
}

function handlePermission(usernameDisplayId) {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = 'login.html';
    }

    const pages = getAllowedPages(user.role);
    roleId = user.role;
    const currentPage =  window.location.pathname.substring(1).split('.')[0];
    // console.log(pages);

    const pageObj = pages.find(p => p.page === currentPage);
    // console.log({pages})
    // console.log({pageObj});

    if (!pageObj) {
        
        window.location.href=pages[0].page+'.html';
        return;
    }

    if (pageObj.permission === 'read') {
        document.querySelectorAll('.writeElement').forEach(element => {
            element.classList.add('hidden');
        });

        document.querySelectorAll('.editElement').forEach(element => {
            element.disabled=true;
            element.style.backgroundColor='white';
         
        });

        document.querySelector(usernameDisplayId).textContent = user.name;

        return 'hidden';
    }

    document.querySelector(usernameDisplayId).textContent = user.name;
    return '';
}





function generateSidebar() {

    // alert('triggered');
    // console.log('called from generate side bar');
    const roleKey = getRoleKeyById(roleId);
    const role = roles[roleKey];
    let allowedModules
    if(role.writes){
        allowedModules = [...new Set([...role.reads, ...role.writes])]; 
    }else{
    allowedModules = [...new Set([...role.reads])]; 
    }

    // console.log({allowedModules:allowedModules});

   
    const categories = {
        'Project Tracking': ['PROJECT TRACKING'],
        'Invoices': ['O&M INVOICES', 'EQUIPMENT INVOICES'],
        'Equipments': ['EQUIPMENTS'],
        'Man Power Management': ['DASHBOARD','STAFF DETAILS', 'CONTRACT LOGS', 'NEW JOINIES'],
        'System Administration': ['USER MANAGEMENT', 'MASTER MANAGEMENT'],
        'Indents': [
            'INDENTS DASHBOARD',
            'INDENT CREATION', 'FUND CHECK', 'LPC COMPLETED', 
            'INDENT APPROVAL', 'PO APPROVAL', 'PO GENERATED',
            'SRB CREATED', 'IC & SR SUBMISSION',
        ],
        'Employee Management':['IIT STAFF','INTERNS'],
        'Assets':['ASSETS']
    };
    // console.log(categories);
    let sidebarHTML = '';
    
   
    for (const [categoryName, categoryModules] of Object.entries(categories)) {
        const allowedCategoryModules = categoryModules.filter(module => 
            allowedModules.includes(module)
        );
        
        if (allowedCategoryModules.length === 0) continue;
        
        sidebarHTML += `
        <div class="accordion">
            <div class="accordion-header">
                <div class="pcoded-navigation-label accordion-toggle text-primary waves-effect waves-dark" onclick="toggleAccordion(this)">
                    ${categoryName}<i class="fa fa-chevron-down ml-1 accordion-icon"></i>
                </div>
            </div>
            <div class="accordion-content" style="display: none;">
                <ul class="pcoded-item pcoded-left-item">
                    ${generateModuleLinks(allowedCategoryModules)}
                </ul>
            </div>
        </div>`;
    }
    
    return sidebarHTML;
}

function generateModuleLinks(modules) {
    const pageMap = {}; 
    
    
    for (const module of modules) {
        const pages = moduleMaps[module] || [];
        const modulePerm = getModulePermissions(roleId)[module];

        // console.log({module, modulePerm});
        
        for (const page of pages) {
            if (!pageMap[page] || modulePerm === 'write') {
                pageMap[page] = {
                    info: getPageInfo(page),
                    permission: modulePerm
                };
            }
        }
    }
    
  
    let linksHTML = '';
    for (const [page, data] of Object.entries(pageMap)) {
        if (!data.info) continue;
        
        linksHTML += `
        <li>
            <a href="${page}.html" class="waves-effect waves-dark">
                <span class="pcoded-micon"><i class="${data.info.icon}"></i><b>D</b></span>
                <span class="pcoded-mtext">${data.info.title}</span>
                <span class="pcoded-mcaret"></span>
            </a>
        </li>`;
    }
    
    return linksHTML;
}


function getPageInfo(page) {

    const pageInfoMap = {
        'index': { title: 'Dashboard', icon: 'ti-home' },
        'projectTracking': { title: 'Projects', icon: 'ti-folder' },
        'projectsDashboard': { title: 'Projects Dashboard', icon: 'ti-bar-chart' },
        'o&mInvoices': { title: 'O&M Invoices', icon: 'ti-calendar' },
        'equipment-invoices': { title: 'Equipment Invoices', icon: 'ti-settings' },
        'equipmentlist': { title: 'Equipment List', icon: 'ti-receipt' },
        'procurementStagesDashboard': { title: 'Equipments Dashboard', icon: 'ti-home' },
        'staff-details': { title: 'Staff Details', icon: 'ti-user' },
        'contract-logs': { title: 'Contract Logs', icon: 'ti-notepad' },
        'talentPool': { title: 'Talent Pool', icon: 'ti-receipt' },

        'user-details': { title: 'User Management', icon: 'ti-user' },
        'indents': { title: 'Indents', icon: 'ti-file' },
        'indentsDashboard': { title: 'Indents Dashboard', icon: 'ti-bar-chart' },
        'staffs': { title: 'Staffs', icon: 'ti-bar-chart' },
        'interns':{ title: 'Interns', icon: 'ti-bar-chart' },
        'employeeDashboard':{ title: 'Employee Dashboard', icon: 'ti-bar-chart' },
        'assetsDashboard':{ title: 'Assets Dashboard', icon: 'ti-bar-chart' },
        'laptops':{ title: 'Laptops', icon: 'ti-bar-chart' },
        'desktops':{ title: 'Desktops', icon: 'ti-bar-chart' },
        'server':{ title: 'Server', icon: 'ti-bar-chart' },




    };
    
    return pageInfoMap[page];
}


window.roleUtil={
    getAllowedPages,
    getRoleKeyById,
    getPagePermissions,
    getModulePermissions,
    loginRedirect
}
window.generateSidebar=generateSidebar
window.handlePermission=handlePermission
