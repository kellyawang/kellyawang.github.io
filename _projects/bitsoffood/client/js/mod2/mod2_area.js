
/*
 * AreaTimeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */



AreaTimeline = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling
    this.eventHandler = _eventHandler;

    // DEBUG RAW DATA
    // console.log(this.data);

    this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

AreaTimeline.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 10, right: 50, bottom: 40, left: 50 };

    vis.width = 300 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TO-DO: Overlay with path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    const LABEL_BUFFER = 6;

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(d3.format(""));

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    //year axis label
    vis.svg.append("text")
        .attr("class", "y-axis-label")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(-40,"+ (vis.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Year")

    //year axis label
    vis.svg.append("text")
        .attr("class", "x-axis-label")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (vis.width/2)+"," + (vis.height + vis.margin.bottom - LABEL_BUFFER) + ")")  // text is drawn off the screen top left, move down and out and rotate
        .text("Food Production (1000 Tonnes)")


    // Initialize the area path generator
    vis.area = d3.area()
        .x1(d => {return vis.x(d[vis.currentElement])})
        .curve(d3.curveCardinal)
        .x0(0)
        .y((_, i) => i * (vis.height/50)) //51 years, spaced out at 10 pixels each to span total height of 500px

    //define tool tip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            // console.log(d)
            return vis.displayData.year + ": " + d[vis.currentElement];
        });

    vis.svg.call(vis.tip);

    vis.wrangleData();
}



/*
 * Data wrangling
 */
AreaTimeline.prototype.wrangleData = function(selector = "Food Balance Sheets", country = "Africa"){
    var vis = this;

    /* Init options */
    vis.currentDomain = selector
    vis.currentCountry = country
    vis.areaColor = green

    // vis.currentItem = 'Wheat and products'
    if (vis.currentDomain === "Annual population") {
        vis.currentItem = "Population - Est. & Proj."
        vis.currentElement = "Total Population - Both sexes"
        vis.areaColor = pink
    } else if (vis.currentDomain === "Agriculture Total") {
        vis.currentItem = "Agriculture total"
        vis.currentElement = "Emissions (CO2eq)"
        vis.areaColor = orange
    } else if (vis.currentDomain === "Crops and livestock products") {
        vis.currentItem = "Agricult.Products, Total"
        vis.currentElement = "Export Value"
        vis.areaColor = purple
    } else if (vis.currentDomain === "Food Balance Sheets") {
        vis.currentElement = 'Production'
        vis.areaColor = green
    }

    vis.displayData = []

    vis.data.forEach(domain => {
        if (domain.domain == vis.currentDomain) {
            domain.countries.forEach(country => {
                if (country.country == vis.currentCountry) {
                    country.years.forEach(year => {
                        if (vis.currentDomain === "Food Balance Sheets") {
                            var itemSelection = year.totals
                        } else {
                            var itemSelection = year.items.find(item => {
                                return item.item == vis.currentItem
                            })
                        }
                        itemSelection.year = +year.year
                        vis.displayData.push(itemSelection)
                    })
                }
            })
        }
    })
    // console.log("displayData:")
    // console.log(vis.displayData)

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

AreaTimeline.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.x.domain(d3.extent(vis.displayData, function(d) { return d[vis.currentElement]; }))
    vis.y.domain([d3.max(vis.displayData, function(d) { return d.year; }), d3.min(vis.displayData, function(d) { return d.year; })])

// Draw the area
    var area = vis.svg.selectAll(".area")
        .data([vis.displayData])
        .join(
            enter => enter.append("path")
                .attr("class", "area")
                .style("fill", "rgba(0, 0, 0, 0.75)") //vis.areaColor
                .attr("d", (d) => {return vis.area(d)}),
                //.on('mouseover', (d)=> vis.tip.show(d))
                //.on('mouseout', (d) => vis.tip.hide(d)),
            update => update
                .transition()
                .duration(800)
                .style("fill", "rgba(0, 0, 0, 0.75)") //vis.areaColor
                .attr("d", (d) => {return vis.area(d)}),
            exit => exit.remove()
        )




    // Call axis functions with the new domain 
    vis.svg.select(".x-axis").call(vis.xAxis.ticks(3));
    vis.svg.select(".y-axis").call(vis.yAxis)

    //update x-axis title
    var xAxisTitle = d3.select(".x-axis-label")
        .text(labelMap[vis.currentDomain]);

    // console.log(labelMap[vis.currentDomain])
}

AreaTimeline.prototype.onCountryClicked = function(clickedCountry, currentDomain) {
    this.wrangleData(currentDomain, clickedCountry)
}
