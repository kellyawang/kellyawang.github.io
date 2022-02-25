'use strict';

// Init data
let data = {};
let mod1Data = null;
let mod2Data = {};
let mod3Data = null;
let mod4Data = null;
let mod4Defs = null;
let mod4Pop = null;
let mod4Supply = null;


var parseDate = d3.timeParse("%Y");

/* `````````````````````````````````\```````````````````````\
    Global Object Constants         |                       |
 ``````````````````````````````````/``````````````````````*/
var choroplethVis, choroplethArcs, areaVis;

// Reference for color scale:
// https://github.com/d3/d3-scale-chromatic
// https://github.com/d3/d3-scale/blob/master/README.md#sequential-scales
// Choropleth hover effects:
// https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html

const purples6 = ["#e8e4f4", "#bcb7db", "#8e84c2", "#7263af", "#54409b", "#462d9a"]
const pinks8 = ["#ffe5eb", "#f2becb", "#f689a0", "#f9547a", "#eb0e44", "#ac1e3c", "#721026", "#4f0716"]
const oranges8 = ["#fee8d3","#fdc28c","#fb8d3d","#f2701d","#e25609","#c44103","#9f3303","#7f2704"]
const greens8 = ["#f7ffeb", "#d2ecad", "#aee35f", "#86d70d", "#51b300", "#3f8c00", "#3f6900", "#335500"]

var colorScaleMap = {
    'Annual population': pinks8,
    'Agriculture Total': oranges8,
    'Crops and livestock products': purples6,
    'Food Balance Sheets': greens8,
}

var unitsMap = {
    'Annual population': "People",
    'Agriculture Total': "Gigagrams",
    'Crops and livestock products': "USD",
    'Food Balance Sheets': "Tonnes",
}

var commaFormat = d3.format(",");
var billionFormat = d3.format(".3s");

var yellow = 'rgba(255, 184, 64, 0.75)'
var orange = 'rgb(250,92,0)'
var pink = 'rgb(235,14,68)'
var green = 'rgb(114,191,0)'
var purple = 'rgb(111,111,196)'
var darkOrange = 'rgb(160,77,0)'
var darkPink = 'rgb(165,14,50)'
var darkGreen = 'rgb(60,121,0)'
var darkPurple = 'rgb(58,58,116)'


// Data to be loaded
const mod1Jsons = [
    'data/mod1/faostat_world_pop.json',
    'data/mod1/faostat_africa_pop.json',
    'data/mod1/faostat_world_fbs_agg.json',
    'data/mod1/faostat_africa_fbs_agg.json',
    'data/mod1/faostat_world_value_agg.json',
    'data/mod1/faostat_africa_value_agg.json',
    'data/mod1/faostat_world_em_agri_agg.json',
    'data/mod1/faostat_africa_em_agri_agg.json',
];

const fourDomains = ['Annual population', 'Agriculture Total', 'Crops and livestock products', 'Food Balance Sheets']

// Load Vis 1 data
const mod1Promises = [];
mod1Jsons.forEach(url => {
    mod1Promises.push(d3.json(url));
});
Promise.all(mod1Promises).then(d => {

    // Define data in obj
    mod1Data = {
        worldPop: d[0][0],
        africaPop: d[1][0],
        worldFBS: d[2][0],
        africaFBS: d[3][0],
        worldValue: d[4][0],
        africaValue: d[5][0],
        worldEmissionsAgri: d[6][0],
        africaEmissionsAgri: d[7][0]
    };

    // Handle in d3Launchpad
    d3LaunchpadPart1()

}).catch(err => console.error(err));


/* `````````````````````````````````\```````````````````````\
    Function: d3Launchpad1 part 1   |   RE: VOID            |
 ``````````````````````````````````/``````````````````````*/
