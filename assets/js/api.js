const API_ROUTES = {
  getAllStaffs: `/staff/all`,
  getLog: (id) => `/cl/log/${id}`,
  getStaff: (id) => `/staff/${id}`,
  getStaffDocumentsMetadata: (id) => `/staff/${id}/documents/metadata`,
  downloadDocument: (staffId, docName) =>
    `/staff/${staffId}/documents/${docName}`,
  deleteDocument: (staffId, docName) =>
    `/staff/${staffId}/documents/${docName}`,
  uploadDocument: (staffId, docName) =>
    `/staff/${staffId}/documents/${docName}`,
  getActiveStaffs: `/activestaffs/all`,
  getactiveDesignations: `/designations/all/active`,
  contractLogs: `/cl`,
  getAllContractLogs: `/cl/all`,
  designationsBase: `/designations`,
  getAllDesignations: `/designations/all`,

  resetPassword: "/password/resetpassword/email",

  getAllHighestQualifications: "/hq/all",
  addHighestQualification: `/hq/add`,
  login: "/auth/login",
  register: "/auth/register",

  highestQualificationsBase: `/hq`,

  getOrganisations: `/organisations/all/active`,

  getAllOrganisations: `/organisations/all`,

  organisationsBase: `/organisations`,

  getHighestQualifications: "/hq/all/active",

  staff: "/staff",
  addinsurance: "/staff/insurance",
  updateInsurance: (id) => `/staff/insurance/${id}`,
  deleteInsurance: (id) => `/staff/insurance/${id}`,

  toggleStaffStatus: (id) => `/staff/status/${id}`,

  getAllUsers: "/user/all",
  toggleUserStatus: (id) => `/user/status/${id}`,

  getAllRoles: "/roles/all",
  rolesBase: `/roles`,
  user: "/user",
  changePassword: "/password/changePassword",
  getAllUsers: "/user/all",
  courses: "/courses/active",
  getAllCourses: "/courses/all",
  coursesBase: `/courses`,

  getAllEquipmentList: "/el/all",

  equipmentListBase: "/el",

  stagesBase: `/stages`,
  getAllStages: `/stages/all`,
  activeStages: `/stages/active`,

  equipmentDeliveyBase: `/equipmentsDelivery`,

  getAllEquipmentDeliveries: `/equipmentsDelivery/`,

  equipmentCategoryBase: `/equipmentCategories`,

  getAllEquipmentCategory: `/equipmentCategories/all`,

  getAllActiveEquipmentCategory: `/equipmentCategories/all/active`,

  createEquipmentCategory: `/equipmentCategories/create`,

  equipmentBase: `/equipments`,
  createEquipment: `/equipments/create`,

  omInvoicesBase: `/om`,
  getAllOMInvoices: `/om/all`,
  getMailSentStatus: `/om/status`,
  toggleMailSentStatus: `/om/status`,

  equipmentInvoiceBase: `/equipmentInvoice`,
  groupEquipmentInvoiceByProjectNumber: `/equipmentInvoice/group`,
  getInvoicesByProjectNumber: `/equipmentInvoice/project`,

  projects: `/projects`,
  getAllProjects: `/projects/all`,
  clientBase: `/clients`,
  getAllClients: `/clients/all`,

  addStaff: `/staffs/all/add`,
  getAllStaff: `/staffs/all`,
  getIITStaff: (id) => `/staffs/all/${id}`,
  toggleIITStaffStatus: `/staffs/all/status/`,

  // intern

  applyInternship: `/internship/apply`,
  getAllIntern: `/intern`,
  getInternDocumentsMetadata: (id) => `/intern/${id}/documents/metadata`,
  downloadInternDocument: (internId, docName) =>
    `/intern/${internId}/documents/${docName}`,
  deleteInternDocument: (internId, docName) =>
    `/intern/${internId}/documents/${docName}`,
  uploadInternDocument: (staffId, docName) =>
    `/intern/${staffId}/documents/${docName}`,
  getActiveintern: `/activeIntern/all`,
  getReportingManager: `/intern/getReportingManager`,


  // talent Pool

  getPerson: (id) => `/talentpool/${id}`,
  talentpool: `/talentpool`,
  getAllTalentpool: `/talentpool/all`,
  getPersonDocumentsMetadata: (id) => `/talentpool/${id}/documents/metadata`,
  downloadDocumentTalentPool: (personId, docName) =>
    `/talentpool/${personId}/documents/${docName}`,
  deleteDocumentTalentPool: (personId, docName) =>
    `/talentpool/${personId}/documents/${docName}`,
  uploadDocumentTalentPool: (personId, docName) =>
    `/talentpool/${personId}/documents/${docName}`,
  checkIDTalentPool: (id) => `/talentpool/checkID/${id}`,

  // Assets
  //laptop
  addLaptops: `/assets/Laptops/add`,
 updateLaptops: `/assets/Laptops/update`,
  toggleLaptopStatus: `/assets/Laptops/status/`,
  getAllAssets: `/assets`,
  getAssets: (id) => `/assets/${id}`,
  getstaffid: `/assets/getstaff`,

  //desktop
  addDesktops: `/assets/Desktops/add`,
 updateDesktops: `/assets/Desktops/update`,
  toggleDesktopsStatus: `/assets/Desktops/status/`,
  //server
  addServer: `/assets/Servers/add`,
  toggleServerStatus: `/assets/Servers/status/`,
  updateServers: `/assets/Servers/update`,

    //desktop
  addPrinter: `/assets/Printer/add`,
 updatePrinter: `/assets/Printer/update`,
  togglePrinterStatus: `/assets/Printer/status/`,

  //download bar code
  downloadBarCode: (id) => `/assets/barcode/${id}`,

  // assets Verification
  getAssetsVerification:`/assets/verification/current`,
  addAssetVerification:`/assets/verification/start`,
  updateAssetVerification:`/assets/verification/update`,
  completeAssetVerificatiom:`/assets/verification/complete`,
  getAssetsVerificationId:`/assets/verification/`,

  // leave
  getAllLeave:`/leavesummary`,

};

window.API_ROUTES = API_ROUTES;
