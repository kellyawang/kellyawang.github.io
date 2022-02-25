'use strict';

// IIFE
// (() => {

// Config svg
const mod1_svgW = 1400;
const mod1_svgH = 650;

// Append svg
const mod1_svg = d3.select('#mainVis')
    .append('svg')
    .attr('width', mod1_svgW)
    .attr('height', mod1_svgH);

/* `````````````````````````````````\```````````````````````\
    Class: Mod1Main                 |                       |
 ``````````````````````````````````/``````````````````````*/
class Mod1Main {

    // Constructor
    constructor(_dataA, _dataB, _numRings) {
        // Fields
        this.dataA = _dataA;
        this.dataB = _dataB;
        this.numRings = _numRings;
        // Parse, then init
        this.parseData().then(() => {
            this.initVis()
        }).catch(err => console.error(err));
    }

    /*
     Function parseVis()
        + Adjusts string to numbers
        + Extracts element value and unit for consistent implementation
     */
    async parseData() {

        // Define this vis
        const vis = this;

        // Call
        forEachData(vis.dataA);
        forEachData(vis.dataB);
        vis.dataA = [vis.dataA];
        vis.dataB = [vis.dataB];

        /* function forEachData() */

        function forEachData(vData) {

            // Create vis.dataIds
            vis.dataIds = [];

            // Parse dataS
            for (let key in vData) {
                // Check
                if (vData.hasOwnProperty(key)) {
                    // Add key to dataIds
                    vis.dataIds.push(key);
                    // Parse
                    if (key === 'emissions') {
                        vData[key].forEach((y, i) => {
                            y.year = +y.year;
                            y.extract = +y.items[0]['Emissions (CO2eq)'];
                            y.unit = y.items[0]['Emissions (CO2eq)_unit'];
                            if (i !== 0) {
                                const change = (y.items[0]['Emissions (CO2eq)'] -
                                    vData[key][i - 1].items[0]['Emissions (CO2eq)']) /
                                    vData[key][i - 1].items[0]['Emissions (CO2eq)'];
                                y.change = (+change * 100).toFixed(2);
                            }
                        });
                    } else if (key === 'fBS') {
                        vData[key].forEach((y, i) => {
                            y.year = +y.year;
                            y.extract = +y.totals['Production'];
                            y.unit = '1000 tonnes';
                            if (i !== 0) {
                                const change = (y.items[0]['Production'] -
                                    vData[key][i - 1].items[0]['Production']) /
                                    vData[key][i - 1].items[0]['Production'];
                                y.change = (+change * 100).toFixed(2);
                            }
                        });
                    } else if (key === 'pop') {
                        vData[key].forEach((y, i) => {
                            y.year = +y.year;
                            y.extract = +y.items[0]['Total Population - Both sexes'];
                            y.unit = y.items[0]['Total Population - Both sexes_unit'];
                            if (i !== 0) {
                                const change = (y.items[0]['Total Population - Both sexes'] -
                                    vData[key][i - 1].items[0]['Total Population - Both sexes']) /
                                    vData[key][i - 1].items[0]['Total Population - Both sexes'];
                                y.change = (+change * 100).toFixed(2);
                            }
                        });
                    } else if (key === 'value') {
                        vData[key].forEach((y, i) => {
                            y.year = +y.year;
                            y.extract = +y.items[0]['Export Value'];
                            y.unit = y.items[0]['Export Value_unit'] || 'ref. key';
                            if (i !== 0) {
                                const change = (y.items[0]['Export Value'] -
                                    vData[key][i - 1].items[0]['Export Value']) /
                                    vData[key][i - 1].items[0]['Export Value'];
                                y.change = (+change * 100).toFixed(2);
                            }
                        });
                    }
                }
            }
        }
    }

