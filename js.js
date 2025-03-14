// -------------------------
// Part 2.1: Side-by-side Boxplot
// -------------------------

// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
  // Convert string values to numbers
  data.forEach(function(d) {
    d.Likes = +d.Likes;
  });
  
  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800;
  const height = 500;
  
  // Create the SVG container
  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // Set up scales for x and y axes
  // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
  // d3.min(data, d => d.Likes) to achieve the min value and 
  // d3.max(data, d => d.Likes) to achieve the max value
  // For the domain of the xscale, you can list all four platforms or use
  // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
  const platforms = [...new Set(data.map(d => d.Platform))];
  const xScale = d3.scaleBand()
    .domain(platforms)
    .range([margin.left, width - margin.right])
    .paddingInner(0.3);
  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
    .nice()
    .range([height - margin.bottom, margin.top]);
  
  
  // Add x-axis label
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append("text")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", 35)
      .attr("fill", "black")
      .text("Platform");
  
  // Add y-axis label
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -35)
      .attr("fill", "black")
      .text("Likes");
  
  // rollupFunction
  const rollupFunction = function(groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const min = d3.min(values);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };
  
  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);
  
  quantilesByGroups.forEach((quartiles, Platform) => {
    const x = xScale(Platform);
    const boxWidth = xScale.bandwidth();
    
    // Vertical lines
    svg.append("line")
      .attr("x1", x + boxWidth / 2)
      .attr("x2", x + boxWidth / 2)
      .attr("y1", yScale(quartiles.min))
      .attr("y2", yScale(quartiles.max))
      .attr("stroke", "black");
    
    // Draw box
    svg.append("rect")
      .attr("x", x)
      .attr("y", yScale(quartiles.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
      .attr("fill", "#e0e0e0")
      .attr("stroke", "black");
    
    // Draw median line
    svg.append("line")
      .attr("x1", x)
      .attr("x2", x + boxWidth)
      .attr("y1", yScale(quartiles.median))
      .attr("y2", yScale(quartiles.median))
      .attr("stroke", "black");
  });
});


// -------------------------
// Part 2.2: Side-by-side Bar Plot
// -------------------------

// Prepare your data and load the data again.
// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv("/Users/jacobmarlowe/Desktop/untitled folder/socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
  // Convert string values to numbers
  data.forEach(function(d) {
    d.AvgLikes = +d.AvgLikes;
  });
  
  // Define the dimensions and margins for the SVG
  const margin = { top: 40, right: 30, bottom: 60, left: 50 };
  const width = 800;
  const height = 500;
  
  // Create the SVG container
  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // Define four scales
  const platforms = [...new Set(data.map(d => d.Platform))];
  const x0 = d3.scaleBand()
    .domain(platforms)
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const postTypes = [...new Set(data.map(d => d.PostType))];
  const x1 = d3.scaleBand()
    .domain(postTypes)
    .range([0, x0.bandwidth()])
    .padding(0.05);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
    .range([height - margin.bottom, margin.top]);
  
  // Also need a color scale for the PostType
  const color = d3.scaleOrdinal()
    .domain(postTypes)
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);
  
  // Add scales x0 and y 
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x0))
    .append("text")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", 40)
      .attr("fill", "black")
      .text("Platform");
  
  // Add y-axis label
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -35)
      .attr("fill", "black")
      .text("Average Likes");
  
  // Group container for bars
  const dataByPlatform = d3.group(data, d => d.Platform);
  dataByPlatform.forEach((values, platform) => {
    svg.append("g")
      .attr("transform", `translate(${x0(platform)},0)`)
      .selectAll("rect")
      .data(values)
      .enter()
      .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));
  });
  
  
  // Add the legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, ${margin.top})`);
  
  postTypes.forEach((type, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));
    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 12)
      .text(type)
      .attr("alignment-baseline", "middle");
  });
});

// -------------------------
// Part 2.3: Line Plot
// -------------------------

// Prepare your data and load the data again.
// This data should contains two columns, date (3/1-3/7) and average number of likes.
const socialMediaTime = d3.csv("/Users/jacobmarlowe/Desktop/untitled folder/socialMediaTime.csv");

socialMediaTime.then(function(data) {
  // Convert string values to numbers
  const parseDate = d3.timeParse("%m/%d/%Y");
  data.forEach(function(d) {
    let dateStr = d.Date.split(" ")[0]; 
    d.Date = parseDate(dateStr);
    d.AvgLikes = +d.AvgLikes;
  });
  
  // Define the dimensions and margins for the SVG
  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const width = 800;
  const height = 500;
  
  // Create the SVG container
  const svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // Set up scales for x and y axes
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.Date))
    .range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
    .range([height - margin.bottom, margin.top]);
  
  // Draw the axis, you can rotate the text in the x-axis here
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(7))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-25)");
  
  // Add x-axis label
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .append("text")
      .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
      .attr("y", 50)
      .attr("fill", "black")
      .text("Date");
  
  // Add y-axis label
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("y", -35)
      .attr("fill", "black")
      .text("Average Likes");
  
  // Draw the line and path. Remember to use curveNatural.
  const lineGenerator = d3.line()
    .curve(d3.curveNatural)
    .x(d => xScale(d.Date))
    .y(d => yScale(d.AvgLikes));
  
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator);
});
