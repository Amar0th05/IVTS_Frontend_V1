function getbaseurl() {
  const { hostname } = location;
  const environments = {
    dev: { host: "localhost", baseUrl: "http://localhost:5500" },
    prod: {
      host: "ntcpwcit.in",
      baseUrl: "https://ntcpwcit.in/worksphere/api",
    },
  };

  for (let env in environments) {
    if (environments[env].host === hostname) {
      return environments[env].baseUrl;
    }
  }

  return "http://localhost:5500";
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const assetId = urlParams.get("assetId");
  if (!assetId) return;

  const baseUrl = getbaseurl();

  try {
    const response = await fetch(`${baseUrl}/assets/details/${assetId}`);
    if (!response.ok) throw new Error("Asset not found");

    const data = await response.json();
    const asset = data.assets;
    const category = asset.category?.toLowerCase();

    // Hide all forms
    ["laptopForm", "desktopForm", "serverForm", "printerForm"].forEach((f) => {
      const el = document.getElementById(f);
      if (el) el.classList.add("hidden");
    });

    // Identify correct form
    let formId = "";
    switch (category) {
      case "laptop":
        formId = "laptopForm";
        break;
      case "desktop & monitor":
        formId = "desktopForm";
        break;
      case "server & storage":
        formId = "serverForm";
        break;
      case "printer & scanner":
        formId = "printerForm";
        break;
      default:
        console.warn("Unknown category:", category);
        return;
    }

    // Show correct form
    const form = document.getElementById(formId);
    if (form) form.classList.remove("hidden");

    // ✅ Field mappings
    const mapping = {
      laptopForm: {
        laptopAssetId: "assetId",
        laptopCategory: "category",
        laptopUser: "userName",
        laptopModel: "modelNo",
        laptopSerial: "serialNo",
        laptopProcessor: "processorType",
        laptopRam: "ramGb",
        laptopStorage: "storage",
        laptopGraphics: "graphics",
        laptopOS: "osType",
        laptopHost: "hostName",
        laptopIP: "ipAddress",
        laptopMAC: "macAddress",
        laptopDept: "dept",
        laptopRemarks: "remarks",
      },
      desktopForm: {
        desktopUser: "userName",
        desktopModel: "modelNo",
        desktopSerial: "serialNo",
        desktopProcessor: "processorType",
        desktopRAM: "ramGb",
        desktopStorage: "storage",
        desktopOS: "osType",
        desktopIP: "ipAddress",
        desktopMAC: "macAddress",
        desktopDept: "dept",
        desktopRemarks: "remarks",
      },
      serverForm: {
        serverUser: "userName",
        serverModel: "modelNo",
        serverSerial: "serialNo",
        serverIP: "ipAddress",
        serverMAC: "macAddress",
        serverPort: "port",
        serverProcessor: "processorType",
        serverDept: "dept",
        serverRemarks: "remarks",
      },
      printerForm: {
        printerUser: "userName",
        printerModel: "modelNo",
        printerSerial: "serialNo",
        printerIP: "ipAddress",
        printerMAC: "macAddress",
        printerDept: "dept",
        printerRemarks: "remarks",
      },
    };

    // ✅ Purchase info mapping
    const purchaseMapping = {
      projectNo: "projectNo",
      poNo: "poNo",
      poDate: "poDate",
      vendorName: "vendorName",
      invoiceNo: "invoiceNo",
      invoiceDate: "invoiceDate",
      srb: "srbNo",
      dept: "dept",
      remarks: "remarks",
    };

    // ✅ Fill asset fields dynamically
    const fieldMap = mapping[formId];
    for (const inputId in fieldMap) {
      const key = fieldMap[inputId];
      const value = asset[key] ?? "";
      const el = document.getElementById(inputId);
      if (!el) continue;

      // Handle input/textarea vs div
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value;
      } else {
        el.textContent = value;
      }
    }

    // ✅ Fill Purchase Details (only if elements exist)
    for (const inputId in purchaseMapping) {
      const key = purchaseMapping[inputId];
      const value = asset[key] ?? "";
      const el = document.getElementById(inputId);
      if (!el) continue;

      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value;
      } else {
        el.textContent = value;
      }
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching asset data.");
  }
});
