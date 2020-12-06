queue()
    .defer(d3.csv, "data1.csv")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	console.log(dataSet);
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.Date_of_offence = dateFormat.parse(d.Date_of_offence);
				d.Date_of_offence.setDate(1);
		d.Total_Fatalities = +d.Total_Fatalities;
		d.Longitude = +d.Longitude;
    	d.Latitude = +d.Latitude;
	});

	
    //Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var date_of_offence_ = ndx.dimension(function(d) { return d.Date_of_offence; });
	var police_station_ = ndx.dimension(function(d) { return d.Police_station; });
	var type_of_collision_ = ndx.dimension(function(d) { return d.Type_of_collision; });
	var intersection_mid_block_ = ndx.dimension(function(d) { return d.Intersection_mid_block; });
	var hit_and_run_ = ndx.dimension(function(d) { return d.Hit_and_run; });
	var maneuver_type_ = ndx.dimension(function(d) { return d.Maneuver_type; });
	var total_Fatalities_  = ndx.dimension(function(d) { return d.Total_Fatalities; });
	//var facilities = ndx.dimension(function(d) {return d.geo;});
	//var groupname = "marker-area";
	var allDim = ndx.dimension(function(d) {return d;});

	//Calculate metrics
	var projectsByDate = date_of_offence_.group(); 
	var projectsByPoliceStation = police_station_.group(); 
	var projectsByCollisionType = type_of_collision_.group();
	var projectsByIntersectionStatus = intersection_mid_block_.group();
	var hitAndRunGroup = hit_and_run_.group();
	var projectsByManeuverType = maneuver_type_.group();
	//var facilitiesGroup = facilities.group().reduceCount();

	var all = ndx.groupAll();

	//Calculate Groups
	var totalfatalitiesManeuver = maneuver_type_.group().reduceSum(function(d) {
		return d.Total_Fatalities;
	});

	var totalfatalitiespolice = police_station_.group().reduceSum(function(d) {
		return d.Police_station;
	});

	var totalfatalitiesIntersection = intersection_mid_block_.group().reduceSum(function(d) {
		return d.Intersection_mid_block;
	});


	var netTotalFatalities = ndx.groupAll().reduceSum(function(d) {return d.Total_Fatalities;});

	var line_Total_Fatalities = date_of_offence_.group().reduceSum(function(d) {return d.Total_Fatalities;});
	var line_Total_serious = date_of_offence_.group().reduceSum(function(d) {return d.Total_serious;});
	var line_Total_minor = date_of_offence_.group().reduceSum(function(d) {return d.Total_minor;});

    var avg_registration_time = police_station_.group().reduceCount(function(d) {
		return d.avg_registration_time;
	});

	 var avg_registration_times = police_station_.group().reduceSum(function(d) {
		return d.avg_registration_time;
	});

	//Define threshold values for data
	var minDate = date_of_offence_.bottom(1)[0].Date_of_offence;
	var maxDate = date_of_offence_.top(1)[0].Date_of_offence;

console.log(minDate);
console.log(maxDate);
	
	//Charts
	var dateChart = dc.lineChart("#date-chart");
	var policeStationChart = dc.rowChart("#policeStation-chart");
	var collisionTypeChart = dc.rowChart("#collisionType-chart");
	var intersectionChart = dc.pieChart("#intersection-chart");
	var hitAndRunChart = dc.rowChart("#hitAndRun-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var netFatalities = dc.numberDisplay("#net-Fatalities");
	var maneuverFatalities = dc.barChart("#maneuver-Fatalities");
	//var maps = dc.leafletMarkerChart("#map");



  selectField = dc.selectMenu('#menuselect')
        .dimension(police_station_)
        .group(projectsByPoliceStation); 

    

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);




	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	netFatalities
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalFatalities)
		.formatNumber(d3.format(".3s"));

	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(date_of_offence_)
		.ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
		.group(line_Total_minor,"Total Minor Cases")
		.stack(line_Total_serious,"Total serious Cases")
		.stack(line_Total_Fatalities,"Total Fatal Cases")
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
        .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);


	collisionTypeChart
        //.width(300)
        .height(220)
        .dimension(type_of_collision_)
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
        .group(projectsByCollisionType)
        .elasticX(true)
        .xAxis().ticks(5);

	hitAndRunChart
		//.width(300)
		.height(220)
        .dimension(hit_and_run_)
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
        .group(hitAndRunGroup)
        .xAxis().ticks(4);


	policeStationChart
		//.width(300)
		.height(220)
        .dimension(police_station_)
        .ordinalColors(["#56B2EA","#E064CD","#F8B700","#78CC00","#7B71C5"])
        .group(avg_registration_times)
        .xAxis().ticks(4);


          intersectionChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(60)
            .transitionDuration(1000)
            .dimension(intersection_mid_block_)
            .ordinalColors(["#78CC00","#7B71C5"])
            .group(projectsByIntersectionStatus)
            .renderLabel(false)
            .legend(dc.legend().x(110).y(90).itemHeight(10).gap(5));


    maneuverFatalities
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(maneuver_type_)
        .ordinalColors(["#7B71C5"])
        .group(totalfatalitiesManeuver)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(maneuver_type_))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));


	var map = L.map('map');

	var drawMap = function(){
		map.setView([31.0943,76.6143],7);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

    var mark = [];
	_.each(allDim.top(Infinity),function(d){
        mark.push([d["Police_station"],d["Latitude"], d["Longitude"],d["Type_of_collision"],d['IPC'],d["Date_of_offence"],d["Date_of_FIR"]]);
	});

    var markerArray = [];
    for ( var i=0; i < mark.length; i++ ){
        marker = L.marker([mark[i][1], mark[i][2]])
      .bindPopup("Police Station: "+mark[i][0] +"<br>Date_of_offence: "+mark[i][5]+"<br>IPC's: "+mark[i][4]+"<br>Date_of_FIR: "+mark[i][6]+"<br>Type_of_collision: "+mark[i][3]);
       map.addLayer(marker);

       markerArray.push(marker);

    }
       var group = L.featureGroup(markerArray).addTo(map);
       map.fitBounds(group.getBounds());

	//Heatmap
	var geoData = [];
	_.each(allDim.top(Infinity),function(d){
		geoData.push([d["Latitude"], d["Longitude"], d["Total_Fatalities"]]);
	});


	var heat = L.heatLayer(geoData,{
		radius: 20,
		blur: 30,
		maxZoom: 2,
	}).addTo(map);

};

drawMap();

dcCharts = [selectField, dateChart, collisionTypeChart, hitAndRunChart, policeStationChart, intersectionChart,maneuverFatalities];

_.each(dcCharts, function (dcChart) {
    dcChart.on("filtered", function (chart, filter) {
        map.eachLayer(function (layer) {
          map.removeLayer(layer)
        }); 
    drawMap();
    });
});

    dc.renderAll();
    //dc.renderAll(groupname);
};