    /*
     Function initVis()
     */
    initVis() {

        // ``````````````````````````````````````````````````````````````````````````````````````````````` Container

        // Define this vis
        const vis = this;

        // Config g
        vis.gMargin = {top: 0, right: (mod1_svgW - mod1_svgH) / 2, bottom: 0, left: (mod1_svgW - mod1_svgH) / 2};
        vis.gW = mod1_svgW - (vis.gMargin.left + vis.gMargin.right);
        vis.gH = mod1_svgH - (vis.gMargin.top + vis.gMargin.bottom);

        // Append g
        vis.g = mod1_svg.append('g')
            .attr('class', 'containerG')
            .style('transform', `translate(${vis.gMargin.left}px, ${vis.gMargin.top}px)`);

        // ``````````````````````````````````````````````````````````````````````````````````````````````````` Setup

        // Append mainG
        vis.mainG = vis.g.append('g')
            .attr('class', 'mainG')
            .style('transform', () => `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Config main features
        vis.mainAngle = 305;
        vis.mainRad = vis.gW / 2 * 0.85;
        vis.mainLineInt = Math.round(vis.mainRad * 0.3);
        vis.mainGraphInt = Math.round(vis.mainRad * 0.3);
        vis.mainLineExt = Math.round(vis.mainRad * 1);
        vis.mainGraphExt = Math.round(vis.mainLineExt * 0.975);

        // Set yearData
        vis.yearData = [];
        for (let i = 0; i < vis.dataA[0].pop.length; i++) {
            vis.yearData.push({year: vis.dataA[0].pop[0].year + i});
        }
        vis.yearMin = d3.min(vis.yearData, d => d.year);
        vis.yearMax = d3.max(vis.yearData, d => d.year);
        vis.botSelYear = vis.yearMax;
        vis.topSelYear = vis.yearMax;

        // Define axisAngleScale
        vis.angleScale = d3.scaleLinear()
            .range([180 - ((360 + vis.mainAngle) / 2), -180 + ((360 + vis.mainAngle) / 2)]);

        // Define xScale
        vis.xScale = d3.scaleLinear()
            .range([
                ((360 - (360 + vis.mainAngle) / 2) / 360) * (2 * Math.PI),
                (((360 + vis.mainAngle) / 2) / 360) * (2 * Math.PI)]);

        // Define yScale
        vis.yScale = d3.scaleLinear();

        // Define labelScale
        vis.labelScale = d3.scaleLinear()
            .domain([0, 1])
            .range([
                (2 * Math.PI * (1 - (360 - vis.mainAngle) / 720)),
                (2 * Math.PI * (1 + (360 - vis.mainAngle) / 720))
            ]);

        // Define labelMaker
        vis.labelMaker = d3.arc()
            .startAngle(vis.labelScale(0))
            .endAngle(vis.labelScale(1));

        // Define keyScale
        vis.keyScale = d3.scaleLinear()
            .domain([0, 2])
            .range([
                (2 * Math.PI * (1 - (360 - vis.mainAngle) / 2160)),
                (2 * Math.PI * (1 + (360 - vis.mainAngle) / 2160))
            ]);

        // Define keyMaker
        vis.keyMaker = d3.arc();

        // Define colorScale
        vis.colorScale = d3.scaleOrdinal()
            .domain([0, 1, 2, 3, 4, 5, 6, 7])
            .range([
                'rgb(250,92,0)', 'rgb(235,14,68)', 'rgb(114,191,0)', 'rgb(111,111,196)',
                'rgb(160,77,0)', 'rgb(165,14,50)', 'rgb(60,121,0)', 'rgb(58,58,116)',
            ]);

        // Define arcMaker
        vis.arcMaker = d3.arc();

        // Define Zoom
        vis.ioSteps = vis.numRings * 3;
        vis.zoom = false;
        vis.focus = vis.numRings;

        // Define areaMaker
        vis.areaMaker = d3.areaRadial()
            .curve(d3.curveLinearClosed);

        // Define lineMaker
        vis.lineMaker = d3.lineRadial()
            .curve(d3.curveLinearClosed)
            .defined(d => !isNaN(d.change));

        // Define vis mode ('area' or 'line')
        vis.mode = 'area';

        // Define vis filterOut
        vis.filterOut = [];

        // Define extAngleScale
        vis.extAngleScale = d3.scaleLinear()
            .domain([0, 4]);

        // Config ext
        vis.extRad = vis.mainRad * 1.2;
        vis.extBubbleRad = vis.mainRad / 35;

        // Define extRadiusScale
        vis.extRadiusScale = d3.scaleSqrt()
            .range([0, vis.extBubbleRad]);

        // ````````````````````````````````````````````````````````````````````````````````````````````` Append to g

        // Draw burstAxisG (x-axis equivalent)
        vis.burstAxisG = vis.mainG.append('g')
            .attr('class', 'burstAxisG');

        // Append arcAxisG (y-axis equiv)
        vis.arcAxisG = vis.mainG.append('g')
            .attr('class', 'arcAxisG');

        // Append areaG
        vis.areaG = vis.mainG.append('g')
            .attr('class', 'areaG');

        // Append lineG
        vis.lineG = vis.mainG.append('g')
            .attr('class', 'lineG');

        // Append extG
        vis.extG = vis.g.append('g')
            .attr('class', 'extG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Append buttonG
        vis.buttonG = vis.g.append('g')
            .attr('class', 'buttonG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        //""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" Perform once

        // Build legend
        vis.keyLegend = vis.arcAxisG.append('g')
            .attr('class', 'keyLegendG');
        vis.keyMaker
            .startAngle(vis.keyScale(1))
            .endAngle(vis.keyScale(2))
            .innerRadius(vis.mainRad * 1.1 - 1.5)
            .outerRadius(vis.mainRad * 1.1 + 1.5);
        vis.keyLegend.append('path')
            .attr('class', 'worldKey')
            .attr('d', vis.keyMaker)
            .attr('fill', 'rgb(188, 138, 130)');
        vis.keyMaker
            .startAngle(vis.keyScale(0))
            .endAngle(vis.keyScale(1));
        vis.keyLegend.append('path')
            .attr('class', 'africaKey')
            .attr('d', vis.keyMaker)
            .attr('fill', 'rgb(113, 83, 78)');
        vis.keyMaker
            .startAngle(vis.keyScale(1.5))
            .endAngle(vis.keyScale(2.5))
            .innerRadius(vis.mainRad * 1.05)
            .outerRadius(vis.mainRad * 1.05);
        vis.keyLegend.append('path')
            .attr('id', 'worldKeyTag')
            .attr('d', vis.keyMaker)
            .attr('fill', 'transparent');
        vis.keyLegend.append('text')
            .append('textPath')
            .attr('class', 'legendArcTextPath')
            .attr('xlink:href', `#worldKeyTag`)
            .attr('startOffset', '25%')
            .text('World');
        vis.keyMaker
            .startAngle(vis.keyScale(-0.5))
            .endAngle(vis.keyScale(0.5));
        vis.keyLegend.append('path')
            .attr('id', 'africaKeyTag')
            .attr('d', vis.keyMaker)
            .attr('fill', 'transparent');
        vis.keyLegend.append('text')
            .append('textPath')
            .attr('class', 'legendArcTextPath')
            .attr('xlink:href', `#africaKeyTag`)
            .attr('startOffset', '25%')
            .text('Africa');

        //""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" NEXT
        vis.wrangleVis();
    }

    /*
     Function wrangleVis()
     */
    wrangleVis() {

        // Define this vis
        const vis = this;

        // ````````````````````````````````````````````````````````````````````````````````````````````` Data Filter

        // Ring sizes
        vis.smRing = 1;
        vis.mdRing = vis.ioSteps / vis.numRings;
        vis.lgRing = vis.ioSteps * ((vis.numRings - 1) / vis.numRings);

        // Init prevRadius as counter
        let prevRadius = vis.mainGraphInt;

        // Clear radiiData
        vis.radiiData = [];
        vis.bubbleData = [];

        // Iterate and update
        for (let i = 0; i < vis.numRings; i++) {
            // Init inner and outer radius
            const innerRadius = prevRadius;
            let outerRadius = prevRadius + ((vis.mainGraphExt - vis.mainGraphInt) * (vis.mdRing / vis.ioSteps));
            let ringSize = vis.mdRing;
            // If not / if zoomed
            if (vis.zoom) {
                if (i === vis.focus) {
                    outerRadius = prevRadius + ((vis.mainGraphExt - vis.mainGraphInt) * (vis.lgRing / vis.ioSteps));
                    ringSize = vis.lgRing;
                } else {
                    outerRadius = prevRadius + ((vis.mainGraphExt - vis.mainGraphInt) * (vis.smRing / vis.ioSteps));
                    ringSize = vis.smRing;
                }
            }
            // Define radii data entry
            vis.radiiData.push({
                index: i,
                innerRadius: Math.round(innerRadius),
                outerRadius: Math.round(outerRadius),
                domain: vis.dataIds[i],
                ringSize: ringSize
            });
            prevRadius = outerRadius;
            // Define bubble data entry
            vis.bubbleData.push({
                index: i,
                domain: vis.dataIds[i],
                domainLookupMaxA: vis.dataA[0][vis.dataIds[i]].find(d => d.year === vis.yearMax),
                domainLookupMaxB: vis.dataB[0][vis.dataIds[i]].find(d => d.year === vis.yearMax),
                domainLookupTopA: vis.dataA[0][vis.dataIds[i]].find(d => d.year === vis.topSelYear),
                domainLookupTopB: vis.dataB[0][vis.dataIds[i]].find(d => d.year === vis.topSelYear),
                domainLookupMinA: vis.dataA[0][vis.dataIds[i]].find(d => d.year === vis.yearMin),
                domainLookupMinB: vis.dataB[0][vis.dataIds[i]].find(d => d.year === vis.yearMin)
            })
        }

        if (vis.mode === 'area') {
            // Sort bubbleData
            vis.bubbleData.sort((a, b) => {
                const aQ = a.domainLookupTopB.extract / a.domainLookupTopA.extract;
                const bQ = b.domainLookupTopB.extract / b.domainLookupTopA.extract;
                return bQ - aQ;
            });
        } else {
            // Sort bubbleData
            vis.bubbleData.sort((a, b) => {
                const aQ = a.domainLookupTopB.change / a.domainLookupTopA.change;
                const bQ = b.domainLookupTopB.change / b.domainLookupTopA.change;
                return bQ - aQ;
            });
        }

        // Add legend
        vis.bubbleData.unshift({
            index: 10,
            domain: 'legend',
            domainLookupMaxA: {extract: 1, change: 1},
            domainLookupMaxB: {extract: 1, change: 1},
            domainLookupTopA: {extract: 4, change: 4},
            domainLookupTopB: {extract: 1, change: 1},
            domainLookupMinA: {extract: 1, change: 1},
            domainLookupMinB: {extract: 0.25, change: 0.25}
        });


        // `````````````````````````````````````````````````````````````````````````````````````````````````` Filter

        // If mode
        if (vis.mode === 'area') {
            vis.radiiDataDisplay = vis.radiiData;
            vis.linesDataDisplay = [];
        } else if (vis.mode === 'line') {
            vis.radiiDataDisplay = [];
            vis.linesDataDisplay = vis.radiiData;
        }

        // Filter displayData
        vis.dataDisplayA = vis.dataA.filter((d, i) => {
            d[vis.radiiData[i].domain].filter(d => d.year >= vis.yearMin && d.year <= vis.yearMax);
            return d;
        });
        vis.dataDisplayB = vis.dataB.filter((d, i) => {
            d[vis.radiiData[i].domain].filter(d => d.year >= vis.yearMin && d.year <= vis.yearMax);
            return d;
        });

        // Filter display data if in line mode
        if (vis.mode === 'line') {
            vis.linesDataDisplay = vis.linesDataDisplay.filter(d => {
                let found = false;
                vis.filterOut.forEach(filter => {
                    if (filter === d.domain) {
                        found = true;
                    }
                });
                if (!found) {
                    return d;
                }
            });
        }

        // Define yearDataDisplay
        vis.yearDataDisplay = vis.yearData.filter(d => d.year >= vis.yearMin && d.year <= vis.yearMax);

        //""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" NEXT
        vis.updateVis();

    }

    /*
     Function updateVis()
     */
    updateVis() {

        // Define this vis
        const vis = this;

        //""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" NEXT
        // Build other charts
        vis.buildBurstAxis();
        vis.buildArcAxis();
        vis.buildAreaCharts();
        vis.buildLineCharts();
        vis.buildExtCharts();
        vis.buildToggleTool();

    }

    /*
     Function buildBurstCharts()
     */
    buildBurstAxis() {

        // Define this vis
        const vis = this;

        // Update scales
        vis.angleScale
            .domain(d3.extent(vis.yearDataDisplay, d => d.year));
        vis.xScale
            .domain(d3.extent(vis.yearDataDisplay, d => d.year));

        // `````````````````````````````````````````````````````````````````````````````````````````````` Enter axes

        // Build burstGs
        vis.burstGs = vis.burstAxisG
            .selectAll('.burstG')
            .data(vis.yearDataDisplay, d => d.year)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'burstG')
                    .style('transform', (d) => {
                        return `rotate(${vis.angleScale(d.year)}deg)`;
                    }).each(function (d, i) {
                        // Define this
                        const burstG = d3.select(this);
                        // Append lines
                        burstG.append('line')
                            .attr('class', () => {
                                if (d.year % 5 === 0) {
                                    return 'burstLine burstLine5';
                                } else {
                                    return 'burstLine';
                                }
                            })
                            .attr('x1', 0)
                            .attr('y1', vis.mainLineInt)
                            .attr('x2', 0)
                            .attr('y2', () => {
                                if (d.year % 5 === 0) {
                                    return vis.mainLineExt;
                                } else {
                                    return Math.round(vis.mainLineExt * 1.01);
                                }
                            });
                        // Append labels
                        burstG.each(function () {
                            if (d.year % 5 === 0) {
                                const labelG = d3.select(this).append('g')
                                    .attr('class', 'labelG')
                                    .style('transform', `translateY(${vis.mainLineExt * 1.04}px)`);
                                labelG.append('text')
                                    .attr('class', 'burstLabel visBurstLabel')
                                    .style('transform', () => {
                                        if (vis.angleScale(d.year) >= 90 || vis.angleScale(d.year) <= -90) {
                                            return 'rotate(180deg)';
                                        }
                                    })
                                    .text(d.year);
                                labelG.append('rect')
                                    .attr('class', 'fiverBox')
                                    .attr('x', -vis.mainRad * 0.1 / 2)
                                    .attr('y', vis.mainRad * 0.05)
                                    .attr('width', vis.mainRad * 0.1)
                                    .attr('height', vis.mainRad * 0.03);
                            } else {
                                const circG = d3.select(this).append('g')
                                    .attr('class', 'circLabels')
                                    .style('transform', `translateY(${vis.mainLineExt * 1.04}px)`);
                                circG.append('circle')
                                    .attr('class', 'triggerCirc')
                                    .attr('r', vis.mainRad * 0.05)
                                    .attr('fill', 'transparent');
                                circG.append('circle')
                                    .attr('class', 'invisBurstCirc burstCirc')
                                    .attr('r', vis.mainRad * 0.025);
                                circG.append('circle')
                                    .attr('class', 'visBurstCirc burstCirc')
                                    .attr('r', vis.mainRad * 0.005);
                                circG.append('text')
                                    .attr('class', 'burstLabel invisBurstLabel')
                                    .classed('visInvisBurstLabel', false)
                                    .style('transform', () => {
                                        if (vis.angleScale(d.year) >= 90 || vis.angleScale(d.year) <= -90) {
                                            return `rotate(180deg) translateY(${-vis.mainLineExt * 0.06}px)`
                                        } else {
                                            return `translateY(${vis.mainLineExt * 0.06}px)`
                                        }
                                    })
                                    .text(d.year);
                            }
                        });
                    }),
                // UPDATE
                update => update
                    .style('transform', (d) => {
                        return `rotate(${vis.angleScale(d.year)}deg)`;
                    }).each(function (d, i) {
                        // Define this
                        const burstG = d3.select(this)
                            .transition();
                        // Append lines
                        burstG.select('.burstLine')
                            .transition()
                            .attr('class', function () {
                                if (d.year % 5 === 0) {
                                    if (d3.select(this).attr('class') === 'burstLine burstLine5 strongBurstLine') {
                                        return 'burstLine burstLine5 strongBurstLine';
                                    } else {
                                        return 'burstLine burstLine5';
                                    }
                                } else {
                                    if (d3.select(this).attr('class') === 'burstLine strongBurstLine') {
                                        return 'burstLine strongBurstLine';
                                    } else {
                                        return 'burstLine';
                                    }
                                }
                            })
                            .attr('x1', 0)
                            .attr('y1', vis.mainLineInt)
                            .attr('x2', 0)
                            .attr('y2', () => {
                                if (d.year % 5 === 0) {
                                    return vis.mainLineExt;
                                } else {
                                    return Math.round(vis.mainLineExt * 1.01);
                                }
                            });
                        // Append labels
                        burstG.each(function () {
                            if (d.year % 5 === 0) {
                                const labelG = d3.select(this).select('.labelG')
                                    .style('transform', `translateY(${vis.mainLineExt * 1.04}px)`);
                                labelG.select('.visBurstLabel')
                                    .style('transform', () => {
                                        if (vis.angleScale(d.year) >= 90 || vis.angleScale(d.year) <= -90) {
                                            return 'rotate(180deg)';
                                        }
                                    })
                                    .text(d.year);
                                labelG.select('.fiverBox')
                                    .attr('x', -vis.mainRad * 0.1 / 2)
                                    .attr('y', vis.mainRad * 0.05)
                                    .attr('width', vis.mainRad * 0.1)
                                    .attr('height', vis.mainRad * 0.03);
                            } else {
                                const circG = d3.select(this).select('g')
                                    .style('transform', `translateY(${vis.mainLineExt * 1.04}px)`);
                                circG.select('.triggerCirc')
                                    .attr('r', vis.mainRad * 0.05);
                                circG.select('.invisBurstCirc')
                                    .attr('r', vis.mainRad * 0.025);
                                circG.select('.visBurstCirc')
                                    .attr('r', vis.mainRad * 0.005);
                                circG.select('text')
                                    .classed('invisBurstLabel', true)
                                    .style('transform', () => {
                                        if (vis.angleScale(d.year) >= 90 || vis.angleScale(d.year) <= -90) {
                                            return `rotate(180deg) translateY(${-vis.mainLineExt * 0.06}px)`
                                        } else {
                                            return `translateY(${vis.mainLineExt * 0.06}px)`
                                        }
                                    })
                                    .text(d.year);
                            }
                        });
                    }),
                // EXIT
                exit => exit.remove()
            );

        // Add events
        vis.burstGs.on('mouseover', function (e) {

            // Undo circ Labels
            d3.select('.visInvisBurstCirc')
                .classed('visInvisBurstCirc', false);
            d3.select('.invisVisBurstCirc')
                .classed('invisVisBurstCirc', false);
            d3.select('.visInvisBurstLabel')
                .classed('visInvisBurstLabel', false);
            d3.select('.superVisBurstLabel')
                .classed('superVisBurstLabel', false);
            d3.select('.selFiverBox')
                .classed('selFiverBox', false);
            d3.select('.strongBurstLine')
                .classed('strongBurstLine', false);

            // Define this
            const burstG = d3.select(this);

            // Update circ Labels
            const circLabels = burstG.select('.circLabels');
            circLabels.select('.invisBurstCirc')
                .attr('r', vis.mainRad * 0.025)
                .classed('visInvisBurstCirc', true);
            circLabels.select('.visBurstCirc')
                .classed('invisVisBurstCirc', true);
            burstG.select('.invisBurstLabel')
                .classed('visInvisBurstLabel', true);
            burstG.select('.visBurstLabel')
                .classed('superVisBurstLabel', true);
            burstG.select('.fiverBox')
                .classed('selFiverBox', true);
            burstG.select('.burstLine')
                .classed('strongBurstLine', true);

            // Redefine hovYear
            vis.topSelYear = +e.year;
            vis.wrangleVis();
        });
    }

    /*
     Function buildAreaCharts()
     */
    buildArcAxis() {

        // Define this vis
        const vis = this;

        // Config arcMaker
        vis.arcMaker = vis.arcMaker
            .startAngle(vis.xScale(d3.min(vis.yearDataDisplay, d => d.year) - 0.5))
            .endAngle(vis.xScale(d3.max(vis.yearDataDisplay, d => d.year) + 0.5));

        // Build arcGs
        vis.arcGs = vis.arcAxisG
            .selectAll('.arcG')
            .data(vis.radiiData, d => d.index)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'arcG')
                    .each(function (d, i) {
                        // Define this
                        const arcG = d3.select(this);
                        // Update arcMaker
                        vis.arcMaker = vis.arcMaker
                            .innerRadius(d.innerRadius - 0.5)
                            .outerRadius(d.innerRadius);
                        // Append inner ring arc
                        arcG.append('path')
                            .attr('d', vis.arcMaker)
                            .attr('class', 'arcPath arcPathInner');
                        // If last ring
                        if (i === vis.numRings - 1) {
                            vis.arcMaker
                                .innerRadius(d.outerRadius - 0.5)
                                .outerRadius(d.outerRadius);
                            // Append outer ring arc
                            arcG.append('path')
                                .attr('d', vis.arcMaker)
                                .attr('class', () => 'arcPath arcPathOuter');
                        }
                        // Set separator
                        const separator = Math.round(vis.mainRad * 0.02);
                        // Update labelScale
                        vis.labelMaker
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 - separator / 4)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 - separator / 4);
                        arcG.append('path')
                            .attr('id', `labelArc${i}`)
                            .attr('class', 'labelArc')
                            .attr('d', vis.labelMaker)
                            .attr('fill', 'rgba(0, 0, 0, 0.2)');
                        // Add label
                        arcG.append('text')
                            .attr('class', 'labelArcText')
                            .attr('x', 0)
                            .append('textPath')
                            .attr('class', 'labelArcTextPath')
                            .attr('xlink:href', `#labelArc${i}`)
                            .attr('startOffset', '25%')
                            .text(() => {
                                if (d.domain === 'emissions') {
                                    return 'Emissions';
                                } else if (d.domain === 'pop') {
                                    return 'Population';
                                } else if (d.domain === 'fBS') {
                                    return 'Food Production';
                                } else if (d.domain === 'value') {
                                    return 'Agricultural Export Value';
                                }
                            });
                        // Update labelScale
                        vis.labelMaker
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 - separator * 2.5)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 - separator * 2.5);
                        arcG.append('path')
                            .attr('id', `unitArc${i}`)
                            .attr('class', 'unitArc')
                            .attr('d', vis.labelMaker)
                            .attr('fill', 'rgba(0, 0, 0, 0.2)');
                        // Add label
                        arcG.append('text')
                            .attr('class', 'unitArcText')
                            .attr('x', 0)
                            .append('textPath')
                            .attr('class', 'unitArcTextPath')
                            .attr('xlink:href', `#unitArc${i}`)
                            .attr('startOffset', '25%')
                            .text(() => {
                                if (d.domain === 'emissions') {
                                    return 'petagrams';
                                } else if (d.domain === 'pop') {
                                    return 'billions people';
                                } else if (d.domain === 'fBS') {
                                    return 'gigatonnes';
                                } else if (d.domain === 'value') {
                                    return 'billions usd';
                                }
                            });
                        // Draw keys
                        vis.keyMaker
                            .startAngle(vis.keyScale(1))
                            .endAngle(vis.keyScale(2))
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 + separator * 2 + 1.5)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 + separator * 2 - 1.5);
                        arcG.append('path')
                            .attr('class', 'worldKey')
                            .attr('d', vis.keyMaker)
                            .attr('fill', vis.colorScale(d.index));
                        vis.keyMaker
                            .startAngle(vis.keyScale(0))
                            .endAngle(vis.keyScale(1));
                        arcG.append('path')
                            .attr('class', 'africaKey')
                            .attr('d', vis.keyMaker)
                            .attr('fill', vis.colorScale(d.index + vis.numRings));
                    }),
                // UPDATE
                update => update
                    .each(function (d, i) {
                        // Define this
                        const arcG = d3.select(this);
                        // Update arcMaker
                        vis.arcMaker = vis.arcMaker
                            .innerRadius(d.innerRadius - 0.5)
                            .outerRadius(d.innerRadius);
                        // Append inner ring arc
                        arcG.selectAll('.arcPathInner')
                            .transition()
                            .attr('class', () => {
                                return 'arcPath arcPathInner';
                            })
                            .attr('d', vis.arcMaker);
                        // If last ring
                        vis.arcMaker = vis.arcMaker
                            .innerRadius(d.outerRadius - 0.5)
                            .outerRadius(d.outerRadius);
                        // Append outer ring arc
                        arcG.selectAll('.arcPathOuter')
                            .transition()
                            .attr('class', () => {
                                return 'arcPath arcPathOuter';
                            })
                            .attr('d', vis.arcMaker);
                        // Set separator
                        const separator = Math.round(vis.mainRad * 0.02);
                        // Update labelScale
                        vis.labelMaker
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 - separator / 4)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 - separator / 4);
                        arcG.select('.labelArc')
                            .transition()
                            .attr('d', vis.labelMaker);
                        // Update labelScale
                        vis.labelMaker
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 - separator * 2.5)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 - separator * 2.5);
                        arcG.select('.unitArc')
                            .transition()
                            .attr('d', vis.labelMaker);
                        // Add label
                        const compareThis = d.outerRadius - d.innerRadius;
                        const toThat = Math.floor((vis.mainGraphExt - vis.mainGraphInt) / 4);
                        arcG.select('.unitArcText')
                            .attr('fill-opacity', () => {
                                if (vis.mode === 'line' || compareThis < toThat) {
                                    return 0;
                                } else {
                                    return 1;
                                }
                            });
                        // Draw keys
                        vis.keyMaker
                            .startAngle(vis.keyScale(1))
                            .endAngle(vis.keyScale(2))
                            .innerRadius((d.innerRadius + d.outerRadius) / 2 + separator * 2 + 1.5)
                            .outerRadius((d.innerRadius + d.outerRadius) / 2 + separator * 2 - 1.5);
                        arcG.select('.worldKey')
                            .transition()
                            .attr('d', vis.keyMaker)
                            .attr('fill', vis.colorScale(d.index))
                            .attr('fill-opacity', () => {
                                if (compareThis < toThat) {
                                    return 0;
                                } else {
                                    return 1;
                                }
                            });
                        vis.keyMaker
                            .startAngle(vis.keyScale(0))
                            .endAngle(vis.keyScale(1));
                        arcG.select('.africaKey')
                            .transition()
                            .attr('d', vis.keyMaker)
                            .attr('fill', vis.colorScale(d.index + vis.numRings))
                            .attr('fill-opacity', () => {
                                if (compareThis < toThat) {
                                    return 0;
                                } else {
                                    return 1;
                                }
                            });
                    }),
                // EXIT
                exit => exit.remove()
            );
    }

    /*
     Function buildAreaCharts()
     */
    buildAreaCharts() {

        // Define this vis
        const vis = this;

        // If active
        if (vis.mode === 'area') {

            // Update blackboard
            /*vis.blackboardG.select('circle')
                .transition()
                .attr('r', 0);*/

            // Update makers
            vis.arcMaker
                .startAngle(vis.xScale(d3.min(vis.yearDataDisplay, d => d.year)))
                .endAngle(vis.xScale(d3.max(vis.yearDataDisplay, d => d.year)));
            vis.areaMaker
                .angle(d => vis.xScale(d.year));

            // Clear line mode
            vis.filterOut = [];

        }

        // `````````````````````````````````````````````````````````````````````````````````````````````` Enter area

        // Build eachAreaG
        vis.eachAreaGs = vis.areaG.selectAll('.eachAreaG')
            .data(vis.radiiDataDisplay, d => d.domain)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'eachAreaG')
                    .each(function (d, i) {
                        // Define this
                        const eachAreaG = d3.select(this);
                        // Update scale
                        vis.yScale
                            .domain([0, d3.max(vis.dataDisplayA[0][d.domain], d => d.extract) * 1.1])
                            .range([vis.radiiData[i].innerRadius, vis.radiiData[i].outerRadius]);
                        // Update arcMaker
                        vis.arcMaker
                            .innerRadius(d.innerRadius)
                            .outerRadius(d.outerRadius);
                        // Append defs w clipPath arc
                        eachAreaG.append('defs')
                            .append('clipPath')
                            .attr('id', `arcClip_${i}`)
                            .append('path')
                            .attr('class', 'areaArc')
                            .attr('d', vis.arcMaker)
                            .attr('fill', 'none');
                        // Update areaMaker
                        vis.areaMaker
                            .innerRadius(() => vis.yScale(0))
                            .outerRadius(d => vis.yScale(d.extract));
                        // Append areaPaths
                        eachAreaG.append('path')
                            .transition()
                            .delay(i * 50)
                            .attr('clip-path', `url(#arcClip_${i})`)
                            .attr('class', 'worldAreaPath areaPath')
                            .attr("fill", vis.colorScale(i))
                            .attr('fill-opacity', 0.85)
                            .attr("d", vis.areaMaker(vis.dataDisplayA[0][d.domain]));
                        eachAreaG.append("path")
                            .transition()
                            .attr('clip-path', `url(#arcClip_${i})`)
                            .attr('class', 'africaAreaPath areaPath')
                            .attr("fill", vis.colorScale(i + vis.numRings))
                            .attr('fill-opacity', 1)
                            .attr("d", vis.areaMaker(vis.dataDisplayB[0][d.domain]));
                    }),
                // UPDATE
                update => update
                    .each(function (d, i) {
                        // Define this
                        const eachAreaG = d3.select(this);
                        // Update scale
                        vis.yScale
                            .domain([0, d3.max(vis.dataDisplayA[0][d.domain], d => d.extract) * 1.1])
                            .range([vis.radiiData[i].innerRadius, vis.radiiData[i].outerRadius]);
                        // Update arcMaker
                        vis.arcMaker
                            .innerRadius(d.innerRadius)
                            .outerRadius(d.outerRadius);
                        // Append defs w clipPath arc
                        eachAreaG.select('defs')
                            .select('clipPath')
                            .select('path')
                            .attr('d', vis.arcMaker);
                        // Update areaMaker
                        vis.areaMaker
                            .innerRadius(() => vis.yScale(0))
                            .outerRadius(d => vis.yScale(d.extract));
                        // Append areaPaths
                        eachAreaG.select('.worldAreaPath')
                            .transition()
                            .attr("d", vis.areaMaker(vis.dataDisplayA[0][d.domain]));
                        eachAreaG.select(".africaAreaPath")
                            .transition()
                            .attr("d", vis.areaMaker(vis.dataDisplayB[0][d.domain]));
                    }),
                // EXIT
                exit => exit.remove()
            );

        // Add event to eachAreaG
        vis.eachAreaGs.on('click', (e) => {
            vis.zoomArea(e);
        });
    }

    /*
     Function buildLineCharts()
     */
    buildLineCharts() {

        // Define this vis
        const vis = this;

        if (vis.mode === 'line') {

            // Update blackboard
            /*vis.blackboardG.select('circle')
                .transition()
                .attr('r', vis.mainGraphExt);*/

            // Update makers
            vis.lineMaker.angle(d => vis.xScale(d.year));
            vis.arcMaker
                .startAngle(vis.xScale(d3.min(vis.yearDataDisplay, d => d.year)))
                .endAngle(vis.xScale(d3.max(vis.yearDataDisplay, d => d.year)));

            // Update scales
            const changeRange = [];
            const allMinMaxs = [];
            vis.linesDataDisplay.forEach(d => {
                const domainMinMaxs = [];
                const minA = d3.min(vis.dataDisplayA[0][d.domain], d => (d.change >= 0) ? +d.change : -(+d.change));
                const maxA = d3.max(vis.dataDisplayA[0][d.domain], d => (d.change >= 0) ? +d.change : -(+d.change));
                const minB = d3.min(vis.dataDisplayB[0][d.domain], d => (d.change >= 0) ? +d.change : -(+d.change));
                const maxB = d3.max(vis.dataDisplayB[0][d.domain], d => (d.change >= 0) ? +d.change : -(+d.change));
                allMinMaxs.push(minA, maxA, minB, maxB);
                domainMinMaxs.push(minA, maxA, minB, maxB);
                changeRange.push({
                    domain: d.domain,
                    ends: Math.round(d3.max(domainMinMaxs, d => d) * 1.1)
                });
            });
            changeRange.push({
                domain: 'all',
                ends: Math.round(d3.max(allMinMaxs, d => d) * 1.1)
            });
            const currentDomain = changeRange.find(d => d.domain === 'all');
            vis.yScale
                .domain([-currentDomain.ends, currentDomain.ends])
                .range([vis.mainGraphInt, vis.mainGraphExt]);

        }

        // ````````````````````````````````````````````````````````````````````````````````````````````` Enter lines

        // Build eachLineG
        vis.eachLineGs = vis.areaG.selectAll('.eachLineG')
            .data(vis.linesDataDisplay, d => d.domain)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'eachLineG')
                    .each(function (d, i) {
                        // Define this
                        const eachLineG = d3.select(this);
                        // Update lineMaker
                        vis.lineMaker
                            .radius(d => vis.yScale(d.change));
                        // Update arcMaker
                        vis.arcMaker
                            .innerRadius(vis.mainGraphInt)
                            .outerRadius(vis.mainGraphExt);
                        // Append defs w clipPath arc
                        eachLineG.append('defs')
                            .append('clipPath')
                            .attr('id', `arcLineClip_${d.index}`)
                            .append('path')
                            .attr('d', vis.arcMaker)
                            .attr('fill', 'none');
                        // Draw line
                        eachLineG.append('path')
                            .transition()
                            .delay(i * 50)
                            .attr('clip-path', `url(#arcLineClip_${d.index})`)
                            .attr('class', 'linePath linePathWorld')
                            .attr('d', vis.lineMaker(vis.dataDisplayA[0][d.domain]))
                            .attr('stroke', vis.colorScale(d.index))
                            .attr('fill', 'none');
                        // Draw line
                        eachLineG.append('path')
                            .transition()
                            .delay(i * 50)
                            .attr('clip-path', `url(#arcLineClip_${d.index})`)
                            .attr('class', 'linePath linePathAfrica')
                            .attr('d', vis.lineMaker(vis.dataDisplayB[0][d.domain]))
                            .attr('stroke', vis.colorScale(d.index + vis.numRings))
                            .attr('fill', 'none');
                    }),
                update => update
                    .each(function (d, i) {
                        // Define this
                        const eachLineG = d3.select(this);
                        // Update lineMaker
                        vis.lineMaker
                            .radius(d => vis.yScale(d.change));
                        // Update arcMaker
                        vis.arcMaker
                            .innerRadius(vis.mainGraphInt)
                            .outerRadius(vis.mainGraphExt);
                        // Draw line
                        eachLineG.selectAll('.linePathWorld')
                            .transition()
                            .delay(i * 50)
                            .attr('d', vis.lineMaker(vis.dataDisplayA[0][d.domain]));
                        // Draw line
                        eachLineG.selectAll('.linePathAfrica')
                            .transition()
                            .delay(i * 50)
                            .attr('d', vis.lineMaker(vis.dataDisplayB[0][d.domain]));
                    }),
                exit => exit.remove()
            )


    }

    /*
     Function buildToggleTool()
     */
    buildToggleTool() {

        // Define this vis
        const vis = this;

        // Init vis.toggleToolData
        vis.toggleToolData = [{
            directTo: 'area',
            text: 'total',
            symbol: '#'
        }, {
            directTo: 'line',
            text: 'change',
            symbol: '%'
        }];
        if (vis.mode === 'area') {
            vis.toggleToolData[0].active = true;
            vis.toggleToolData[1].active = false;
        } else if (vis.mode === 'line') {
            vis.toggleToolData[0].active = false;
            vis.toggleToolData[1].active = true;
        }

        // Append buttons
        vis.buttonGs = vis.buttonG.selectAll('.buttonG')
            .data(vis.toggleToolData, d => d.text)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', d => {
                        if (d.active) {
                            return `buttonG activeButtonG`;
                        } else {
                            return `buttonG inactiveButtonG`;
                        }
                    })
                    .style('transform', d => {
                        if (d.active) {
                            return `rotate(0deg) translate(0, ${-vis.mainRad * 0.2}px)`;
                        } else {
                            return `rotate(45deg) translate(0, ${-vis.mainRad * 0.175}px)`;
                        }
                    })
                    .each(function (d, i) {
                        // Select this
                        const buttonG = d3.select(this);
                        // Append circle
                        buttonG.append('circle')
                            .attr('r', d => {
                                if (d.active) {
                                    return vis.mainRad * 0.07;
                                } else {
                                    return vis.mainRad * 0.05;
                                }
                            });
                        // Append text
                        buttonG.append('text')
                            .text(d.symbol);
                    }),
                update => update
                    .transition()
                    .attr('class', d => {
                        if (d.active) {
                            return `buttonG activeButtonG`;
                        } else {
                            return `buttonG inactiveButtonG`;
                        }
                    })
                    .style('transform', d => {
                        if (d.active) {
                            return `rotate(0deg) translate(0, ${-vis.mainRad * 0.2}px)`;
                        } else {
                            if (d.text === 'change') {
                                return `rotate(45deg) translate(0, ${-vis.mainRad * 0.175}px)`;
                            } else {
                                return `rotate(-45deg) translate(0, ${-vis.mainRad * 0.175}px)`;
                            }
                        }
                    })
                    .each(function (d, i) {
                        // Select this
                        const buttonG = d3.select(this);
                        // Append circle
                        buttonG.select('circle')
                            .attr('r', d => {
                                if (d.active) {
                                    return vis.mainRad * 0.0625;
                                } else {
                                    return vis.mainRad * 0.05;
                                }
                            });
                    })
            );

        vis.buttonGs.on('click', e => {

            // Determine and update mode
            if (e.text === 'total' && e.directTo !== vis.mode) {
                // Refine mode and year
                vis.mode = e.directTo;
                vis.yearMin--;
                vis.wrangleVis();
            } else if (e.text === 'change' && e.directTo !== vis.mode) {
                // Redefine to zoom out
                vis.zoom = false;
                vis.focus = vis.numRings;
                // Refine mode and year
                vis.mode = e.directTo;
                vis.yearMin++;
                vis.wrangleVis();
            }
        })
    }

    /*
     Function buildExtCharts()
     */
    buildExtCharts() {

        // Define this vis
        const vis = this;

        // ``````````````````````````````````````````````````````````````````````````````````````````` Enter bubbles

        // Config scales
        vis.extAngleScale
            .range([-140, -75]);

        // Build bubbles
        vis.bubbleGs = vis.extG.selectAll('.bubbleG')
            .data(vis.bubbleData, d => d.domain)
            .join(
                // ENTER
                enter => enter
                    .append('g')
                    .attr('class', 'bubbleG')
                    .each(function (d, i) {
                        // Define this
                        const bubbleG = d3.select(this)
                            .style('transform', () => {
                                if (d.domain === 'legend') {
                                    return `rotate(${vis.extAngleScale(i)}deg) translate(0, ${vis.extRad}px)`;
                                } else {
                                    return `rotate(${vis.extAngleScale(i + 0.5)}deg) translate(0, ${vis.extRad}px)`;
                                }
                            });

                        // Set vars
                        const worldTop = d.domainLookupTopA.extract;
                        const africaTop = d.domainLookupTopB.extract;
                        const worldBot = d.domainLookupMinA.extract;
                        const africaBot = d.domainLookupMinB.extract;

                        // Update scales
                        vis.extRadiusScale
                            .domain([0, africaTop]);

                        // Set scaled vars
                        const worldTopBubbleRadius = vis.extRadiusScale(d.domainLookupTopA.extract);
                        const africaTopBubbleRadius = vis.extRadiusScale(d.domainLookupTopB.extract);
                        const worldBotBubbleRadius = vis.extRadiusScale(d.domainLookupMinA.extract);
                        const africaBotBubbleRadius = vis.extRadiusScale(d.domainLookupMinB.extract);

                        // Create bubbleContainerG
                        const bubbleContainerG1 = bubbleG.append('g')
                            .attr('class', 'bubbleContainerG1')
                            .style('transform', `translateY(${vis.extRad * 0.08 * (1 + i)}px)`);

                        const bubbleContainerG2 = bubbleContainerG1.append('g')
                            .attr('class', 'bubbleContainerG2')
                            .style('transform', () => {
                                if (d.domain === 'legend') {
                                    return `rotate(${-vis.extAngleScale(i)}deg)`;
                                } else {
                                    return `rotate(${-vis.extAngleScale(i + 0.5)}deg)`;
                                }
                            });

                        // Append bubbleCirc - 2013WORLD
                        bubbleContainerG2.append('circle')
                            .attr('class', 'worldNow')
                            .attr('r', worldTopBubbleRadius)
                            .attr('fill', () => {
                                if (d.domain === 'legend') {
                                    return 'rgb(188, 138, 130)';
                                } else {
                                    return vis.colorScale(d.index);
                                }
                            })
                            .attr('fill-opacity', 0.85);
                        // Append bubbleCirc - 2013AFRICA
                        bubbleContainerG2.append('circle')
                            .attr('class', 'africaNow')
                            .attr('r', africaTopBubbleRadius)
                            .attr('fill', () => {
                                if (d.domain === 'legend') {
                                    return 'rgb(113, 83, 78)';
                                } else {
                                    return vis.colorScale(d.index + vis.numRings);
                                }
                            })
                            .attr('fill-opacity', 0.85);

                        // Append bubbleContainer3
                        const bubbleContainerG3 = bubbleContainerG2.append('g')
                            .attr('class', 'bubbleContainerG3')
                            .style('transform', `translateY(${-worldTopBubbleRadius}px)`);

                        // Append bubbleCirc - 1963WORLD
                        bubbleContainerG3.append('circle')
                            .attr('class', () => {
                                if (vis.mode === 'johnbob') {
                                    return 'worldThen invisibleWorldThen';
                                } else {
                                    return 'worldThen';
                                }
                            })
                            .attr('r', worldBotBubbleRadius)
                            .attr('fill', 'none')
                            .attr('stroke', 'rgba(0, 0, 0, 1)')
                            .attr('stroke-width', 0.3);
                        // Append bubbleCirc - 1963AFRICA
                        bubbleContainerG3.append('circle')
                            .attr('class', () => {
                                if (vis.mode === 'johnbob') {
                                    return 'africaThen invisibleAfricaThen';
                                } else {
                                    return 'africaThen';
                                }
                            })
                            .attr('r', africaBotBubbleRadius)
                            .attr('fill', 'none')
                            .attr('stroke', 'rgba(0, 0, 0, 1)')
                            .attr('stroke-width', 0.3);

                        // Add toggle
                        if (d.domain !== 'legend') {
                            const lineToggleG = bubbleContainerG2.append('g')
                                .attr('class', () => {
                                    if (vis.mode === 'area') {
                                        return 'lineToggleG invisibleLineToggleG';
                                    } else {
                                        return 'lineToggleG';
                                    }
                                });
                            // Append circle w text
                            lineToggleG.append('text')
                                .attr('class', 'lineToggleText');
                        }

                        // Append info
                        const infoG = bubbleContainerG2.append('g')
                            .attr('class', 'infoG');

                        // Determine multiplier
                        let multiplier = 0;
                        let unit1 = '';
                        let unit2 = '';
                        let textComp = '';
                        if (d.domain === 'emissions') {
                            // ORIGINAL Gg
                            multiplier = 0.000001;
                            unit1 = 'petagram';
                            unit2 = 'Pg';
                            textComp = 'emissions';
                        } else if (d.domain === 'pop') {
                            // ORIGINAL 1000 ppl
                            multiplier = 0.000001;
                            unit1 = 'bil. people';
                            unit2 = 'b. ppl';
                            textComp = 'population';
                        } else if (d.domain === 'fBS') {
                            // ORIGINAL 1000 tonnes
                            multiplier = 0.000001;
                            unit1 = 'gigatonnes';
                            unit2 = 'Gt';
                            textComp = 'production';
                        } else if (d.domain === 'value') {
                            // ORIGIONAL 1000 usd
                            multiplier = 0.000001;
                            unit1 = 'billion USD';
                            unit2 = 'b. usd';
                            textComp = 'value'
                        }

                        const infoAfricaG = infoG.append('g')
                            .attr('class', 'infoAfricaG')
                            .style('transform', `rotate(-30deg)`);

                        infoAfricaG.append('line')
                            .attr('class', 'infoLine')
                            .attr('x1', africaTopBubbleRadius * 2)
                            .attr('y1', 0)
                            .attr('x2', worldTopBubbleRadius + (vis.extRad / 20))
                            .attr('y2', 0);

                        infoAfricaG.append('g')
                            .attr('class', 'infoResult infoAfricaResult')
                            .style('transform', `translateX(${worldTopBubbleRadius + (vis.extRad / 15)}px)`)
                            .append('text')
                            .style('transform', `rotate(30deg)`)
                            .text(() => {
                                if (d.domain === 'legend') {
                                    return 'Africa';
                                } else {
                                    return d3.format('.3f')(africaTop * multiplier) + ' ' + unit2;
                                }
                            });

                        const infoWorldG = infoG.append('g')
                            .attr('class', 'infoWorldG')
                            .style('transform', `rotate(0deg)`);

                        infoWorldG.append('line')
                            .attr('class', 'infoLine')
                            .attr('x1', worldTopBubbleRadius + africaTopBubbleRadius * 2)
                            .attr('y1', 0)
                            .attr('x2', worldTopBubbleRadius + (vis.extRad / 10))
                            .attr('y2', 0);

                        infoWorldG.append('g')
                            .attr('class', 'infoResult infoWorldResult')
                            .style('transform', `translate(${worldTopBubbleRadius + (vis.extRad / 8.5)}px, 0)`)
                            .append('text')
                            .style('transform', `rotate(0deg)`)
                            .text(() => {
                                if (d.domain === 'legend') {
                                    return 'World';
                                } else {
                                    return d3.format(',.3f')(worldTop * multiplier) + ' ' + unit2;
                                }
                            });

                        // Append infoPctG
                        const infoPctG = infoG.append('g')
                            .attr('class', 'infoPctG')
                            .style('transform', `rotate(25deg)`);

                        // Calc percentages and difference
                        const nowPct = africaTop / worldTop;
                        const thenPct = africaBot / worldBot;
                        const difference = nowPct - thenPct;

                        infoPctG.append('g')
                            .attr('class', () => {
                                if (d.domain === 'legend') {
                                    return 'infoResult infoPctResult infoPctResultSmall'
                                } else {
                                    return 'infoResult infoPctResult'
                                }
                            })
                            .style('transform', `translate(${worldTopBubbleRadius + (vis.extRad / 7.5)}px, 0)`)
                            .append('text')
                            .attr('class', 'infoPctResultText')
                            .style('transform', `rotate(-25deg)`)
                            .text(() => {
                                if (d.domain === 'legend') {
                                    return '(Africa / World)%';
                                } else {
                                    return d3.format(',.1%')(nowPct)
                                }
                            })
                            .append('tspan')
                            .attr('class', () => {
                                if (d.domain === 'legend') {
                                    return 'infoPctResultSpan infoPctResultSpanSmall'
                                } else {
                                    return 'infoPctResultSpan'
                                }
                            })
                            .html(() => {
                                if (d.domain === 'legend') {
                                    return ` &plusmn;(change since ${vis.yearMin})%`;
                                } else {
                                    if (difference >= 0) {
                                        return ' +' + d3.format(',.1%')(difference);
                                    } else {
                                        return ' ' + d3.format(',.1%')(difference);
                                    }
                                }
                            });

                        // Append legend label
                        if (d.domain === 'legend') {
                            bubbleContainerG3.append('g')
                                .attr('class', 'thenRefLabel')
                                .style('transform', `translate(${worldBotBubbleRadius}px, ${-worldBotBubbleRadius}px)`)
                                .append('text')
                                .style('transform', `rotate(-30deg) translateY(3px)`)
                                .text(`${vis.yearMin} ref.`)

                        }
                    }),
                update => update
                    .each(function (d, i) {
                        // Define this
                        const bubbleG = d3.select(this);
                        bubbleG.transition()
                            .style('transform', () => {
                                if (d.domain === 'legend') {
                                    return `rotate(${vis.extAngleScale(i)}deg) translate(0, ${vis.extRad}px)`;
                                } else {
                                    return `rotate(${vis.extAngleScale(i + 0.5)}deg) translate(0, ${vis.extRad}px)`;
                                }
                            });

                        // Set vars
                        const worldTop = vis.mode === 'area' ? d.domainLookupTopA.extract : d.domainLookupTopA.change;
                        const africaTop = vis.mode === 'area' ? d.domainLookupTopB.extract : d.domainLookupTopB.change;
                        const worldBot = vis.mode === 'area' ? d.domainLookupMinA.extract : d.domainLookupMinA.change;
                        const africaBot = vis.mode === 'area' ? d.domainLookupMinB.extract : d.domainLookupMinB.change;

                        // Set max in scope
                        let maxDomain = 0;

                        // Update scales
                        if (vis.mode === 'area') {
                            // Config units
                            vis.extBubbleRad = vis.mainRad / 35;
                            // Config scale
                            vis.extRadiusScale
                                .range([0, vis.extBubbleRad])
                                .domain([0, africaTop]);
                        } else {
                            // Config units
                            vis.extBubbleRad = vis.mainRad / 9;
                            // Config scale
                            maxDomain = Math.max(Math.abs(worldTop), Math.abs(africaTop));
                            vis.extRadiusScale
                                .range([1, vis.extBubbleRad])
                                .domain([-maxDomain, maxDomain]);
                        }

                        // Set scaled vars
                        const worldTopBubbleRadius = vis.mode === 'area'
                            ? vis.extRadiusScale(d.domainLookupTopA.extract) : vis.extRadiusScale(d.domainLookupTopA.change);
                        const africaTopBubbleRadius = vis.mode === 'area'
                            ? vis.extRadiusScale(d.domainLookupTopB.extract) : vis.extRadiusScale(d.domainLookupTopB.change);
                        const worldBotBubbleRadius = vis.mode === 'area'
                            ? vis.extRadiusScale(d.domainLookupMinA.extract) : vis.extRadiusScale(d.domainLookupMinA.change);
                        const africaBotBubbleRadius = vis.mode === 'area'
                            ? vis.extRadiusScale(d.domainLookupMinB.extract) : vis.extRadiusScale(d.domainLookupMinB.change);

                        // Create bubbleContainerG
                        const bubbleContainerG1 = bubbleG.select('.bubbleContainerG1');
                        bubbleContainerG1
                            .transition()
                            .style('transform', `translateY(${vis.extRad * 0.08 * (1 + i)}px)`);

                        const bubbleContainerG2 = bubbleContainerG1.select('.bubbleContainerG2');
                        bubbleContainerG2
                            .transition()
                            .style('transform', () => {
                                if (d.domain === 'legend') {
                                    return `rotate(${-vis.extAngleScale(i)}deg)`;
                                } else {
                                    return `rotate(${-vis.extAngleScale(i + 0.5)}deg)`;
                                }
                            });

                        // Append bubbleCirc - 2013WORLD
                        bubbleContainerG2.select('.worldNow')
                            .transition()
                            .attr('r', worldTopBubbleRadius)
                            .attr('fill', () => {
                                if (vis.mode === 'area') {
                                    if (d.domain === 'legend') {
                                        return 'rgb(188, 138, 130)';
                                    } else {
                                        return vis.colorScale(d.index);
                                    }
                                } else {
                                    return 'transparent';
                                }
                            })
                            .attr('stroke', () => {
                                if (vis.mode === 'area') {
                                    return 'none';
                                } else {
                                    if (d.domain === 'legend') {
                                        return 'rgb(188, 138, 130)';
                                    } else {
                                        return vis.colorScale(d.index);
                                    }
                                }
                            });
                        // Append bubbleCirc - 2013AFRICA
                        bubbleContainerG2.select('.africaNow')
                            .transition()
                            .attr('r', africaTopBubbleRadius)
                            .attr('fill', () => {
                                if (vis.mode === 'area') {
                                    if (d.domain === 'legend') {
                                        return 'rgb(113,83,78)';
                                    } else {
                                        return vis.colorScale(d.index + vis.numRings);
                                    }
                                } else {
                                    return 'transparent';
                                }
                            })
                            .attr('stroke', () => {
                                if (vis.mode === 'area') {
                                    return 'none';
                                } else {
                                    if (d.domain === 'legend') {
                                        return 'rgb(113,83,78)';
                                    } else {
                                        return vis.colorScale(d.index + vis.numRings);
                                    }
                                }
                            });

                        // Append bubbleContainer3
                        const bubbleContainerG3 = bubbleContainerG2.select('.bubbleContainerG3')
                            .style('transform', () => {
                                if (vis.mode === 'area') {
                                    return `translateY(${-worldTopBubbleRadius}px)`;
                                } else {
                                    return `translateY(${-vis.extRadiusScale(maxDomain)}px)`;
                                }
                            });

                        // Append bubbleCirc - 1963WORLD
                        bubbleContainerG3.select('.worldThen')
                            .transition()
                            .attr('class', () => {
                                if (vis.mode === 'area') {
                                    return 'worldThen';
                                } else {
                                    return 'worldThen worldThenFainter';
                                }
                            })
                            .attr('r', worldBotBubbleRadius);
                        // Append bubbleCirc - 1963AFRICA
                        bubbleContainerG3.select('.africaThen')
                            .transition()
                            .attr('class', () => {
                                if (vis.mode === 'area') {
                                    return 'africaThen';
                                } else {
                                    return 'africaThen africaThenFainter';
                                }
                            })
                            .attr('r', africaBotBubbleRadius);


                        // Add toggle
                        if (d.domain !== 'legend') {
                            const lineToggleG = bubbleContainerG2.select('.lineToggleG')
                                .attr('class', () => {
                                    if (vis.mode === 'area') {
                                        return 'lineToggleG invisibleLineToggleG';
                                    } else {
                                        return 'lineToggleG';
                                    }
                                });
                            // Append circle w text
                            lineToggleG.select('.lineToggleText')
                                .attr('x', -(vis.extRad * 0.15))
                                .html(() => {
                                    const filterOn = vis.filterOut.find(f => f === d.domain);
                                    if (filterOn) {
                                        return '&plus;';
                                    } else {
                                        return '&minus;';
                                    }
                                });
                        }

                        // Append info
                        const infoG = bubbleContainerG2.select('.infoG');

                        // Determine multiplier
                        let multiplier = 1;
                        let unit1 = 'Percent';
                        let unit2 = '';
                        let textComp = '';
                        if (vis.mode === 'area') {
                            if (d.domain === 'emissions') {
                                // ORIGINAL Gg
                                multiplier = 0.000001;
                                unit1 = 'petagram';
                                unit2 = 'Pg';
                                textComp = 'emissions';
                            } else if (d.domain === 'pop') {
                                // ORIGINAL 1000 ppl
                                multiplier = 0.000001;
                                unit1 = 'bil. people';
                                unit2 = 'b. ppl';
                                textComp = 'population';
                            } else if (d.domain === 'fBS') {
                                // ORIGINAL 1000 tonnes
                                multiplier = 0.000001;
                                unit1 = 'gigatonnes';
                                unit2 = 'Gt';
                                textComp = 'production';
                            } else if (d.domain === 'value') {
                                // ORIGIONAL 1000 usd
                                multiplier = 0.000001;
                                unit1 = 'billion USD';
                                unit2 = 'b. usd';
                                textComp = 'value'
                            }
                        }

                        const infoAfricaG = infoG.select('.infoAfricaG');

                        infoAfricaG.select('.infoLine')
                            .attr('x1', () => {
                                if (vis.mode === 'area') {
                                    return africaTopBubbleRadius * 2;
                                } else {
                                    return africaTopBubbleRadius;
                                }
                            })
                            .attr('x2', () => {
                                if (vis.mode === 'area') {
                                    return worldTopBubbleRadius + (vis.extRad / 20);
                                } else {
                                    return vis.extRadiusScale(maxDomain) + (vis.extRad / 20);
                                }

                            });

                        infoAfricaG.select('.infoAfricaResult')
                            .style('transform', () => {
                                if (vis.mode === 'area') {
                                    return `translateX(${worldTopBubbleRadius + (vis.extRad / 15)}px)`
                                } else {
                                    return `translateX(${vis.extRadiusScale(maxDomain) + (vis.extRad / 15)}px)`
                                }
                            })
                            .select('text')
                            .text(() => {
                                if (d.domain === 'legend') {
                                    return 'Africa';
                                } else {
                                    if (vis.mode === 'area') {
                                        return d3.format('.3f')(africaTop * multiplier) + ' ' + unit2;
                                    } else {
                                        return d3.format('.2%')(africaTop / 100) + ' (Af.)';
                                    }
                                }
                            });

                        const infoWorldG = infoG.select('.infoWorldG');

                        infoWorldG.select('.infoLine')
                            .attr('x1', () => {
                                if (vis.mode === 'area') {
                                    return worldTopBubbleRadius + africaTopBubbleRadius * 2
                                } else {
                                    return worldTopBubbleRadius;
                                }
                            })
                            .attr('x2', () => {
                                if (vis.mode === 'area') {
                                    return worldTopBubbleRadius + (vis.extRad / 10);
                                } else {
                                    return vis.extRadiusScale(maxDomain) + (vis.extRad / 20);
                                }
                            });

                        infoWorldG.select('.infoWorldResult')
                            .style('transform', () => {
                                if (vis.mode === 'area') {
                                    return `translate(${worldTopBubbleRadius + (vis.extRad / 8.5)}px, 0)`;
                                } else {
                                    return `translateX(${vis.extRadiusScale(maxDomain) + (vis.extRad / 15)}px)`
                                }
                            })
                            .select('text')
                            .text(() => {
                                if (d.domain === 'legend') {
                                    return 'World';
                                } else {
                                    if (vis.mode === 'area') {
                                        return d3.format(',.3f')(worldTop * multiplier) + ' ' + unit2;
                                    } else {
                                        return d3.format('.2%')(worldTop / 100) + ' (W.)';
                                    }
                                }
                            });

                        // Append infoPctG
                        const infoPctG = infoG.select('.infoPctG');

                        // Calc percentages and difference
                        let nowPct = vis.mode === 'area' ? africaTop / worldTop : africaTop / 100 - worldTop / 100;
                        let thenPct = vis.mode === 'area' ? africaBot / worldBot : africaBot / 100 - worldBot / 100;
                        const difference = nowPct - thenPct;

                        infoPctG.select('g')
                            .attr('class', () => {
                                if (d.domain === 'legend') {
                                    return 'infoResult infoPctResult infoPctResultSmall'
                                } else {
                                    return 'infoResult infoPctResult'
                                }
                            })
                            .style('transform', () => {
                                if (vis.mode === 'area') {
                                    return `translate(${worldTopBubbleRadius + (vis.extRad / 7.5)}px, 0)`;
                                } else {
                                    return `translate(${vis.extRadiusScale(maxDomain) + (vis.extRad / 7.5)}px, 0)`;
                                }
                            })
                            .select('.infoPctResultText')
                            .text(() => {
                                if (d.domain === 'legend') {
                                    if (vis.mode === 'area') {
                                        return '(Africa / World)%';
                                    } else {
                                        return '(Africa - World)%';
                                    }
                                } else {
                                    if (vis.mode === 'area') {
                                        return d3.format(',.1%')(nowPct)
                                    } else {
                                        return d3.format(',.1%')(nowPct)
                                    }
                                }
                            })
                            .append('tspan')
                            .attr('class', () => {
                                if (d.domain === 'legend') {
                                    return 'infoPctResultSpan infoPctResultSpanSmall'
                                } else {
                                    return 'infoPctResultSpan'
                                }
                            })
                            .html(() => {
                                if (d.domain === 'legend') {
                                    return ` &plusmn;(change since ${vis.yearMin})%`;
                                } else {
                                    if (vis.mode === 'area') {
                                        if (difference >= 0) {
                                            return ' +' + d3.format(',.1%')(difference);
                                        } else {
                                            return ' ' + d3.format(',.1%')(difference);
                                        }
                                    } else {
                                        if (difference >= 0) {
                                            return ' +' + d3.format(',.1%')(difference);
                                        } else {
                                            return ' ' + d3.format(',.1%')(difference);
                                        }
                                    }
                                }
                            });

                        // Append legend label
                        if (d.domain === 'legend') {
                            bubbleContainerG3.select('.thenRefLabel')
                                .style('transform', `translate(${worldBotBubbleRadius}px, ${-worldBotBubbleRadius}px)`)
                                .append('text')
                                .attr('fill-opacity', () => {
                                    if (vis.mode === 'area') {
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                })
                                .style('transform', `rotate(-30deg) translateY(3px)`)
                                .text(`${vis.yearMin} ref.`)
                        }

                    }),
                exit => exit.remove()
            );

        // Add event
        vis.bubbleGs.on('click', function (d3e) {

            if (vis.mode === 'area') {
                vis.zoomArea(d3e);
            } else if (vis.mode === 'line') {
                if (!vis.filterOut.find(d => d === d3e.domain)) {
                    vis.filterOut.push(d3e.domain);
                } else {
                    vis.filterOut = vis.filterOut.filter(d => d !== d3e.domain);
                }
                vis.wrangleVis();
            }
        });

    }

    /*
     Function zoomArea()
     */
    zoomArea(e) {

        // Define this vis
        const vis = this;

        if (vis.mode === 'area') {

            // Set zoom and focus
            if (!vis.zoom) {
                // Redefine to zoom in
                vis.zoom = true;
                vis.focus = e.index;
            } else {
                // If same selection
                if (vis.focus === e.index) {
                    // Redefine to zoom out
                    vis.zoom = false;
                    vis.focus = vis.numRings;
                } else {
                    // Redefine to remain zoomed in
                    vis.focus = e.index;
                }
            }

            // Update
            vis.wrangleVis();

        }

    }
}

// })();

/*
 Ref.
  + https://observablehq.com/@d3/radial-area-chart
  + https://stackoverflow.com/questions/21208031/how-to-customize-the-color-scale-in-a-d3-line-chart
  + https://observablehq.com/@d3/line-with-missing-data
  + https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
 */
