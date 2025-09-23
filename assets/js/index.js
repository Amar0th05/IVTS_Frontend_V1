am5.ready(async function () {
  var root = am5.Root.new("chartdiv");
  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingBottom: 100,
    })
  );

  chart.set("tooltip", am5.Tooltip.new(root, {}));

  let backendData;

  try {
    const response = await axiosInstance.get("/dashboard/staffs/organisation");
    backendData = response.data.result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return;
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
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  const designationSet = new Set();
  backendData.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== "entity") {
        designationSet.add(key);
      }
    });
  });
  const allDesignations = Array.from(designationSet);

  function toCamelCase(str) {
    return str
      .split(" ")
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  }

  const chartData = backendData.map((item) => {
    let newItem = { entity: getOrganizationShortForm(item.entity) };
    allDesignations.forEach((designation) => {
      const key = toCamelCase(designation);
      newItem[key] = item.hasOwnProperty(designation) ? item[designation] : 0;
    });
    return newItem;
  });

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "entity",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 0 }),
    })
  );
  xAxis.get("renderer").labels.template.setAll({ fontSize: "10px" });
  xAxis.data.setAll(chartData);

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
    })
  );
  yAxis.get("renderer").labels.template.setAll({ fontSize: "10px" });

  const validDesignations = allDesignations.filter((designation) => {
    const key = toCamelCase(designation);
    return chartData.some((item) => item[key] > 0);
  });

  function createSeries(field, name, color) {
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: field,
        categoryXField: "entity",
        stacked: true,
      })
    );

    series.columns.template.setAll({
      tooltipText: "[bold]{name}[/]\n{categoryX}: {valueY}",
      interactive: true,
      cursorOverStyle: "pointer",
    });

    series.setAll({
      interactive: true,
    });

    series.events.on("pointerover", function (ev) {
      console.log("Hovered on:", ev.target.dataItem?.dataContext);
    });

    if (color) {
      series.columns.template.set("fill", am5.color(color));
    }

    series.columns.template.setAll({
      width: am5.percent(45),
      minWidth: 45,
      strokeOpacity: 0,
    });

    series.bullets.push(function () {
      let label = am5.Label.new(root, {
        text: "{valueY}",
        centerY: am5.p50,
        populateText: true,
        fontSize: "12px",
      });

      label.adapters.add("text", function (text, target) {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.get("valueY") === 0) {
          return "";
        }
        return text;
      });
      return am5.Bullet.new(root, {
        locationY: 0.5,
        sprite: label,
      });
    });

    series.data.setAll(chartData);
    series.appear();
    return series;
  }

  validDesignations.forEach((designation) => {
    const key = toCamelCase(designation);
    createSeries(key, designation, null);
  });

  var legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      y: am5.p100,
      marginTop: 20,
      layout: am5.GridLayout.new(root, { maxColumns: 4 }),
    })
  );
  legend.labels.template.setAll({ fontSize: "10px" });
  legend.data.setAll(chart.series.values);

  chart.appear(1000, 100);
});

am5.ready(async function () {
  var root = am5.Root.new("educationChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingTop: 20,
      paddingBottom: 30,
    })
  );

  var response = await axiosInstance.get("/dashboard/staffs/hq");

  var data = response.data.result;

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "qualification",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
      }),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  xAxis.data.setAll(data);

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  yAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "qualification",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: {valueY}",
      }),
    })
  );

  series.columns.template.setAll({
    width: am5.percent(40),
    minWidth: 20,
    fill: am5.color(0x5bf0ce),
    strokeOpacity: 0,
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
  });

  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      locationY: 0.5,
      sprite: am5.Label.new(root, {
        text: "{valueY}",
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: "15px",
        fill: am5.color(0xffffff),
      }),
    });
  });
  series.columns.template.setAll({
    tooltipText: "[bold]{name}[/]\n{categoryX}: {valueY}",
    interactive: true,
    cursorOverStyle: "pointer",
  });
  series.data.setAll(data);

  chart.appear(1000, 100);
  series.appear();
});

am5.ready(async function () {
  var root = am5.Root.new("operatorsEducationChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingTop: 20,
      paddingBottom: 30,
    })
  );

  var response = await axiosInstance.get("/dashboard/staffs/operators/hq");

  var data = response.data.result;

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "qualification",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
      }),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  xAxis.data.setAll(data);

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  yAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "qualification",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: {valueY}",
      }),
    })
  );

  series.columns.template.setAll({
    width: am5.percent(40),
    minWidth: 20,
    fill: am5.color(0x5bf0ce),
    strokeOpacity: 0,
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
  });

  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      locationY: 0.5,
      sprite: am5.Label.new(root, {
        text: "{valueY}",
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: "15px",
        fill: am5.color(0xffffff),
      }),
    });
  });
  series.columns.template.setAll({
    tooltipText: "[bold]{name}[/]\n{categoryX}: {valueY}",
    interactive: true,
    cursorOverStyle: "pointer",
  });
  series.data.setAll(data);

  chart.appear(1000, 100);
  series.appear();
});

