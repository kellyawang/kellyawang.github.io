'use strict';

// IIFE
// (() => {

// Config svg
const mod4_svgW = 1440;
const mod4_svgH = 712;

// Append svg
const mod4_svg = d3.select('#securityVis')
    .append('svg')
    .attr('class', 'svg')
    .attr('width', mod4_svgW)
    .attr('height', mod4_svgH);


/* `````````````````````````````````\```````````````````````\
    Class: Mod4Main                 |                       |
 ``````````````````````````````````/``````````````````````*/
class Mod4Main {

    // Constructor
    constructor(_data, _defs, _pop) {
        this.data = _data;
        this.defs = _defs;
        this.pop = _pop;
        // Parse
        this.parseData().then(() => {
            // Init
            this.initVis()
        }).catch(err => console.error(err))
    }

    /*
    parseData
     */
    async parseData() {

        // Define this vis
        const vis = this;

        // Iterate data and add defs
        vis.data.forEach(d => {
            d.defs = vis.defs.find(d2 => d2.name === d.country);
            if (d.defs) {
                if (d.defs.name === 'United Republic of Tanzania') {
                    d.defs.nickname = 'Tanzania';
                } else if (d.defs.name === 'Democratic Republic of the Congo') {
                    d.defs.nickname = 'Dem. Rep. Congo';
                } else if (d.defs.name === 'Central African Republic') {
                    d.defs.nickname = 'C. African. Rep.';
                } else {
                    d.defs.nickname = d.defs.name;
                }
            }
        });
        vis.data = vis.data.filter(d => d.defs);

        // Define countries
        vis.countries = [];
        vis.regions = [];
        vis.data.forEach(d => {
            const country = vis.pop.find(p => p.countryCode === d.countryCode);
            const year = country.years.find(y => y.year === '2013');
            d.population = year.items[0]['Total Population - Both sexes'] * 1000 / 1000000;
            if (d.defs.type === 'parent') {
                vis.regions.push(d);
            } else {
                vis.countries.push(d);
            }
        });
        vis.core = [vis.regions.shift()];
        vis.countryGroups = [
            {group: 'Eastern Africa', groupCode: '5101', countries: []},
            {group: 'Middle Africa', groupCode: '5102', countries: []},
            {group: 'Northern Africa', groupCode: '5103', countries: []},
            {group: 'Southern Africa', groupCode: '5104', countries: []},
            {group: 'Western Africa', groupCode: '5105', countries: []},
        ];
        vis.countries.forEach(country => {
            country.defs.parents.forEach(parent => {
                const found = vis.countryGroups.find(cG => cG.groupCode === parent.countryGroupCode);
                if (found) {
                    found.countries.push(country);
                }
            })
        });

    }

