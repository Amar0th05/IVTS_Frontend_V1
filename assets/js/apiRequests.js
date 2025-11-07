const api = {
    getActiveStaffs: () => fetchData(API_ROUTES.getActiveStaffs, "staffs"),

    getActiveDesignations: () => fetchData(API_ROUTES.getactiveDesignations, "designations"),

    getAllDesignations:()=>fetchData(API_ROUTES.getAllDesignations,"designations"),

    getDesignationById:(id)=>fetchData(API_ROUTES.designationsBase+`/${id}`),
    
    updateDesignation:(id,data)=>putData(API_ROUTES.designationsBase+`/${id}`,{name:data}),

    
    createDesignation: (designationName) => postData(API_ROUTES.designationsBase+'/add', { name:designationName }),

    getAllContractLogs: () => fetchData(API_ROUTES.getAllContractLogs),

    getLog: (id) => fetchData(`/cl/log/${id}`),

    getCourses: () => fetchData(API_ROUTES.courses, "courses"),

    getAllCourses:()=> fetchData(API_ROUTES.getAllCourses, "courses"),

    createCourse: (courseName) => postData(API_ROUTES.coursesBase, { courseName }),

    getOrganisations: () => fetchData(API_ROUTES.getOrganisations, "organisations"),

    getHighestQualifications: () => fetchData(API_ROUTES.getHighestQualifications, "highestQualifications"),

    getAllHighestQualifications:()=> fetchData(API_ROUTES.getAllHighestQualifications, "highestQualifications"),

    getQualificationById:(id)=>fetchData(API_ROUTES.highestQualificationsBase+`/${id}`,"highestQualification"),

    createHighestQualification: (qualificationName) => postData(API_ROUTES.addHighestQualification, { name:qualificationName }),

    updateHighestQualification:(id,data)=>putData(API_ROUTES.highestQualificationsBase+`/${id}`,{name:data}),

    addContractLog: (data) => postData(API_ROUTES.contractLogs, { data }),

    updateContractLog: (data) => putData(API_ROUTES.contractLogs,  {data} ),

    resetPassword: (mail) => postData(API_ROUTES.resetPassword, { mail }),
    changePassword: (userData) => putData(API_ROUTES.changePassword, {userData}),


    register: (userData) => postData(API_ROUTES.register, {userData}),

    login: async (mail, password) => {
        const response = await postData(API_ROUTES.login, { mail, password });
        const token = response.headers?.authorization?.split(" ")[1] || null;
        return { data: response.data, token };
    },

    addStaff: (data) => postData(API_ROUTES.staff, { data }),
    

    updateStaff: (data) => putData(API_ROUTES.staff, { data }),

    toggleStaffStatus: (id) => putData(`/staff/status/${id}`),

    getAllStaffs: () => fetchData(API_ROUTES.getAllStaffs, "staffDetails"),

    getAllUsers: () => fetchData(API_ROUTES.getAllUsers, "users"),

    toggleUserStatus: async (id) => await putData(`/user/status/${id}`),



    getAllRoles: () => fetchData(API_ROUTES.getAllRoles, "roles"),
    getRoleById :(id) => fetchData(API_ROUTES.rolesBase+`/${id}`,"role"),

    createUser: (userData) => postData(API_ROUTES.user,{userData}),

    updateUser: (userData) => putData(API_ROUTES.user, {userData}),
    getUser:(id)=>fetchData(`/user/${id}`,"user"),


    getAllOrganisations: () => fetchData(API_ROUTES.getAllOrganisations, "organisations"),

    getOrganisationById:(id)=>fetchData(API_ROUTES.organisationsBase+`/${id}`,"organisation"),

    updateOrganisation:(id,data)=>putData(API_ROUTES.organisationsBase+`/${id}`,{name:data}),

    createOrganisation: (organisationName) => postData(API_ROUTES.organisationsBase+'/add', { name: organisationName }),

    getAllEquipmentList:()=>fetchData(API_ROUTES.getAllEquipmentList,"equipmentList"),

    getAllStages:()=>fetchData(API_ROUTES.getAllStages,"stages"),

    getStage:(id)=>fetchData(API_ROUTES.stagesBase+`/${id}`,"stage"),
    
    updateStage:(id,data)=>putData(API_ROUTES.stagesBase+`/${id}`,{stage:data}),

    createStage:(data)=>postData(API_ROUTES.stagesBase,{stage:data}),

    getAllEquipmentDeliveries:()=>fetchData(API_ROUTES.getAllEquipmentDeliveries,"deliveries"), 
    updateQuantityDelivered:(id,data)=>putData(API_ROUTES.equipmentDeliveyBase+`/${id}`,data),


    getAllActiveEquipmentCategory:()=>fetchData(API_ROUTES.getAllActiveEquipmentCategory,"categories"),

    getAllEquipmentCategories:()=>fetchData(API_ROUTES.getAllEquipmentCategory,"categories"),

    updateCategory:(id,data)=>putData(API_ROUTES.equipmentCategoryBase+`/${id}`,{category_name:data}),
    createcategory:(data)=>postData(API_ROUTES.createEquipmentCategory,{category_name:data}),
    getCategory:(id)=>fetchData(API_ROUTES.equipmentCategoryBase+`/${id}`,"category"),

    createEquipment:(data)=>postData(API_ROUTES.createEquipment,data),

    getAllOMInvoices:()=>fetchData(API_ROUTES.getAllOMInvoices,"invoices"),

    getMailSentStatus:()=>fetchData(API_ROUTES.getMailSentStatus,"statuses"),
    toggleMailSentStatus:(id,status)=>putData(API_ROUTES.toggleMailSentStatus+`/${id}`,{status}),
    getAllOrganisationsInvoiceStatus:()=>fetchData('/organisations/all/hq',"organisations"),
    getAllActiveOrganisationsExceptHQ:()=>fetchData('/organisations/all/hq',"organisations"),

    groupEquipmentInvoiceByProjectNumber:()=>fetchData(API_ROUTES.groupEquipmentInvoiceByProjectNumber,"invoices"),
    getInvoicesByProjectNumber:(id)=>fetchData(API_ROUTES.getInvoicesByProjectNumber+`/${id}`,"invoices"),
    createEquipmentInvoice:(data)=>postData(API_ROUTES.equipmentInvoiceBase+'/',data),
    updateEquipmentInvoice:(data)=>putData(API_ROUTES.equipmentInvoiceBase,{data}),

    downloadStaffData:()=>fetchData('/staff/download/all',"staffDetails"),

    getAllProjects:()=>fetchData(API_ROUTES.getAllProjects,"projects"),
    getProjectById:(id)=>fetchData(API_ROUTES.projects+`/${id}`,"project"),
    updateProjectDeliverable:(data)=>putData('/deliverables',data),


    getAllClients:()=>fetchData(API_ROUTES.getAllClients,"clients"),
    getClient:(id)=>fetchClient(API_ROUTES.clientBase+`/${id}`,"client"),
    createClient:(ClientName)=>postData(API_ROUTES.clientBase,{ClientName}),

    getAllStaff:()=>fetchData(API_ROUTES.getAllStaff,"staffs"),
    updateIITStaff: (data) => putData(API_ROUTES.getAllStaff, { data }),
    toggleIITStaffStatus: (id) => putData(API_ROUTES.toggleIITStaffStatus+`${id}`),
    downloadIITStaffData:()=>fetchData('/staffs/all/download',"staffs"),
    addIITStaff:(data)=>postData(API_ROUTES.addStaff,{data}),

    // intern

    getAllIntern: () => fetchData(API_ROUTES.getAllIntern+`/all`, "intern"),
    getInterById:(id) => fetchData(API_ROUTES.getAllIntern+`/${id}`, "intern"),
    updateIntern: (id,data) => putData(API_ROUTES.getAllIntern+`/${id}`, { data }),
    toggleInternStatus: (id) => putData(`/intern/status/${id}`),
    //reporting manager
    getReportingManger: () => fetchData(API_ROUTES.getReportingManager, "staffid"),

// talent Pool
    getAllPersons:()=>fetchData(API_ROUTES.getAllTalentpool,"talent"),
    updatePerson: (data) => putData(API_ROUTES.talentpool, { data }),
    addTalent: (data) => postData(API_ROUTES.talentpool, { data }),

// assets

    // laptop
    getAllLaptops: () => fetchData(API_ROUTES.getAllAssets+'/Laptops', "laptops"),
    addLaptops:(data)=>postData(API_ROUTES.addLaptops,{data}),
    toggleLaptopStatus: (id) => putData(API_ROUTES.toggleLaptopStatus+`${id}`),
    updateLaptops: (data) => putData(API_ROUTES.updateLaptops, {data}),
// desktop
    getAllDesktops: () => fetchData(API_ROUTES.getAllAssets+'/Desktops', "desktops"),
    addDesktops:(data)=>postData(API_ROUTES.addDesktops,{data}),
    toggleDesktopsStatus: (id) => putData(API_ROUTES.toggleDesktopsStatus+`${id}`),
    updateDesktops: (data) => putData(API_ROUTES.updateDesktops, { data }),

//server
    getAllServer: () => fetchData(API_ROUTES.getAllAssets+'/Servers', "servers"),
    addServer:(data)=>postData(API_ROUTES.addServer,{data}),
    toggleServerStatus: (id) => putData(API_ROUTES.toggleServerStatus+`${id}`),
    updateServers: (data) => putData(API_ROUTES.updateServers, {data}),


// printer

    getAllPrinter: () => fetchData(API_ROUTES.getAllAssets+'/Printer', "printer"),
    addPrinter:(data)=>postData(API_ROUTES.addPrinter,{data}),
    // toggleDesktopsStatus: (id) => putData(API_ROUTES.toggleDesktopsStatus+`${id}`),
    updatePrinter: (data) => putData(API_ROUTES.updatePrinter, { data }),


    // Asset Verification
  getAssetsVerification: () => fetchData(API_ROUTES.getAssetsVerification,"assets"),
  addAssetVerification: (payload) => postData(API_ROUTES.addAssetVerification, payload),
  updateAssetVerification: (payload) => postData(API_ROUTES.updateAssetVerification, payload),
  completeAssetVerification: (payload) => postData(API_ROUTES.completeAssetVerificatiom, payload),
  getAssetVerificationByAssetId: (assetId) => fetchData(API_ROUTES.getAssetsVerificationId + `${assetId}`,"assets"),



    getAllAssets: () => fetchData(API_ROUTES.getAllAssets, "assets"),
    getstaffid: () => fetchData(API_ROUTES.getstaffid, "staffid"),

    // Leave

    getAllLeave:() => fetchData(API_ROUTES.getAllLeave,"leave"),

    // insurance staff details
    addInsurance: (payload) => postData(API_ROUTES.addinsurance, payload),
    updateInsurance: (id, payload) => putData(API_ROUTES.updateInsurance(id), payload),
    deleteInsurance: (id) => deleteData(API_ROUTES.deleteInsurance(id)),

    // intern leave
    getEmployees: () => fetchData(API_ROUTES.getEmployees, 'employees'),
  getManager: (employeeId) => fetchData(API_ROUTES.getManager(employeeId),'manager'),
  submitLeave: (payload) => postData(API_ROUTES.submitLeave, payload)
};

const fetchData = (url, key) => axiosInstance.get(url).then(res => key ? res.data[key] : res.data);
const postData = (url, payload) => axiosInstance.post(url, payload).then(res => res.data);
const putData = (url, payload) => axiosInstance.put(url, payload).then(res => res.data);

window.api = api;
