'use strict';


/* `````````````````````````````````\```````````````````````\
    Class: Mod4Ext                |                       |
 ``````````````````````````````````/``````````````````````*/
class Mod4Ext {

    // Constructor
    constructor(_supply, _starterData, _svg) {
        this.supply = _supply;
        this.starterData = _starterData
        this.svg = _svg;
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

    }

    /*
    initVis
     */
    initVis() {

        // Define this vis
        const vis = this;


        // Config extG
        vis.extGMargin = {top: 100, right: 1025, bottom: 0, left: 0}
        vis.extGWidth = vis.svg.attr("width") - (vis.extGMargin.left + vis.extGMargin.right)
        vis.extGHeight = vis.svg.attr("height") - (vis.extGMargin.top + vis.extGMargin.bottom)

        // Create container inside viz
        vis.extG = vis.svg.append("g")
            .attr("class", "extG")
            .style("transform", `translate(${vis.extGMargin.left}px, ${vis.extGMargin.top}px)`);

        // Conversion scales
        vis.gProteinToCal = 4
        vis.gFatToCal = 9
        vis.recCalFemaleMin = {gender: 'female', range: 'min', value: 1600};
        vis.recCalFeMaleMax = {gender: 'female', range: 'max', value: 2400};
        vis.recCalMaleMin = {gender: 'male', range: 'min', value: 2000};
        vis.recCalMaleMax = {gender: 'male', range: 'max', value: 3000};
        vis.recCalData = [vis.recCalFemaleMin, vis.recCalFeMaleMax, vis.recCalMaleMin, vis.recCalMaleMax];

        // Create scales
        vis.caloriesScale = d3.scaleLinear()
            .range([0, 150])
            .domain([0, vis.recCalMaleMax.value])

        // Init input
        vis.input = null;

        // Build overview g
        vis.overviewG = vis.extG.append("g")
            .attr("class", "overviewG")
            .style("transform", `translate(${vis.extGWidth / 2}px, ${vis.extGHeight * 0.1}px)`)

        vis.overviewG.append("text")
            .attr("class", "countryTitle")
            .text("Country")

        vis.overviewG.append("text")
            .attr("class", "countryText1 countryText")
            .style("transform", `translateY(40px)`)
            .text("10,000,000")

        vis.overviewG.append("text")
            .attr("class", "countryLabel1 countryLabel")
            .style("transform", `translateY(60px)`)
            .text("People")

        vis.overviewG.append("text")
            .attr("class", "countryText2 countryText")
            .style("transform", `translateY(100px)`)
            .text("1,000,000")

        vis.overviewG.append("text")
            .attr("class", "countryLabel2 countryLabel")
            .style("transform", `translateY(120px)`)
            .text("Undernourished")

        vis.overviewG.append("text")
            .attr("class", "countryResult")
            .style("transform", `translateY(180px)`)
            .text("10.0%")

        // Create food supply G
        vis.foodSupplyG = vis.extG.append("g")
            .attr("class", "foodSupplyG")
            .style("transform", `translate(${vis.extGWidth / 2}px, 300px)`)

        vis.foodSupplyBarsG = vis.foodSupplyG.append("g")
            .attr("class", "foodSupplyBarsG ")


        // Wrangle
        vis.wrangleVis();
    }

    /*
    wrangleVis
     */
    wrangleVis() {

        // Define this vis
        const vis = this;

        // Define display data
        if (vis.input) {
            vis.displayData = vis.input
        } else {
            vis.displayData = vis.starterData
        }

        // Get supply data
        vis.supplyDisplayData = vis.supply.find(d => d["Country Code"] === vis.displayData.countryCode)
        if (!vis.supplyDisplayData) vis.supplyDisplayData = {Value: 0}

        // Update
        vis.updateVis();

    }

