
var labelMap = {
    'Annual population': "Annual Population (People)",
    'Agriculture Total': "Agricultural Emissions (Gigagrams)",
    'Crops and livestock products': "Agricultural Exports (USD)",
    'Food Balance Sheets': "Food Production (Tonnes)",
}
var t = d3.transition().duration(200);


ChoroplethVis = function(_parentElement, _data, _topojson, _eventHandler) { // _countryData
    this.parentElement = _parentElement;
    this.data = _data; // compiledData
    this.topojson = _topojson;
    this.eventHandler = _eventHandler;
    this.dataByCountryName = {};

    this.LEGEND_Y = 50
    this.LEGEND_X = 10
    this.LEGEND_WIDTH = 20
    this.LEGEND_HEIGHT = 20

    this.initVis();
}


ChoroplethVis.prototype.initVis = function() {

    let vis = this;

    /* Init options */
    // store state of country clicked
    vis.countrySelected = false;
    vis.currentDomain = 'Food Balance Sheets'
    vis.currentCountry = 'Africa'
    vis.currentYear = "2013"

    // Convert TopoJSON to GeoJSON
    vis.topoData = topojson.feature(vis.topojson, vis.topojson.objects.collection).features


    /* Init flattened totals data */
    vis.choropleth_flattened = []

    vis.data.forEach(dd => {
        dd.countries.forEach(c => {
            var currentYearObj = c.years.find(d => d.year === vis.currentYear)

            // NOTE: we are transforming the values here to make them more human reaadable.
            // If you change the convention here, you must also update the legend and the arcs in ChoroplethArcs.prototype.wrangleData
            if (currentYearObj && vis.topoData.find(d => (d.properties.region_un === 'Africa' && d.properties.adm0_a3_is === c.iso_a3))) {
                var value;
                if(dd.domain === 'Annual population') {
                    value = currentYearObj.items[0]['Total Population - Both sexes'] * 1000
                } else if (dd.domain === 'Agriculture Total') {
                    var item = currentYearObj.items.find(d => d.item === 'Agriculture total')
                    value = Math.round(item['Emissions (CO2eq)'])
                } else if (dd.domain === 'Crops and livestock products') {
                    value = currentYearObj.items[0]['Export Value'] * 1000
                } else if (dd.domain === 'Food Balance Sheets') {
                    value = currentYearObj.totals['Production'] * 1000
                }
                if (value) {
                    vis.choropleth_flattened.push({ domain: dd.domain, country: c.country, total: value, iso_a3: c.iso_a3})
                }
            }
        })
    })




    /* Init dataByCountryName: here we further process choropleth_flattened by country name */
    // also add ISO code to data by country name
    vis.choropleth_flattened.forEach(e => {
        if (!vis.dataByCountryName[e.iso_a3]) {
            // if country data hasn't been added to dataByCountryName yet, initialize it
            vis.dataByCountryName[e.iso_a3] = { country: e.country, [`total_${e.domain}`]: e.total }
        } else {
            // otherwise add the totals to the existing object
            let countryData = vis.dataByCountryName[e.iso_a3]
            countryData[`total_${e.domain}`] = e.total
            vis.dataByCountryName[e.iso_a3] = countryData
        }
    })


    /* Init SVG */
    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = 700 - vis.margin.left - vis.margin.right;
    vis.height = 700 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // // draw arcs first so choropleth can go on top
    vis.arcs = new ChoroplethArcs(vis.svg, vis.data, vis.dataByCountryName, vis.eventHandler)

    vis.svg.append("g")
        .attr("class", "mapGroup")

    vis.svg.append("g")
        .attr("class", "legend-axis-group")

    // color map legend
    vis.legend = d3.select("#choroplethLegend").append("svg")
        .attr("width", 300 + vis.margin.left + vis.margin.right)
        .attr("height", 300 + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.legend.append("g")
        .attr("class", "legendGroup")

    vis.legend.append("text")
        .attr("class", "legend-title")
        .attr("x", 0)
        .attr("y", vis.LEGEND_Y - vis.LEGEND_HEIGHT)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text("Population")

    // extra square and label for no data
    vis.legend.append("rect")
        .attr("class", "legend-rect")
        .attr("id", "no-data")
        .attr("x", 0)
        .attr("y", vis.LEGEND_Y + vis.LEGEND_HEIGHT - 15)
        // .attr("cx", 10)
        // .attr("cy", vis.LEGEND_Y + vis.LEGEND_HEIGHT - 5)
        .attr("width", vis.LEGEND_WIDTH)
        .attr("height", vis.LEGEND_HEIGHT)
        // .attr("r", 8)

    vis.legend.append("text")
        .attr("class", "legend-label")
        .attr("x", vis.LEGEND_X + vis.LEGEND_WIDTH + 3)
        .attr("y", vis.LEGEND_Y + vis.LEGEND_HEIGHT)
        .text("No data")

    // https://github.com/d3/d3-scale/blob/master/README.md#quantize-scales
    vis.qScale = d3.scaleQuantize()
        .range(colorScaleMap[vis.currentDomain])

    // vis.qScale().map(x => Math.round(x));
    // clr.quantiles().map(x => Math.round(x));

    vis.wrangleData();
}


ChoroplethVis.prototype.wrangleData = function(selector = "Food Balance Sheets") {

    let vis = this;
    vis.currentDomain = selector;
    vis.countrySelected = false;
    vis.currentCountry = "Africa"

    // Update the arcs
    vis.arcs.wrangleData(selector);

    // Update the choropleth
    vis.updateVis();
}


ChoroplethVis.prototype.updateVis = function() {
    var vis = this;

    // TODO: using the correct domain here?
    vis.qScale.domain([
        d3.min(vis.choropleth_flattened, d => {
            if (d.domain == vis.currentDomain) {
                return d.total;
            }
        }),
        d3.max(vis.choropleth_flattened, d => {
            if (d.domain == vis.currentDomain) {
                return d.total;
            }
        })
    ]);

    vis.qScale.range(colorScaleMap[vis.currentDomain])

    /* ChoroplethVis implementation */
    // create mercator projection
    var projection = d3.geoMercator()
        .scale([310])
        .translate([250, 390])

    // Create geo path generator, d3.geoPath, and specify a projection for it to use.
    // projection algorithm determines how 3D space is projected onto 2D space
    var path = d3.geoPath()
        .projection(projection);

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html(function(d) {
            let name = d.properties.name_long
            let iso = d.properties.adm0_a3_is
            // let countryData = vis.dataByCountryName[name]
            let countryData = vis.dataByCountryName[iso]
            let key = `total_${vis.currentDomain}`
            if (countryData && countryData[key]) {
                return `<span class="tooltip-title">${countryData.country}<br></span>
                   <span>${commaFormat(countryData[key])} ${unitsMap[vis.currentDomain]}</span><br>`;
            } else {
                return `<span class="tooltip-title">${name}</span>
                        <span>No Data</span>`;
            }
        });

    vis.svg.call(vis.tip);




    // Render the U.S. by using the path generator
    // Bind data and create one path per TopoJSON feature
    var mapGroup = d3.select(".mapGroup").selectAll("path")
        .data(vis.topoData, k => {
            return k.properties.gu_a3
        })

    mapGroup.exit().remove()
    var mapEnter = mapGroup.enter()
        .append("path")
        .attr("class", "map-paths")
        .attr("d", path)
        .on("mouseover", function(d) {
            let name = d.properties.name_long
            let iso = d.properties.adm0_a3_is
            let countryData = vis.dataByCountryName[iso]

            vis.tip.show(d)
            // Append country to top
            this.parentNode.appendChild(this);
            d3.select(this)
                .style("stroke-width", "3")

        })
        .on("mouseout", function(d) {
            let name = d.properties.name_long
            let iso = d.properties.adm0_a3_is

            vis.tip.hide(d)
            d3.select(this)
                .style("stroke-width", "0.5")

        })
        .on("click", function(d) {
            // if country click is active; else country click not active
            // countrySelected && countrySelected !== countryData.country
            if (vis.countrySelected) {
                //unclick country
                vis.countrySelected = false
                vis.currentCountry = "Africa"
                d3.selectAll(".map-paths")
                    .transition(t)
                    .style("opacity", 1)
            } else {
                //click country
                vis.countrySelected = true

                let iso = d.properties.adm0_a3_is

                let countryData = vis.dataByCountryName[iso]
                var countryName = countryData.country
                vis.currentCountry = countryName

                d3.selectAll(".map-paths")
                    .transition(t)
                    .style("opacity", .3)
                d3.select(this)
                    .transition(t)
                    .style("opacity", 1)
            }
            $(vis.eventHandler).trigger("countryClicked", [vis.currentCountry, vis.currentDomain]);
        })

    // Update map on change
    mapGroup.merge(mapEnter)
        .transition(t)
        .style("fill", function(d) {

            let name = d.properties.name_long
            let iso = d.properties.adm0_a3_is

            if (vis.dataByCountryName[iso]) {
                if(isNaN(vis.dataByCountryName[iso][`total_${vis.currentDomain}`])) {
                    return "#BCBCBC"
                } else {
                    return vis.qScale(vis.dataByCountryName[iso][`total_${vis.currentDomain}`])
                }
            }
            return "#BCBCBC"
        })

    // Draw color legend squares
    var legendGroup = d3.select(".legendGroup").selectAll("rect")
        .data(vis.qScale.range())

        legendGroup.exit().remove()
        var legendEnter = legendGroup.enter()
            .append("rect")
            .attr("class", "legend-rect")
            .attr("x", 0)
            .attr("y", function(d, i) { return vis.LEGEND_Y + i * vis.LEGEND_HEIGHT + 25 }) //vis.LEGEND_Y + i * vis.LEGEND_HEIGHT + 25
            .attr("width", vis.LEGEND_WIDTH)
            .attr("height", vis.LEGEND_HEIGHT)

        legendGroup.merge(legendEnter)
            .transition(t)
            .style("fill", d => d)

        // Draw color legend labels
        var legendLabels = d3.select(".legendGroup").selectAll(".legend-label")
            .data(vis.qScale.range())

        legendLabels.exit().remove()
        var legendLabelEnter = legendLabels.enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", vis.LEGEND_X + vis.LEGEND_WIDTH + 3)
            .attr("y", function(d, i) { return vis.LEGEND_Y + i * vis.LEGEND_HEIGHT + 40 }) //vis.LEGEND_Y + i * vis.LEGEND_HEIGHT + 40
            .text(function(d) {
                var extent = vis.qScale.invertExtent(d)
                // round the value given by the scale, and then format it with commas every thousand
                return `< ${commaFormat(Math.round(extent[1]))}`

            })

        legendLabels.merge(legendLabelEnter)
            .transition(t)
            .text(function(d) {
                var extent = vis.qScale.invertExtent(d)
                let label = (vis.currentDomain === 'Crops and livestock products' || vis.currentDomain === 'Annual population') ?
                    `< ${billionFormat(Math.round(extent[1])).replace(/G/,"B")}` :
                    `< ${commaFormat(Math.round(extent[1]))}`
                return label

            })

        var legendTitle = d3.select(".legend-title")
            .text(labelMap[vis.currentDomain])

}

ChoroplethVis.prototype.onCountryClicked = function(clickedCountry) {
    this.arcs.onCountryClicked(clickedCountry)
}