am5.ready(async function () {
  var root = am5.Root.new("certificationChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingTop: 20,
      paddingBottom: 30,
    })
  );

  var response = await axiosInstance.get("/dashboard/staffs/courses");

  var data = response.data.result;

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "course",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
      }),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  xAxis.data.setAll(data);

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  yAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "course",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: {valueY}",
      }),
    })
  );

  series.columns.template.setAll({
    width: am5.percent(40),
    minWidth: 20,
    fill: am5.color(0x5bf0ce),
    strokeOpacity: 0,
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
  });

  series.columns.template.setAll({
    tooltipText: "[bold]{name}[/]\n{categoryX}: {valueY}",
    interactive: true,
    cursorOverStyle: "pointer",
  });

  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      locationY: 0.5,
      sprite: am5.Label.new(root, {
        text: "{valueY}",
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: "15px",
        fill: am5.color(0xffffff),
      }),
    });
  });

  series.data.setAll(data);

  chart.appear(1000, 100);
  series.appear();
});

am5.ready(async function () {
  var root = am5.Root.new("operatorsCertificationChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingTop: 20,
      paddingBottom: 30,
    })
  );

  var response = await axiosInstance.get("/dashboard/staffs/operators/courses");

  var data = response.data.result;

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "course",
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 20,
      }),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  xAxis.data.setAll(data);

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );

  yAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "course",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{categoryX}: {valueY}",
      }),
    })
  );

  series.columns.template.setAll({
    width: am5.percent(40),
    minWidth: 20,
    fill: am5.color(0x5bf0ce),
    strokeOpacity: 0,
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
  });

  series.columns.template.setAll({
    tooltipText: "[bold]{name}[/]\n{categoryX}: {valueY}",
    interactive: true,
    cursorOverStyle: "pointer",
  });

  series.bullets.push(function () {
    return am5.Bullet.new(root, {
      locationY: 0.5,
      sprite: am5.Label.new(root, {
        text: "{valueY}",
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        fontSize: "15px",
        fill: am5.color(0xffffff),
      }),
    });
  });

  series.data.setAll(data);

  chart.appear(1000, 100);
  series.appear();
});

am5.ready(async function () {
  var root = am5.Root.new("payHikeChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: 0,
    })
  );

  const response = await axiosInstance.get("/dashboard/hike");

  const hikes = response.data.hikes;

  var data = [
    { category: "less than 25000", value: 0 },
    { category: "25000 to 50000", value: 0 },
    { category: "50000 to 1 lakh", value: 0 },
    { category: "above 1 lakh", value: 0 },
  ];

  hikes.forEach((hike) => {
    if (hike < 25000) {
      data[0].value += 1;
    } else if (hike > 25000 && hike < 50000) {
      data[1].value += 1;
    } else if (hike >= 50000 && hike < 100000) {
      data[2].value += 1;
    } else if (hike >= 100000) {
      data[3].value += 1;
    }
  });

  var series = chart.series.push(
    am5percent.PieSeries.new(root, {
      name: "Pay Hike Series",
      categoryField: "category",
      valueField: "value",
      tooltip: am5.Tooltip.new(root, {
        labelText:
          "{category}: {value} ({valuePercentTotal.formatNumber('0.000')}%)",
      }),
    })
  );

  series.data.setAll(data);

  series.set("radius", am5.percent(70));
  series.set("marginTop", 15);
  series.slices.template.setAll({
    stroke: am5.color(0xffffff),
    strokeWidth: 2,
  });

  series.labels.template.setAll({
    text: "{value} | {valuePercentTotal.formatNumber('0.000')}%",
    radius: 20,
    fontSize: "12px",
    fill: am5.color("#000"),
    forceHidden: false,
    oversizedBehavior: "none",
  });

  var legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      layout: root.horizontalLayout,
      paddingTop: 10,
    })
  );
  legend.data.setAll(series.dataItems);

  series.appear(1000, 100);
  chart.appear(1000, 100);
}); // end am5.ready()