    /*
    updateVis
     */
    updateVis() {

        // Define this vis
        const vis = this;

        // Update country title
        vis.overviewG.select(".countryTitle")
            .text(vis.displayData.defs.nickname)

        vis.overviewG.select(".countryText1")
            .text(d3.format(",")(vis.displayData.population * 1000000))

        vis.overviewG.select(".countryText2")
            .text(() => {
                if (vis.displayData.years.items.Value) {
                    return d3.format(",")(vis.displayData.years.items.Value * 1000000)
                } else {
                    return "Data n/a"
                }

            })


        vis.overviewG.select(".countryResult")
            .text(() => {
                if (vis.displayData.years.items.Percent) {
                    return vis.displayData.years.items.Percent + "%"
                } else {
                    return ""
                }
            })

        // Build food supply bars G
        vis.foodSupplyBars = vis.foodSupplyBarsG.selectAll(".foodSupplyBar")
            .data([vis.supplyDisplayData])
            .join(
                enter => enter
                    .append("g")
                    .attr("class", "foodSupplyBar")
                    .each(function (d, i) {
                        // Define this food supply bar
                        const foodSupplyBar = d3.select(this)
                            .style("transform", `translateY(${i * 60}px)`)

                        // Get width
                        const barW = vis.caloriesScale(vis.recCalMaleMax.value)
                        const barH = 20;

                        // Append label
                        foodSupplyBar.append("text")
                            .attr("class", "foodSupplyText")
                            .text("Food Supply");
                        foodSupplyBar.append('text')
                            .attr('class', 'foodSupplyUnit')
                            .style('transform', 'translateY(20px)')
                            .text('calories/person/day')

                        // Create calorie result g
                        const calorieResultG = foodSupplyBar.append("g")
                            .attr("class", "calorieResultG")
                            .style("transform", `translate(${-barW / 2}px, 100px)`)

                        // Build recommended calorie bar
                        calorieResultG.append("rect")
                            .transition()
                            .attr("class", "recCalBar")
                            .attr("width", barW)
                            .attr("height", barH)
                            .attr("fill", "rgba(0,0,0,0.25");

                        // Build actual calorie bar
                        calorieResultG.append("rect")
                            .transition()
                            .attr("class", "actualCalBar")
                            .attr("width", vis.caloriesScale(d.Value))
                            .attr("height", barH)
                            .attr("fill", "rgba(0,0,0,1")

                        // Append value
                        calorieResultG.append('text')
                            .attr('class', 'calResultText')
                            .style('transform', `translate(5px, ${barH / 2 + 1}px)`)
                            .text(d3.format(',')(d.Value));

                        // Add calorie labels
                        let prevEntry = null;
                        const calorieResultLabelG = calorieResultG.append('g')
                            .attr('class', 'calorieResultLabelG');
                        // Append countryCalLabel
                        const countryCalLabel = calorieResultLabelG.append('g')
                            .attr('class', 'countryCalLabel')
                            .style('transform', `translateX(22px)`);
                        countryCalLabel.append('line')
                            .attr('class', 'calLabelLine')
                            .attr('y1', -3)
                            .attr('y2', -13);
                        countryCalLabel.append('text')
                            .attr('class', 'calLabelText')
                            .style('transform', `translateY(${-20}px)`)
                            .text('Actual')
                        vis.recCalData.forEach((rCD, i) => {
                            const calLabel = calorieResultLabelG.append('g')
                                .attr('class', 'calLabel')
                                .style('transform', `translateX(${vis.caloriesScale(rCD.value)}px)`);
                            calLabel.append('line')
                                .attr('class', 'calLabelLine')
                                .attr('y1', rCD.gender === 'male' ? -barH : barH * 2)
                                .attr('y2', barH)
                            calLabel.append('line')
                                .attr('class', 'calLabelLineWhite')
                                .attr('y1', 0)
                                .attr('y2', barH)
                            // Append range label
                            calLabel.append('text')
                                .attr('class', () => {
                                    if (rCD.range === 'max') {
                                        return 'calLabelText calLabelTextSpecial calLabelTextR';
                                    } else {
                                        return 'calLabelText calLabelTextSpecial calLabelTextL';
                                    }
                                })
                                .style('transform', () => {
                                    let x = 0;
                                    let y = 0;
                                    if (rCD.gender === 'male') {
                                        y = -barH;
                                        if (rCD.range === 'max') {
                                            x = 3;
                                        } else {
                                            x = -3;
                                        }
                                    } else {
                                        y = barH * 2;
                                        if (rCD.range === 'max') {
                                            x = 3;
                                        } else {
                                            x = -3;
                                        }
                                    }
                                    return `translate(${x}px, ${y}px)`;
                                })
                                .text(rCD.value);
                            // Connector line
                            if (i % 2 === 1) {
                                const dist = vis.caloriesScale(prevEntry.value) - vis.caloriesScale(rCD.value);
                                const coords = [
                                    [0, rCD.gender === 'male' ? -barH : barH * 2],
                                    [dist / 2, rCD.gender === 'male' ? -barH - 5 : barH * 2 + 5],
                                    [dist, rCD.gender === 'male' ? -barH : barH * 2]
                                ];
                                const lineMaker = d3.line();
                                calLabel.append('path')
                                    .attr('class', 'calLabelPath')
                                    .attr('d', lineMaker(coords));
                                calLabel.append('text')
                                    .attr('class', 'calLabelText')
                                    .style('transform', `translate(${dist / 2}px, 
                                    ${rCD.gender === 'male' ? -barH - 15 : barH * 2 + 15}px`)
                                    .html(rCD.gender === 'male' ? `rec.&#9794; range` : `rec.&#9792; range`)
                            }
                            // Set previous entry
                            prevEntry = rCD;
                        });

                        // Add event
                        calorieResultLabelG.on('mouseover', (e) => {
                            // Show labels
                            d3.selectAll('.calLabelTextSpecial')
                                .classed('calLabelTextSel', true);
                        }).on('mouseout', () => {
                            // Show labels
                            d3.selectAll('.calLabelTextSpecial')
                                .classed('calLabelTextSel', false);
                        });

                    }),
                update => update
                    .each(function (d, i) {
                        // Define this food supply bar
                        const foodSupplyBar = d3.select(this);

                        // Create calorie result g
                        const calorieResultG = foodSupplyBar.select(".calorieResultG")

                        // Build actual calorie bar
                        calorieResultG.select(".actualCalBar")
                            .transition()
                            .attr("width", vis.caloriesScale(d.Value));

                        // Append value
                        calorieResultG.select('.calResultText')
                            .text(d.Value !== 0 ? d3.format(',')(d.Value) : 'Data n/a');

                    }),
                exit => exit.remove()
            )
    }

    /*
    extInput
     */
    extInput(e) {

        // Define this vis
        const vis = this;

        // Event input
        vis.input = e;

        // Wrangle
        vis.wrangleVis();

    }

}


