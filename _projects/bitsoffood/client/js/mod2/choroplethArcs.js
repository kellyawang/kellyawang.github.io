// Donut chart reference: https://www.d3-graph-gallery.com/graph/donut_basic.html
// Donut interaction reference: https://jonsadka.com/blog/how-to-create-adaptive-pie-charts-with-transitions-in-d3
// Donut interaction reference 2: http://bl.ocks.org/mbostock/5100636

let constantsMap = {
    'Annual population': {
        solidColor: darkPink,
        colorScale: pinks8,
        units: "People"
    },
    'Agriculture Total': {
        solidColor: darkOrange,
        colorScale: oranges8,
        units: "Gigagrams"
    },
    'Crops and livestock products': {
        solidColor: darkPurple,
        colorScale: purples6,
        units: "USD"
    },
    'Food Balance Sheets': {
        solidColor: darkGreen,
        colorScale: greens8,
        units: "Tonnes"
    },
    'Total Population - Both sexes': 'Total Population',
    'Total Population - Male': 'Male',
    'Total Population - Female': 'Female',
    'Enteric Fermentation': 'Methane Gas From Ruminants',
    'Agricult.Products, Total': 'Agricultural Exports',
}

ChoroplethArcs = function(_parentElement, _data, _dataByCountryName,_eventHandler) {
    this.svg = _parentElement;
    this.data = _data; //compiledData

    this.eventHandler = _eventHandler;

    this.initVis();
}


ChoroplethArcs.prototype.initVis = function() {

    let vis = this;

    /* Init options */
    vis.currentDomain = 'Food Balance Sheets'
    vis.currentCountry = 'Africa'
    vis.currentYear = '2013'


    /* Init SVG */
    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = 700 - vis.margin.left - vis.margin.right;
    vis.height = 700 - vis.margin.top - vis.margin.bottom;
    vis.arcMargin = 40;

    vis.radius = Math.min(vis.width, vis.height) / 2 - vis.arcMargin

    // SVG drawing area
    vis.arcsGroup = vis.svg.append("g")
        .attr("class", "arcsGroup")
        .attr("transform", "translate(" + vis.width/2 + "," + vis.height/2 + ")");


    //create pie layout
    vis.pie = d3.pie()
        .value(function(d) {return d.value; })

    // arc generator
    vis.arc = d3.arc()
        .innerRadius(280)
        .outerRadius(300)
        .padAngle(1 * (Math.PI / 180));

    vis.wrangleData();
}

// Instead of interpolating attributes like color or position, we interpolate the entire dataspace
// Reference: https://github.com/d3/d3-interpolate#interpolateObject
ChoroplethArcs.prototype.arcTween = function(vis, newAngleData) {
    var interpolate = d3.interpolate(this._current, newAngleData);
    // update current with new data for next transition
    this._current = interpolate(0);

    return function(t) {
        return vis.arc(interpolate(t));
    };
}

ChoroplethArcs.prototype.wrangleData = function(selector = "Food Balance Sheets", currCountry = "Africa") {

    let vis = this;
    let hasItems;

    vis.currentDomain = selector;
    vis.currentCountry = currCountry

    let domain = vis.data.find(d => d.domain === vis.currentDomain)
    let country = domain.countries.find(c => c.country === vis.currentCountry) //changes on clicking choropleth
    let year = country.years.find(y => y.year === vis.currentYear)

    let itemData = year.items.filter(d => {
        if(vis.currentDomain === 'Agriculture Total') {
            // our data returns the total itself as one of the items. Filter it out to omit it from the donut
            return d.item !== 'Agriculture total'
        } else {
            return true
        }
    })

    // let elementData = {}
    // if (vis.currentDomain === 'Food Balance Sheets') elementData = year.totals

    vis.nestedData = d3.nest()
        .key(d => d.item)
        .rollup(d => {
            switch (vis.currentDomain) {
                case "Food Balance Sheets":
                    return d[0]['Production'] * 1000 || 0;
                case "Agriculture Total":
                    return Math.round(d[0]['Emissions (CO2eq)']) || 0;
                case "Crops and livestock products":
                    return d[0]['Export Value'] * 1000 || 0;
                default:
                    return 0;
            }
        })
        .entries(itemData)

    if (vis.currentDomain === 'Annual population') {
        let populationArray = [];
        let itemObject = year.items[0]
        for (const property in itemObject) {
            populationArray.push({
                key: property,
                value: itemObject[property] * 1000
            })
        }
        vis.nestedData = populationArray.slice(2,4)
    }


    // Update the visualization
    vis.updateVis();
}

ChoroplethArcs.prototype.updateVis = function() {
    var vis = this;

    /* Arc Tooltip */
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html(function(d) {
            let label = constantsMap[d.data.data.key] || d.data.data.key
            let value = d.data.data.value
            return `<span class="tooltip-title">${label}<br></span>
                <span>${commaFormat(value)} ${unitsMap[vis.currentDomain]}</span><br>`;
        });

    vis.svg.call(vis.tip);

    // Compute the position of each group on the pie:
    vis.pieData = vis.pie(vis.nestedData)

    var g = vis.arcsGroup

    // Build the pie chart
    var pieSelect = g.datum(vis.pieData).selectAll('.innerArcs')
        .data(vis.pie)

    var pieEnter = pieSelect.enter()
        .append('path')
        .attr('class', 'innerArcs')
        .attr("d", vis.arc)
        .each(function(d) {
            this._current = d;
        })
        .attr("stroke", "rgba(0, 0, 0, 0.75)")
        .style("fill", "rgba(0, 0, 0, 0.75)")
        .style("stroke-width", "1px")
        .style("opacity", 0.7)
        .on("mouseover", d => {
            vis.tip.show(d)
        })
        .on("mouseout", d => {
            vis.tip.hide(d)
        })

    pieSelect.transition().duration(1000)
        .attrTween("d", d => vis.arcTween(vis, d))

    pieSelect.merge(pieEnter)
        // .attr("fill", solidColorMap[vis.currentDomain])
        // .attr("stroke", solidColorMap[vis.currentDomain])
        .attr("stroke", "rgba(0, 0, 0, 0.75)")
        .style("fill", "rgba(0, 0, 0, 0.75)")
        .each(function(d) {
            this._current = d;
        })

    pieSelect.exit().remove();

    // vis.svg.selectAll('.outerArcs')
    //     .data(data_ready)
    //     .enter()
    //     .append('path')
    //     .attr('d', d3.arc()
    //         .innerRadius(100)         // This is the size of the donut hole
    //         .outerRadius(radius)
    //     )
    //     .attr('fill', function(d){ return(vis.colorScale(d.data.key)) })
    //     .attr("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .style("opacity", 0.7)

}

ChoroplethArcs.prototype.onCountryClicked = function(clickedCountry) {
    this.wrangleData(this.currentDomain, clickedCountry)
}