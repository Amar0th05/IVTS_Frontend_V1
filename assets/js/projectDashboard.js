 
    am5.ready(async function() {
let data=await axiosInstance.get('/projects/all/status');
let apiResponse=data.data;
// console.log(data);
var root = am5.Root.new("chartdiv1");

var chart = root.container.children.push(
am5percent.PieChart.new(root, {
layout: root.verticalLayout
})
);

var series = chart.series.push(
am5percent.PieSeries.new(root, {
name: "Project Status",
categoryField: "status",
valueField: "count",
innerRadius: am5.percent(40)
})
);


const statusColors = {
  "Ongoing": am5.color("#3a86ff"),
  "Completed": am5.color("#4cc9f0"),
  "Withdrawn": am5.color("#f72585"),
  "": am5.color("#adb5bd") 
};

const chartData = apiResponse.map(item => ({
  status: item.ProjectStatus || "Unknown",
  count: item.Count,
  color: statusColors[item.ProjectStatus] || am5.color("#cccccc") 
}));
series.data.setAll(chartData);

series.labels.template.set("visible", false);
series.ticks.template.set("visible", false);

var legend = chart.children.push(
am5.Legend.new(root, {
centerX: am5.percent(50),
x: am5.percent(50),
layout: root.horizontalLayout
})
);
legend.data.setAll(series.dataItems);
});

      

   am5.ready(function () {
    let rs=[
    {
        "TotalCost": 105,
        "PaymentReceived": 105,
        "ProjectStatus": "Ongoing"
    },
    {
        "TotalCost": 105,
        "PaymentReceived": 105,
        "ProjectStatus": "Ongoing"
    },
    {
        "TotalCost": 105,
        "PaymentReceived": 105,
        "ProjectStatus": "Ongoing"
    },
    {
        "TotalCost": 1005,
        "PaymentReceived": 105,
        "ProjectStatus": "Ongoing"
    }
];

let ongoing={};
let completed={};

rs.forEach(r=>{
    if(r.ProjectStatus=='Ongoing'){
        let tc=r.TotalCost;
        let pr=r.PaymentReceived;
        let percentage=pr/tc*100;
        percentage=percentage.toFixed(2);
        // ongoing['percentage']=percentage,
        let count=ongoing[percentage]?ongoing[percentage]+1:1;
        if(percentage==0){
            ongoing['0']=count;
        }else if(percentage<25){
           ongoing['<25']=count;
        }else if(percentage<50){
            ongoing['<50']=count;
        }else if(percentage<75){
            ongoing['<75']=count;
        }else if(percentage>=75){
            ongoing['>75']=count;
        }
    }
    else if(r.ProjectStatus=='Completed'){
        let tc=r.TotalCost;
        let pr=r.PaymentReceived;
        let percentage=pr/tc*100;
        completed[percentage]=completed[percentage]?completed[percentage]+1:1;
    }
});

let ongoingStatus=[];
let completedStatus=[];




console.log(ongoing,completed);

// console.log(data);
  var root = am5.Root.new("chartdiv2");

  // Optional: use theme
  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    })
  );

  var series = chart.series.push(
    am5percent.PieSeries.new(root, {
      name: "Payment Progress",
      categoryField: "milestone",
      valueField: "count",
      innerRadius: am5.percent(30),
      legendLabelText: "{category}: {value}"
    })
  );

  // Custom color set
  var customColors = ["#ffbe0b", "#fc79d3", "#8338ec", "#06d6a0"];
  series.get("colors").setAll({
    colors: customColors.map(c => am5.color(c))
  });

  // Set data
  series.data.setAll([
    { milestone: "25% Paid", count: 2 },
    { milestone: "50% Paid", count: 40 },
    { milestone: "75% Paid", count: 26 },
    { milestone: "more than 75% Paid", count: 20 }
  ]);

  // Automatically hide 0% slices
  series.slices.template.adapters.add("visible", function (visible, target) {
    return target.dataItem.get("valueY") > 0;
  });

  // Add legend with gridLayout for multiple rows
  var legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      layout: root.gridLayout,
      width: am5.percent(100)
    })
  );

  legend.labels.template.setAll({
    text: "{category}: {value}  {valuePercentTotal.formatNumber('0.00')}%",
    fontSize: 11,
    populateText: true
  });

  // Set the number of columns in the grid layout
  legend.itemContainers.template.setAll({
    layout: root.horizontalLayout
  });

  // Connect legend to series
  legend.data.setAll(series.dataItems);
});


    

    am5.ready(function () {
  var root = am5.Root.new("chartdiv3");

  // Optional: use theme
  root.setThemes([am5themes_Animated.new(root)]);

  var chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    })
  );

  var series = chart.series.push(
    am5percent.PieSeries.new(root, {
      name: "Payment Progress",
      categoryField: "milestone",
      valueField: "count",
      innerRadius: am5.percent(30),
      legendLabelText: "{category}: {value}"
    })
  );

  // Custom color set
  var customColors = ["#ffa0ab", "#fb5607", "#8338ec", "#06d6a0"];
  series.get("colors").setAll({
    colors: customColors.map(c => am5.color(c))
  });

  // Set data
  series.data.setAll([
    { milestone: "25% Paid", count: 20 },
    { milestone: "50% Paid", count: 4 },
    { milestone: "75% Paid", count: 10 },
    { milestone: "more than 75% Paid", count: 20 }
  ]);

  // Automatically hide 0% slices
  series.slices.template.adapters.add("visible", function (visible, target) {
    return target.dataItem.get("valueY") > 0;
  });

  // Add legend with gridLayout for multiple rows
  var legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      layout: root.gridLayout,
      width: am5.percent(100)
    })
  );

  legend.labels.template.setAll({
    text: "{category}: {value}  {valuePercentTotal.formatNumber('0.00')}%",
    fontSize: 11,
    populateText: true
  });

  // Set the number of columns in the grid layout
  legend.itemContainers.template.setAll({
    layout: root.horizontalLayout
  });

  // Connect legend to series
  legend.data.setAll(series.dataItems);
});