am5.ready(async function () {
  var root = am5.Root.new("payHikeBreakdownChart");

  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
      paddingLeft: 70,
      paddingRight: 70,
      paddingTop: 30,
      paddingBottom: 30,
    })
  );

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
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  const invoiceMapping = {
    JNPA: 10542336,
    VPA: 477842,
    VoCPA: 500000,
    PPA: 0,
    NMPA: 1260000,
    KPL: 750000,
    ChPA: 1045945,
    HQ: 92562,
  };

  var response = await axiosInstance.get("/dashboard/manningCost");

  var apiData = response.data.result;

  var data = [];

  var sum = 0;
  var invoiceSum = 0;

  apiData.map((item) => {
    const entity = {};
    (entity["organisation"] = getOrganizationShortForm(item.organisation)),
      (entity["actualCost"] = item.manningCost),
      (entity["invoiceRaised"] =
        invoiceMapping[getOrganizationShortForm(item.organisation)]),
      (entity["other"] = 0);
    sum += parseFloat(item.manningCost);
    data.push(entity);
  });

  function getOrgFullName(shortForm) {
    return (
      Object.keys(orgNameMapping).find(
        (key) => orgNameMapping[key] === shortForm
      ) || null
    );
  }

  invoiceSum = Object.values(invoiceMapping).reduce((t, n) => t + n, 0);

  let tableBody = document.getElementById("invoiceTable");

  Object.entries(invoiceMapping).forEach(([org, cost]) => {
    let row = document.createElement("tr");
    row.innerHTML = `
                  <td>${getOrgFullName(org)}</td>
                  <td>₹ ${cost.toLocaleString()}</td>
                `;
    tableBody.appendChild(row);
  });

  document.getElementById("invoice-raised").innerHTML =
    "₹ " + invoiceSum.toLocaleString();

  document.getElementById("total-manning-cost").innerHTML =
    "₹ " + parseFloat(sum).toLocaleString();

  var yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "organisation",
      renderer: am5xy.AxisRendererY.new(root, {
        inversed: true,
        cellStartLocation: 0,
        cellEndLocation: 1,
      }),
    })
  );
  yAxis.data.setAll(data);

  var xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererX.new(root, {
        strokeOpacity: 0.1,
        minGridDistance: 50,
      }),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fontSize: "10px",
  });

  function createSeries(field, name, color) {
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: field,
        categoryYField: "organisation",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "[bold]{name}[/]\n{categoryY}: {valueX}",
        }),
      })
    );

    if (color) {
      series.columns.template.set("fill", am5.color(color));
      series.columns.template.set("stroke", am5.color(color));
    }

    series.columns.template.setAll({
      height: am5.percent(100),
      strokeOpacity: 0,
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 1,
        locationY: 0.5,
        sprite: am5.Label.new(root, {
          centerY: am5.p50,
          text: "{valueX}",
          populateText: true,
          dx: 5,
          fill: am5.color("#000"),
          fontSize: "12px",
        }),
      });
    });

    series.data.setAll(data);
    series.appear(1000);
    return series;
  }

  createSeries("actualCost", "Actual Manning Cost / Month", 0x0066cc);
  createSeries("invoiceRaised", "Invoice Raised / Month", 0x5de2e7);
  createSeries("other", "Other", 0xff9900);

  var legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      layout: am5.GridLayout.new(root, {
        maxColumns: 3,
        fixedWidthGrid: false,
        useDefault: true,
      }),
    })
  );
  legend.data.setAll(chart.series.values);

  var cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "zoomY",
    })
  );
  cursor.lineY.set("forceHidden", true);
  cursor.lineX.set("forceHidden", true);

  chart.appear(1000, 100);
});

document.addEventListener("DOMContentLoaded", async () => {
  if (window.api) {
    window.getStaffsCountByHighestQualification =
      window.api.getStaffsCountByHighestQualification;
  } else {
    console.error("api not found");
  }
  var response = await axiosInstance.get("/dashboard/manpower/count");

  document.getElementById("manpower-deployed").innerHTML =
    '<i class="fa-solid fa-users"></i>  ' + response.data.count;

  var response = await axiosInstance.get("/dashboard/staffs/designation");

  const designationStaffsMap = response.data.result;

  if (!designationStaffsMap) {
    document.querySelector("#manPowerTable").innerHTML =
      '<p class="text-danger">No Data Found</p>';
  } else {
    designationStaffsMap.forEach((obj) => {
      $("#manPowerTable").append(`
                          <tr>
                              <td>${obj.designation}</td>
                              <td>${obj.count}</td>
                          </tr>
                      `);
    });
  }

  var response = await axiosInstance.get("/dashboard/manningcost");
  var manningcost = response.data;

  if (manningcost) {
    const manningCostTable = document.getElementById("manningCostTable");
    manningCostTable.innerHTML = "";
    manningcost = manningcost.result;
    // console.log(manningcost);
    manningcost.forEach((data) => {
      manningCostTable.insertAdjacentHTML(
        "beforeend",
        `
  <tr>
    <td>${data.organisation}</td>
    <td>₹ ${data.manningCost}</td>
  </tr>
`
      );
    });
  }
});
