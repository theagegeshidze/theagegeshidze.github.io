
function createMap(width, height) {
  d3.select("#map")
    .attr("width", width)
    .attr("height", height)
    .append("text")
    .attr("x", width / 2)
    .attr("y", "1em")
    .attr("font-size", "1.5em")
    .style("text-anchor", "middle")
    .classed("map-title", true);
}

function drawMap(geoData, climateData, year, dataType) {
  let map = d3.select("#map");

  let projection = d3
    .geoMercator()
    .scale(110)
    .translate([+map.attr("width") / 2, +map.attr("height") / 1.4]);

  let path = d3.geoPath().projection(projection);

  d3.select("#year-val").text(year);

  // adding climateData to each country for the selected year
  geoData.forEach(d => {
    let countries = climateData.filter(row => row.countryCode === d.id);
    let name = "";

    if (countries.length > 0) name = countries[0].country;

    d.properties = countries.find(c => c.year === year) || { country: name };
  });

  let colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"];

  let domains = {
    emissions: [0, 2.5e5, 1e6, 5e6],
    emissionsPerCapita: [0, 0.5, 2, 10]
  };

  let mapColorScale = d3
    .scaleLinear()
    .domain(domains[dataType])
    .range(colors);

  let update = map.selectAll(".country").data(geoData);

  update
    .enter()
    .append("path")
    .classed("country", true)
    .attr("d", path)
    .on("click", function() {
      // assigning the selected country a class of 'active' or 'inactive'
      // and using that to manipulate the bar chart
      let currentDataType = d3.select("input:checked").property("value");

      let country = d3.select(this);

      let isActive = country.classed("active");

      let countryName = isActive ? "" : country.data()[0].properties.country;

      drawBar(climateData, currentDataType, countryName);
      highlightBars(+d3.select("#year").property("value"));

      d3.selectAll(".country").classed("active", false);

      country.classed("active", !isActive);
    })
    .merge(update)
    .transition()
    .duration(750)
    .attr("fill", d => {
      let val = d.properties[dataType];

      return val ? mapColorScale(val) : "#ccc";
    });

  d3.select(".map-title").text(
    `Carbon dioxide ${graphTitle(dataType)}, ${year}`
  );
}

function graphTitle(str) {
  return str.replace(/[A-Z]/g, c => ` ${c.toLowerCase()}`);
}
