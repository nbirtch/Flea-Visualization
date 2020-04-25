class RegionMap {
  
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 600,
    }
    
    this.config.margin = _config.margin || { top: 50, bottom: 50, right: 10, left: 10 }
    
    this.initVis();
  }
  
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom + 200;

    vis.continentFocus = "none";
    vis.countryFocus = "none";
    vis.colourScheme = "Default";
    vis.yearFilterStart = 2006;
    vis.yearFilterEnd = 2017;

    vis.graticule = d3.geoGraticule();

    vis.zoom = d3.zoom()
        .scaleExtent([1, 6])
        .translateExtent([[0, 0], [vis.width, vis.height]])
        .on('zoom', function() {
          vis.chartRegions.selectAll('path')
              .attr('transform', d3.event.transform);
          vis.chartPoints.selectAll('circle')
              .attr('transform', d3.event.transform);
          $("#clickable-tooltip").attr("style", "opacity: 0;");;
          $("#clickable-tooltip-hidden").val("");
        });

    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight)
        .call(vis.zoom);

    vis.chartPoints = vis.svg.append("g");
    vis.chartRegions = vis.svg.append("g");

    vis.projection = d3.geoMercator()
        .scale(vis.width / 2 / Math.PI)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.jsonMapping = {};
    vis.jsonMapping["Continents"] = {file: "world-continents.json", obj: "continent"};
    vis.jsonMapping["Countries"] = {file: "world-countries-sans-antarctica.json", obj: "countries1"};

    vis.palette = {};
    vis.palette["Default"] = {region: "#b4a606", points: "#a20019", highlight: "#01a669"};
    vis.palette["CBF"] = {region: "#013277", points: "#ff5f98", highlight: "#b44900"};

    vis.clickableTooltip = d3.select("#clickable-tooltip");
  }

  update() {
    let vis = this;
    vis.processedData = [...vis.data];
    // Process Data Filtering
    if (vis.selectedDots !== undefined) {
      vis.processedData = vis.processedData.filter(d => vis.selectedDots.includes(d.ID));
    }
    if (vis.countryFocus === "none") {
      if (vis.continentFocus !== "none") {
        vis.processedData = vis.processedData.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)) && d.Continent === this.continentFocus);
      } else {
        vis.processedData = vis.processedData.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)));
      }
      vis.render();
    }
    if (vis.countryFocus !== "none") {
      vis.processedData = vis.processedData.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)) && d.Country === this.countryFocus);
      vis.render();
    }
  }

  render() {
    let vis = this;
    // Render points
    vis.chartPoints.selectAll("circle").remove();

    vis.chartPoints.selectAll("circle")
        .data(vis.processedData, d => d.ID)
        .join("circle")
        .attr("cx", d =>  vis.projection([d.Lon,d.Lat])[0])
        .attr("cy", d =>  vis.projection([d.Lon,d.Lat])[1])
        .attr("r",2)
        .attr('id', d => "map-" + d.ID)
        .style("fill", vis.palette[vis.colourScheme].points)
        .attr('data-info', d => vis.getInfoBox(d))
        .on("mouseover", function () {
          let point = d3.select(this);
          point.style("fill", vis.palette[vis.colourScheme].highlight);
          $("#info-box").html($(this).attr("data-info"));
        })
        .on("mouseout", function () {
          let point = d3.select(this);
          point.style("fill", vis.palette[vis.colourScheme].points);
          $("#info-box").empty();
          let selectedInfo = $("#selected-dot-info").val();
          if (selectedInfo !== "") $("#info-box").html(selectedInfo);
        })
        .on("click", function(d) {
          vis.clickableTooltip.transition()
              .duration(300)	
              .style("opacity", .9);	
          vis.clickableTooltip
              .style("left", (d3.event.pageX + 2) + "px")			 
              .style("top", (d3.event.pageY - 40) + "px");
          $("#clickable-tooltip-hidden").val(d.ID);
        })
        .append("svg:title")
        .text(function(d) { return "ID: " + d.ID + "\n" + "Species: " + d.FleaSpecies +  "\n" + "Subspecies: " + d.FleaSubspecies +  "\n" + "Host Species: " +  d.HostSpecies;});

    vis.chartPoints.raise();

    // Render Map
    vis.chartRegions.selectAll("path").remove();

    vis.chartRegions.append("path")
        .datum(vis.graticule)
        .attr("class", "graticule")
        .attr("d", vis.path);

    if (vis.countryFocus === "none" && vis.continentFocus === "none") {
      d3.json("data/" + vis.jsonMapping["Continents"].file).then(t => {
        let continents = topojson.feature(t, t.objects[vis.jsonMapping["Continents"].obj]).features;

        let path = vis.chartRegions.selectAll(".continent")
            .data(continents);

        path.enter()
            .append("path")
            .attr("d", vis.path)
            .attr("title", function (d) {
              return d.properties.continent;
            })
            .style("fill", vis.palette[vis.colourScheme].region)
            .on("mouseover", function () {
              let region = d3.select(this);
              region.style("fill", vis.palette[vis.colourScheme].highlight);
            })
            .on("mouseout", function () {
              let region = d3.select(this);
              region.style("fill", vis.palette[vis.colourScheme].region);
            })
            .on("click", function () {
              let mouse = d3.mouse(this);
              d3.event.stopPropagation();
              vis.svg.transition().duration(2000).call(
                  vis.zoom.transform,
                  d3.zoomIdentity.translate(vis.width / 2, vis.height / 2).scale(4).translate(-mouse[0], -mouse[1])
              );

              let region = d3.select(this);
              $("#select-continent").val(region.attr("title")).change();
              $("#select-continent").selectmenu("refresh");
              $("#select-continent").trigger("selectmenuchange");
            })
            .append("svg:title")
            .text(function(d) { return d.properties.continent;});
      });
    }
    if (vis.countryFocus !== "none" || vis.continentFocus !== "none") {
      d3.json("data/" + vis.jsonMapping["Countries"].file).then(t => {
        let countries = topojson.feature(t, t.objects[vis.jsonMapping["Countries"].obj]).features;

        let path = vis.chartRegions.selectAll(".country")
            .data(countries);

        path.enter()
            .append("path")
            .attr("d", vis.path)
            .attr("title", function (d) {
              return d.properties.name;
            })
            .style("fill", vis.palette[vis.colourScheme].region)
            .on("mouseover", function () {
              let region = d3.select(this);
              region.style("fill", vis.palette[vis.colourScheme].highlight);
            })
            .on("mouseout", function () {
              let region = d3.select(this);
              region.style("fill", vis.palette[vis.colourScheme].region);
            })
            .on("click", function () {
              let mouse = d3.mouse(this);
              d3.event.stopPropagation();
              vis.svg.transition().duration(2000).call(
                  vis.zoom.transform,
                  d3.zoomIdentity.translate(vis.width / 2, vis.height / 2).scale(4).translate(-mouse[0], -mouse[1])
              );

              let region = d3.select(this);
              $("#select-country").val(region.attr("title")).change();
              $("#select-country").selectmenu("refresh");
              $("#select-country").trigger("selectmenuchange");
            })
            .append("svg:title")
            .text(function(d) { return d.properties.name + " (" + d.id + ")" + "\n";});
      });
    }
  }

  getInfoBox(flea) {
    let info = "";
    info += `ID: <b>${flea.ID}</b><br>`;
    info += `Species: <b>${flea.FleaSpecies}</b><br>`;
    info += `Subspecies: <b>${flea.FleaSubspecies}</b><br>`;
    info += `Host Species: <b>${flea.HostSpecies}</b><br>`;
    info += `Host Description: <b>${flea.HostDescription}</b><br>`;
    info += `Collector: <b>${flea.Collector}</b><br>`;
    info += `Collection Date: <b>${flea.CollectionDate}</b><br>`;
    info += `Collection Locale: <b>${flea.Region}, ${flea.Country}, ${flea.Continent}</b><br>`;
    info += `Location: <b>(${flea.Lat},${flea.Lon})</b><br>`;
    if (flea.Clade !== "") { info += `Clade: <b>${flea.Clade}</b><br>`; }
    if (flea.Cluster !== "") { info += `Cluster: <b>${flea.Cluster}</b><br>`; }
    if (flea.Notes !== "") { info += `Notes: <b>${flea.Notes}</b>`; }
    return info;
  }
}
