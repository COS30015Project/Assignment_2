function init() {
    const width = 1200;
    const height = 1000;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const div = d3.select('body').append('div')
        .attr('class', 'info-box')
        .style('opacity', 0);

    const myColor = d3.scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1, 100]);

    Promise.all([
        d3.json('usa.json'),
        d3.csv('us_migration_data.csv')
    ]).then(([usData, data]) => {
        const csvData = data.slice(1);

        const processedData = {};
        csvData.forEach(function (d) {
            const stateName = d['US States'];
            processedData[stateName] = {
                Bangladesh: +d.Bangladesh,
                China: +d.China,
                India: +d.India,
                Iran: +d.Iran,
                Korea: +d.Korea,
                Pakistan: +d.Pakistan,
                Philippines: +d.Philippines,
                Taiwan: +d.Taiwan,
                Vietnam: +d.Vietnam,
                Others: +d.Others,
                Total: +d.Total
            };
        });

        const projection = d3.geoAlbersUsa();
        const path = d3.geoPath().projection(projection);

        svg.selectAll('path')
            .data(usData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .on('mouseover', function (d) {
                const stateData = d.properties.NAME;
                const data = processedData[stateName];
                const formattedData = formatData(data);

                div.style('opacity', 0.9);
                div.html('<b>' + d.properties.NAME + '</b><br>' +
                    'Bangladesh: ' + formattedData + '<br>' +
                    'China: ' + formattedData + '<br>' +
                    'India: ' + formattedData + '<br>' +
                    'Iran: ' + formattedData + '<br>' +
                    'Korea: ' + formattedData + '<br>' +
                    'Pakistan: ' + formattedData + '<br>' +
                    'Philippines: ' + formattedData + '<br>' +
                    'Taiwan: ' + formattedData + '<br>' +
                    'Vietnam: ' + formattedData + '<br>' +
                    'Others: ' + formattedData + '<br>' +
                    'Total: ' + stateData.Total)
                    .style('left', (d3.event.pageX + 23) + 'px')
                    .style('top', (d3.event.pageY - 20) + 'px');
            })
            .on('mouseout', function () {
                div.style('opacity', 0);
            });
    });
}

window.onload = init;