    /*
    initVis
     */
    initVis() {

        // Define this vis
        const vis = this;

        // ``````````````````````````````````````````````````````````````````````````````````````````````` Container

        // Config g
        vis.gMargin = {top: 0, right: (mod4_svgW - mod4_svgH) / 2, bottom: 0, left: (mod4_svgW - mod4_svgH) / 2};
        vis.gW = mod4_svgW - (vis.gMargin.left + vis.gMargin.right);
        vis.gH = mod4_svgH - (vis.gMargin.top + vis.gMargin.bottom);

        // Append g
        vis.g = mod4_svg.append('g')
            .attr('class', 'containerG')
            .style('transform', `translate(${vis.gMargin.left}px, ${vis.gMargin.top}px)`);

        // ``````````````````````````````````````````````````````````````````````````````````````````````````` Setup

        // Append mainG
        vis.mainG = vis.g.append('g')
            .attr('class', 'mainG')
            .style('transform', () => `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);

        // Define radScale
        vis.maxRad = Math.round(vis.gW / 2.5);
        vis.radScale = d3.scaleLinear()
            .range([1, vis.maxRad]);

        // Config rings
        vis.ringRegionRad = vis.maxRad / 2.1;
        vis.ringCountryRad = vis.ringRegionRad * 2;
        vis.ringZoomRad = vis.ringRegionRad * 1.3;

        // Config xScale
        vis.xScale = d3.scaleLinear()
            .range([Math.PI, -Math.PI]);

        // Define axisAngleScale
        vis.angleScale = d3.scaleLinear()
            .range([0, 360]);

        // Config xarcScale
        vis.arcScale = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        // Define arcMaker
        vis.arcMaker = d3.arc();

        // Item options
        vis.itemOptions = [
            {item: "Prevalence of undernourishment (percent) (3-year average)", itemCode: "210041"},
            {item: "Number of people undernourished (million) (3-year average)", itemCode: "210011"}
        ];

        // Init item
        vis.currentItemCode = "210011";
        vis.suppItemCode = "210041";

        // Init zoom
        vis.zoom = false;

        // Init mod4ext instantiation counter
        vis.mod4ExtCounter = 0;

        // ````````````````````````````````````````````````````````````````````````````````````````````` Append to g

        // Add eventBoard
        vis.eventBoard = vis.mainG.append('circle')
            .attr('r', vis.gH / 2)
            .attr('fill', 'rgba(0, 0, 0, 0)');

        // Define zones
        vis.continentZone = vis.mainG.append('g')
            .attr('class', 'zone continentZone');
        vis.regionZone = vis.mainG.append('g')
            .attr('class', 'zone regionZone');
        vis.countryZone = vis.mainG.append('g')
            .attr('class', 'zone countryZone');

        // ```````````````````````````````````````````````````````````````````````````````````````````` Perform once

        // TODO - maybe delete
        /*
        // Config tooltip
        vis.tooltipW = vis.maxRad * 0.6;
        vis.tooltipH = vis.maxRad * 0.15;
        vis.tooltipOffset = vis.maxRad * 0.01;

        // Linemaker
        vis.lineMaker = d3.line();
        vis.tooltipCoords = [
            [-vis.tooltipOffset, -vis.tooltipOffset],
            [vis.tooltipW, 0],
            [vis.tooltipW, vis.tooltipH],
            [0, vis.tooltipH]
        ];

        // Add tooltip
        vis.tooltip = vis.g
            .append('g')
            .attr('class', 'invisTT')
            .attr('id', 'tooltip');
        vis.tooltip.append('path')
            .attr('d', vis.lineMaker(vis.tooltipCoords));
        vis.tooltip.append('text')
            .attr('class', 'ttText ttTextCountry')
            .style('transform', `translate(${vis.tooltipOffset * 2}px, ${vis.tooltipOffset * 5}px)`)
            .text('Country');
        vis.tooltip.append('text')
            .attr('class', 'ttText ttTextValue')
            .style('transform', `translate(${vis.tooltipW - vis.tooltipOffset * 3}px, ${vis.tooltipH - vis.tooltipOffset * 3}px)`)
            .text('1,000,000');

        // Add first event
        svg.on('mouseover', e => {
            if (d3.event.target.className.baseVal === 'svg') {
                vis.tooltipControl(e, false);
            }
        });
        */

        // Wrangle
        vis.wrangleVis();
    }

    /*
    wrangleVis
     */
    wrangleVis() {

        // Define this vis
        const vis = this;

        // `````````````````````````````````````````````````````````````````````````````````````````` Filter display
        // Filter core
        vis.displayInside = vis.core.filter(country => {
            country.years = country.years.find(year => {
                year.supp = year.items.find(item => item.itemCode === vis.suppItemCode);
                year.items = year.items.find(item => item.itemCode === vis.currentItemCode);
                if (!year.items.Value || !year.supp.Value) {
                    year.items.Value = undefined;
                    year.items.Percent = undefined;
                } else {
                    year.items.Percent = year.supp.Value;
                }
                return year;
            });
            return country;
        });
        // Create mod4Ext
        if (vis.mod4ExtCounter === 0) {
            // Increment
            vis.mod4ExtCounter++;
            // Instantiate
            vis.createExt();
        }
        // Filter and sort regions
        vis.displayMiddle = vis.regions.filter(country => {
            country.years = country.years.find(year => {
                year.supp = year.items.find(item => item.itemCode === vis.suppItemCode);
                year.items = year.items.find(item => item.itemCode === vis.currentItemCode);
                if (!year.items.Value || !year.supp.Value) {
                    year.items.Value = undefined;
                    year.items.Percent = undefined;
                } else {
                    year.items.Percent = year.supp.Value;
                }
                return year;
            });
            return country;
        });
        vis.displayMiddle.sort((a, b) => {
            return a.years.items.Value - b.years.items.Value;
        });
        vis.displayMiddle.forEach((dR, i) => {
            dR.order = i;
        });
        // Filter and sort countries
        vis.displayOutside = vis.countryGroups.filter(cG => {
            cG.countries.filter(country => {
                country.years = country.years.find(year => {
                    year.supp = year.items.find(item => item.itemCode === vis.suppItemCode);
                    year.items = year.items.find(item => item.itemCode === vis.currentItemCode);
                    if (!year.items.Value || !year.supp.Value) {
                        year.items.Value = undefined;
                        year.items.Percent = undefined;
                    } else {
                        year.items.Percent = year.supp.Value;
                    }
                    return year;
                });
                return country;
            });
            cG.countries.sort((a, b) => {
                const first = a.years.items.Value || -1;
                const second = b.years.items.Value || -1;
                return first - second;
            });
            return cG;
        });
        vis.displayOutside.forEach((dC, i) => {
            const match = vis.displayMiddle.find(dR => dR.country === dC.group);
            dC.order = match.order;
        });
        vis.displayOutside.sort((a, b) => {
            return a.order - b.order;
        });

        // Wrangle
        vis.updateVis();
    }

    /*
    updateVis
     */
    updateVis() {

        // Define this vis
        const vis = this;

        // ``````````````````````````````````````````````````````````````````````````````````````````` continentZone

        vis.continentGs = vis.continentZone.selectAll('.continentG')
            .data(vis.displayInside, d => d.country)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'continentG')
                    .each(function (d, i) {
                        // Get this
                        const thisG = d3.select(this);

                        // Update entry
                        let coreValue = d.years.items.Value;

                        // Update scales
                        vis.radScale.domain([0, d.population]);

                        // Draw link line
                        thisG.append('line')
                            .attr('class', 'linkLine')
                            .attr('x1', 0)
                            .attr('x2', 0)
                            .attr('y1', 0)
                            .attr('y2', -vis.ringRegionRad);

                        // Append geoVarCirc
                        const geoVarCirc = thisG.append('circle')
                            .attr('class', 'geoVarCirc continentVarCirc')
                            .attr('r', vis.radScale(coreValue));

                        // Append geoWholeCirc
                        thisG.append('circle')
                            .attr('class', 'geoWholeCirc continentWholeCirc')
                            .attr('r', vis.radScale(d.population));

                        // Set dist
                        const distText = -vis.radScale(coreValue);

                        // Add tempText
                        const geoTextContainer = thisG.append('g')
                            .attr('class', 'geoTextContainer')
                            .style('transform', `translate(${distText}px, ${distText}px)`)
                        geoTextContainer.append('text')
                            .attr('class', 'geoText geoTextDisplay geoTextL')
                            .style('transform', `rotate(-45deg)`)
                            .text(d.country);
                        geoTextContainer.append('text')
                            .attr('class', 'geoText geoTextValue')
                            .style('transform', `rotate(-45deg) translateY(${-vis.maxRad * 0.075}px)`)
                            .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');


                        // Add event
                        thisG.on('mouseover', e => {
                            //vis.tooltipControl(e, true);
                            vis.hoverControl(e);
                        }).on('mousemove', e => {
                            //vis.tooltipControl(e, true);
                        }).on('click', e => {
                            vis.zoomControl(e);
                            vis.extOutput(e);
                        });

                    }),
                update => update
                    .each(function (d, i) {
                        // Get this
                        const thisG = d3.select(this);

                        if (!vis.zoom) {

                            // Update entry
                            let coreValue = d.years.items.Value;

                            // Update scales
                            vis.radScale.domain([0, d.population]);

                            // Draw link line
                            const linkLine = thisG.select('.linkLine');
                            if (linkLine.size() === 0) {
                                thisG.append('line')
                                    .attr('class', 'linkLine')
                                    .attr('x1', 0)
                                    .attr('x2', 0)
                                    .attr('y1', 0)
                                    .attr('y2', -vis.ringRegionRad);
                            }

                            // Append geoVarCirc
                            thisG.select('.geoVarCirc')
                                .transition()
                                .attr('r', vis.radScale(coreValue))
                                .style('transform', `translate(0, 0)`);

                            // Append geoWholeCirc
                            const geoWholeCirc = thisG.select('.geoWholeCirc');
                            if (geoWholeCirc.size() === 0) {
                                thisG.append('circle')
                                    .transition()
                                    .attr('class', 'geoWholeCirc continentWholeCirc')
                                    .attr('r', vis.radScale(d.population));
                            }

                            // Set dist
                            const distText = -vis.radScale(coreValue);

                            // Add tempText
                            const geoTextContainer = thisG.select('.geoTextContainer')
                                .transition()
                                .style('transform', `translate(${distText}px, ${distText}px)`);
                            geoTextContainer.select('.geoTextValue')
                                .style('transform', `rotate(-45deg) translateY(${-vis.maxRad * 0.075}px)`)
                                .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');


                        } else {

                            // Remove line
                            thisG.select('.linkLine')
                                .remove();

                            // Calc dist
                            const distCirc = vis.maxRad * 0.875;
                            const distText = distCirc + (vis.maxRad * 0.125);

                            // Fix geoVarCirc
                            thisG.select('.geoVarCirc')
                                .transition()
                                .attr('r', vis.maxRad * 0.1)
                                .style('transform', `translate(${distCirc}px, ${distCirc}px)`);

                            // Append geoVarCirc
                            thisG.select('.geoWholeCirc')
                                .remove();

                            // Add tempText
                            const geoTextContainer = thisG.select('.geoTextContainer')
                                .transition()
                                .style('transform', `translate(${distText}px, ${distText}px)`);
                            geoTextContainer.select('.geoTextValue')
                                .style('transform', `rotate(-45deg) translateY(${-vis.maxRad * 0.075}px)`)
                                .text(() => '');


                        }

                    }),
                exit => exit.transition().remove()
            );

