 
let equipments = [];
        let tableRecords = [];
        async function getOrganisationsHavingProcurements() {
            const response = await axiosInstance.get('stages/organisation/data');
            let organisations = response.data.organisations;
            return organisations || null;
        }
        let chartRoots = {};
        let data1 = [], data2 = [], data3 = [], data4 = [];
        function createPieChart(divId, data) {
            if (chartRoots[divId]) {
                chartRoots[divId].dispose();
            }
            let root = am5.Root.new(divId);
            chartRoots[divId] = root;
            root.setThemes([am5themes_Animated.new(root)]);
            let chart = root.container.children.push(am5percent.PieChart.new(root, {}));
            let series = chart.series.push(am5percent.PieSeries.new(root, {
                valueField: "value",
                categoryField: "stage",
            }));
            series.labels.template.setAll({
                text: "{stage} : {value}  |  {valuePercentTotal.formatNumber('0.000')}%",
                radius: 20,
                fontSize: "12px",
                fill: am5.color("#000"),
                forceHidden: false,
                oversizedBehavior: "none"
            });
            series.slices.template.events.on("click", function (event) {
                let sliceData = event.target.dataItem.dataContext;
                let chartParent = $("#" + divId).closest(".chart-container-wrapper");
                let tableContainer = $("#table-container" + divId);
                let tablebody = tableContainer.find('tbody')
                tablebody.empty();
                let equipmentData = equipments[sliceData.cid][sliceData.sid];
                equipmentData.forEach(element => {
                    tablebody.append(`
                            <tr>
                                <td>${element.equipment}</td>
                                <td>${element.totalQuantity}</td>
                            </tr>
                        `);
                })
                if (chartParent.hasClass("col-md-12")) {
                    chartParent.removeClass("col-md-12").addClass("col-md-6");
                    tableContainer.removeClass("d-none");
                }
            });

            series.ticks.template.setAll({
                strokeWidth: 1
            });

            series.slices.template.setAll({
                strokeWidth: 0.5
            });

            series.slices.template.adapters.add("tooltipText", function (text) {
                return "[fontSize:10px]" + text;
            });

            series.data.setAll(data);
        }
        function refreshPieChart(divId) {
            let root = chartRoots[divId];
            if (root) {
                let chart = root.container.children.getIndex(0);
                if (chart) {
                    let series = chart.series.getIndex(0);
                    if (series) {
                        series.data.setAll(series.data.values);
                        series.appear(1000, 100);
                        root._render();
                    }
                }
            }
        }
        $('.tbl-close').on('click', function () {
            let tableContainer = $(this).closest('.table-container');
            let chartParent = tableContainer.prev('.chart-container-wrapper');
            if (chartParent.length) {
                chartParent.removeClass('col-md-6').addClass('col-md-12');
            }
            tableContainer.addClass('d-none');
            let chartDiv = chartParent.find('[id^="chartdiv"]');
            if (chartDiv.length) {
                let chartId = chartDiv.attr('id');
                if (chartId) {
                    setTimeout(() => refreshPieChart(chartId), 0);
                }
            }
        });
        async function displayChart(id) {
            if (chartRoots["chartdiv1"]) chartRoots["chartdiv1"].dispose();
            if (chartRoots["chartdiv2"]) chartRoots["chartdiv2"].dispose();
            if (chartRoots["chartdiv3"]) chartRoots["chartdiv3"].dispose();
            if (chartRoots["chartdiv4"]) chartRoots["chartdiv4"].dispose();
            chartRoots = {};
            data1.length = 0;
            data2.length = 0;
            data3.length = 0;
            data4.length = 0;
            try {
                let response = await axiosInstance.get(`/stages/org/data/${id}`);
                let records = response.data.records;
                records.forEach(record => {
                    if (record.v1 !== 0) data1.push({ stage: record.stage, value: record.v1, cid: 1, sid: record.stageID });
                    if (record.v2 !== 0) data2.push({ stage: record.stage, value: record.v2, cid: 3, sid: record.stageID });
                    if (record.v3 !== 0) data3.push({ stage: record.stage, value: record.v3, cid: 4, sid: record.stageID });
                    if (record.v4 !== 0) data4.push({ stage: record.stage, value: record.v4, cid: 5, sid: record.stageID });
                });
                createPieChart('chartdiv1', data1);
                createPieChart('chartdiv2', data2);
                createPieChart('chartdiv3', data3);
                createPieChart('chartdiv4', data4);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        }
        async function getStageDataByOrganisationID(id) {
            let response = await axiosInstance.get(`/stages/organisation/data/category/${id}`);
            let records = response.data.records;
            return records;
        }
        const orgNameMapping = {
            "Head Quarters": "HQ",
            "Chennai Port Authority": "ChPA",
            "Jawaharlal Nehru Port Authority": "JNPA",
            "Kamarajar Port Limited": "KPL",
            "New Mangalore Port Authority": "NMPA",
            "Paradip Port Authority": "PPA",
            "VOC Port Authority": "VoCPA",
            "Visakhapatnam Port Authority": "VPA",
            "Cochin Port Authority": "CPA",
            "Syama Prasad Mookerjee Port Authority": "SPMPA",
            "Deendayal Port Authority": "DPA",
            "Mumbai Port Authority": "MbPA",
            "Marmugao Port Authority": "MPA",
        };
        function getOrganizationShortForm(orgName) {
            if (orgNameMapping[orgName]) {
                return orgNameMapping[orgName];
            }
            return orgName
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .toUpperCase();
        }
        document.addEventListener('DOMContentLoaded', async function () {
            let organisations = await getOrganisationsHavingProcurements();
            tableRecords = await getStageDataByOrganisationID(organisations[0].id);
            let equipmentsOverViewTable = document.getElementById('equipmentsOverviewTable');
            let tableHead = equipmentsOverViewTable.querySelector('thead');
            tableHead.innerHTML = '';
            keys = tableRecords[0] ? Object.keys(tableRecords[0]) : [];
            keys.splice(1, 1);
            keys = keys.map(item => {
                return item.split('_').join(' ').toUpperCase();
            });
            const headerRow = `<tr>${keys.map(key => `<th scope="col">${key}</th>`).join('')}</tr>`;
            tableHead.insertAdjacentHTML('beforeend', headerRow);
            tableBody = equipmentsOverViewTable.querySelector('tbody');
            tableBody.innerHTML = '';
            tableRecords.forEach(record => {
                const row = `<tr scope="row">
                    <td>${record.stage}</td>
                    <td>${record['VTMS_IT_EQUIPMENTS_AND_HARDWARE']}</td>
                    <td>${record['VTMS_SENSORS']}</td>
                    <td>${record['VTMS_CENTRE_SURVILLENCE']}</td>
                    <td>${record['VTMS_DISPLAY_WALL']}</td>
                  </tr>`;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
            let chartTabs = document.getElementById('chartTabs');
            chartTabs.innerHTML = "";
            let data = organisations.map(item => ({
                organisation: getOrganizationShortForm(item.org),
                id: item.id
            }));
            let tableTabs = document.getElementById('tbl-tabs');
            tableTabs.innerHTML = "";
            data.forEach(item => {
                chartTabs.insertAdjacentHTML('beforeend', `
            <li class="nav-item" role="presentation">
                <button class="nav-link tabbtn" id="chartTabs-tab${item.id}" type="button" role="tab" aria-selected="true" data-org-id="${item.id}">
                    ${item.organisation}
                </button>
            </li>
        `);
                tableTabs.insertAdjacentHTML('beforeend', `
         <li class="nav-item" role="presentation">
                                                          <button class="nav-link charttabbtn" id="tbl-tabs-tab${item.id}"  data-bs-target="#tab1" type="button" role="tab"  aria-selected="true" data-org-id="${item.id}">${item.organisation}</button>
                                                        </li>
        `);
            });
            displayChart(data[0].id);
            equipments = await getAllEquipmentsForPort(data[0].id);
            document.querySelector('.tabbtn').classList.add("active");
            document.querySelector('.charttabbtn').classList.add("active");

            document.querySelectorAll(".tabbtn").forEach(btn => {
                btn.addEventListener('click', async () => {
                    document.querySelectorAll(".tabbtn").forEach(btn => {
                        btn.classList.remove("active");
                    });

                    btn.classList.add("active");
                    const id = btn.dataset.orgId;
                    equipments = await getAllEquipmentsForPort(id);
                    // console.log(equipments);
                    document.querySelectorAll('.chart-container-wrapper').forEach(chart => {
                        chart.classList.remove('col-md-6');
                        chart.classList.add('col-md-12');
                    });
                    document.querySelectorAll('.table-container').forEach(table => {
                        table.classList.add('d-none');
                    });
                    displayChart(id);
                });
            });
            document.querySelectorAll(".charttabbtn").forEach(btn => {
                btn.addEventListener('click', async () => {
                    document.querySelectorAll(".charttabbtn").forEach(btn => {
                        btn.classList.remove("active");
                    });
                    btn.classList.add("active");
                    const id = btn.dataset.orgId;
                    tableRecords = await getStageDataByOrganisationID(id);
                    let equipmentsOverViewTable = document.getElementById('equipmentsOverviewTable');
                    let tableHead = equipmentsOverViewTable.querySelector('thead');
                    tableHead.innerHTML = '';
                    const headerRow = `<tr>${keys.map(key => `<th scope="col">${key}</th>`).join('')}</tr>`;
                    tableHead.insertAdjacentHTML('beforeend', headerRow);
                    tableBody = equipmentsOverViewTable.querySelector('tbody');
                    tableBody.innerHTML = '';
                    tableRecords.forEach(record => {
                        const row = `<tr scope="row">
                              <td>${record.stage}</td>
                              <td>${record['VTMS_IT_EQUIPMENTS_AND_HARDWARE']}</td>
                              <td>${record['VTMS_SENSORS']}</td>
                              <td>${record['VTMS_CENTRE_SURVILLENCE']}</td>
                              <td>${record['VTMS_DISPLAY_WALL']}</td>
                            </tr>`;
                        tableBody.insertAdjacentHTML('beforeend', row);
                    });
                });
            });
            var table = $('#equipmentsOverviewTable').DataTable({
  paging: true,
  pageLength: 25,
  lengthMenu: [5, 10, 25, 50, 100],
  dom: '<"top"lBf>rt<"bottom"ip><"clear">',
  buttons: [
    {
      extend: 'excel',
      text: '<i class="fa-solid fa-file-excel"></i> Excel',
      className: 'btn-excel'
    },
    {
      extend: 'pdf',
      text: '<i class="fa-solid fa-file-pdf"></i> PDF',
      className: 'btn-pdf'
    },
    {
      extend: 'colvis',
      text: '<i class="fa-solid fa-eye"></i> Columns',
      className: 'btn-colvis'
    }
  ],
  language: {
    search: "",
    searchPlaceholder: "Type to search...",
    paginate: { first: "«", last: "»", next: "›", previous: "‹" }
  },
  initComplete: function () {
    const $input = $('#equipmentsOverviewTable_filter input');
    $input.wrap('<div class="search-wrapper position-relative"></div>');
    $input.before('<i class="fa-solid fa-magnifying-glass search-icon"></i>');
  }
});

// Append export buttons to a custom container
table.buttons().container().appendTo('#exportButtons');

        });

        async function getAllEquipmentsForPort(portId) {
            try {
                const response = await axiosInstance.get(`/equipmentsDelivery/port/${portId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                    }
                });
                return response.data.equipments;
            } catch (error) {
                console.error('Error fetching equipments:', error);
                return [];
            }
        }
        let chartCard = document.getElementById('chartCard');
        let tableCard = document.getElementById('tableCard');
        let chartBtn = document.getElementById('chartsBtn');
        let tableBtn = document.getElementById('tableBtn');
        chartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            chartCard.classList.remove('d-none');
            tableCard.classList.add('d-none');
        });
        tableBtn.addEventListener('click', function (e) {
            e.preventDefault();
            chartCard.classList.add('d-none');
            tableCard.classList.remove('d-none');
        });
    