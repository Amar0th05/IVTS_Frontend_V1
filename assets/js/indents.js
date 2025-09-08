document.querySelector('#logout-button').addEventListener('click', () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  window.location.href = 'login.html';
});

//Item Details
const quantityInput = document.getElementById('itemQty');
const unitPriceInput = document.getElementById('unitPrice');
const totalPriceInput = document.getElementById('itemPrice');
 const formPrice = document.getElementById('formPrice');
// Trigger calculation when quantity or unit price changes
quantityInput.addEventListener('input', calculateTotalPrice);
unitPriceInput.addEventListener('input', calculateTotalPrice);
function calculateTotalPrice() {
  console.log('Calculating total price...');
  const quantity = quantityInput.valueAsNumber;
  const unitPrice = unitPriceInput.valueAsNumber;

  // Check for invalid or empty input
  const total = (isNaN(quantity) ? 0 : quantity) * (isNaN(unitPrice) ? 0 : unitPrice);

  // Set total price with 2 decimal places
  totalPriceInput.value = total.toFixed(2);
 
  formPrice.value=total.toFixed(2);
}



  //-----------------------------------------------------------------------------------//
 //                                   GLOBAL VARIABLES                                //
//-----------------------------------------------------------------------------------//

let categorizedModules;
let writeModules;


let gst = 0;
let gstCost = 0;
let totalCost = 0;
let vendorSelect = document.querySelector('#vendorSelect');
let projectSelect = document.querySelector('#projectSelect');
let selectedVendor = null;
let selectedProject = null;
let globalIndentID = null;
let globalFundStatus = true;
let subTotal = 0;
let updates = {};
let srbItems = [];

let projectNOSet = new Set();
let vendorSet = new Set();
let statusSet = new Set();

const user = JSON.parse(sessionStorage.getItem('user'));

let allowedPages;
document.addEventListener('DOMContentLoaded', async () => {
  roles = await axiosInstance.get('/roles/role/perms');
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
  allowedPages = roleUtil.getAllowedPages(user.role);
  categorizedModules = getModulePermissions(allowedPages);
  writeModules = categorizedModules.write
  // console.log({ categorizedModules });
  // console.log(typeof allowedPages)
  hideNonWriteElements();
})




function getModulePermissions(permissionsObject) {
  if (typeof permissionsObject !== 'object' || permissionsObject === null) {
    // console.error('Expected an object but got:', permissiosnsObject);
    return {};
  }

  const result = {
    write: [],
    read: []
  };


  for (const key in permissionsObject) {
    if (permissionsObject.hasOwnProperty(key)) {
      const item = permissionsObject[key];
      const { module, permission } = item;


      if (permission === 'write') {
        if (!result.write.includes(module)) {
          result.write.push(module);
        }
      } else if (permission === 'read') {

        if (!result.read.includes(module)) {
          result.read.push(module);
        }
      }
    }
  }

  return result;
}




function hideNonWriteElements() {
  const writeModules = categorizedModules.write;
  const allElements = document.querySelectorAll('[data-module]');

  allElements.forEach(function (element) {
    const moduleName = element.getAttribute('data-module');

    if (!writeModules.includes(moduleName)) {
      element.classList.add('hidden');
    }
  });
}




async function getAllIndents() {
  try {
    const response = await axiosInstance.get('/indents/basic');
    const indents = response.data.indents;
    return indents;
  } catch (err) {
    console.error('Error fetching indents:', err);
    showErrorPopupFadeInDown('Error fetching indents');
  }
}

