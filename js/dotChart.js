class DotChart {
  
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 600,
    }
    
    this.config.margin = _config.margin || { top: 10, bottom: 10, right: 10, left: 10 }
    
    this.initVis();
  }
  
  initVis() {
    let vis = this;
    vis.dotsPerColumn = 20;
    vis.dotSize = 1;
    vis.continentFocus = "none";
    vis.countryFocus = "none";
    vis.colourScheme = "Default";
    vis.yearFilterStart = 2006;
    vis.yearFilterEnd = 2017;
    this.initColours();

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.subsetBoxHeight = vis.config.containerHeight - 100;
    vis.subsetBoxX0 = vis.config.margin.left;
    vis.subsetBoxY0 = vis.config.margin.top;
    vis.subsetBoxX1 = vis.config.containerWidth - vis.config.margin.right;
    vis.subsetBoxY1 = vis.subsetBoxHeight - vis.config.margin.bottom;

    vis.globalBoxX0 = vis.config.margin.left;
    vis.globalBoxX1 = vis.config.containerWidth - vis.config.margin.right;
    vis.globalBoxY0 = vis.subsetBoxHeight + vis.config.margin.top;
    vis.globalBoxY1 = vis.config.containerHeight - vis.config.margin.bottom;

    vis.selection = [[0,vis.subsetBoxHeight], [200,vis.config.containerHeight]];

    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        // .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xScale = d3.scaleLinear()
        .domain([0, Math.floor(5128 / vis.dotsPerColumn)])
        .range([vis.globalBoxX0, vis.globalBoxX1])
        
    vis.yScale = d3.scaleLinear()
        .domain([0, vis.dotsPerColumn - 1])
        .range([vis.globalBoxY0, vis.globalBoxY1])

    vis.focus = "FleaSubspecies";
    vis.sortOrder = "none";
    vis.uncheckedIndex = [];
    vis.brush = d3.brush()
                  .extent([[0, vis.subsetBoxHeight], [vis.config.containerWidth, vis.config.containerHeight]])
                  .filter(() => !d3.event.ctrlKey && !d3.event.button && (d3.event.metaKey || d3.event.target.__data__.type !== "overlay"))
                  .on("end", () => {
                    vis.callBrushEnd = true;
                    this.brushed(this);
                  }); // start brush end, if too slow, use end only.

  }

  update() {
    let vis = this;
    this.getColours();
    vis.processedData = [...vis.data];
    this.filterData();
    this.sortData();
    vis.processedData.forEach((d, index) => {
      d.row = index % vis.dotsPerColumn;
      d.col = Math.floor(index / vis.dotsPerColumn);
    });
    vis.render();
  }

  render() {
    let vis = this;
    vis.chart.selectAll('.general-dot').data(vis.processedData, d => d.ID)
            .join("circle")
            .attr('data-col', d => d.col)
            .attr('data-row', d => d.row)
            .attr('data-info', d => vis.getInfoBox(d))
            .classed("general-dot", true)
            .html(d => "<title>ID: " + d.ID + "\n" + "Gender: " + d.Gender +  "\n" + "Species: " + d.FleaSpecies +  "\n" + "Subspecies: " + d.FleaSubspecies +  "\n" + "Host Species: " +  d.HostSpecies + "</title>")
            .on("mousedown", this.circleClicked)
            .transition().duration(500)
            .attr('id', d => d.ID)
            .attr('cy', d => vis.yScale(d.row))
            .attr('cx', d => vis.xScale(d.col))
            .attr('r', vis.dotSize)
            .attr('fill', d => vis.colourScale(d[vis.focus]))
            // .attr('class', "general-dot")
            
    vis.chart.attr("class", "brush").call(vis.brush).call(vis.brush.move, vis.selection).call(g => g.select(".overlay").style("cursor", "default"));
  }

  initColours() {
    let vis = this;
    vis.palette = {};
    vis.palette["Default"] = {};
    vis.palette["CBF"] = {};

    // normal set
    let fleaSpeciesColours = ["#bf9d00","#ad80ff","#FF4500","#000037","#3eff91","#74006d","#007043","#a30026","#00d3f3","#ffb58e","#42b8ff","#ffbfcd","#006688","#d6adff"];
    let fleaSpecies = [ "Ctenocephalides felis","Ctenocephalides orientis","Echidnophaga ambulans","Ctenocephalides canis","Pulex irritans","Ctenocephalides connatus","Echidnophaga gallinacea","Echidnophaga larina","Xenopsylla cheopis","Nosopsyllus fasciatus","Ceratophyllus gallinae","Ceratophyllus sp.","Echidnophaga myrmecobii","Leptopsylla segnis"];
    fleaSpecies.sort();
    vis.palette["Default"].FleaSpecies = {domain: fleaSpecies, range: fleaSpeciesColours};


    let subspeciesColours = [ "#73416f","#d7c933","#4d90ff","#de431d","#01cd81","#000000"];
    let subspecies = ["felis","transitional","ambulans","strongylus","damarensis","unknown"];
    subspecies.sort();
    vis.palette["Default"].FleaSubspecies = {domain: subspecies, range: subspeciesColours};

    let genderColours = ["#FF0000", "#1E90FF", "#000000"];
    let gender = ["female", "male", "unknown"];
    vis.palette["Default"].Gender = {domain: gender, range: genderColours};
    gender.sort();

    let hostSpeciesColours = ["#a30026","#00d3f3","#ffb58e","#42b8ff","#ffbfcd","#006688","#d6adff", "#bf9d00","#ad80ff","#FF4500","#000037","#3eff91","#74006d","#007043", "#ce0080","#000000"];
    let hostSpecies = [ "Canis aureus","Canis lupus familiaris","Canis lupus signatus","Capra aegagrus hircus","Homo sapiens","Lamprotornis purpuroptera","Mustela putorius furo","Tachyglossus aculeatus","Felis catus","unknown","Felis catus or Canis Lupus familiaris","Galerella sanguinea","Echidnophaga myrmecobii","Leptopsylla segnis", "Xerus inauris", "Vulpes vulpes"];
    hostSpecies.sort();
    vis.palette["Default"].HostSpecies = {domain: hostSpecies, range: hostSpeciesColours};

    // colour blind friendly set
    let fleaSpeciesColoursCBF = ["#705381", "#f17b0e", "#016bd1", "#948b00", "#882392", "#3f7700", "#b00080", "#a8d19b", "#ae0043", "#80b5ff", "#7d4424", "#ff6fbb", "#d7c688", "#ff7f8a"];
    let subspeciesColoursCBF = ["#b06b80", "#02d4e3", "#ca0082", "#7b7200", "#0193e1", "#000000"];
    let genderColoursCBF = ["#ff743b", "#2c95ff", "#000000"];
    let hostSpeciesColoursCBF = ["#a8d19b", "#ae0043", "#80b5ff", "#7d4424", "#ff6fbb", "#d7c688", "#ff7f8a", "#705381", "#f17b0e", "#465916", "#016bd1", "#948b00", "#882392", "#3f7700", "#b00080", "#000000"];

    vis.palette["CBF"].FleaSpecies = {domain: fleaSpecies, range: fleaSpeciesColoursCBF};
    vis.palette["CBF"].FleaSubspecies = {domain: subspecies, range: subspeciesColoursCBF};
    vis.palette["CBF"].Gender = {domain: gender, range: genderColoursCBF};
    vis.palette["CBF"].HostSpecies = {domain: hostSpecies, range: hostSpeciesColoursCBF};
  }

  getColours() {
    let vis = this;
    vis.colourScale = d3.scaleOrdinal().domain(vis.palette[vis.colourScheme][vis.focus].domain).range(vis.palette[vis.colourScheme][vis.focus].range);
  }

  filterData() {
    let vis = this;
    if (vis.countryFocus === "none") {
      if (vis.continentFocus !== "none") {
        vis.processedData = vis.data.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)) && !vis.uncheckedIndex.includes(d[vis.focus]) && d.Continent === this.continentFocus);
      } else {
        vis.processedData = vis.data.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)) && !vis.uncheckedIndex.includes(d[vis.focus]));
      }
    }
    if (vis.countryFocus !== "none") {
      vis.processedData = vis.data.filter(d => (d.Year === 0 || (d.Year >= vis.yearFilterStart && d.Year <= vis.yearFilterEnd)) && !vis.uncheckedIndex.includes(d[vis.focus]) && d.Country === this.countryFocus);
    }
  }

  sortData() {
    let vis = this;
    if (vis.sortOrder === "none") return;
    vis.processedData = vis.processedData.sort((x, y) => vis.sortOrder === "ascending" ? d3.ascending(x[vis.focus], y[vis.focus]) : d3.descending(x[vis.focus], y[vis.focus]))
    vis.sortOrder = "none";
  }

  brushed(el) {
    let vis = el;
    let subsetBoxXScale = d3.scaleLinear()
                            .domain([0, Math.floor(5128 / vis.dotsPerColumn)])
                            .range([vis.subsetBoxX0, vis.subsetBoxX1])
    let subsetBoxYScale = d3.scaleLinear()
                            .domain([0, vis.dotsPerColumn - 1])
                            .range([vis.subsetBoxY0, vis.subsetBoxY1])
    let rValue = 15;
    let selection = d3.event.selection;
    let circles = d3.select("g.brush").selectAll("circle");
    let selectedDot = d3.select("g.brush").selectAll(".selected-dot");
    let group0 = selectedDot._groups[0];
    if (group0.length > 0) {
      let firstEl = group0[0];
      let firstElCol = d3.select(firstEl).attr("data-col");
      let firstElRow = d3.select(firstEl).attr("data-row");
      
      let lastEl = group0[group0.length - 1];
      let lastElCol = d3.select(lastEl).attr("data-col");
      let lastElRow = 0;
      for (let i = 0; i < Math.min(vis.dotsPerColumn, group0.length); i++) {
        lastElRow = Math.max(lastElRow, d3.select(group0[i]).attr("data-row"));
      }

      let widthAdjust = Math.floor((vis.subsetBoxX1 - vis.subsetBoxX0) / 8);
      subsetBoxXScale = d3.scaleLinear()
                          .domain([firstElCol, lastElCol])
                          .range([vis.subsetBoxX0 + widthAdjust, vis.subsetBoxX1 - widthAdjust])

      subsetBoxYScale = d3.scaleLinear()
                          .domain([firstElRow - 1, lastElRow + 1])
                          .range([vis.subsetBoxY0, vis.subsetBoxY1])

      let actualWidth = vis.subsetBoxX1 - vis.subsetBoxX0 - 2 * widthAdjust;
      let actualHeight = vis.subsetBoxY1 - vis.subsetBoxY0;
      let dotsPerColumn = lastElRow - firstElRow;
      let dotsPerRow = lastElCol - firstElCol
      let minGap = Math.min(Math.floor(actualWidth / dotsPerRow), Math.floor(actualHeight / dotsPerColumn));
      rValue = Math.min(Math.max(Math.floor(minGap / 3), 2), 15);
    }

    if (selection === null) {
      circles.attr("opacity", 0.5);
    } else {
      const [[x0,y0], [x1,y1]] = selection;
      circles.attr("opacity", d => {
        let cx = vis.xScale(d.col);
        let cy = vis.yScale(d.row);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy < y1 ? 1 : 0.5;
      })
      .classed("selected-dot", d => {
        let cx = vis.xScale(d.col);
        let cy = vis.yScale(d.row);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy < y1;
      })
      .transition().duration(1000)
      .attr('cy', d => {
        let originX = vis.xScale(d.col);
        let originY = vis.yScale(d.row);
        let newY = subsetBoxYScale(d.row);
        return x0 <= originX && originX <= x1 && y0 <= originY && originY < y1 ? newY : originY;
      })
      .attr('cx', d => {
        let originX = vis.xScale(d.col);
        let originY = vis.yScale(d.row);
        let newX = subsetBoxXScale(d.col);
        return x0 <= originX && originX <= x1 && y0 <= originY && originY < y1 ? newX : originX;
      })
      .attr('r', d => {
        let originX = vis.xScale(d.col);
        let originY = vis.yScale(d.row);
        return x0 <= originX && originX <= x1 && y0 <= originY && originY < y1 ? rValue : vis.dotSize;
      })
      .attr('fill', d => {
        let originX = vis.xScale(d.col);
        let originY = vis.yScale(d.row);
        return x0 <= originX && originX <= x1 && y0 <= originY && originY < y1 ? "#FFFFFF" : vis.colourScale(d[vis.focus]);
      })
      .attr('stroke', d => vis.colourScale(d[vis.focus]))
      .attr('stroke-width', d => {
        let originX = vis.xScale(d.col);
        let originY = vis.yScale(d.row);
        return x0 <= originX && originX <= x1 && y0 <= originY && originY < y1 ? (rValue < 3 ? 1 : 3) : 0;
      })
    }

    if (vis.callBrushEnd) {
      vis.callBrushEnd = false;
      this.brushed(vis);
    }

    vis.selection = selection;
  }

  circleClicked() {
    let selection = $("input[name='click-selection']:checked").val();
    if (selection === "pick") {
      if($(this).hasClass("deselect-clicked")) {
        $(this).removeClass("deselect-clicked");
      } else {
        $(this).addClass("deselect-clicked");
      }
    } else if (selection === "info") {
      if($(this).hasClass("info-clicked")) {
        $(this).removeClass("info-clicked");
        $("#info-box").empty();
        $("#selected-dot-info").val("");
      } else {
        $(".info-clicked").removeClass("info-clicked");
        $(this).addClass("info-clicked");
        $("#info-box").html($(this).attr("data-info"));
        $("#selected-dot-info").val($(this).attr("data-info"));
      }
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
