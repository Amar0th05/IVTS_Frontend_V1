function getbaseurl() {
  const { hostname } = location;
  const environments = {
    dev: { host: "localhost", baseUrl: "http://localhost:5500" },
    prod: { host: "ntcpwcit.in", baseUrl: "https://ntcpwcit.in/worksphere/api" },
  };

  for (let env in environments) {
    if (environments[env].host === hostname) {
      return environments[env].baseUrl;
    }
  }

  return "http://localhost:5500";
}

    document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const assetId = urlParams.get('assetId');
      if (!assetId) return;
      const baseUrl = getbaseurl();

      try {
        
        const response = await fetch(`${baseUrl}/assets/details/${assetId}`);
        if (!response.ok) throw new Error('Asset not found');

        const data = await response.json();
        const asset = data.assets;
        const category = asset.category.toLowerCase();

        // Hide all forms
        ['laptopForm','desktopForm','serverForm','printerForm'].forEach(f => {
          document.getElementById(f).classList.add('hidden');
        });

        let formId = '';
        switch(category){
          case 'laptop': formId = 'laptopForm'; break;
          case 'desktop & monitor': formId = 'desktopForm'; break;
          case 'server & storage': formId = 'serverForm'; break;
          case 'printer & scanner': formId = 'printerForm'; break;
          default: console.warn('Unknown category'); return;
        }

        const form = document.getElementById(formId);
        form.classList.remove('hidden');

        // Populate fields dynamically
        const mapping = {
          laptopForm: {
            laptopAssetId:'assetId', laptopCategory:'category', laptopUser:'userName',
            laptopModel:'modelNo', laptopSerial:'serialNo', laptopProcessor:'processorType',
            laptopRam:'ramGb', laptopStorage:'storage', laptopGraphics:'graphics',
            laptopOS:'osType', laptopHost:'hostName', laptopIP:'ipAddress',
            laptopMAC:'macAddress', laptopDept:'dept', laptopRemarks:'remarks'
          },
          desktopForm: {
            desktopUser:'userName', desktopModel:'modelNo', desktopSerial:'serialNo',
            desktopProcessor:'processorType', desktopRAM:'ramGb', desktopStorage:'storage',
            desktopOS:'osType', desktopIP:'ipAddress', desktopMAC:'macAddress',
            desktopDept:'dept', desktopRemarks:'remarks'
          },
          serverForm: {
            serverUser:'userName', serverModel:'modelNo', serverSerial:'serialNo',
            serverIP:'ipAddress', serverMAC:'macAddress', serverPort:'port',
            serverProcessor:'processorType', serverDept:'dept', serverRemarks:'remarks'
          },
          printerForm: {
            printerUser:'userName', printerModel:'modelNo', printerSerial:'serialNo',
            printerIP:'ipAddress', printerMAC:'macAddress', printerDept:'dept',
            printerRemarks:'remarks'
          }
        };

        const map = mapping[formId];
        for(const inputId in map){
          const value = asset[map[inputId]] || '';
          const input = document.getElementById(inputId);
          if(input) input.value = value;
        }

      } catch(err){
        console.error(err);
        alert('Error fetching asset data.');
      }
    });
 