function d3LaunchpadPart1() {

    // Define mod1L data (world)
    const mod1A_data = {
        emissions: mod1Data.worldEmissionsAgri.years,
        pop: mod1Data.worldPop.years,
        fBS: mod1Data.worldFBS.years,
        value: mod1Data.worldValue.years,
    };

    // Define mod1B data (africa)
    const mod1B_data = {
        emissions: mod1Data.africaEmissionsAgri.years,
        pop: mod1Data.africaPop.years,
        fBS: mod1Data.africaFBS.years,
        value: mod1Data.africaValue.years,
    };

    // Instatiate mod1L
    const mod1 = new Mod1Main(mod1A_data, mod1B_data, 4);

}

// Load data for Vis 2 and 3
// Data to be loaded
const choroplethJsons = [
    'data/mod2/faostat_combined_pop.json',//0
    'data/mod2/faostat_combined_em_agri.json', //1
    'data/mod2/faostat_combined_value.json', //2
    'data/africa.topo.json', //3
    'data/global/faostat_0_defs_foodSecurity_country-group.json', //4
];

const jsons1 = ['world', 'africa', 'africaeastern', 'africamiddle', 'africanorthern', 'africasouthern', 'africawestern', 'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Congo', 'Cote dIvoire', 'Djibouti', 'Egypt', 'Eswatini', 'Ethiopia', 'Ethiopia PDR', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Sierra Leone', 'South Africa', 'Sudan', 'Sudan former', 'Togo', 'Tunisia', 'Uganda', 'United Republic of Tanzania', 'Zambia', 'Zimbabwe'];

const promises = [];
const fbs_promises = [];
let mod3_promises = [];
jsons1.forEach(ref => {
    mod3_promises.push(d3.json(`data/mod2/fbs/faostat_africa_${ref.split(' ').join('').toLowerCase()}_fbs.json`));
});

Promise.all(mod3_promises).then(d1 => {

    // Init new array
    let d1New = [];

    // MOD3: Reconfigure data (add first array element)
    d1.forEach(d1Old => {
        d1New.push(d1Old[0]);
    });
    data.combined_food = d1New

    // MOD3: Define data in obj
    mod3Data = [{domain: d1New[0].domain, data: d1New}];

    // Clear promises
    mod3_promises = [];

    // MOD2 & MOD3
    choroplethJsons.forEach(url => {
        mod3_promises.push(d3.json(url));
    });
    Promise.all(mod3_promises).then(d2 => {

        // MOD2: Define data in an object
        data.combined_pop = d2[0]
        data.combined_em = d2[1]
        data.combined_trade = d2[2]
        mod2Data.mapTopJson = d2[3]

        // this gets used later in Vis 4 as well
        mod2Data.foodSecurityDefs = d2[4];

        // MOD3: Add to data
        // Vis3 only uses the first three data sets. Do not push d2[3] or d2[4] to mod3Data
        d2.forEach((d2Now, i) => {
            if(i < d2.length - 2) mod3Data.push({domain: d2Now[0].domain, data: d2Now})
        });

        // Handle in d3Launchpad
        d3LaunchpadPart2()

    }).catch(err => console.error(err));

}).catch(err => console.error(err));

/* `````````````````````````````````\```````````````````````\
    Function: d3Launchpad part 2    |   RE: VOID            |
 ``````````````````````````````````/``````````````````````*/
function d3LaunchpadPart2() {
    /* Set up Event Handler */
    let eventHandler = {};

    /* Set up Choropleth */
    let mapTopJson = mod2Data.mapTopJson
    let compiledData = compileChoroplethData();

    // choropleth is our "context" visualization which we use to control other visualizations
    choroplethVis = new ChoroplethVis("choroplethVis", compiledData, mapTopJson, eventHandler) // countryDataByCountryId

    /* Set up Linked timeline */
    areaVis = new AreaTimeline("areaVis", compiledData, eventHandler)

    // Bind event handler
    $(eventHandler).bind("countryClicked", function(event, clickedCountry, currentDomain) {
        choroplethVis.onCountryClicked(clickedCountry)
        areaVis.onCountryClicked(clickedCountry, currentDomain);
    });


    /* Set up Mod 3 */
    const mod3 = new Mod3Main(mod3Data);

}

// Load data for Vis 4
// Data to be loaded
const mod4Jsons = [
    'data/global/faostat_0_defs_foodSecurity_country-group.json',
    'data/mod4/faostat_combined_foodSecurity.json',
    'data/mod2/faostat_combined_pop.json'
];

// Load data
const mod4Promises = [];
mod4Jsons.forEach(url => {
    mod4Promises.push(d3.json(url));
});
Promise.all(mod4Promises).then(d => {

    // Define data in obj
    mod4Defs = d[0];
    mod4Data = d[1];
    mod4Pop = d[2];

    // Load food supply data
    d3.csv('data/mod4/FAOSTAT_combined_fbs_supply.csv', d => d)
        .then(d => {
            // Redefine supply
            mod4Supply = d;
            // Handle in d3Launchpad
            d3LaunchpadPart3();
        }).catch(err => console.error(err));

}).catch(err => console.error(err));


/* `````````````````````````````````\```````````````````````\
    Function: d3Launchpad           |   RE: VOID            |
 ``````````````````````````````````/``````````````````````*/
function d3LaunchpadPart3() {

    // Instantiate mod4
    const mod4 = new Mod4Main(mod4Data, mod4Defs, mod4Pop);


}

/*
 * Compiles all data from our four domains (Population, Emissions, Food Balance, Trade Value)
 * into an array of four objects, preserving country and year data for each country, and inserting ISO code
 *
 * @Input: Object
 * For each key in the data object, we collect country data into one array
 * Keys in data object:
 *      - combined_pop
 *      - combined_em
 *      - combined_trade
 *      - combined_food
 * Values in data:
 *      - Array of countries containing a object that represents the country
 *      - eg. {domain: "Annual population", countryCode: "4", country: "Algeria", years: Array(51)}
 *
* @Output: Array
 * [{domain: "Annual population", countries: [data by country]}
 * {domain: "Agriculture Total", countries: [data by country]}
 * {domain: "Crops and livestock products", countries: [data by country}
 * {domain: "Food Balance Sheets", countries: [data by country]}]
 */
function compileChoroplethData() {
    let compiledData = []
    let newCompiled = []
    const regions = ["5000", "5100", "5101", "5102", "5103", "5104", "5105"]

    fourDomains.forEach(d => {
        newCompiled.push({ domain: d, countries: [] })
    })

    for (const currentDomain in data) {
        // get the countries array of the given domain
        let countryCollector = newCompiled.find(domainObj => domainObj.domain === data[currentDomain][0].domain).countries

        data[currentDomain].forEach(d => {
            // Special handling for Ethiopia and Sudan which are split across two country entries
            // NOTE: These cases expect that once we get to Ethiopia PDR and Sudan(former) respectively,
            // we assume that Ethiopia and Sudan have already been added to the countries array
            if (d.country === "Ethiopia PDR") {
                let ethiopia = countryCollector.find(c => c.country === "Ethiopia")
                d.years.forEach(y => ethiopia.years.push(y))
                ethiopia.years.sort((a, b) => (+a.year) - (+b.year))

            } else if (d.country === "Sudan (former)") {
                let sudan = countryCollector.find(c => c.country === "Sudan")
                d.years.forEach(y => sudan.years.push(y))
                sudan.years.sort((a, b) => (+a.year) - (+b.year))

            } else if (d.country === "Mayotte") {
                // Mayotte is not in Food Security mapping, but we know its ISO code so add it manually
                countryCollector.push({ iso_a3: "MYT", country: d.country, years: d.years })

            } else {
                let countryInFoodSecurity = mod2Data.foodSecurityDefs.find(def => (def.type === 'child' && def.code === d.countryCode))
                if (countryInFoodSecurity) {
                    countryCollector.push({
                        iso_a3: countryInFoodSecurity.iSO3Code,
                        country: d.country,
                        years: d.years
                    })
                } else if (regions.includes(d.countryCode)) {
                    countryCollector.push({
                        iso_a3: "N/A",
                        country: d.country,
                        years: d.years
                    })
                }
            }
        })
    }

    //return compiled data array
    return newCompiled

}

function updateDomainSelection() {
    let selector = d3.select("#choroplethSelect").property("value");
    choroplethVis.wrangleData(selector);
    areaVis.wrangleData(selector);
}
