let dotChart = new DotChart({ parentElement: "#project-dots", containerWidth: 1200, containerHeight:400 });
let regionMap = new RegionMap({ parentElement: "#project-map", containerWidth: 600, containerHeight: 450 });
let jsonMapping = {};
jsonMapping["Continents"] = {file: "world-continents.json", obj: "continent"};
jsonMapping["Countries"] = {file: "world-countries-sans-antarctica.json", obj: "countries1"};

// Populate dropdowns
d3.json("data/" + jsonMapping["Countries"].file).then(t => {
  let countries = topojson.feature(t, t.objects[jsonMapping["Countries"].obj]).features;
  let countryOptions = [];

  countries.forEach(d => {
    if (countryOptions.indexOf(d.properties.name) === -1) {
      countryOptions.push(d.properties.name);
    }
  });

  countryOptions.sort();

  $('#select-country').empty();

  $('#select-country').append($('<option></option>').val("none").html(""));

  $.each(countryOptions, function(i, p) {
    $('#select-country').append($('<option></option>').val(p).html(p));
  });
});

d3.json("data/" + jsonMapping["Continents"].file).then(t => {
  let continents = topojson.feature(t, t.objects[jsonMapping["Continents"].obj]).features;
  let continentOptions = [];

  continents.forEach(d => {
    if (continentOptions.indexOf(d.properties.continent) === -1) {
      continentOptions.push(d.properties.continent);
    }
  });

  continentOptions.sort();

  $('#select-continent').empty();

  $('#select-continent').append($('<option></option>').val("none").html(""));

  $.each(continentOptions, function(i, p) {
    $('#select-continent').append($('<option></option>').val(p).html(p));
  });
});

// Load data
d3.csv('data/flea.csv').then(data => {
  // Change values to numbers
  let processedData = processData(data);
  dotChart.data = processedData;
  regionMap.data = processedData;
  dotChart.update();
  regionMap.update();
});

// Process data
function processData(data) {
  let fleaData = [];
  data.forEach(d => {
    let flea = getFlea(d);
    let fleaID = "";
    if (d.Males === "unknown" || d.Females === "unknown") {
      let totalCount = +d["total fleas"];
      for (let i = 0; i < totalCount; i++) {
        fleaID = getFleaID(flea, "U" + i);
        let newFlea = Object.assign({}, flea);
        newFlea.ID = fleaID;
        newFlea.Gender = "unknown";
        fleaData.push(newFlea);
      }
    } else {
      let maleCount = +d.Males;
      let femaleCount = +d.Females;
      for (let i = 0; i < maleCount; i++) {
        fleaID = getFleaID(flea, "M" + i);
        let newFlea = Object.assign({}, flea);
        newFlea.ID = fleaID;
        newFlea.Gender = "male";
        fleaData.push(newFlea);
      }
      for (let i = 0; i < femaleCount; i++) {
        fleaID = getFleaID(flea, "F" + i);
        let newFlea = Object.assign({}, flea);
        newFlea.ID = fleaID;
        newFlea.Gender = "female";
        fleaData.push(newFlea);
      }
    }
  });

  return fleaData;
}

function getFlea(flea) {
  let datum = {
    ID: flea.ID,
    SampleNo: flea["Sample no#"],
    SpecimenNo: flea["Specimen no#"],
    FleaSpecies: flea["Flea species"],
    FleaSubspecies: flea["flea subspecies/morphotype"],
    Continent: flea.Continent,
    Country: flea.Country,
    Region: flea["Town/Region"],
    Lat: +flea.Latitude,
    Lon: +flea.Longitude,
    HostSpecies: flea["Host scientific name"],
    HostDescription: flea.Host,
    CollectionDate: flea["Collection date"],
    Collector: flea.Collector,
    Clade: flea["Clade 1"],
    Cluster: flea.Cluster,
    Notes: flea.Notes,
    Year: getFleaYear(flea["Collection date"])
  };
  // Special Cases
  datum.Country = datum.Country === "China (Tibet)" ? "China" : datum.Country;
  datum.Country = datum.Country === "USA" ? "United States of America" : datum.Country;
  
  datum.FleaSubspecies = datum.FleaSubspecies.includes("trans") ? "transitional" :  datum.FleaSubspecies;
  datum.FleaSubspecies = datum.FleaSubspecies === "" ? "unknown" :  datum.FleaSubspecies;

  datum.HostSpecies = datum.HostSpecies.includes("flea") ? "unknown" : datum.HostSpecies;
  datum.HostSpecies = datum.HostSpecies.includes("Flea") ? "unknown" : datum.HostSpecies;
  datum.HostSpecies = datum.HostSpecies === "Homo sapien" ? "Homo sapiens" : datum.HostSpecies;
  datum.HostSpecies = datum.HostSpecies === "Felis catus " ? "Felis catus" : datum.HostSpecies;
  datum.HostSpecies = datum.HostSpecies.includes("Felis catus &") ? "Felis catus or Canis Lupus familiaris" : datum.HostSpecies;

  return datum;
}