async function getIndentByID(id) {
  try {
    const response = await axiosInstance.get(`/indents/${id}`);
    const indent = response.data.indent;
    console.log(indent);
    return indent;
  } catch (err) {
    console.error('Error fetching indent:', err);
    showErrorPopupFadeInDown('Error fetching indent');
  }
}
async function downloadFile(id) {
  try {

    const response = await axiosInstance.get(`/indents/download/${id}`, {
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `indents_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    showErrorPopupFadeInDown("Download failed!");
  }
}




let fundCheckSubmit = document.querySelector('#fundCheckSubmit');

fundCheckSubmit.addEventListener('click', async () => {

  let IndentID = globalIndentID;
  if (!IndentID) {
    showErrorPopupFadeInDown('No Indent ID found');
    return;
  }

  if (!globalFundStatus && !selectedAltProject) {
    console.log({ globalFundStatus, selectedAltProject });
    showErrorPopupFadeInDown('Please select an alternate project');
    return;
  }

  let remarksField = document.querySelector('#fundCheckRemarks');
  let remarks = remarksField.value;

  if (!remarks) {
    showErrorPopupFadeInDown('Please enter remarks');
    return;
  }

  let data = {};

  data['FundAvailable'] = globalFundStatus ? 1 : 0;
  data['AlternateProjectNo'] = globalFundStatus ? null : selectedAltProject.ProjectID;
  data['Remarks'] = remarks;

  // console.log(data);
  // return;
  try {
    let response = await axiosInstance.post(`/fundCheck/${IndentID}`, data);
    console.log(response.data);
    showPopupFadeInDown('Fund Check Submitted');
    setTimeout(() => {
      location.reload();
    }, 2000);
  } catch (err) {
    console.error(err);
    if (err.response) {
      console.error('Server error:', err.response.data.message);
      showErrorPopupFadeInDown(err.response.data.message);
    } else {
      console.error('Network/other error:', err.message);
      showErrorPopupFadeInDown('Network error. Please try again.');
    }
  }




});

function resetState() {
  window.location.reload();
}

// ! Fullscreen Modal
async function openFullscreenModal(button) {
  console.log('Opening fullscreen modal', button);

  let stageIDs = [
    'indentCreatedStage',
    'fundCheckStage',
    'lpcCompletedStage',
    'indentApprovalStage',
    'poApprovedStage',
    'poGeneratedStage',
    'srbCreatedStage',
    'icSrSubmittedStage'
  ];

  stageIDs.forEach(stageID => {
    const stageElement = document.getElementById(stageID);
    if (stageElement) {
      stageElement.classList.remove('completed', 'active', 'rejected');
    }
  });

  let stageNames = ['Awaiting For Fund Check', 'Awaiting For LPC Completion', 'Awaiting For Indent Approval', 'Awaiting For PO Approval', 'Awaiting For PO Generation', 'Awaiting For SRB Creation', 'Awaiting For ICSR Submission', 'Completed'];


  let indentID = button.getAttribute("data-id");
  globalIndentID = indentID;

  // alert('Indent ID: ' + indentID);


  let indent = await getIndentByID(indentID);
  // -----------------------------------------------------------------------------------//
  //                                  SRB Logic                          //

if(indent.TypeOfIndent=="Work indent"){
const srbCreatedStage = document.getElementById('srbCreatedStage');
const srbCreated = document.getElementById('srbCreated');

srbCreatedStage.style.display = 'none'; // Hide SRB Created stage initially
srbCreated.style.display = 'none'; // Hide SRB Created stage initially
}
else{
const srbCreatedStage = document.getElementById('srbCreatedStage');
const srbCreated = document.getElementById('srbCreated');

srbCreatedStage.style.display = 'block'; // Hide SRB Created stage initially
srbCreated.style.display = 'block'; // Hide SRB Created stage initially
}




  // ! Bank details
  const editBtn = document.getElementById("edit");
const viewBtn = document.getElementById("view");
const uploadSection = document.getElementById("uploadSection");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const bankFileInput = document.getElementById("bankFileInput");

viewBtn.addEventListener("click", () => {
  if (typeof indent !== "undefined" && indent.VendorID) {
    downloadBankFile(indent.VendorID);
  } else {
    showErrorPopupFadeInDown("Vendor ID is missing!");
  }
});

// Assume indent.VendorID is defined and valid
const vendorId = indent.VendorID;

editBtn.addEventListener("click", () => {
  uploadSection.classList.remove("d-none");
  editBtn.classList.add("d-none");
  viewBtn.classList.add("d-none");
});

cancelBtn.addEventListener("click", () => {
  uploadSection.classList.add("d-none");
  editBtn.classList.remove("d-none");
  viewBtn.classList.remove("d-none");
  bankFileInput.value = ""; // clear input
});

// 🟩 Save/upload new file to replace previous
saveBtn.addEventListener("click", async () => {
  console.log("Save button clicked");
  const file = bankFileInput.files[0];

  if (!file) {
    showErrorPopupFadeInDown("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("bankDocument", file); // field name should match server
  console.log("Vendor ID:", vendorId);
  formData.append("vendorId", vendorId);
  console.log("Form data prepared:", formData);

  try {
    const token = localStorage.getItem("accessToken");
    const response = await axiosInstance.post(`/vendors/upload/${vendorId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      showErrorPopupFadeInDown("File uploaded successfully!");
    } else {
      showErrorPopupFadeInDown("Upload failed. Try again.");
    }

    uploadSection.classList.add("d-none");
    editBtn.classList.remove("d-none");
    viewBtn.classList.remove("d-none");
    bankFileInput.value = "";
  } catch (error) {
    console.error("Upload failed:", error);
    showErrorPopupFadeInDown("Error uploading file.");
  }
});

async function downloadBankFile(id) {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axiosInstance.get(`/vendors/download/${id}`, {
      responseType: "blob", // Important: treat response as binary
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `vendor_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    showErrorPopupFadeInDown("Download failed!");
  }
}

// end

  srbItems = indent.items;
  if (!indent) {
    showErrorPopupFadeInDown('Error fetching indent');
    return;
  }


  const stage = button.getAttribute("data-stage");
  console.log("Stage:", stage);



  let index = stageNames.indexOf(stage);
  console.log({ index });

  if (indent.CurrentStage === 'Rejected') {
    index = 3;
  }

  if (indent.CurrentStage === 'Reverted Back') {
    index = 3;
  }

  // if(indent.CurrentStage === 'Completed') {
  //   index = 6;
  //   document.getElementById('ICSRContent').classList.add('d-none');
  //   document.getElementById('icSrSubmittedStage').classList.add('completed');
  //   document.getElementById('icSrSubmittedStage').classList.remove('active');

  // }

  if (indent.CurrentStage === 'Completed') {
    index = 7;  // Completed stage
    document.getElementById('ICSRContent').classList.add('d-none');  // Hide ICSR content
    document.getElementById('stageDetailsContent').classList.remove('d-none');  // Show stageDetailsContent
    document.getElementById('icSrSubmittedStage').classList.add('completed');
    document.getElementById('icSrSubmittedStage').classList.remove('active');
    document.getElementById('ICSRContent').classList.add('d-none');
  }



  if (index >= 0) {
    stageIDs.forEach((stageID, i) => {
      if (i <= index) {
        document.getElementById(stageID).classList.add('completed');
      } else {
        document.getElementById(stageID).classList.remove('completed');
      }
    });
  }

  if (indent.CurrentStage === 'Rejected') {
    document.getElementById('indentApprovalStage').classList.add('rejected');
  }

  if (stage === 'Completed') {
    document.getElementById('ICSRContent').classList.add('d-none');
    document.getElementById('icSrSubmittedStage').classList.add('completed');
    document.getElementById('icSrSubmittedStage').classList.remove('active');
    let stageData = await fetchStageData(index - 1);
    renderData(stageData, index - 1);
  }


  // alert(stage);
  // alert(hasStageAccess(stage));

  if (index !== 7 && hasStageAccess(stage)) {
    // alert('has access');
    document.getElementById(stageIDs[index + 1]).classList.add('active');
  }


  const stagesContent = ['previewContent', 'fundcheckContent', 'lpcContent', 'approvalContent', 'poApprovalContent', 'poGeneratedContent', 'SRBContent', 'ICSRContent'];
  if (index === 0) {
    document.getElementById(stagesContent[index]).classList.remove('d-none');
  } else
    if (index !== 7 && hasStageAccess(stage)) {
      document.getElementById(stagesContent[index + 1]).classList.remove('d-none');
    } else {
      document.getElementById('stageDetailsContent').classList.remove('d-none');
      let stageData = await fetchStageData(index - 1);
      renderData(stageData, index - 1);
    }


  document.querySelectorAll('.indent-stage').forEach((stage, index) => {

    stage.addEventListener('click', async () => {
      if (!stage.classList.contains('completed') && !stage.classList.contains('active')) {
        return;
      }

      if (index !== 0 && stage.classList.contains('completed')) {
        // alert(stage.classList.contains('completed'));
        let stageData = await fetchStageData(index - 1);
        renderData(stageData, index - 1);
      }


      stagesContent.forEach(contentId => {
        document.getElementById(contentId)?.classList.add('d-none');
      });

      if (stage.classList.contains('completed')) {
        document.getElementById('stageDetailsContent').classList.remove('d-none');
        if (index === 0) {
          document.getElementById('stageDetailsContent').classList.add('d-none');
          document.getElementById(stagesContent[index])?.classList.remove('d-none');
        }
      } else {

        document.getElementById(stagesContent[index])?.classList.remove('d-none');
        document.getElementById('stageDetailsContent').classList.add('d-none');

      }


      // document.getElementById(stagesContent[index])?.classList.remove('d-none');
    });
  });

  document.querySelector('#stageCloser').addEventListener('click', () => {

    stagesContent.forEach(contentId => {
      document.getElementById(contentId)?.classList.add('d-none');
    });

  });

  console.table(indent);
  setText('VendorNameDisplay', indent.VendorName);
  setText('VendorAddressDisplay', indent.VendorAddress);
  setText('VendorPhoneDisplay', indent.VendorPhone);
  setText('VendorMailDisplay', indent.VendorEmail);
  setText('VendorGstDisplay', indent.VendorGSTNO);
  setText('VendorPanDisplay', indent.VendorPANNO);
  setText('VendorAccountDisplay', indent.VendorAccountNumber);
  setText('VendorIfscDisplay', indent.VendorIFSC);
  setText('VendorBankDisplay', indent.VendorBankName);
  setText('VendorBankAddressDisplay', indent.VendorBankBranch);

  setText('ExtraGstDisplay', indent.ExtraGST);
  setText('PriceDisplay', indent.Price);
  setText('PaymentDisplay', indent.PaymentTerms);
  setText('DeliveryPlaceDisplay', indent.DeliveryPlace);
  setText('DeliveryDisplay', indent.Delivery);
  setText('CurrencyDisplay', indent.TypeOfCurrency);
  setText('OtherTermsDisplay', indent.OtherTerms);

  setText('ProjectNumberDisplay', indent.ProjectNo);
  // showErrorPopupFadeInDown(indent.ProjectNo);
  setText('SubProjectNumberDisplay', indent.SubProjectNo);
  setText('ProjectRemarksDisplay', indent.ProjectRemarks);
  // setText('projectDepartmentDisplay',indent.Department);
  setText('ProjectIvestigatorDisplay', indent.ProjectIncharge);

  // alert(indent.ProjectIncharge);


  setText('ModeOfPurchaseDisplay', indent.ModeOfPurchase);
  setText('PurposeDisplay', indent.Purpose);
  setText('indentTypeDisplay', indent.TypeOfIndent);
  setText('quotationDisplay', indent.QuotationAvailable ? 'Yes' : 'No');
  setText('CostDisplay', 'Rs. ' + indent.Price);

  let price = indent.Price;
  let gst = indent.ExtraGST;
  let gstCost = price * gst / 100;
  let totalPrice = price + gstCost;

  setText('GstDisplay', 'Rs. ' + gstCost.toFixed(2));
  setText('TotalCostDisplay', 'Rs. ' + totalPrice.toFixed(2));
  // alert(indent.ExtraGST);

  setText('FCprojectNameDisplay', indent.ProjectName);
  setText('FCprojectNumberDisplay', indent.ProjectNo);


  document.getElementById('updateExtraGst').value = indent.ExtraGST;
  document.getElementById('updatePrice').value = indent.Price;
  document.getElementById('updateCurrencySelect').value = indent.TypeOfCurrency;
  document.getElementById('updatePayment').value = indent.PaymentTerms;
  document.getElementById('updateDeliveryPlace').value = indent.DeliveryPlace;
  document.getElementById('updateDelivery').value = indent.Delivery;

  let srbTableBody = document.getElementById('srbTableBody');
  srbTableBody.innerHTML = '';
  indent.items.forEach((item, index) => {
    let row = `
    <tr>
      <td>${item.ProductName}</td>
      <td>${item.ItemName}</td>
      <td>${item.Description}</td>
      <td>${item.ItemClassification}</td>
      <td>${item.Quantity}</td>
      <td>${item.Quantity}</td>
      <td>${item.EstimatedUnitPrice}</td>
      <td>${item.EstimatedTotalPrice}</td>
      <td>${item.Remarks}</td>
    </tr>
  `;
    srbTableBody.innerHTML += row;
  });

  document.getElementById('srbProjectNumber').value = indent.ProjectNo;
  document.getElementById('srbSubProjectNumber').value = indent.SubProjectNo;
  document.getElementById('srbVendorName').value = indent.VendorName;
  document.getElementById('srbSubTotal').value = indent.Price;
  subTotal = indent.Price;

  document.getElementById('srbGrandTotal').value = indent.Price;



  let tableBody = document.getElementById('ItemsPreviewTableBody');

  tableBody.innerHTML = '';


  indent.items.forEach((item, index) => {

    let row = `
      <tr>
        <td>${item.ProductName}</td>
        <td>${item.ItemName}</td>
        <td>${item.Description}</td>
        <td>${item.ItemClassification}</td>
        <td>${item.Quantity}</td>
        <td>${item.Quantity}</td>
        <td>${item.EstimatedUnitPrice}</td>
        <td>${item.EstimatedTotalPrice}</td>
        <td>${item.Remarks}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });



  const myModal = new bootstrap.Modal(document.getElementById('fullscreenItemModal'));
  myModal.show();
}

// ! Fullscreen Modal End

function renderData(data, index) {
  document.getElementById('stageDetailsContent').innerHTML = '';
  let html;

  if (index === 0) {
    html = `
    
           <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Is Fund Availabe ?</label>
                  <div class="p-2 border rounded bg-light">${data.FundAvailable ? 'Yes' : 'No'}</div>
                </div>
                 <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Alternate Project Number</label>
                  <div class="p-2 border rounded bg-light">${data.AlternateProjectNo || '-'}</div>
                </div>
                 <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Remarks</label>
                  <div class="p-2 border rounded bg-light">${data.Remarks || '-'}</div>
                </div>
                 <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Verified On</label>
                  <div class="p-2 border rounded bg-light">${new Date(data.VerifiedAt).toLocaleDateString()}</div>
                </div>
                 <div class="col-md-12 mb-3">
                  <label class="form-label text-dark">Verified By</label>
                  <div class="p-2 border rounded bg-light">${data.Username + ' - ' + data.VerifiedBy}</div>
                </div>
                
    `;

  }

  if (index === 1) {
    html = `
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Documents Processed Date</label>
            <div class="p-2 border rounded bg-light">${data.DocumentsProcessedDate ? new Date(data.DocumentsProcessedDate).toLocaleDateString() : '-'}</div>
        </div>
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Documents Dispatched Date</label>
            <div class="p-2 border rounded bg-light">${data.DocumentsDispatchedDate ? new Date(data.DocumentsDispatchedDate).toLocaleDateString() : '-'}</div>
        </div>
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Documents Received Date</label>
            <div class="p-2 border rounded bg-light">${data.DocumentsReceivedDate ? new Date(data.DocumentsReceivedDate).toLocaleDateString() : '-'}</div>
        </div>
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Completion Date</label>
            <div class="p-2 border rounded bg-light">${data.CompletionDate ? new Date(data.CompletionDate).toLocaleDateString() : '-'}</div>
        </div>
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Support Document</label>
          <div class="p-2 border rounded bg-light">
              ${data.HasDocument ?
        `<button class="btn btn-primary btn-sm download-po" onclick="downloadDocument('${'lpc'}')">
                      <i class="fas fa-file-download me-2"></i> Download PO
                  </button>` :
        '-'}
          </div>
        </div>
        <div class="col-md-6 mb-3">
            <label class="form-label text-dark">Remarks</label>
            <div class="p-2 border rounded bg-light">${data.Remarks || '-'}</div>
        </div>
        <div class="col-md-12 mb-3">
            <label class="form-label text-dark">Processed By</label>
            <div class="p-2 border rounded bg-light">${data.Username ? data.Username + ' - ' + data.ProcessedBy : '-'}</div>
        </div>
        <div class="col-md-12 mb-3">
            <label class="form-label text-dark">Processed On</label>
            <div class="p-2 border rounded bg-light">${data.ProcessedAt ? new Date(data.ProcessedAt).toLocaleDateString() : '-'}</div>
        </div>
    `;
  }
  if (index === 2) {
    html = `
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Approval Status</label>
          <div class="p-2 border rounded bg-light">
              ${data.Status}
          </div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Support Document</label>
          <div class="p-2 border rounded bg-light">
              ${data.HasDocument ?
        `<button class="btn btn-primary btn-sm download-btn" onclick="downloadDocument('${'indentApproval'}')" data-id="${data.ApprovalID}">
                      <i class="fa-solid fa-download me-2"></i>Download
                  </button>` :
        '-'}
          </div>
      </div>
      <div class="col-md-12 mb-3">
          <label class="form-label text-dark">Remarks</label>
          <div class="p-2 border rounded bg-light">${data.Remarks || '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Action By</label>
          <div class="p-2 border rounded bg-light">${data.Username ? `${data.Username} (${data.ActionBy})` : '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Action Date</label>
          <div class="p-2 border rounded bg-light">${data.ActionAt ? new Date(data.ActionAt).toLocaleString() : '-'}</div>
      </div>
  `;
  }
  if (index === 3) {
    html = `
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Type of Order</label>
          <div class="p-2 border rounded bg-light">${data.TypeOfOrder || '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Category</label>
          <div class="p-2 border rounded bg-light">${data.Category || '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Reference Number</label>
          <div class="p-2 border rounded bg-light">${data.ReferenceNo || '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Reference Date</label>
          <div class="p-2 border rounded bg-light">${data.ReferenceDate ? new Date(data.ReferenceDate).toLocaleDateString() : '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Approval Date</label>
          <div class="p-2 border rounded bg-light">${data.ApprovalDate ? new Date(data.ApprovalDate).toLocaleDateString() : '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Name of Work</label>
          <div class="p-2 border rounded bg-light">${data.NameOfWork || '-'}</div>
      </div>
      <div class="col-md-12 mb-3">
          <label class="form-label text-dark">Approved By</label>
          <div class="p-2 border rounded bg-light">${data.Username ? `${data.Username} (${data.ApprovedBy})` : '-'}</div>
      </div>
  `;
  }
  if (index === 4) {
    html = `
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">PO Number</label>
          <div class="p-2 border rounded bg-light">${data.PONumber || '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Signed PO Mailed Date</label>
          <div class="p-2 border rounded bg-light">${data.SignedPOMailedDate ? new Date(data.SignedPOMailedDate).toLocaleDateString() : '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Generated On</label>
          <div class="p-2 border rounded bg-light">${data.GeneratedAt ? new Date(data.GeneratedAt).toLocaleString() : '-'}</div>
      </div>
      <div class="col-md-6 mb-3">
          <label class="form-label text-dark">Signed PO Document</label>
          <div class="p-2 border rounded bg-light">
              ${data.HasDocument ?
        `<button class="btn btn-primary btn-sm download-po" onclick="downloadDocument('${'poGenerated'}')" data-id="${data.POGenerationID}">
                      <i class="fas fa-file-download me-2"></i> Download PO
                  </button>` :
        '-'}
          </div>
      </div>
      <div class="col-md-12 mb-3">
          <label class="form-label text-dark">Generated By</label>
          <div class="p-2 border rounded bg-light">${data.Username ? `${data.Username} (${data.GeneratedBy})` : '-'}</div>
      </div>
  `;
  }
  if (index === 5) {  // Assuming this is stage 5
    html = `
      <div class="row">
          <!-- Basic Information -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">SRB For</label>
              <div class="p-2 border rounded bg-light">${data.SRBFor || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Serial Number</label>
              <div class="p-2 border rounded bg-light">${data.SerialNo || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Type</label>
              <div class="p-2 border rounded bg-light">${data.Type || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">PO Number</label>
              <div class="p-2 border rounded bg-light">${data.PONumber || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">PO Date</label>
              <div class="p-2 border rounded bg-light">${data.PODate ? new Date(data.PODate).toLocaleDateString() : '-'}</div>
          </div>
          
          <!-- Employee/Vendor Information -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Employee/Vendor Name</label>
              <div class="p-2 border rounded bg-light">${data.EmpName || '-'}</div>
          </div>
          
          <!-- Invoice Details -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Invoice Number</label>
              <div class="p-2 border rounded bg-light">${data.InvoiceNo || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Invoice Date</label>
              <div class="p-2 border rounded bg-light">${data.InvoiceDate ? new Date(data.InvoiceDate).toLocaleDateString() : '-'}</div>
          </div>
          
          <!-- Financial Information -->
          <div class="col-md-4 mb-3">
              <label class="form-label text-dark">Discount</label>
              <div class="p-2 border rounded bg-light">${data.Discount ? '₹' + data.Discount : '-'}</div>
          </div>
          <div class="col-md-4 mb-3">
              <label class="form-label text-dark">Deducted Amount</label>
              <div class="p-2 border rounded bg-light">${data.DeductedAmount ? '₹' + data.DeductedAmount : '-'}</div>
          </div>
          <div class="col-md-4 mb-3">
              <label class="form-label text-dark">GST Amount</label>
              <div class="p-2 border rounded bg-light">${data.GSTAmount ? '₹' + data.GSTAmount : '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Other Charges</label>
              <div class="p-2 border rounded bg-light">${data.OtherCharges ? '₹' + data.OtherCharges : '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Grand Total</label>
              <div class="p-2 border rounded bg-light font-weight-bold">${data.GrandTotal ? '₹' + data.GrandTotal : '-'}</div>
          </div>
          
          <!-- Warranty and Others -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Warranty</label>
              <div class="p-2 border rounded bg-light">${data.Warranty || '-'}</div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Other Details</label>
              <div class="p-2 border rounded bg-light">${data.Others || '-'}</div>
          </div>
          
          <!-- Document and Creation Info -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">SRB Document</label>
              <div class="p-2 border rounded bg-light">
                  ${data.HasDocument ?
        `<button class="btn btn-primary btn-sm download-srb" onclick="downloadDocument('${'srb'}')" data-id="${data.SRBID}">
                          <i class="fas fa-file-download me-2"></i> Download SRB
                      </button>` :
        '-'}
              </div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Created On</label>
              <div class="p-2 border rounded bg-light">${data.CreatedAt ? new Date(data.CreatedAt).toLocaleString() : '-'}</div>
          </div>
          <div class="col-md-12 mb-3">
              <label class="form-label text-dark">Created By</label>
              <div class="p-2 border rounded bg-light">${data.Username ? `${data.Username} (${data.CreatedBy})` : '-'}</div>
          </div>
      </div>
  `;
  }
  if (index === 6) {  // Assuming this is stage 6
    const statusText = data.Status === true ? 'Approved' : 'Rejected';
    const statusClass = data.Status === true ? 'text-success' : 'text-danger';

    html = `
    
          <!-- Status Information -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Status</label>
              <div class="p-2 border rounded bg-light">
                  <span class=" ${statusClass}">${statusText}</span>
              </div>
          </div>
          
          <!-- Approval Date (shown when status is 1) -->
          ${data.Status === 1 ? `
              <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Approval Date</label>
                  <div class="p-2 border rounded bg-light">
                      ${data.ApprovalDate ? new Date(data.ApprovalDate).toLocaleDateString() : '-'}
                  </div>
              </div>
          ` : ''}
          
          <!-- Rejection Date (shown when status is 0) -->
          ${data.Status === 0 ? `
              <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Rejection Date</label>
                  <div class="p-2 border rounded bg-light">
                      ${data.RejectionDate ? new Date(data.RejectionDate).toLocaleDateString() : '-'}
                  </div>
              </div>
          ` : ''}
          
          <!-- Rejection Remarks (shown when status is 0) -->
          ${data.Status === false ? `
              <div class="col-md-6 mb-3">
                  <label class="form-label text-dark">Rejection Remarks</label>
                  <div class="p-2 border rounded bg-light">
                      ${data.RejectionRemarks || 'No remarks provided'}
                  </div>
              </div>
          ` : ''}
          
          <!-- Creation Information (always shown) -->
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Created On</label>
              <div class="p-2 border rounded bg-light">
                  ${data.CreatedAt ? new Date(data.CreatedAt).toLocaleString() : '-'}
              </div>
          </div>
          <div class="col-md-6 mb-3">
              <label class="form-label text-dark">Created By</label>
              <div class="p-2 border rounded bg-light">
                  ${data.Username ? `${data.Username} (${data.CreatedBy})` : '-'}
              </div>
          </div>
      
  `;
  }
  document.getElementById('stageDetailsContent').innerHTML = html;

}

async function downloadDocument(api) {
  try {
    const response = await axiosInstance.get(`/${api}/download/${globalIndentID}`, {
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `IND_${api}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Download failed!");
  }
}

async function fetchStageData(index) {
  const endpoints = ['fundCheck', 'lpc', 'indentApproval', 'poApproval', 'poGenerated', 'srb', 'icsr'];


  if (index < 0 || index >= endpoints.length) {
    throw new Error("Invalid stage index");
  }

  try {
    const response = await axiosInstance.get(`/${endpoints[index]}/${globalIndentID}`);

    const data = response.data.record;
    data['api-stage'] = endpoints[index];
    return data;
  } catch (error) {
    console.error("Error fetching stage data: ", error);
    showErrorPopupFadeInDown("Error fetching stage data");
    return null;
  }
}


async function addRow(data) {
  let table = $('#indentsTable').DataTable();
  if ($.fn.dataTable.isDataTable('#indentsTable')) {
    table = $('#indentsTable').DataTable();
  }
  if (!data) {
    console.error('no data to add');
    return;
  }

  if (data.IsDocumentAvailable) {
    data.IsDocumentAvailable = `<div class="bg-facebook rounded p-2" onclick="downloadFile(${data.IndentID})" style="cursor:pointer;"><i class="fa-solid fa-download text-white"></i></div>`;
  } else {
    data.IsDocumentAvailable = `-`;
  }

  let currentStage = data.CurrentStage;
  let lastRow = `<button class="btn btn-sm view-btn" data-stage="${data.CurrentStage}" data-id="${data.IndentID}" onclick="openFullscreenModal(this)" title="View Details">
  <i class="ti-eye me-1"></i> View
</button>
`;

  if (currentStage === 'Reverted Back' && data.userID === user.id) {
    lastRow = `<div class="d-flex justify-content-center align-items-center"><button class="btn btn-sm view-btn m-1 " data-stage="${data.CurrentStage}" data-id="${data.IndentID}" onclick="openFullscreenModal(this)" title="View Details">
    <i class="ti-eye me-1"></i> View
  </button>  <button class="btn btn-sm m-1 view-btn bg-danger " data-stage="${data.CurrentStage}" data-id="${data.IndentID}" onclick="loadUpdateData(this)" title="View Details">
  <i class="ti-pencil me-1"></i> Edit
</button></div>
  `;
  }

  table.row.add([
    data.IndentID,
    data.ProjectNo,
    data.SubProjectNo,
    data.VendorName,
    data.CreatedBy,
    data.IsDocumentAvailable,
    `<p class="status-badge text-nowrap">${data.CurrentStage}</p>`,

    lastRow,
  ]).draw(false);

}

document.addEventListener('DOMContentLoaded', async () => {
  let indents = await getAllIndents();
  if (indents.length) {
    indents.forEach(indent => {


      projectNOSet.add(indent.ProjectNo);
      vendorSet.add(indent.VendorName);
      statusSet.add(indent.CurrentStage);



      addRow(indent);


    });


    projectNOSet.forEach(project => {
      if (!project) return;
      $('#projectNOFilter').append(`<option value="${project}">${project}</option>`);
    });

    vendorSet.forEach(vendor => {
      if (!vendor) return;
      $('#vendorFilter').append(`<option value="${vendor}">${vendor}</option>`);
    });

    statusSet.forEach(status => {
      if (!status) return;
      $('#statusFilter').append(`<option value="${status}">${status}</option>`);
    })

  }

  console.log({ projectNOSet, vendorSet, statusSet });

  // let vendorSelect=document.querySelector('#vendorSelect');
  // vendorSelect.innerHTML='';
  populateVendors();
  response = await axiosInstance.get('/projects/all');
  let projects = response.data.projects;
  // let altProjectSelect = document.querySelector('#altProjectSelect');
  let projectList = document.querySelector('#projectList');
  let altProjectList = document.querySelector('#altProjectList');

  projects.forEach(project => {
    let option = document.createElement('option');
    option.value = project.ProjectID;
    option.textContent = project.ProjectID;
    option.dataset.project = JSON.stringify(project);
    // projectSelect.appendChild(option);
    altProjectList.appendChild(option.cloneNode(true));
    projectList.appendChild(option.cloneNode(true));
  })



  // console.log(vendors);
});


async function populateVendors() {

  let response = await axiosInstance.get('/vendors/all/active');
  let vendors = response.data.vendors;


  let vendorSelect = document.querySelector('#vendorSelect');
  vendorSelect.innerHTML = '';

  vendors.forEach(vendor => {
    let option = document.createElement('option');
    option.value = vendor.VendorID;
    option.textContent = vendor.VendorName;
    option.dataset.vendor = JSON.stringify(vendor);
    vendorSelect.appendChild(option);
  })

  let option = document.createElement('option');
  option.value = 'add-new-action';
  option.textContent = 'Add New Vendor';
  option.classList.add('bg-success');
  vendorSelect.appendChild(option);

}

document.getElementById('cancelCreateVendor').addEventListener('click', (e) => {
  e.preventDefault();
  vendorSelect.selectedIndex = 0;
  document.getElementById('newVendorSection').classList.add('d-none');
  document.getElementById('existingVendorSection').classList.remove('d-none');
});

document.getElementById('createVendorBtn').addEventListener('click', async (e) => {
  e.preventDefault();

  // selectedVendor = null;

let form = document.getElementById('newVendorForm');
let formData = new FormData(form);

// Convert text fields to object
let Data = {};
for (let [key, value] of formData.entries()) {
  if (value instanceof File) {
    // Handle file input separately
    if (value.name) {
      Data[key] = value; // assign the File object
    } else {
      Data[key] = null; // no file selected
    }
  } else {
    Data[key] = value;
  }
}
const data = new FormData();
for (let key in Data) {
  data.append(key, Data[key]);
}


  let requiredFields = ["VendorName", "VendorAddress", "VendorPhone", "VendorMailAddress", "VendorGST", "VendorAccountNumber", "VendorIFSC", "VendorBank", "VendorBranch","BankDetailsDoc"];

  let hasErrors = false;
  let i = 0;

  while (!hasErrors && i < requiredFields.length) {
    if (data[requiredFields[i]] == '') {
      showErrorPopupFadeInDown(`Please Enter ${requiredFields[i].replace(/([A-Z])/g, ' $1').trim()} `);
      hasErrors = true;
    }

    i++;
  }

  if (hasErrors) {
    return;
  }

  console.log(data);
  console.log(selectedVendor);

  try {
       let response = await axiosInstance.post('/vendors/', data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }  
});
    if (response.status === 200) {
      populateVendors();
      vendorSelect.selectedIndex = vendorSelect.options.length - 1;
      vendorSelect.value = vendorSelect.options[vendorSelect.options.length - 1].value;
      showPopupFadeInDown('Vendor Created Successfully');
    }
  } catch (err) {
    console.log(err);
    showPopupFadeInDown(err.response.data.message);
  }


  vendorSelect.selectedIndex = 0;
  document.getElementById('newVendorSection').classList.add('d-none');
  document.getElementById('existingVendorSection').classList.remove('d-none');



});

vendorSelect.addEventListener('change', (e) => {

  if (e.target.value === 'add-new-action') {
    document.getElementById('existingVendorSection').classList.add('d-none');
    document.getElementById('newVendorSection').classList.remove('d-none');
    return;
  }
  try {
    const selectedOption = vendorSelect.options[vendorSelect.selectedIndex];
    selectedVendor = JSON.parse(selectedOption.dataset.vendor || 'null');
    console.log('Selected Vendor:', selectedVendor);
  } catch (error) {
    console.error('Error parsing vendor data:', error);
    selectedVendor = null;
  }
});

// projectSelect.addEventListener('change', () => {
//   try {
//     const selectedOption = projectSelect.options[projectSelect.selectedIndex];
//     selectedProject = JSON.parse(selectedOption.dataset.project || 'null');
//     console.log('Selected Project:', selectedProject);
//   } catch (error) {
//     console.error('Error parsing project data:', error);
//     selectedProject = null;
//   }
// })

const projectInput = document.getElementById('projectInput');
const projectList = document.getElementById('projectList');

projectInput.addEventListener('input', () => {
  const inputValue = projectInput.value;
  selectedProject = null;

  Array.from(projectList.options).forEach(option => {
    if (option.value === inputValue) {
      try {
        selectedProject = JSON.parse(option.dataset.project || 'null');
        console.log('Selected Project:', selectedProject);
      } catch (error) {
        console.error('Error parsing project data:', error);
      }
    }
  });

  if (!selectedProject) {
    showErrorPopupFadeInDown('No Matching Project Found');
  }
});

const altProjectInput = document.getElementById('altProjectInput');
const altProjectList = document.getElementById('altProjectList');
let selectedAltProject = null;

altProjectInput.addEventListener('input', () => {
  const inputValue = altProjectInput.value;
  selectedAltProject = null;

  Array.from(projectList.options).forEach(option => {
    if (option.value === inputValue) {
      try {
        selectedAltProject = JSON.parse(option.dataset.project || 'null');
        document.getElementById('altProjectNameInput').value = selectedAltProject.ProjectName;
        console.log('Selected Project:', { selectedAltProject });
      } catch (error) {
        console.error('Error parsing project data:', error);
      }
    }
  });

  if (!selectedAltProject) {
    showErrorPopupFadeInDown('No Matching Project Found');
  }
});


$(document).ready(function () {
  const datatable = $('#indentsTable').DataTable({
    dom: 'Bfrtip',
    buttons: [
      'csv', 'excel', 'pdf', 'colvis'
    ]
  });

  datatable.buttons().container().appendTo($('#exportButtons'));

  $('#projectNOFilter').on('change', function () {
    const selectedFilterProject = $(this).val();
    datatable.column(1).search(selectedFilterProject ? '^' + selectedFilterProject + '$' : '', true, false).draw();
  });



  $('#vendorFilter').on('change', function () {
    const selectedFilterVendor = $(this).val();
    datatable.column(3).search(selectedFilterVendor ? '^' + selectedFilterVendor + '$' : '', true, false).draw();
  });

  $('#statusFilter').on('change', function () {
    const selectedFilterStatus = $(this).val();
    datatable.column(6).search(selectedFilterStatus ? '^' + selectedFilterStatus + '$' : '', true, false).draw();
  });


});

document.querySelector('#addNew').addEventListener('click', function () {
  document.querySelector('#projectIndentModal').classList.remove('d-none');
  document.querySelector('#tableContainer').classList.add('d-none');

  // Set action as 'create'
  document.querySelector('#projectIndentModal').dataset.action = 'create';

  // Toggle buttons
  togglePreviewButton(false); // false = create
});

function togglePreviewButton(isUpdate) {
  document.getElementById('updateModalBtn').classList.toggle('d-none', !isUpdate);
  document.getElementById('createModalBtn').classList.toggle('d-none', isUpdate);
}


async function loadUpdateData(button) {



  let items = [];

  // document.getElementById('createModalBtn').classList.add('d-none');
  // document.getElementById('updateModalBtn').classList.remove('d-none');

  document.querySelector('#projectIndentModal').classList.remove('d-none');
  document.querySelector('#tableContainer').classList.add('d-none');

  // Set action as 'update'
  document.querySelector('#projectIndentModal').dataset.action = 'update';

  // Toggle buttons
  togglePreviewButton(true); // true = update
  let Indent = await getIndentByID(button.dataset.id);
  globalIndentID = button.dataset.id;

  updates = Indent;




  // console.log({Indent});

  // document.querySelector('#itemForm').classList.add('d-none');

  setValue('vendorSelect', Indent.VendorID);
  setValue('formIndentType', Indent.TypeOfIndent);
  setValue('formIsQuotationAvailable', Indent.QuotationAvailable ? 'Yes' : 'No');
  setValue('totalAmount', Indent.Price);
  setValue('formExtraGST', Indent.ExtraGST);
  setValue('formPrice', Indent.Price);
  setValue('formTypeOFCurrency', Indent.TypeOfCurrency);
  setValue('formPayment', Indent.PaymentTerms);
  setValue('formDeliveryPlace', Indent.DeliveryPlace);
  setValue('formDelivery', Indent.Delivery);
  setValue('projectInput', Indent.ProjectNo);
  setValue('formSubProjectNo', Indent.SubProjectNo);
  setValue('formRemarks', Indent.ProjectRemarks);
  setValue('formIndentMode', Indent.ModeOfPurchase);
  setValue('formIndentPurpose', Indent.Purpose);
  setValue('formOtherTerms', Indent.OtherTerms);
  // setValue('supportDoc3', Indent.Department);
  items = Indent.items;



  renderUpdateItems(items);

}

function getValue(id) {
  const element = document.getElementById(id);
  if (element) {
    return element.value;
  }
  return null;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

document.querySelectorAll('.modalClose').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#projectIndentModal').classList.add('d-none');
    document.querySelector('#tableContainer').classList.remove('d-none');
    window.location.reload();
  });
})


function goToNextTab() {
  const activeTab = document.querySelector('.nav-tabs .nav-link.active');
  const nextTab = activeTab.parentElement.nextElementSibling;
  if (nextTab) {
    const link = nextTab.querySelector('.nav-link');
    new bootstrap.Tab(link).show();
  }
}


document.querySelectorAll('.indent-stage').forEach(stage => {
  stage.addEventListener('mouseover', () => {
    if (stage.classList.contains('completed') || stage.classList.contains('active')) {
      stage.style.cursor = 'pointer';
    } else {
      stage.style.cursor = 'not-allowed';
    }
  });

  stage.addEventListener('mouseout', () => {
    stage.style.cursor = '';
  });
});


document.querySelectorAll('.tc-check').forEach(chk => {
  chk.addEventListener('click', () => {
    if (chk.classList.contains('fa-circle')) {
      chk.classList.add('text-success');
      chk.classList.remove('fa-regular');
      chk.classList.remove('fa-circle');
      chk.classList.add('fa-solid');
      chk.classList.add('fa-circle-check');

      chk.classList.remove('text-muted');

    } else if (chk.classList.contains('fa-circle-check')) {
      chk.classList.remove('text-success');
      chk.classList.remove('fa-solid');
      chk.classList.remove('fa-circle-check');
      chk.classList.add('fa-regular');
      chk.classList.add('fa-circle');
      chk.classList.add('text-muted');

    }
  });
});


function showSRBFileName(input) {
  const fileNameDisplay = document.getElementById('srbDocumentDisplay');
  if (input.files.length > 0) {
    fileNameDisplay.textContent = "Selected file: " + input.files[0].name;
  } else {
    fileNameDisplay.textContent = "";
  }
}


function showFileName(input) {
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  if (input.files.length > 0) {
    fileNameDisplay.textContent = "Selected file: " + input.files[0].name;
  } else {
    fileNameDisplay.textContent = "";
  }
}
function showFileName2(input) {
  const fileNameDisplay = document.getElementById('fileNameDisplay1');
  if (input.files.length > 0) {
    fileNameDisplay.textContent = "Selected file: " + input.files[0].name;
  } else {
    fileNameDisplay.textContent = "";
  }
}
function showFileName3(input) {
  const fileNameDisplay = document.getElementById('fileNameDisplay3');
  if (input.files.length > 0) {
    fileNameDisplay.textContent = "Selected file: " + input.files[0].name;
  } else {
    fileNameDisplay.textContent = "";
  }
}

function showPOName(input) {
  const fileNameDisplay = document.getElementById('poNameDisplay');
  if (input.files.length > 0) {
    fileNameDisplay.textContent = "Selected file: " + input.files[0].name;
  } else {
    fileNameDisplay.textContent = "";
  }
}




let items = [];

function addItem() {
  if (!globalIndentID) {
    const productDropdown = document.getElementById('productCategory');
    const productName = productDropdown.options[productDropdown.selectedIndex].text;
    const subProductDropdown = document.getElementById('productName');
    const name = subProductDropdown.options[subProductDropdown.selectedIndex].text;
    // const name = document.getElementById('itemName').value.trim();
    const desc = document.getElementById('itemDesc').value.trim();
    const classification = document.getElementById('itemClass').value;
    const qty = parseInt(document.getElementById('itemQty').value);
    const unit = document.getElementById('itemUnit').value;
    const price = parseFloat(document.getElementById('unitPrice').value);
    const estTotalPrice = parseFloat(document.getElementById('itemPrice').value);
    const remarks = document.getElementById('itemsRemarks').value.trim();
    const total = qty * price;


    if (!name || !desc || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      showErrorPopupFadeInDown("Fill: Name, Description, Valid Qty (>0), Valid Price (>0)");
      return;
    }


    items.push({
      productName,
      name,
      desc,
      classification,
      qty,
      unit,
      price,
      estTotalPrice: isNaN(estTotalPrice) ? total : estTotalPrice,
      remarks,
      total
    });


    renderItems();
    document.getElementById('itemForm').reset();
  }
  else {
    alert("You cannot add items in update mode");
  }
}

function removeItem(index) {
  items.splice(index, 1);
  renderItems();
}

function renderItems() {
  const tableBody = document.getElementById('itemsTableBody');
  tableBody.innerHTML = '';
  let total = 0;

  // Define your classification options
  const classificationOptions = ['Electronics', 'Clothing', 'Groceries', 'Furniture', 'Other'];

  items.forEach((item, index) => {
    total += item.qty * item.price;

    const row = `
          <tr data-index="${index}">
              <td class="editable" data-field="productName">${item.productName}</td>
              <td class="editable" data-field="name">${item.name}</td>
              <td class="editable" data-field="desc">${item.desc}</td>
              <td class="editable-select" data-field="classification">
                  ${item.classification}
              </td>
              <td>
                  <input type="number" min="1" value="${item.qty}" class="form-control form-control-sm qty-input" 
                         data-index="${index}" data-field="qty" style="width: 70px;">
                  <span>${item.unit}</span>
              </td>
              <td class="editable" data-field="price">₹${item.price.toFixed(2)}</td>
              <td>₹${(item.qty * item.price).toFixed(2)}</td>
              <td class="editable" data-field="remarks">${item.remarks}</td>
              <td>
                  <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          </tr>
      `;
    tableBody.innerHTML += row;
  });

  // Add event listeners for editable cells
  document.querySelectorAll('.editable').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.classList.contains('editable')) {
        showEditModal(e.target);
      }
    });
  });

  // Add event listeners for editable select cells
  document.querySelectorAll('.editable-select').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.classList.contains('editable-select')) {
        showSelectModal(e.target);
      }
    });
  });

  // Add event listeners for quantity inputs
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      const field = e.target.getAttribute('data-field');
      const value = parseFloat(e.target.value);

      if (!isNaN(value) && value > 0) {
        items[index][field] = value;
        renderItems();
      }
    });
  });

  document.getElementById('totalAmount').innerText = total.toFixed(2);
  totalCost = total;
}

function renderUpdateItems(items) {
  const tableBody = document.getElementById('itemsTableBody');
  let total = 0;

  // Define your classification options
  const classificationOptions = ['Electronics', 'Clothing', 'Groceries', 'Furniture', 'Other'];

  items.forEach((item, index) => {
    total += item.Quantity * item.EstimatedUnitPrice;

    const row = `
          <tr data-index="${index}">
              <td class="editable" data-field="productName">${item.ProductName}</td>
              <td class="editable" data-field="name">${item.ItemName}</td>
              <td class="editable" data-field="desc">${item.Description}</td>
              <td class="editable-select" data-field="classification">
                  ${item.ItemClassification}
              </td>
              <td>
                  <p 
                         data-index="${index}" data-field="qty" style="width: 70px;">${item.Quantity}</p>
                  <span>${item.Unit}</span>
              </td>
              <td class="editable" data-field="price">₹${item.EstimatedUnitPrice.toFixed(2)}</td>
              <td>₹${(item.Quantity * item.EstimatedUnitPrice).toFixed(2)}</td>
              <td class="editable" data-field="remarks">${item.Remarks}</td>
              <td>
                  <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          </tr>
      `;
    tableBody.innerHTML += row;
  });

  // Add event listeners for editable cells
  document.querySelectorAll('.editable').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.classList.contains('editable')) {
        showEditModal(e.target);
      }
    });
  });

  // Add event listeners for editable select cells
  document.querySelectorAll('.editable-select').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.classList.contains('editable-select')) {
        showSelectModal(e.target);
      }
    });
  });

  // Add event listeners for quantity inputs
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      const field = e.target.getAttribute('data-field');
      const value = parseFloat(e.target.value);

      if (!isNaN(value) && value > 0) {
        items[index][field] = value;
        renderItems();
      }
    });
  });

  document.getElementById('totalAmount').innerText = total.toFixed(2);
  totalCost = total;
}

function showSelectModal(cell) {
  const row = cell.closest('tr');
  const index = row.getAttribute('data-index');
  const field = cell.getAttribute('data-field');
  const currentValue = items[index][field];
  const classificationOptions = ['Electronics', 'Clothing', 'Groceries', 'Furniture', 'Other'];

  // Create modal with select dropdown
  const modal = `
      <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Edit Classification</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <select class="form-select form-control" id="editFieldInput">
                          ${classificationOptions.map(option =>
    `<option value="${option}" ${option === currentValue ? 'selected' : ''}>${option}</option>`
  ).join('')}
                      </select>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-primary" onclick="saveEdit(${index}, '${field}')">Save</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  // Add modal to body and show it
  document.body.insertAdjacentHTML('beforeend', modal);
  const modalEl = new bootstrap.Modal(document.getElementById('editModal'));
  modalEl.show();

  // Remove modal after it's closed
  document.getElementById('editModal').addEventListener('hidden.bs.modal', function () {
    this.remove();
  });
}

function showEditModal(cell) {
  const row = cell.closest('tr');
  const index = row.getAttribute('data-index');
  const field = cell.getAttribute('data-field');
  const currentValue = items[index][field];

  // Skip if this is the classification field (handled by showSelectModal)
  if (field === 'classification') return;

  // Create and show modal
  const modal = `
      <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Edit ${field}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <input type="${field === 'price' ? 'number' : 'text'}" 
                             class="form-control" 
                             id="editFieldInput" 
                             value="${currentValue}" 
                             step="${field === 'price' ? '0.01' : '1'}">
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-primary" onclick="saveEdit(${index}, '${field}')">Save</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  // Add modal to body and show it
  document.body.insertAdjacentHTML('beforeend', modal);
  const modalEl = new bootstrap.Modal(document.getElementById('editModal'));
  modalEl.show();

  // Remove modal after it's closed
  document.getElementById('editModal').addEventListener('hidden.bs.modal', function () {
    this.remove();
  });
}

function saveEdit(index, field) {
  let newValue;

  if (field === 'classification') {
    newValue = document.getElementById('editFieldInput').value;
  } else {
    newValue = field === 'price'
      ? parseFloat(document.getElementById('editFieldInput').value)
      : document.getElementById('editFieldInput').value;
  }

  if ((field === 'price' && isNaN(newValue)) || !newValue) {
    showErrorPopupFadeInDown('Please enter a valid value');
    return;
  }

  items[index][field] = newValue;
  renderItems();
  bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
}


document.querySelectorAll('input[name="fundStatus"]').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    if (event.target.checked) {
      console.log(`Selected: ${event.target.id}`);


      if (event.target.id === "fundAvailable") {
        globalFundStatus = true;
        document.getElementById("altProject").classList.add("d-none");
      } else {
        globalFundStatus = false;

        document.getElementById("altProject").classList.remove("d-none");
      }
    }
  });
});

function validateRequiredFields(formSelector) {
  const form = document.querySelector(formSelector);
  const requiredInputs = form.querySelectorAll('[required]');
  for (let input of requiredInputs) {
    if (!input.value || input.value.trim() === '') {
      input.focus();
      showErrorPopupFadeInDown(`Please fill the required field: ${input.dataset.name || input.id}`);
      return false;
    }
  }
  return true;
}


function formDataToObject(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

let updateIndentData = null;

async function showPreviewModal() {




  if (!selectedVendor) {
    showErrorPopupFadeInDown('Please select a vendor');
    return;
  }


  const allForms = [
    '#vendorForm',
    '#itemDetailsForm',
    '#itemForm',
    '#commercialForm',
    '#projectForm',
    '#indentForm'
  ];

  for (let formSelector of allForms) {
    if (!validateRequiredFields(formSelector)) return;
  }


  const vendorFormData = formDataToObject(new FormData(document.querySelector('#vendorForm')));
  const itemDetailsForm = formDataToObject(new FormData(document.querySelector('#itemDetailsForm')));
  const itemForm = formDataToObject(new FormData(document.querySelector('#itemForm')));
  const commercialForm = formDataToObject(new FormData(document.querySelector('#commercialForm')));
  const projectForm = formDataToObject(new FormData(document.querySelector('#projectForm')));
  const indentForm = formDataToObject(new FormData(document.querySelector('#indentForm')));

  itemForm['items'] = items;

  let totalCost = 0;
  items.forEach((item) => {
    totalCost += parseFloat(item.estTotalPrice);
  });

  const gstCost = (totalCost * parseFloat(commercialForm['extraGST'])) / 100;
  totalCost += gstCost;

  itemForm['cost'] = totalCost;
  itemForm['totalCost'] = totalCost;
  itemForm['gstCost'] = gstCost;

  if (!selectedVendor) {
    showErrorPopupFadeInDown('Please select a vendor');
    return;
  }

  if (!selectedProject) {
    showErrorPopupFadeInDown('Please select a project');
    return;
  }



  if (!items.length) {
    showErrorPopupFadeInDown('Please add at least one item');
    return;
  }

  // Vendor section
  setText('vendorNameDisplay', selectedVendor.VendorName);
  setText('vendorAddressDisplay', selectedVendor.Address);
  setText('vendorPhoneDisplay', selectedVendor.Phone);
  setText('vendorMailDisplay', selectedVendor.Email);
  setText('vendorGSTDisplay', selectedVendor.GSTNo);
  setText('vendorPANDisplay', selectedVendor.PANNo);
  setText('vendorAccountDisplay', selectedVendor.AccountNo);
  setText('vendorIFSCDisplay', selectedVendor.IFSCode);
  setText('vendorBankDisplay', selectedVendor.BankName);
  setText('vendorBankAddressDisplay', selectedVendor.Branch);

  // Commercial
  setText('extraGSTDisplay', commercialForm['extraGST']);
  setText('priceDisplay', commercialForm['price']);
  setText('paymentDisplay', commercialForm['payment']);
  setText('deliveryPlaceDisplay', commercialForm['deliveryPlace']);
  setText('deliveryDisplay', commercialForm['delivery']);
  setText('otherTermsDisplay', commercialForm['otherTerms']);

  // Project
  setText('projectNumberDisplay', projectForm['project']);
  setText('subProjectNumberDisplay', projectForm['subProject']);
  setText('remarksDisplay', projectForm['remarks']);
  setText('departmentDisplay', projectForm['department']);
  setText('projectInvestigatorDisplay', selectedProject.ProjectIncharge);

  // Indent
  setText('modeOfPurchaseDisplay', indentForm['indentMode']);
  setText('purposeDisplay', indentForm['indentPurpose']);
  setText('typeOfIndentDisplay', itemDetailsForm['indentType']);
  setText('isQuotationAvailableDisplay', itemDetailsForm['isQuotationAvailable']);

  // Cost Preview
  setText('costDisplay', `₹${(totalCost - gstCost).toFixed(2)}`);
  setText('gstDisplay', `₹${gstCost.toFixed(2)}`);
  setText('totalCostDisplay', `₹${totalCost.toFixed(2)}`);

  // Items table
  document.getElementById('itemsPreviewTableBody').innerHTML = '';
  items.forEach((item) => {
    document.getElementById('itemsPreviewTableBody').innerHTML += `
      <tr>
        <td>${item.productName}</td>
        <td>${item.name}</td>
        <td>${item.desc}</td>
        <td>${item.classification}</td>
        <td>${item.qty}</td>
        <td>${item.unit}</td>
        <td>${item.price}</td>
        <td>${item.estTotalPrice}</td>
        <td>${item.remarks}</td>
      </tr>
    `;
  });

  document.getElementById('fullscreenItemModal2').dataset.IndentID = globalIndentID;
  document.getElementById('fullscreenItemModal2').dataset.action = 'update';

  const previewModal = new bootstrap.Modal(document.getElementById('fullscreenItemModal2'));
  previewModal.show();
}

async function showUpdatePreviewModal() {
  alert('triggered');

  const vendorForm = formDataToObject(new FormData(document.querySelector('#vendorForm')));
  const itemDetailsForm = formDataToObject(new FormData(document.querySelector('#itemDetailsForm')));
  const itemForm = formDataToObject(new FormData(document.querySelector('#itemForm')));
  const commercialForm = formDataToObject(new FormData(document.querySelector('#commercialForm')));
  const projectForm = formDataToObject(new FormData(document.querySelector('#projectForm')));
  const indentForm = formDataToObject(new FormData(document.querySelector('#indentForm')));

  if (items) {
    itemForm['items'] = items;
  } else {
    itemForm['items'] = updates.items;
  }

  let totalCost = 0;
  items.forEach(item => {
    item.estTotalPrice = item.qty * item.price; // Update per item
    totalCost += item.estTotalPrice;
  });

  const gstCost = (totalCost * parseFloat(commercialForm.extraGST || 0)) / 100;
  totalCost += gstCost;

  itemForm.cost = totalCost;
  itemForm.totalCost = totalCost;
  itemForm.gstCost = gstCost;


  if (!selectedVendor) {
    selectedVendor = {
      VendorID: updates.VendorID,
      VendorName: updates.VendorName,
      Address: updates.VendorAddress,
      Phone: updates.VendorPhone,
      Email: updates.VendorEmail,
      GSTNo: updates.VendorGSTNO,
      PANNo: updates.VendorPANNO,
      AccountNo: updates.VendorAccountNumber,
      IFSCode: updates.VendorIFSC,
      BankName: updates.VendorBankName,
      Branch: updates.VendorBankBranch,
    }
  }

  if (!selectedProject) {
    selectedProject = {
      ProjectID: updates.ProjectNo,
      ProjectName: updates.ProjectName,
      SubProjectNo: updates.SubProjectNo,
      ProjectIncharge: updates.ProjectIncharge,
      ProjectRemarks: updates.ProjectRemarks,
    }
  } else {
    selectedProject = {
      ProjectID: selectedProject.ProjectID,
      ProjectName: selectedProject.ProjectName,
      SubProjectNo: projectForm.subProject,
      ProjectIncharge: selectedProject.ProjectIncharge,
      ProjectRemarks: projectForm.remarks,
    }
  }
  console.log({ projectForm })

  // Prepare final object for PUT request
  let updatedIndent = {
    vendorData: selectedVendor,
    ...itemDetailsForm,
    ...itemForm,
    ...commercialForm,
    projectData: selectedProject,
    ...indentForm,
    items: itemForm.items,
    totalCost: itemForm.totalCost,
    gstCost: itemForm.gstCost,
  };

  updateIndentData = updatedIndent;

  console.log("🚀 Final data to send via PUT:", updatedIndent);
  document.getElementById('fullscreenItemModal2').dataset.IndentID = globalIndentID;
  document.getElementById('fullscreenItemModal2').dataset.action = 'update';
  // Now show the modal
  renderPreviewDisplay(updatedIndent);
  new bootstrap.Modal(document.getElementById('fullscreenItemModal2')).show();
}



async function updateIndent(updatedIndent) {
  const indentID = globalIndentID;
  const url = `/indents/${indentID}`;

  try {

    const response = await axiosInstance.put(url, updatedIndent);


    if (response.status >= 200 && response.status < 300) {
      console.log("Indent updated successfully:", response.data);
      alert("Indent updated successfully!");
    } else {
      console.error("Error updating indent:", response.data);
      alert("Failed to update indent!");
    }
  } catch (error) {
    console.error("Error occurred while updating indent:", error);
    alert("An error occurred while updating indent!");
  }
}



function renderPreviewDisplay(data) {
  console.log({ data });
  setText('vendorNameDisplay', data.vendorData.VendorName);
  setText('vendorAddressDisplay', data.vendorData.Address);
  setText('vendorPhoneDisplay', data.vendorData.Phone);
  setText('vendorMailDisplay', data.vendorData.Email);
  setText('vendorGSTDisplay', data.vendorData.GSTNo);
  setText('vendorPANDisplay', data.vendorData.PANNo);
  setText('vendorAccountDisplay', data.vendorData.AccountNo);
  setText('vendorIFSCDisplay', data.vendorData.IFSCode);
  setText('vendorBankDisplay', data.vendorData.BankName);
  setText('vendorBankAddressDisplay', data.vendorData.Address);

  setText('extraGSTDisplay', data.extraGST);
  setText('priceDisplay', data.price);
  setText('paymentDisplay', data.payment);
  setText('deliveryPlaceDisplay', data.deliveryPlace);
  setText('deliveryDisplay', data.delivery);
  setText('otherTermsDisplay', data.otherTerms);
  setText('currencyDisplay', data.Currency);



  setText('projectNumberDisplay', data.projectData.ProjectID);
  setText('subProjectNumberDisplay', data.projectData.SubProjectNo);
  setText('remarksDisplay', data.projectData.ProjectRemarks);
  // setText('departmentDisplay', data.projectData.ProjectRemarks); 
  setText('projectInvestigatorDisplay', data.projectData.ProjectIncharge);

  setText('modeOfPurchaseDisplay', data.indentMode);
  setText('purposeDisplay', data.indentPurpose);
  setText('typeOfIndentDisplay', data.indentType);
  setText('isQuotationAvailableDisplay', data.isQuotationAvailable);

  setText('CostDisplay', `₹${(data.totalCost - data.gstCost).toFixed(2)}`);
  setText('gstDisplay', `₹${data.gstCost.toFixed(2)}`);
  setText('totalCostDisplay', `₹${data.totalCost.toFixed(2)}`);

  const tbody = document.getElementById('itemsPreviewTableBody');
  tbody.innerHTML = '';
  data.items.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.productName}</td>
        <td>${item.name}</td>
        <td>${item.desc}</td>
        <td>${item.classification}</td>
        <td>${item.qty}</td>
        <td>${item.unit}</td>
        <td>${item.price}</td>
        <td>${item.estTotalPrice}</td>
        <td>${item.remarks}</td>
      </tr>
    `;
  });
}

async function createIndent() {
  const vendorFormData = formDataToObject(new FormData(document.querySelector('#vendorForm')));
  const itemDetailsForm = formDataToObject(new FormData(document.querySelector('#itemDetailsForm')));
  const itemForm = formDataToObject(new FormData(document.querySelector('#itemForm')));
  const commercialForm = formDataToObject(new FormData(document.querySelector('#commercialForm')));
  const projectForm = formDataToObject(new FormData(document.querySelector('#projectForm')));
  const indentForm = formDataToObject(new FormData(document.querySelector('#indentForm')));

  // Add items to the form data
  itemForm['items'] = items;

  // Prepare final form data to be sent
  const finalFormData = new FormData();
  finalFormData.append('vendorDetails', JSON.stringify(vendorFormData));
  finalFormData.append('itemDetails', JSON.stringify(itemDetailsForm));
  finalFormData.append('items', JSON.stringify(itemForm['items']));
  finalFormData.append('commercialDetails', JSON.stringify(commercialForm));
  finalFormData.append('projectDetails', JSON.stringify(projectForm));

  const indentFormObj = { ...indentForm };
  delete indentFormObj.supportDoc;  // Remove supportDoc from indent form
  finalFormData.append('indentDetails', JSON.stringify(indentFormObj));

  finalFormData.append('selectedProject', selectedProject.ProjectID);
  finalFormData.append('selectedVendor', selectedVendor.VendorID);

  // Attach the support document if available
  const fileInput = document.querySelector('#supportDoc3');
  if (fileInput.files.length > 0) {
    finalFormData.append('supportDoc', fileInput.files[0]);
  }

  try {

    const res = await axiosInstance.post('/indents', finalFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Indent submitted:', res.data.message);
    showPopupFadeInDown('Indent created successfully');
  } catch (err) {
    if (err.response) {
      console.error('❌ Server error:', err.response.data.message);
      showErrorPopupFadeInDown(err.response.data.message);
    } else {
      console.error('❌ Network/other error:', err.message);
      showErrorPopupFadeInDown('Network error. Please try again.');
    }
  }

  console.log({ updates });
}


// document.getElementById('submitIndentBtn').addEventListener('click', async () => {
//   const action = document.getElementById('projectIndentModal').dataset.action;


//   try {
//     if (action === 'update') {
//       // alert('update');
//       await updateIndent(updateIndentData)
//       showPopupFadeInDown("Indent Updated Successfully");
//     } else {
//       // alert('create');
//       await createIndent();
//       showPopupFadeInDown("Indent Created Successfully");
//     }

//     // window.location.reload(); // Refresh after action done
//     location.reload();

//   } catch (err) {
//     console.error("Failed to process indent:", err);
//     showPopupFadeInDown("Something went wrong");
//   }
// });


// function downloadPreview() {

// const html = document.getElementById('receiptcontent').innerHTML;
//   const html = `
//                   <div style="padding: 40px;" id="receiptcontent">
// <!-- Data Grid Layout -->
// <div style="font-size: 10px; display: flex;">

//  <!-- Left Column - Key Information -->
//  <div style="width: 33.33%; border-right: 1px solid #dee2e6; padding: 16px; background-color: #f8f9fa;">

//   <!-- Vendor Block -->
//   <div style="margin-bottom: 16px;">
//     <h2 style="display: flex; align-items: center; text-transform: uppercase; color: blue; font-size: 10px; margin-bottom: 12px; font-weight: 100;">
//       <span style="background-color: #0d6efd; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">1</span>
//       Vendor Details
//     </h2>
//     <div style="padding-left: 16px;">
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor:</span>
//         <span style="font-weight: 500;">ABC Industrial</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor Address:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor Phone NO.:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor Mail ID.:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor GST NO.:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Vendor PAN NO.:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Account NO.:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">IFSC Code:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Bank Name:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Bank Address:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//     </div>
//   </div>

//   <div style="margin-bottom: 16px;">
//     <h2 style="display: flex; align-items: center; text-transform: uppercase; color: blue; font-size: 10px; margin-bottom: 12px; font-weight: 100;">
//       <span style="background-color: rgba(13, 110, 253, 0.1); color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">2</span>
//       Commercial Specification
//     </h2>
//     <div style="padding-left: 16px;">
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Extra GST:</span>
//         <span style="font-weight: 500;">18%</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Price:</span>
//         <span style="font-weight: 500;">0</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Payment:</span>
//         <span style="font-weight: 500;">18</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Delivery Place:</span>
//         <span style="font-weight: 500;">Place</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Delivery:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Type of Currency:</span>
//         <span style="font-weight: 500;">INR</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Other Terms:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//     </div>
//   </div>

//   <!-- Project Details -->
//   <div>
//     <h2 style="display: flex; align-items: center; text-transform: uppercase; color: blue; font-size: 10px; margin-bottom: 12px; font-weight: 100;">
//       <span style="background-color: rgba(13, 110, 253, 0.1); color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">3</span>
//       Project Details
//     </h2>
//     <div style="padding-left: 16px;">
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Project Number:</span>
//         <span style="font-weight: 500;">PRJ - 0001</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Sub Project Number:</span>
//         <span style="font-weight: 500;">SUB-PRJ-001</span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Remarks:</span>
//         <span style="font-weight: 500; color: #198754;"></span>
//       </p>
//     </div>
//   </div>
//   <!-- Indent Details -->
//   <div>
//     <h2 style="display: flex; align-items: center; text-transform: uppercase; color: black; font-size: 10px; margin-bottom: 12px; color: blue; font-weight: 100;">
//       <span style="background-color: rgba(13, 110, 253, 0.1); color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">4</span>
//       Indent Details
//     </h2>
//     <div style="padding-left: 16px;">
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Mode of Purchase:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//       <p style="display: flex; margin-bottom: 8px;">
//         <span style="color: black; width: 40%;">Purpose:</span>
//         <span style="font-weight: 500;"></span>
//       </p>
//     </div>
//   </div>
// </div>

// <!-- Right Column - Line Items -->
// <div style="width: 66.67%; padding: 16px;">
//   <h2 style="display: flex; align-items: center; text-transform: uppercase; color: black; font-size: 10px; margin-bottom: 12px; color: blue; font-weight: 100;">
//     <span style="background-color: rgba(13, 110, 253, 0.1); color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">5</span>
//     Item Details
//   </h2>
//   <div style="display: flex; flex-wrap: wrap; margin-bottom: 16px;">
//     <p style="display: flex; margin-bottom: 8px; width: 41.66%;">
//       <span style="color: black; width: 40%;">Type of Indent:</span>
//       <span style="font-weight: 500;"></span>
//     </p>
//     <p style="display: flex; margin-bottom: 8px; width: 58.33%;">
//       <span style="color: black; width: 40%;">Is Quotation Available ?:</span>
//       <span style="font-weight: 500; color: #198754;">yes</span>
//     </p>
//   </div>
//   <!-- Items Table -->
//   <div style="overflow-x: auto;">
//     <table style="width: 100%; border-collapse: collapse; vertical-align: middle;" id="itemsPreviewTable">
//       <thead style="background-color: #0d6efd; color: white;">
//         <tr style="border-bottom: 1px solid #dee2e6; font-size: 10px; text-transform: uppercase;">
//           <th style="border: 1px solid black; text-align: left; padding-left: 0;">Product Name</th>
//           <th style="border: 1px solid black;">Item Name</th>
//           <th style="border: 1px solid black; text-align: right;">Description</th>
//           <th style="border: 1px solid black; text-align: right;">Item Classification</th>
//           <th style="border: 1px solid black; text-align: right; padding-right: 0;">Quantity</th>
//           <th style="border: 1px solid black; text-align: right; padding-right: 0;">Unit</th>
//           <th style="border: 1px solid black; text-align: right; padding-right: 0;">Estimated Unit Price</th>
//           <th style="border: 1px solid black; text-align: right; padding-right: 0;">Estimated Total Price</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td style="border: 1px solid black;">Product 1</td>
//           <td style="border: 1px solid black;">Item 1</td>
//           <td style="border: 1px solid black;">Description</td>
//           <td style="border: 1px solid black;">Classification</td>
//           <td style="border: 1px solid black;">Quantity</td>
//           <td style="border: 1px solid black;">Unit</td>
//           <td style="border: 1px solid black;">1</td>
//           <td style="border: 1px solid black;">2</td>
//         </tr>
//         <tr>
//           <td style="border: 1px solid black;">Product 2</td>
//           <td style="border: 1px solid black;">Item 2</td>
//           <td style="border: 1px solid black;">Description</td>
//           <td style="border: 1px solid black;">Classification</td>
//           <td style="border: 1px solid black;">Quantity</td>
//           <td style="border: 1px solid black;">Unit</td>
//           <td style="border: 1px solid black;">1</td>
//           <td style="border: 1px solid black;">2</td>
//         </tr>
//         <tr>
//           <td style="border: 1px solid black;">Product 3</td>
//           <td style="border: 1px solid black;">Item 3</td>
//           <td style="border: 1px solid black;">Description</td>
//           <td style="border: 1px solid black;">Classification</td>
//           <td style="border: 1px solid black;">Quantity</td>
//           <td style="border: 1px solid black;">Unit</td>
//           <td style="border: 1px solid black;">1</td>
//           <td style="border: 1px solid black;">2</td>
//         </tr>
//         <tr>
//           <td style="border: 1px solid black;">Product 4</td>
//           <td style="border: 1px solid black;">Item 4</td>
//           <td style="border: 1px solid black;">Description</td>
//           <td style="border: 1px solid black;">Classification</td>
//           <td style="border: 1px solid black;">Quantity</td>
//           <td style="border: 1px solid black;">Unit</td>
//           <td style="border: 1px solid black;">1</td>
//           <td style="border: 1px solid black;">2</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

//   <!-- Summary -->
//   <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #dee2e6;">
//     <div style="display: flex; flex-wrap: wrap; justify-content: flex-end;">
//       <div style="width: 50%;">
//         <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
//           <span style="color: black;">Cost:</span>
//           <span style="font-weight: 500;">₹3,08,050</span>
//         </div>
//         <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
//           <span style="color: black;">GST (18%):</span>
//           <span style="font-weight: 500;">₹55,449</span>
//         </div>
//         <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 12px;">
//           <span style="color: black;">Total Cost:</span>
//           <span style="font-weight: bold; color: #0d6efd;">₹3,63,499</span>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
// </div>
// </div>

//       `;
//   const converted = htmlToPdfmake(html);
//   const docDefinition = {
//     pageOrientation: 'landscape',
//     pageSize: 'A4',
//     content: converted,
//   };
//   pdfMake.createPdf(docDefinition).download('document.pdf');
// }


function generatePDF() {
  const content = document.getElementById("receiptcontent");
  // content.style.fontSize='10px';
  const pdfContent = htmlToPdfmake(content.innerHTML);


  pdfMake.createPdf(docDefinition).download("bootstrap-styled.pdf");
}

function setText(fieldId, text) {
  document.getElementById(fieldId).textContent = text;
}


function checkBudget() {
  const projectSelect = document.getElementById('projectSelect');
  const selectedOption = projectSelect.options[projectSelect.selectedIndex];
  const container = document.getElementById('budgetStatusContainer');

  if (!selectedOption.value) {
    container.classList.add('d-none');
    return;
  }


  const totalBudget = parseFloat(selectedOption.dataset.budget);
  const usedBudget = parseFloat(selectedOption.dataset.used);
  const available = totalBudget - usedBudget;
  const indentValue = 150000;

  document.getElementById('indentValue').textContent = `₹${indentValue.toLocaleString()}`;
  document.getElementById('availableBalance').textContent = `₹${available.toLocaleString()}`;

  const statusBadge = document.getElementById('statusBadge');
  const overBudgetFields = document.getElementById('overBudgetFields');

  if (indentValue <= available) {
    statusBadge.innerHTML = `<span class="badge bg-success px-3 py-2">Available</span>`;
    overBudgetFields.classList.add('d-none');
  } else {
    statusBadge.innerHTML = `<span class="badge bg-danger px-3 py-2">Insufficient</span>`;
    document.getElementById('deficitAmount').textContent =
      `₹${(indentValue - available).toLocaleString()}`;
    overBudgetFields.classList.remove('d-none');
  }

  container.classList.remove('d-none');
}




let rejectionDate = document.querySelector('#rejectionDate');
let rejectionReason = document.querySelector('#rejectionReason');
let approvalDate = document.querySelector('#approvalDate');



rejectionDate.addEventListener('change', (event) => {

  if (event.target.value !== '') {
    document.querySelectorAll('.rejection-span').forEach(sp => {
      sp.classList.remove('d-none');
    });

    document.querySelectorAll('.approval-span').forEach(aspan => {
      aspan.classList.add('d-none');
    });

    approvalDate.value = '';
  }
});

rejectionReason.addEventListener('input', (event) => {

  if (event.target.value !== '') {
    document.querySelectorAll('.rejection-span').forEach(sp => {
      sp.classList.remove('d-none');
    });

    document.querySelectorAll('.approval-span').forEach(aspan => {
      aspan.classList.add('d-none');
    });
  }

  approvalDate.value = '';
});

approvalDate.addEventListener('change', (event) => {


  document.querySelectorAll('.rejection-span').forEach(sp => {
    sp.classList.add('d-none');
  });

  document.querySelectorAll('.approval-span').forEach(aspan => {
    aspan.classList.remove('d-none');
  });

  rejectionDate.value = '';
  rejectionReason.value = '';

});

let lpcSubmitButton = document.querySelector('#lpcSubmitBtn');

lpcSubmitButton.addEventListener('click', async (event) => {
  event.preventDefault();

  let DocumentsProcessedDate = document.querySelector('#documentsProcessedDate').value;
  let DocumentsDispatchedDate = document.querySelector('#documentsDispatchedDate').value;
  let DocumentsReceivedDate = document.querySelector('#documentsReceivedDate').value;
  let CompletionDate = document.querySelector('#LPCCompletionDate').value;
  let file = document.querySelector('#supportDoc1').files[0];

  if (!DocumentsProcessedDate || !DocumentsDispatchedDate || !DocumentsReceivedDate || !CompletionDate) {
    showErrorPopupFadeInDown('Please fill all the required fields');
    return;
  }

  let IndentId = globalIndentID;

  if (!IndentId) {
    showErrorPopupFadeInDown('Indent ID not found');
    return;
  }

  const formData = new FormData();
  formData.append('DocumentsProcessedDate', DocumentsProcessedDate);
  formData.append('DocumentsDispatchedDate', DocumentsDispatchedDate);
  formData.append('DocumentsReceivedDate', DocumentsReceivedDate);
  formData.append('CompletionDate', CompletionDate);
  if (file) {
    formData.append('file', file);
  }

  try {
    let response = await axiosInstance.post(`/lpc/${IndentId}`, formData);

    console.log('LPC Submit Response:', response);

    if (response.status === 200) {
      showPopupFadeInDown('LPC submitted successfully');
      setTimeout(() => {
        window.reload();
      }, 2000);
    } else {
      showErrorPopupFadeInDown('LPC submission failed');
    }

  } catch (error) {
    console.error("LPC Submit Error:", error);
    showErrorPopupFadeInDown("Network error. Please try again.");
  }

  location.reload();

});


let revertBtn = document.querySelector('#revertBtn');
let rejectBtn = document.querySelector('#indentRejectBtn');
let approveBtn = document.querySelector('#indentAapproveBtn');

async function handleApproveIndent(event) {
  event.preventDefault();

  let IndentId = globalIndentID;

  if (!IndentId) {
    showErrorPopupFadeInDown('Indent ID not found');
    return;
  }

  let approvalRemarks = document.querySelector('#approvalRemarks').value;
  let file = document.querySelector('#supportDoc').files[0];

  if (!approvalRemarks) {
    showErrorPopupFadeInDown('Please Enter Remarks');
    return;
  }

  let formData = new FormData();
  formData.append('Remarks', approvalRemarks);

  if (file) {
    formData.append('file', file);
  }

  if (event.target === approveBtn) {
    formData.append('Status', 'Approved');
  } else if (event.target === rejectBtn) {
    formData.append('Status', 'Rejected');
  } else if (event.target === revertBtn) {
    formData.append('Status', 'Reverted');
  }

  try {
    let response = await axiosInstance.post(`/indentApproval/${IndentId}`, formData);

    console.log('Indent Approval Response:', response);
    if (response.status === 200 || response.status === 201) {
      showPopupFadeInDown('Indent status updated successfully');
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else {
      showErrorPopupFadeInDown('Indent status update failed');
    }
  } catch (error) {
    console.error("Indent Approval Error:", error);
    showErrorPopupFadeInDown("Network error. Please try again.");
  }
}


rejectBtn.addEventListener('click', handleApproveIndent);
approveBtn.addEventListener('click', handleApproveIndent);
revertBtn.addEventListener('click', handleApproveIndent);

function getText(id) {
  return document.getElementById(id).value;
}
let poApprovalUpdates = [];

function listenUpdates(id) {




  document.getElementById(id).addEventListener('input', (event) => {
    const existingIndex = poApprovalUpdates.findIndex(item => item.field === id);

    if (existingIndex !== -1) {

      poApprovalUpdates[existingIndex].value = event.target.value;
    } else {

      poApprovalUpdates.push({ field: id, value: event.target.value });
    }
  });
}

  //----------------------------------------------//
 //               LISTEN FOR UPDATES             //
//----------------------------------------------//

listenUpdates('updateExtraGst');
listenUpdates('updateCurrencySelect');
listenUpdates('updatePayment');
listenUpdates('updateDeliveryPlace');
listenUpdates('updateDelivery');
listenUpdates('updatePrice');

let poApprovalData = {};

function openPoPreviewModal() {



  setText('PreviewtypeOfOrder', getText('typeOfOrder'));
  setText('previewpoApprovalCategorySelect', getText('poApprovalCategorySelect'));

  setText('PreviewPOreferenceNo', getText('POreferenceNo'));
  setText('PreviewPOreferenceDate', getText('POreferenceDate'));
  setText('PreviewNameOfWork', getText('NameOfWork'));
  setText('PreviewupdateExtraGst', getText('updateExtraGst'));
  setText('PreviewupdateCurrencySelect', getText('updateCurrencySelect'));
  setText('PreiviewupdatePayment', getText('updatePayment'));
  setText('PreviewupdateDeliveryPlace', getText('updateDeliveryPlace'));
  setText('previewupdateDelivery', getText('updateDelivery'));
  setText('previewupdatePrice', getText('updatePrice'));

  poApprovalData['TypeOfOrder'] = getText('typeOfOrder');
  poApprovalData['Category'] = getText('poApprovalCategorySelect');
  poApprovalData['ReferenceNo'] = getText('POreferenceNo');
  poApprovalData['ReferenceDate'] = getText('POreferenceDate');
  poApprovalData['NameOfWork'] = getText('NameOfWork');


  const modal = new bootstrap.Modal(document.getElementById('popreviewModal'));
  modal.show();
}


document.querySelector('#POApprovalSubmitBtn').addEventListener('click', async () => {


  let updates = poApprovalUpdates.reduce((acc, item) => {
    acc[item.field] = item.value;
    return acc;
  }, {});

  Object.keys(updates).forEach(field => {
    if (field === 'updateExtraGst') {
      updates['ExtraGST'] = updates[field];
      delete updates[field];
    }
    if (field === 'updateCurrencySelect') {
      updates['Currency'] = updates[field];
      delete updates[field];
    }
    if (field === 'updatePayment') {
      updates['Payment'] = updates[field];
      delete updates[field];
    }
    if (field === 'updateDeliveryPlace') {
      updates['DeliveryPlace'] = updates[field];
      delete updates[field];
    }
    if (field === 'updateDelivery') {
      updates['Delivery'] = updates[field];
      delete updates[field];
    }
    if (field === 'updatePrice') {
      updates['Price'] = updates[field];
      delete updates[field];
    }
  });


  // console.log({poApprovalData});



  if (!poApprovalData['TypeOfOrder']) {
    showErrorPopupFadeInDown('Please select the type of order');
    return;
  }
  if (!poApprovalData['Category']) {
    showErrorPopupFadeInDown('Please select the category');
    return;
  }

  if (!poApprovalData['ReferenceNo']) {
    showErrorPopupFadeInDown('Please enter the reference number');
    return;
  }

  if (!poApprovalData['ReferenceDate']) {
    showErrorPopupFadeInDown('Please enter the reference date');
    return;
  }
  if (!poApprovalData['NameOfWork']) {
    showErrorPopupFadeInDown('Please enter the name of work');
    return;
  }

  // console.log('PO Approval Data:', poApprovalData);
  // return;


  poApprovalData['updates'] = updates;

  try {
    let response = await axiosInstance.post(`/poApproval/${globalIndentID}`, poApprovalData);
    console.log('PO Approval Response:', response);

    if (response.status === 200 || response.status === 201) {
      showPopupFadeInDown('PO Approval updated successfully');
      setTimeout(() => {
        location.reload();
      }, 1000);

    } else {
      showErrorPopupFadeInDown('PO Approval update failed');
    }
  } catch (err) {
    console.log(err);
    if (err.response) {
      console.error('Server error:', err.response.data.message);
      showErrorPopupFadeInDown(err.response.data.message);
    } else {
      console.error('Network/other error:', err.message);
      showErrorPopupFadeInDown('Network error. Please try again.');
    }
  }

  const modal = new bootstrap.Modal(document.getElementById('popreviewModal'));
  modal.hide();
});

let poGenSubmitBtn = document.querySelector('#poGenSubmitBtn');

poGenSubmitBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  let IndentId = globalIndentID;

  if (!IndentId) {
    showErrorPopupFadeInDown('Indent ID not found');
    return;
  }

  let SignedPoMailedDate = document.querySelector('#signedPoMailedDate').value;
  let file = document.querySelector('#signedPO').files[0];

  if (!SignedPoMailedDate) {
    showErrorPopupFadeInDown('Please Enter Date');
    return;
  }

  if (!file) {
    showErrorPopupFadeInDown('Please Upload Signed PO');
    return;
  }

  if (!file.name.endsWith('.pdf')) {
    showErrorPopupFadeInDown('Please Upload Signed PO in PDF format');
    return;
  }

  let formData = new FormData();
  formData.append('SignedPOMailedDate', SignedPoMailedDate);

  if (file) {
    formData.append('file', file);
  }

  try {
    let response = await axiosInstance.post(`/poGenerated/${IndentId}`, formData);

    console.log('PO Generation Response:', response);
    if (response.status === 200 || response.status === 201) {
      showPopupFadeInDown('Success!');
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else {
      showErrorPopupFadeInDown('PO generation failed');
    }
  } catch (error) {
    console.error("PO Generation Error:", error);
    showErrorPopupFadeInDown("Network error. Please try again.");
  }
});


function updateGrandTotal() {
  let total = typeof subTotal !== "undefined" ? subTotal : 0;
  total = isNaN(total) ? 0 : total;

  let discountPercentage = parseFloat(document.querySelector('#srbDiscount').value) || 0;

  if (discountPercentage < 0 || discountPercentage > 100) {
    showErrorPopupFadeInDown('Discount percentage must be between 0 and 100');
    discountPercentage = 0;
    document.querySelector('#srbDiscount').value = '';
  }

  let discountAmount = total * discountPercentage / 100;
  document.querySelector('#srbDeductedAmount').value = discountAmount.toFixed(2);

  let gstAmount = parseFloat(document.querySelector('#srbGSTAmount').value) || 0;

  if (gstAmount < 0) {
    showErrorPopupFadeInDown('GST amount cannot be negative');
    gstAmount = 0;
    document.querySelector('#srbGSTAmount').value = '0';
  }

  let otherCharges = parseFloat(document.querySelector('#srbotherCharges').value) || 0;

  if (otherCharges < 0) {
    showErrorPopupFadeInDown('Other charges cannot be negative');
    otherCharges = 0;
    document.querySelector('#srbotherCharges').value = '0';
  }

  let grandTotal = total - discountAmount + gstAmount + otherCharges;
  document.querySelector('#srbGrandTotal').value = grandTotal.toFixed(2);
}

document.querySelector('#srbDiscount').addEventListener('input', updateGrandTotal);
document.querySelector('#srbGSTAmount').addEventListener('input', updateGrandTotal);
document.querySelector('#srbotherCharges').addEventListener('input', updateGrandTotal);


async function submitSRBForm() {

  const srbFor = document.getElementById('srbFor').value;
  const srbSerialNo = document.getElementById('srbSerialNo').value;
  const srbType = document.getElementById('srbTypeSelect').value;
  const srbPONumber = document.getElementById('srbPONumber').value;
  const srbPODate = document.getElementById('srbPODate').value;
  const srbEmployeeName = document.getElementById('srbEmployeeName').value;
  const srbDiscount = parseFloat(document.getElementById('srbDiscount').value) || 0;
  const srbDeductedAmount = parseFloat(document.getElementById('srbDeductedAmount').value) || 0;
  const srbInvoiceNumber = document.getElementById('srbInvoiceNumber').value;
  const srbInvoiceDate = document.getElementById('srbInvoiceDate').value;
  const srbWarranty = document.getElementById('srbWarranty').value;
  const srbOthers = document.getElementById('srbothers').value;
  const srbGSTAmount = parseFloat(document.getElementById('srbGSTAmount').value) || 0;
  const srbOtherCharges = parseFloat(document.getElementById('srbotherCharges').value) || 0;
  const srbGrandTotal = parseFloat(document.getElementById('srbGrandTotal').value) || 0;
  const fileInput = document.getElementById('srbDocument');
  const file = fileInput.files[0];

  if (!srbPONumber || !srbEmployeeName || !srbInvoiceNumber || !srbInvoiceDate || !srbWarranty || !srbOthers || !file) {
    showErrorPopupFadeInDown("Please fill in all required fields and upload a file.");
    return;
  }

  let printData = {
    items: srbItems,
    // totalAmount:document.getElementById('srbTotalAmount').value,
    itemsTotal: document.getElementById('srbSubTotal').value,
    srbFor: srbFor,
    projectNo: document.getElementById('srbProjectNumber').value,
    subProjectNo: document.getElementById('srbSubProjectNumber').value,
    vendorName: document.getElementById('srbVendorName').value,
    srbSerialNo: srbSerialNo,
    srbType: srbType,
    srbPONumber: srbPONumber,
    srbPODate: srbPODate,
    srbEmployeeName: srbEmployeeName,
    srbDiscount: srbDiscount,
    srbDeductedAmount: srbDeductedAmount,
    srbInvoiceNumber: srbInvoiceNumber,
    srbInvoiceDate: srbInvoiceDate,
    srbWarranty: srbWarranty,
    srbOtherCharges: srbOtherCharges,
    srbGSTAmount: srbGSTAmount,
    srbGrandTotal: srbGrandTotal,
    srbOthers: srbOthers,
  }
  const formData = new FormData();
  formData.append('SRBFor', 'Project Purchase');
  formData.append('SerialNo', srbSerialNo);
  formData.append('Type', srbType);
  formData.append('PONumber', srbPONumber);
  formData.append('PODate', srbPODate);
  formData.append('EmpName', srbEmployeeName);
  formData.append('Discount', srbDiscount);
  formData.append('DeductedAmount', srbDeductedAmount);
  formData.append('InvoiceNo', srbInvoiceNumber);
  formData.append('InvoiceDate', srbInvoiceDate);
  formData.append('Warranty', srbWarranty);
  formData.append('OtherCharges', srbOtherCharges);
  formData.append('GSTAmount', srbGSTAmount);
  formData.append('GrandTotal', srbGrandTotal);
  formData.append('file', file);
  formData.append('Others', srbOthers);


  try {
    let response = await axiosInstance.post(`/srb/${globalIndentID}`, formData);
    console.log('SRB Submit Response:', response);
    if (response.status === 200) {
      showPopupFadeInDown('SRB submitted successfully');

      generateSRB(printData);

      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  } catch (err) {
    console.log(err);
    if (err.response) {
      console.error('Server error:', err.response.data.message);
      console.error('Server error:', err.response.data);
      showErrorPopupFadeInDown(err?.response?.data?.message);
    } else {
      console.error('Network/other error:', err.message);
      showErrorPopupFadeInDown('Network error. Please try again.');
    }
  }

}



// function generateSRBPDF(formData) {
//   const { jsPDF } = window.jspdf;
//   const doc = new jsPDF();

//   // Title
//   doc.setFontSize(18);
//   doc.text('SRB Form Details', 105, 20, { align: 'center' });

//   // Add a line
//   doc.setDrawColor(0);
//   doc.setLineWidth(0.5);
//   doc.line(20, 25, 190, 25);

//   // Set font for content
//   doc.setFontSize(12);

//   // Form data
//   let yPosition = 35;
//   doc.text(`SRB For: ${formData.srbFor}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Serial No: ${formData.srbSerialNo}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Type: ${formData.srbType}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`PO Number: ${formData.srbPONumber}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`PO Date: ${formData.srbPODate}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Employee Name: ${formData.srbEmployeeName}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Discount: ${formData.srbDiscount}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Deducted Amount: ${formData.srbDeductedAmount}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Invoice Number: ${formData.srbInvoiceNumber}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Invoice Date: ${formData.srbInvoiceDate}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Warranty: ${formData.srbWarranty}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Others: ${formData.srbOthers}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`GST Amount: ${formData.srbGSTAmount}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Other Charges: ${formData.srbOtherCharges}`, 20, yPosition);
//   yPosition += 10;
//   doc.text(`Grand Total: ${formData.srbGrandTotal}`, 20, yPosition);

//   // Save the PDF
//   doc.save('SRB_Form_Details.pdf');
// }



const templateHTML = `
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SRB</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 10px;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 15mm;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      text-align: center;
      border-bottom: 2px solid black;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    .header img:nth-of-type(1) {
      height: 90px;
      width: 120px;
    }

    .header img:nth-of-type(2) {
      height: 90px;
      width: 130px;
    }

    .header div {
      text-align: center;
    }

    .header h3 {
      margin: 0;
      font-size: 16px;
    }

    .header p {
      margin: 0;
      margin-top: 10px;
      font-size: 12px;
      font-weight: 500;
    }

    .info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
      margin-top: 25px;
    }

    .info h3 {
      font-size: 14px;
      margin: 0;
    }

    .table-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 50px;
      margin-top: 25px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td {
      padding: 6px;
      font-size: 13px;
    }

    td:first-child {
      font-weight: bold;
    }

    .table-left {
      text-align: left;
      padding: 0;
      width: 100%;
    }

    .table-right {
      text-align: right;
      width: 100%;
      padding: 0;
    }

    #itemsTable th {
      font-size: 13px;
    }

    #itemsTable th,
    #itemsTable td {
      padding: 8px;
      text-align: left;
      border: 1px solid #000000;
      word-wrap: break-word;
    }

    @media print {
      body {
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-BVjk1CBl38SYGw4zxjpqU-cbXmfK1-t73Q&s" alt="Logo 1" />
    <div>
      <h3>STORES RECEIVED BOOK</h3>
      <p>National Technology Centre for Ports Waterways and Costs</p>
    </div>
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJkvW8jxjeRBp344sWaJyfO7mBRvC4SrKtMg&s" alt="Logo 2" />
  </div>

  <div class="info">
    <h3>SRB No.: {{SRB_NO}}</h3>
    <h3>Date: {{DATE}}</h3>
  </div>

  <div class="table-container">
    <div class="table-left">
      <table>
        <tr><td>Project No:</td><td>{{PROJECT_NO}}</td></tr>
        <tr><td>PO No:</td><td>{{PO_NO}}</td></tr>
        <tr><td>Invoice No:</td><td>{{INVOICE_NO}}</td></tr>
        <tr><td>Location:</td><td>{{LOCATION}}</td></tr>
        <tr><td>Sub Project No:</td><td>{{SUB_PROJECT_NO}}</td></tr>
        <tr><td>Supplier Name:</td><td>{{SUPPLIER_NAME}}</td></tr>
      </table>
    </div>
    <div class="table-right">
      <table>
        <tr><td>Purchase/Work Type:</td><td>{{WORK_TYPE}}</td></tr>
        <tr><td>PO Date:</td><td>{{PO_DATE}}</td></tr>
        <tr><td>Invoice Date:</td><td>{{INVOICE_DATE}}</td></tr>
        <tr><td>Employee Name:</td><td>{{EMPLOYEE_NAME}}</td></tr>
      </table>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Item Name</th><th>Description</th><th>Quantity & Units</th><th>Unit Price</th><th>Total Price</th></tr>
    </thead>
    <tbody id="items-list">{{ITEMS}}</tbody>
    <tfoot>
      <tr><th colspan="4">Item Total</th><td>{{ITEM_TOTAL}}</td></tr>
      <tr><th colspan="4">Discount</th><td>{{DISCOUNT}}</td></tr>
      <tr><th colspan="4">Total Amount</th><td>{{TOTAL_AMOUNT}}</td></tr>
      <tr><th colspan="4">Other Charges</th><td>{{OTHER_CHARGES}}</td></tr>
      <tr><th colspan="4">GST Amount</th><td>{{GST}}</td></tr>
      <tr><th colspan="4">Grand Total</th><td>{{GRAND_TOTAL}}</td></tr>
    </tfoot>
  </table>

  <div class="footer">
    Note: This is a system generated SRB.
  </div>
</body>
</html>

  
`;

  //----------------------------------------------//
 //            SRB DOCUMENT GENERATION           //
//----------------------------------------------//

async function generateSRB(data) {
  // Create HTML template with inline styles for better PDF rendering
  console.log({ printData: data });
  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; width: 210mm; min-height: 297mm; padding: 15mm; box-sizing: border-box; margin: 0 auto;">
      <!-- Header Section -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 40px; text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 15px;">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-BVjk1CBl38SYGw4zxjpqU-cbXmfK1-t73Q&s" style="height: 90px; width: 120px; object-fit: contain;" />
        <div>
          <h3 style="margin: 0; font-size: 16px;">STORES RECEIVED BOOK</h3>
          <p style="margin: 0; margin-top: 10px; font-size: 12px; font-weight: 500;">National Technology Centre for Ports Waterways and Costs</p>
        </div>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJkvW8jxjeRBp344sWaJyfO7mBRvC4SrKtMg&s" style="height: 90px; width: 130px; object-fit: contain;" />
      </div>

      <!-- SRB Info -->
      <div style="display: flex; justify-content: space-between; margin: 20px 0;">
        <h3 style="font-size: 14px; margin: 0;">SRB No.: ${data.srbSerialNo}</h3>
        <h3 style="font-size: 14px; margin: 0;">Date: ${new Date(data.date || Date.now()).toLocaleDateString()}</h3>
      </div>

      <!-- Details Tables -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
        <table style="width: 48%; border-collapse: collapse;">
          <tr><td style="padding: 6px; font-weight: bold;">Project No:</td><td style="padding: 6px;">${data.projectNo || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">PO No:</td><td style="padding: 6px;">${data.srbPONumber || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Invoice No:</td><td style="padding: 6px;">${data.srbInvoiceNumber || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Location:</td><td style="padding: 6px;">${data.location || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Sub Project No:</td><td style="padding: 6px;">${data.subProjectNo || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Supplier Name:</td><td style="padding: 6px;">${data.vendorName || ''}</td></tr>
        </table>
        <table style="width: 48%; border-collapse: collapse;">
          <tr><td style="padding: 6px; font-weight: bold;">Purchase/Work Type:</td><td style="padding: 6px;">${data.srbFor || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">PO Date:</td><td style="padding: 6px;">${data.srbPODate || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Invoice Date:</td><td style="padding: 6px;">${data.srbInvoiceDate || ''}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Employee Name:</td><td style="padding: 6px;">${data.srbEmployeeName || ''}</td></tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left; font-weight:600">Item Name</th>
            <th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;font-weight:600">Description</th>
            <th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;font-weight:600">Quantity</th>
            <th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;font-weight:600">Unit Price</th>
            <th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;font-weight:600">Total Price</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td style="padding: 8px; border: 1px solid black; font-size: 13px;">${item.ItemName || ''}</td>
              <td style="padding: 8px; border: 1px solid black; font-size: 13px;">${item.Description || ''}</td>
              <td style="padding: 8px; border: 1px solid black; font-size: 13px;">${item.Quantity || ''}</td>
              <td style="padding: 8px; border: 1px solid black; font-size: 13px;">${item.EstimatedUnitPrice || ''}</td>
              <td style="padding: 8px; border: 1px solid black; font-size: 13px;">${item.EstimatedTotalPrice || ''}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr><th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;" colspan="4">Item Total</th><td style="padding: 8px; border: 1px solid black; font-size: 13px;">${data.itemsTotal || 0}</td></tr>
          <tr><th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;" colspan="4">Discount</th><td style="padding: 8px; border: 1px solid black; font-size: 13px;">${data.srbDiscount || 0}</td></tr>
          <tr><th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;" colspan="4">Other Charges</th><td style="padding: 8px; border: 1px solid black; font-size: 13px;">${data.srbOtherCharges || 0}</td></tr>
          <tr><th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;" colspan="4">GST</th><td style="padding: 8px; border: 1px solid black; font-size: 13px;">${data.srbGSTAmount || 0}</td></tr>
          <tr><th style="padding: 8px; border: 1px solid black;  font-size: 13px; text-align: left;" colspan="4">Grand Total</th><td style="padding: 8px; border: 1px solid black; font-size: 13px;">${data.srbGrandTotal || 0}</td></tr>
        </tfoot>
      </table>

      <!-- Footer Note -->
      <div style="position: absolute; bottom: 20px; font-size: 12px;">
        Note: This is a system generated SRB.
      </div>
    </div>
  `;


  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.innerHTML = htmlContent;
  document.body.appendChild(tempDiv);


  const canvas = await html2canvas(tempDiv, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true
  });


  document.body.removeChild(tempDiv);


  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save('SRB_Document.pdf');
}



document.getElementById('srbSubmitBtn').addEventListener('click', submitSRBForm);


document.querySelector('#poApprovalPreviewBtn').addEventListener('click', openPoPreviewModal);


let icsrSubmissionBtn = document.querySelector('#icsrSubmit');

icsrSubmissionBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  let IndentId = globalIndentID;
  if (!IndentId) {
    showErrorPopupFadeInDown('Indent ID not found');
    return;
  }


  let RejectionDate = document.querySelector('#rejectionDate').value;
  let RejectionRemarks = document.querySelector('#rejectionReason').value;
  let ApprovalDate = document.querySelector('#approvalDate').value;

  if (!RejectionDate && !ApprovalDate) {
    showErrorPopupFadeInDown('Please select Rejection Date or Approval Date');
    return;
  }

  if (RejectionDate && !RejectionRemarks) {
    showErrorPopupFadeInDown('Please Enter Rejection Remarks');
    return;
  }

  try {

    let response = await axiosInstance.post(`/icsr/${IndentId}`, {
      RejectionDate: RejectionDate,
      RejectionRemarks: RejectionRemarks,
      ApprovalDate: ApprovalDate
    });

    console.log('ICS Submission Response:', response);


    if (response.status === 200) {
      showPopupFadeInDown('Submitted successfully');
      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  } catch (err) {
    console.log(err);


    if (err.response) {
      console.error('Server error:', err.response.data.message);
      showErrorPopupFadeInDown(err?.response?.data?.message);
    } else {
      console.error('Network/other error:', err.message);
      showErrorPopupFadeInDown('Network error. Please try again.');
    }
  }
});


document.addEventListener('DOMContentLoaded', async () => {

  roles = await axiosInstance.get('/roles/role/perms');
  roles = roles.data.roles;
  // console.log(roles);
  window.roles = roles;
  handlePermission('#username');




  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = generateSidebar();


    const currentPage = window.location.pathname.split('/').pop();
    // console.log(currentPage);
    const navLinks = document.querySelectorAll('.pcoded-item a');
    // console.log(navLinks[0].getAttribute('href')===currentPage);
    navLinks.forEach(link => {
      // console.log(link.getAttribute('href'));
      if (link.getAttribute('href').includes(currentPage)) {
        link.parentElement.classList.add('active');


        const accordionContent = link.closest('.accordion-content');
        if (accordionContent) {
          accordionContent.style.display = 'block';
          const header = accordionContent.previousElementSibling;
          const icon = header.querySelector('.accordion-icon');
          if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
          }
        }
      }
    });
  }

  // const user=JSON.parse(sessionStorage.getItem('user'));
  // const token=sessionStorage.getItem('token');

  // if(token===null||user===null){
  //     window.location.href="login.html";
  // }

  // if(user.role===2){
  //     window.location.href="user-details.html";
  //     return;
  // }

  // document.getElementById('username').innerText=user.name;






});

function toggleAccordion(button) {
  const content = button.parentElement.nextElementSibling;
  content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";

  const icon = button.querySelector("i");
  icon.classList.toggle("fa-chevron-down");
  icon.classList.toggle("fa-chevron-up");
}




// let stageModuleMapping = {
//     'FUND CHECK': 'Awaitng For Fund Check',
//     'PO APPROVAL': 'Awaiting For PO Approval',
//     'LPC COMPLETED':"Awaiting For LPC Completion",
//     'INDENT APPROVAL':'Awaiting For Indent Approval',
//     'PO GENERATED':'Awaiting For PO Generation',
//     'SRB CREATED':'Awaiting For SRB Creation',
//     'IC & SR SUBMISSION':'Awaiting For IC & SR Submission',
// };

// function hasStageAccess() {
//   const writeModules = categorizedModules.write;  
//   const allElements = document.querySelectorAll('[data-access-module]');


//   for (let element of allElements) {
//     const moduleName = element.getAttribute('data-access-module');


//     if (!writeModules.includes(moduleName)) {
//       return false; 
//     }
//   }


//   return true;
// }

  //----------------------------------------------//
 //               STAGE ACCESS CONTROL           //
//----------------------------------------------//

function hasStageAccess(currentStage) {

  const writeModules = categorizedModules.write;
  // console.log({ writeModules });

  // console.log({ currentStage });


  let stageModuleMapping = {
    'Awaiting For Fund Check': 'FUND CHECK',
    'Awaiting For PO Approval': 'PO APPROVAL',
    'Awaiting For LPC Completion': 'LPC COMPLETED',
    'Awaiting For Indent Approval': 'INDENT APPROVAL',
    'Awaiting For PO Generation': 'PO GENERATED',
    'Awaiting For SRB Creation': 'SRB CREATED',
    'Awaiting For ICSR Submission': 'IC & SR SUBMISSION',
  };

  // console.log(stageModuleMapping[currentStage]);

  const requiredStatus = stageModuleMapping[currentStage];

  // console.log({ requiredStatus });


  if (!requiredStatus) {
    return false;
  }


  if (!writeModules.includes(requiredStatus)) {
    return false;
  }

  return true;
}