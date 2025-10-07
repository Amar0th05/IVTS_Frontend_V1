const reader = new Html5Qrcode("reader");
const assetInfoDiv = document.getElementById("assetInfo");
const detailsDiv = document.getElementById("details");

function showAssetDetails(asset) {
  assetInfoDiv.classList.remove("d-none");
  detailsDiv.innerHTML = `
    <p><strong>Asset ID:</strong> ${asset.Asset_ID}</p>
    <p><strong>Category:</strong> ${asset.Category}</p>
    <p><strong>Model No:</strong> ${asset.Model_No}</p>
    <p><strong>Serial No:</strong> ${asset.Serial_No}</p>
    <p><strong>Processor:</strong> ${asset.Processor_Type}</p>
    <p><strong>RAM:</strong> ${asset.RAM_GB} GB</p>
    <p><strong>Storage:</strong> ${asset.Storage_GB_TB}</p>
    <p><strong>OS:</strong> ${asset.OS_Type}</p>
    <p><strong>User:</strong> ${asset.User_Name}</p>
    <p><strong>Dept:</strong> ${asset.Dept}</p>
    <p><strong>Status:</strong> ${asset.status}</p>
  `;
}

function scanSuccess(decodedText, decodedResult) {
  reader.stop();
  fetch(`/api/asset/${decodedText}`)
    .then(res => {
      if (!res.ok) throw new Error('Asset not found');
      return res.json();
    })
    .then(data => showAssetDetails(data))
    .catch(err => {
      alert(err.message);
      assetInfoDiv.classList.add("d-none");
    });
}

reader.start(
  { facingMode: "environment" }, // Back camera for mobile
  { fps: 10, qrbox: { width: 250, height: 250 } },
  scanSuccess,
  (errorMessage) => {} // Ignore errors
);