function getFleaID(flea, index) {
  let id = "";
  if (flea.ID === "") {
    id = flea.SampleNo.split(" ").join("-") + "-" + flea.SpecimenNo.split(" ").join("-") + "-" + flea.FleaSpecies.split(" ").join("-");
  } else {
    id = flea.ID;
  }
  return id + "-" + index;
}

function getFleaYear(date) {
  if (date === "unknown") return 0;
  if (date.includes("-")) return +date.split("-")[2];
  return +date;
}

// Widget UI interactions
// ----------------------

$("#select-continent").on("selectmenuchange", function() {
  let continentFocus = $(this).val();
  if (continentFocus !== "") {
    regionMap.continentFocus = continentFocus;
    regionMap.countryFocus = "none";
    dotChart.continentFocus = continentFocus;
    dotChart.countryFocus = "none";
    $("#select-country").val("none").change();
    $("#select-country").selectmenu("refresh");
    regionMap.update();
    dotChart.update();
  }
});

$("#select-country").on("selectmenuchange", function() {
  let countryFocus = $(this).val();
  if (countryFocus !== "") {
    regionMap.countryFocus = countryFocus;
    regionMap.continentFocus = "none";
    dotChart.countryFocus = countryFocus;
    dotChart.continentFocus = "none";
    $("#select-continent").val("none").change();
    $("#select-continent").selectmenu("refresh");
    regionMap.update();
    dotChart.update();
  }
});

$(".reset-button").on("click", function() {
    window.location.reload();
});

$("#colour-scheme").on("selectmenuchange", function() {
  let colourScheme = $(this).val();
  if (colourScheme !== "") {
    regionMap.colourScheme = colourScheme;
    dotChart.colourScheme = colourScheme;
    regionMap.update();
    dotChart.update();
    buildIndexCheckbox(dotChart.focus);
  }
});

$("#focus-select").on("selectmenuchange", function() {
  let focus = $(this).val();
  if (focus !== "") {
    dotChart.focus = focus;
    dotChart.update();
    buildIndexCheckbox(focus);
  }
});

function buildIndexCheckbox(focus) {
  $("#index-input-area").empty();
  let result = "";
  dotChart.palette[dotChart.colourScheme][focus].domain.forEach((d, index) => {
    let inputName = "index-input-" + index;
    let input = `<input type="checkbox" name="${inputName}" id="${inputName}" class="index-input" value="${d}" checked="checked">`;
    let label = `<label for="${inputName}" style="color: ${dotChart.palette[dotChart.colourScheme][focus].range[index]}; background: white !important;">${d === "" ? "blank" : d}</label>`;
    result += input + label;
  })
  $("#index-input-area").html(result);
  $("input[name*='index-input']").checkboxradio();
}

$(".filter-button").on("click", function() {
  let selectedDots = [];
  $(".selected-dot").each((index, el) => {
    if (!$(el).hasClass("deselect-clicked")) {
      selectedDots.push($(el).attr("id"));
    }
  });
  regionMap.selectedDots = selectedDots;
  regionMap.update();
});

$(".reset-filter-button").on("click", function() {
  $(".deselect-clicked").removeClass("deselect-clicked");
  $(".filter-button").trigger("click");
});

$(".sort-button").on("click", function() {
  dotChart.sortOrder = $(this).val();
  dotChart.update();
});

$("#clickable-tooltip-hide").on("click", function() {
  let id = $("#clickable-tooltip-hidden").val();
  if (id !== "") {
    $("#map-" + id + "").remove();
    $("#" + id).addClass("deselect-clicked")
  }
  $("#clickable-tooltip").attr("style", "opacity: 0;");
  $("#clickable-tooltip-hidden").val("");
})

$("#clickable-tooltip-dismiss").on("click", function() {
  $("#clickable-tooltip").attr("style", "opacity: 0;");
  $("#clickable-tooltip-hidden").val("");
})

$(document).on("change", "[name*='index-input']", function(e) {
  let uncheckedValues = [];
  $("[name*='index-input']:not(:checked)").each((index, e) => {
    uncheckedValues.push($(e).val());
  });
  dotChart.uncheckedIndex = uncheckedValues;
  dotChart.update();
})

$( function() {
  $( "#slider-range" ).slider({
    range: true,
    min: 2006,
    max: 2017,
    values: [ 2006, 2017 ],
    slide: function( event, ui ) {
      $( "#date-slider" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    },
    stop: function(event, ui) {   
      let start = ui.values[0];
      let end = ui.values[1];
      if (start !== dotChart.yearFilterStart || end !== dotChart.yearFilterEnd) {
        dotChart.yearFilterStart = start;
        dotChart.yearFilterEnd = end;
        dotChart.update();
        regionMap.yearFilterStart = start;
        regionMap.yearFilterEnd = end;
        regionMap.update();
      }
    }
  });
  $( "#date-slider" ).val($( "#slider-range" ).slider( "values", 0 ) + " - " + $( "#slider-range" ).slider( "values", 1 ) );
  buildIndexCheckbox("FleaSubspecies");
  $("input[name='click-selection']").checkboxradio();
  $(".sort-button").button();
  $(".reset-button").button();
  $(".filter-button").button();
  $(".reset-filter-button").button();
  $(".clickable-tooltip-button").button();
  $(".vis-dropdownlist").selectmenu();
});
