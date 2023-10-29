function init()
{

    const width = window.innerWidth;
const height = window.innerHeight;

const colorScheme = [
    "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"
];

const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const color = d3.scaleQuantile()
    .domain([0, 100000])
    .range(colorScheme);

let totalMigration = null;

const fetchData = async () => {
    const [statesTopo, migrationData] = await Promise.all([
        d3.json("us.json"),
        d3.csv("us_migration_data.csv")
    ]);

    totalMigration = calculateTotalMigration(migrationData);

    drawMap(statesTopo, migrationData);
};

const calculateTotalMigration = (data) => {
    const totalMigration = {};
    for (const stateName in data) {
        totalMigration[stateName] = d3.sum(Object.values(data[stateName]));
    }
    return totalMigration;
};

const drawMap = (statesTopo, migrationData) => {
    svg.selectAll("path")
        .data(topojson.feature(statesTopo, statesTopo.objects.states).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            const stateName = d.properties.NAME;
            return color(totalMigration[stateName]);
        })
        .attr("data-state", function (d) {
            return d.properties.NAME;
        })
        .on("mouseover", function (d) {
            const stateName = d3.select(this).attr("data-state");
            const total = totalMigration[stateName];
            createTooltip(stateName, total);
        })
        .on("mouseout", function () {
            d3.selectAll(".tooltip").remove();
        });
};

const createTooltip = (stateName, total) => {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0);

    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

    tooltip.html(`<strong>${stateName}</strong>: ${total} migrants (${total.toLocaleString()} people)`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
};

fetchData();

}

window.onload = init;


