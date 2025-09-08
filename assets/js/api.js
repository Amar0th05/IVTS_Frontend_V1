const   API_ROUTES = {
   
    getAllStaffs: `/staff/all`,
    getLog:(id)=>`/cl/log/${id}`,
    getStaff:(id)=>`/staff/${id}`,
    getStaffDocumentsMetadata:(id)=>`/staff/${id}/documents/metadata`,
    downloadDocument:(staffId, docName)=>`/staff/${staffId}/documents/${docName}`,
    deleteDocument:(staffId, docName)=>`/staff/${staffId}/documents/${docName}`,
    uploadDocument:(staffId, docName)=>`/staff/${staffId}/documents/${docName}`,
    getActiveStaffs:`/activestaffs/all`,
    getactiveDesignations:`/designations/all/active`,
    contractLogs:`/cl`,
    getAllContractLogs:`/cl/all`,
    designationsBase:`/designations`,
    getAllDesignations:`/designations/all`,

    resetPassword:'/password/resetpassword/email',

    getAllHighestQualifications:'/hq/all',
    addHighestQualification:`/hq/add`,
    login:'/auth/login',
    register:'/auth/register',

    highestQualificationsBase:`/hq`,

    getOrganisations:`/organisations/all/active`,

    getAllOrganisations:`/organisations/all`,

    organisationsBase:`/organisations`,

    getHighestQualifications:'/hq/all/active',

    staff:'/staff',

    toggleStaffStatus:(id)=>`/staff/status/${id}`,

    getAllUsers:'/user/all',
    toggleUserStatus:(id)=>`/user/status/${id}`,

    getAllRoles:'/roles/all',
    rolesBase:`/roles`,
    user:'/user',
    getAllUsers:'/user/all',
    courses:'/courses/active',
    getAllCourses:'/courses/all',
    coursesBase:`/courses`,

    getAllEquipmentList:'/el/all',

    equipmentListBase:'/el',

    stagesBase:`/stages`,
    getAllStages:`/stages/all`,
    activeStages:`/stages/active`,
    


    equipmentDeliveyBase:`/equipmentsDelivery`,

    getAllEquipmentDeliveries:`/equipmentsDelivery/`,


    equipmentCategoryBase:`/equipmentCategories`,

    getAllEquipmentCategory:`/equipmentCategories/all`, 

    getAllActiveEquipmentCategory:`/equipmentCategories/all/active`,

    createEquipmentCategory:`/equipmentCategories/create`,
    
    equipmentBase:`/equipments`,
    createEquipment:`/equipments/create`,

    omInvoicesBase:`/om`,
    getAllOMInvoices:`/om/all`,
    getMailSentStatus:`/om/status`,
    toggleMailSentStatus:`/om/status`,

    equipmentInvoiceBase:`/equipmentInvoice`,
    groupEquipmentInvoiceByProjectNumber:`/equipmentInvoice/group`,
    getInvoicesByProjectNumber:`/equipmentInvoice/project`,


    projects:`/projects`,
    getAllProjects:`/projects/all`,
    clientBase:`/clients`,
    getAllClients:`/clients/all`,


addStaff:`/staffs/all/add`,
getAllStaff: `/staffs/all`,
  getAllIntern: `/intern`,
  downlodeIntern:`http://localhost:5000/intern`,


    applyInternship:`/internship/apply`
};



window.API_ROUTES = API_ROUTES;