        // `````````````````````````````````````````````````````````````````````````````````````````````` regionZone
        // Config scale
        if (!vis.zoom) {
            vis.xScale.domain([0, vis.countries.length]);
            vis.arcScale.domain([0, vis.countries.length]);
            vis.angleScale.domain([0, vis.countries.length]);
        } else {
            vis.xScale.domain([0, vis.displayOutside[0].countries.length]);
            vis.arcScale.domain([0, vis.displayOutside[0].countries.length]);
            vis.angleScale.domain([0, vis.displayOutside[0].countries.length]);
        }

        // Init counter
        let counter = 0;
        let prev = -1;
        let flagUpdate = -9999;

        // Config arcMaker
        if (!vis.zoom) {
            vis.arcMaker
                .innerRadius(vis.ringRegionRad - 0.2)
                .outerRadius(vis.ringRegionRad + 0.2);
        } else {
            vis.arcMaker
                .innerRadius(vis.ringZoomRad - 0.2)
                .outerRadius(vis.ringZoomRad + 0.2);
        }

        vis.regionGs = vis.regionZone.selectAll('.regionG')
            .data(vis.displayMiddle, d => d.country)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'regionG')
                    .each(function (d, i) {
                        // Get this
                        const thisG = d3.select(this);

                        // Update entry
                        let value = d.years.items.Value;

                        // If a region is skipped bc it is being updated
                        if (prev !== i - 1) {
                            flagUpdate = counter;
                            counter += vis.displayMiddle[i - 1].defs.children.length;
                        }

                        // Set x and y
                        const x = vis.ringRegionRad * Math.sin(vis.xScale(counter));
                        const y = vis.ringRegionRad * Math.cos(vis.xScale(counter));

                        // Draw link line
                        const linkX = vis.ringCountryRad * Math.sin(vis.xScale(counter));
                        const linkY = vis.ringCountryRad * Math.cos(vis.xScale(counter));
                        thisG.append('line')
                            .attr('class', 'linkLine')
                            .attr('x1', x)
                            .attr('x2', linkX)
                            .attr('y1', y)
                            .attr('y2', linkY);

                        // Update startAngle
                        vis.arcMaker.startAngle(vis.arcScale(counter));

                        // Update counter
                        counter += d.defs.children.length;
                        prev = i;

                        // Update endAngle
                        vis.arcMaker.endAngle(vis.arcScale(counter));

                        // Draw angle if not at end
                        if (i !== vis.displayMiddle.length - 1) {
                            thisG.append('path')
                                .attr('class', 'linkPath')
                                .attr('d', vis.arcMaker);
                        }

                        // Append geoG
                        const geoG = thisG.append('g')
                            .attr('class', 'geoG geoRegionG')
                            .style('transform', `translate(${x}px, ${y}px)`);

                        // Append circ
                        geoG.append('circle')
                            .attr('class', 'geoVarCirc regionVarCirc')
                            .attr('r', vis.radScale(value));

                        // Append circ
                        geoG.append('circle')
                            .attr('class', 'geoWholeCirc regionWholeCirc')
                            .attr('r', vis.radScale(d.population));

                        // Add tempText
                        const textAngle = vis.angleScale(counter - d.defs.children.length);
                        const geoTextContainer = geoG.append('g')
                            .attr('class', 'geoTextContainer')
                            .style('transform', `rotate(${textAngle}deg) translateY(${-vis.radScale(d.population)}px)`);
                        geoTextContainer.append('text')
                            .attr('class', 'geoText geoTextDisplay geoTextM')
                            .style('transform', () => {
                                if (textAngle >= 90 && textAngle <= 270) {
                                    return `rotate(180deg) translateY(${vis.maxRad * 0.025}px`;
                                } else {
                                    return `rotate(0deg) translateY(${-vis.maxRad * 0.025}px)`;
                                }
                            })
                            .text(d.country);
                        geoTextContainer.append('text')
                            .attr('class', 'geoText geoTextValue')
                            .style('transform', () => {
                                if (textAngle >= 90 && textAngle <= 270) {
                                    return `rotate(180deg) translateY(${vis.maxRad * 0.075}px)`;
                                } else {
                                    return `rotate(0deg) translateY(${-vis.maxRad * 0.075}px)`;
                                }
                            })
                            .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');


                        // Add event
                        thisG.on('mouseover', e => {
                            //vis.tooltipControl(e, true);
                            vis.hoverControl(e);
                        }).on('mousemove', e => {
                            //vis.tooltipControl(e, true);
                        }).on('click', e => {
                            vis.zoomControl(e);
                            vis.extOutput(e);
                        });

                    }),
                update => update
                    .each(function (d, i) {
                        // Get this
                        const thisG = d3.select(this);

                        // If zoomed
                        if (!vis.zoom) {

                            // Check flag
                            if (flagUpdate === -9999) {
                                flagUpdate = counter;
                            }

                            // Update entry
                            let value = d.years.items.Value;

                            // Set x and y
                            const x = vis.ringRegionRad * Math.sin(vis.xScale(flagUpdate));
                            const y = vis.ringRegionRad * Math.cos(vis.xScale(flagUpdate));

                            // Draw link line
                            const linkX = vis.ringCountryRad * Math.sin(vis.xScale(flagUpdate));
                            const linkY = vis.ringCountryRad * Math.cos(vis.xScale(flagUpdate));
                            thisG.select('.linkLine')
                                .attr('class', 'linkLine')
                                .attr('x1', x)
                                .attr('x2', linkX)
                                .attr('y1', y)
                                .attr('y2', linkY);

                            // Update startAngle
                            vis.arcMaker.startAngle(vis.arcScale(flagUpdate));

                            // Update counter
                            counter = flagUpdate + d.defs.children.length;

                            // Update endAngle
                            vis.arcMaker.endAngle(vis.arcScale(counter));

                            // Draw angle if not at end
                            if (i !== vis.displayMiddle.length - 1) {
                                thisG.append('path')
                                    .attr('class', 'linkPath')
                                    .attr('d', vis.arcMaker);
                            }

                            // Append geoG
                            const geoG = thisG.select('.geoG')
                                .transition()
                                .style('transform', `translate(${x}px, ${y}px)`);

                            // Append circ
                            geoG.select('.geoVarCirc')
                                .transition()
                                .attr('r', vis.radScale(value));

                            // Append circ
                            geoG.select('.geoWholeCirc')
                                .transition()
                                .attr('r', vis.radScale(d.population));

                            // Add tempText
                            const textAngle = vis.angleScale(counter - d.defs.children.length);
                            const geoTextContainer = geoG.select('.geoTextContainer')
                                .transition()
                                .style('transform', `rotate(${textAngle}deg) translateY(${-vis.radScale(d.population)}px)`)

                            geoTextContainer.select('.geoTextDisplay')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.025}px`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.025}px)`;
                                    }
                                })
                                .text(d.country);
                            geoTextContainer.select('.geoTextValue')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.075}px)`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.075}px)`;
                                    }
                                })
                                .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');


                        } else {
                            // Update entry
                            let value = d.years.items.Value;

                            // Update scales
                            vis.radScale.domain([0, d.population]);

                            // Draw link line
                            thisG.select('.linkLine')
                                .attr('x1', 0)
                                .attr('x2', 0)
                                .attr('y1', 0)
                                .attr('y2', -vis.ringZoomRad);

                            // Remove linkPath
                            thisG.select('.linkPath')
                                .remove();

                            // Append geoG
                            const geoG = thisG.select('.geoG')
                                .transition()
                                .style('transform', `translate(0px, 0px)`);

                            // Append circ
                            geoG.select('.geoVarCirc')
                                .transition()
                                .attr('r', vis.radScale(value));

                            // Append circ
                            geoG.select('.geoWholeCirc')
                                .transition()
                                .attr('r', vis.radScale(d.population));

                            // Add tempText
                            const textAngle = vis.angleScale(counter - d.defs.children.length);
                            const geoTextContainer = geoG.select('.geoTextContainer')
                                .style('transform', `rotate(${textAngle}deg) translateY(${-vis.radScale(value)}px)`)
                            geoTextContainer.select('.geoTextDisplay')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.025}px`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.025}px)`;
                                    }
                                })
                                .text(d.country);
                            geoTextContainer.select('.geoTextValue')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.075}px)`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.075}px)`;
                                    }
                                })
                                .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');

                        }


                    }),
                exit => exit.remove()
            );

        // ````````````````````````````````````````````````````````````````````````````````````````````` countryZone

        // Init counter
        counter = 0;
        prev = -1;
        flagUpdate = -9999;

        // Config arcMaker
        if (!vis.zoom) {
            vis.arcMaker
                .innerRadius(vis.ringCountryRad - 0.2)
                .outerRadius(vis.ringCountryRad + 0.2);
        } else {
            vis.arcMaker
                .innerRadius(vis.ringZoomRad - 0.2)
                .outerRadius(vis.ringZoomRad + 0.2);
        }

        vis.countryGroupGs = vis.countryZone.selectAll('.countryGroupG')
            .data(vis.displayOutside, d => d.group)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'countryGroupG')
                    .each(function (cG, i) {

                        // Define this countryGroupG
                        const countryGroupG = d3.select(this);

                        // If a region is skipped bc it is being updated
                        if (prev !== i - 1) {
                            flagUpdate = counter;
                            counter = counter + vis.displayOutside[i - 1].countries.length;
                        }

                        // Delegate to nestedPattern()
                        nestedPattern(cG, countryGroupG);

                        // Update prev
                        prev = i;

                    }),
                update => update.each(function (cG) {

                    // Define this countryGroupG
                    const countryGroupG = d3.select(this);

                    // Check flag
                    if (flagUpdate !== -9999) {
                        counter = flagUpdate;
                    }

                    // Delegate to nestedPattern()
                    nestedPattern(cG, countryGroupG);

                }),
                exit => exit.remove()
            );

        function nestedPattern(cG, countryGroupG) {

            // Append countries
            vis.cGGs = countryGroupG.selectAll(`.cGG`)
                .data(cG.countries, d => d.country)
                .join(
                    enter => enter
                        .append('g')
                        .attr('class', `cGG`)
                        .each(function (d, i) {
                            // Get this
                            const thisG = d3.select(this);

                            // Update arcMaker
                            vis.arcMaker
                                .startAngle(vis.arcScale(counter))
                                .endAngle(vis.arcScale(counter + 1));

                            // Draw angle if not at end
                            if (i !== cG.countries.length - 1) {
                                thisG.append('path')
                                    .attr('class', 'linkPath')
                                    .attr('d', vis.arcMaker);
                            }

                            // Update entry
                            let value = d.years.items.Value;

                            // Set x and y
                            const x = vis.ringCountryRad * Math.sin(vis.xScale(counter));
                            const y = vis.ringCountryRad * Math.cos(vis.xScale(counter));

                            const geoG = thisG.append('g')
                                .attr('class', 'geoG geoCountryG')
                                .style('transform', `translate(${x}px, ${y}px)`);

                            // Append circ
                            geoG.append('circle')
                                .attr('class', 'geoVarCirc countryVarCirc')
                                .attr('r', vis.radScale(value));

                            // Append circ
                            geoG.append('circle')
                                .attr('class', 'geoWholeCirc countryWholeCirc')
                                .attr('r', vis.radScale(d.population));

                            // Add tempText
                            const textAngle = vis.angleScale(counter);
                            const geoTextContainer = thisG.append('g')
                                .attr('class', 'geoTextContainer')
                                .style('transform', `rotate(${textAngle}deg) translateY(${-vis.maxRad * 1.05}px)`)
                            geoTextContainer.append('text')
                                .attr('class', 'geoText geoTextDisplay')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.005}px)`;
                                    }
                                })
                                .text(d.defs.iSO3Code);
                            geoTextContainer.append('text')
                                .attr('class', 'geoText geoTextName')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.13}px)`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.13}px)`;
                                    }
                                })
                                .text(d.defs.nickname);
                            geoTextContainer.append('text')
                                .attr('class', 'geoText geoTextValue')
                                .style('transform', () => {
                                    if (textAngle >= 90 && textAngle <= 270) {
                                        return `rotate(180deg) translateY(${vis.maxRad * 0.065}px)`;
                                    } else {
                                        return `rotate(0deg) translateY(${-vis.maxRad * 0.065}px)`;
                                    }
                                })
                                .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');

                            // Update counter
                            counter++;

                            // Add event
                            thisG.on('mouseover', e => {
                                vis.hoverControl(e);
                                //vis.tooltipControl(e, true, true);
                            }).on('mousemove', e => {
                                //vis.tooltipControl(e, true, true);
                            }).on('click', e => {
                                vis.extOutput(e);
                            });
                        }),
                    update => update
                        .each(function (d, i) {
                            // Get this
                            const thisG = d3.select(this);

                            if (!vis.zoom) {

                                // Update arcMaker
                                vis.arcMaker
                                    .startAngle(vis.arcScale(counter))
                                    .endAngle(vis.arcScale(counter + 1));

                                // Draw angle if not at end
                                if (i !== cG.countries.length - 1) {
                                    thisG.select('.linkPath')
                                        .attr('d', vis.arcMaker);
                                }

                                // Update entry
                                let value = d.years.items.Value;

                                // Set x and y
                                const x = vis.ringCountryRad * Math.sin(vis.xScale(counter));
                                const y = vis.ringCountryRad * Math.cos(vis.xScale(counter));

                                const geoG = thisG.select('.geoG')
                                    .transition()
                                    .style('transform', `translate(${x}px, ${y}px)`);

                                // Append circ
                                geoG.select('.geoVarCirc')
                                    .transition()
                                    .attr('r', vis.radScale(value));

                                // Append circ
                                geoG.select('.geoWholeCirc')
                                    .transition()
                                    .attr('r', vis.radScale(d.population));

                                // Add tempText
                                const textAngle = vis.angleScale(counter);
                                const geoTextContainer = thisG.select('.geoTextContainer')
                                    .transition()
                                    .style('transform', `rotate(${textAngle}deg) translateY(${-vis.maxRad * 1.05}px)`)
                                geoTextContainer.select('.geoTextDisplay')
                                    .style('transform', () => {
                                        if (textAngle >= 90 && textAngle <= 270) {
                                            return `rotate(180deg) translateY(${vis.maxRad * 0.005}px)`;
                                        }
                                    })
                                    .text(d.defs.iSO3Code);
                                geoTextContainer.select('.geoTextValue')
                                    .style('transform', () => {
                                        if (textAngle >= 90 && textAngle <= 270) {
                                            return `rotate(180deg) translateY(${vis.maxRad * 0.065}px)`;
                                        } else {
                                            return `rotate(0deg) translateY(${-vis.maxRad * 0.065}px)`;
                                        }
                                    })
                                    .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');

                                // Update counter
                                counter++;

                            } else {
                                // Update arcMaker
                                vis.arcMaker
                                    .startAngle(vis.arcScale(counter))
                                    .endAngle(vis.arcScale(counter + 1));

                                // Draw angle if not at end
                                if (i !== cG.countries.length - 1) {
                                    thisG.select('.linkPath')
                                        .attr('d', vis.arcMaker);
                                }

                                // Update entry
                                let value = d.years.items.Value;

                                // Set x and y
                                const x = vis.ringZoomRad * Math.sin(vis.xScale(counter));
                                const y = vis.ringZoomRad * Math.cos(vis.xScale(counter));

                                const geoG = thisG.select('.geoG')
                                    .transition()
                                    .style('transform', `translate(${x}px, ${y}px)`);

                                // Append circ
                                geoG.select('.geoVarCirc')
                                    .transition()
                                    .attr('r', vis.radScale(value));

                                // Append circ
                                geoG.select('.geoWholeCirc')
                                    .transition()
                                    .attr('r', vis.radScale(d.population));

                                // Add tempText
                                const textAngle = vis.angleScale(counter);
                                const geoTextContainer = thisG.select('.geoTextContainer')
                                    .transition()
                                    .style('transform', `rotate(${textAngle}deg) translateY(${-vis.maxRad * 1.05}px)`)
                                geoTextContainer.select('.geoTextDisplay')
                                    .style('transform', () => {
                                        if (textAngle >= 90 && textAngle <= 270) {
                                            return `rotate(180deg) translateY(${vis.maxRad * 0.005}px)`;
                                        }
                                    })
                                    .text(d.defs.nickname);
                                geoTextContainer.select('.geoTextValue')
                                    .style('transform', () => {
                                        if (textAngle >= 90 && textAngle <= 270) {
                                            return `rotate(180deg) translateY(${vis.maxRad * 0.065}px)`;
                                        } else {
                                            return `rotate(0deg) translateY(${-vis.maxRad * 0.065}px)`;
                                        }
                                    })
                                    .text(() => d.years.items.Value ? d.years.items.Value + 'm (' + d.years.items.Percent + '%)' : 'Data n/a');

                                // Update counter
                                counter++;
                            }

                        }),
                    exit => exit.remove()
                )
        }

    }

    /*
    extPassthru
     */
    extOutput(e) {

        // Define this vis
        const vis = this;

        // Pass to
        vis.mod4ext.extInput(e);

    }

    /*
    tooltipControl
     */
    tooltipControl(e, on, country) {

        // Define this vis
        const vis = this;


        if (on) {

            let mouse = null;
            // Get mouse poses
            if (country) {
                mouse = d3.mouse(d3.event.currentTarget.parentElement.parentElement.parentElement.parentElement);
            } else {
                mouse = d3.mouse(d3.event.currentTarget.parentElement.parentElement.parentElement);
            }

            // Get x and y
            const x = mouse[0] + (vis.tooltipOffset * 5);
            const y = mouse[1] + (vis.tooltipOffset * 6);

            // Set tooltip
            vis.tooltip
                .classed('invisTT', false)
                .style('transform', `translate(${x}px, ${y}px)`);

            // Update texts
            vis.tooltip.select('.ttTextCountry')
                .text(e.defs.nickname);
            vis.tooltip.select('.ttTextValue')
                .text(() => {
                    if (e.years.items.Value) {
                        return d3.format(',')(e.years.items.Value * 1000000);
                    } else {
                        return ('Data n/a');
                    }
                });
        } else {

            // Set tooltip
            vis.tooltip
                .classed('invisTT', true)
        }
    }

    /*
    zoomControl
     */
    zoomControl(e) {

        // Define this vis
        const vis = this;

        if (!vis.zoom) {

            if (e.country !== 'Africa') {

                // Set zoom
                vis.zoom = true;

                // Update middle
                vis.savedMiddle = vis.displayMiddle.filter(d => d);
                vis.displayMiddle = [e];

                // Update outside
                vis.savedOutside = vis.displayOutside.filter(d => d);
                vis.displayOutside = [vis.displayOutside.find(c => c.group === e.country)];

                // Update
                vis.updateVis();
            }

        } else {

            if (e.country === 'Africa') {

                // Set zoom
                vis.zoom = false;

                // Update middle
                vis.displayMiddle = vis.savedMiddle;
                vis.displayOutside = vis.savedOutside;

                // Update
                vis.updateVis();
            }


        }
    }

    /*
    hoverControl
     */
    hoverControl(e) {

        // Define this vis
        const vis = this;

        // Clear classes
        d3.select('.selCir')
            .classed('selCir', false);
        d3.select('.selWholeCirc')
            .classed('selWholeCirc', false);
        d3.select('.selVarCirc')
            .classed('selVarCirc', false);
        d3.select('.selTextDisplay')
            .classed('selTextDisplay', false);
        d3.select('.selTextName')
            .classed('selTextName', false);
        d3.select('.selTextValue')
            .classed('selTextValue', false);

        // Set parent
        const parent = d3.select(d3.event.currentTarget)
            .classed('selCir', true);

        // Set classes
        const wholeCirc = parent.select('.geoWholeCirc')
            .classed('selWholeCirc', true);
        // Set classes
        const varCirc = parent.select('.geoVarCirc')
            .classed('selVarCirc', true);
        // Set classes
        const geoTextDisplay = parent.select('.geoTextDisplay')
            .classed('selTextDisplay', true);
        // Set classes
        const geoTextValue = parent.select('.geoTextValue')
            .classed('selTextValue', true);

        // If not zoomed
        if (!vis.zoom) {
            // Set classes
            const geoTextName = parent.select('.geoTextName')
                .classed('selTextName', true);
        }
    }

    /*
    createExt
     */
    createExt() {

        // Define this vis
        const vis = this;

        // Define svg to pass thru
        vis.svg = mod4_svg;

        // Create Mod4Ext
        vis.mod4ext = new Mod4Ext(mod4Supply, vis.displayInside[0], vis.svg);
    }

}


// })();
