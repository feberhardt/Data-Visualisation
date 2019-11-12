// Pre-define d3 to avoid error messages in glitch :)
var d3;

// Scatterplot implementation of Charvi Jain, Kaustav Das and Felix Eberhardt for Data Vis assignment #2, winter semester 19/20

(function(d3) {
  "use strict";

  const colorLegend = (selection, props) => {
    const { colorScale, circleRadius, spacing, textOffset } = props;

    const groups = selection.selectAll("g").data(colorScale.domain());
    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "tick");
    groupsEnter
      .merge(groups)
      .attr("transform", (d, i) => `translate(0, ${i * spacing})`);
    groups.exit().remove();

    groupsEnter
      .append("circle")
      .merge(groups.select("circle"))
      .attr("r", circleRadius)
      .attr("fill", colorScale);

    groupsEnter
      .append("text")
      .merge(groups.select("text"))
      .text(d => d)
      .attr("dy", "0.32em")
      .attr("x", textOffset);
  };

  const sizeLegend = (selection, props) => {
    const { sizeScale, spacing, textOffset, numTicks, circleFill } = props;

    const title = "Highway Miles";
    const ticks = sizeScale
      .ticks(numTicks)
      .filter(d => d !== 0)
      .reverse();

    const groups = selection.selectAll("g").data(ticks);
    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "tick");
    groupsEnter
      .merge(groups)
      .attr("transform", (d, i) => `translate(0, ${i * spacing})`);
    groups.exit().remove();

    groupsEnter
      .append("circle")
      .merge(groups.select("circle"))
      .attr("r", sizeScale)
      .attr("fill", circleFill);

    groupsEnter
      .append("text")
      .merge(groups.select("text"))
      .text(d => d)
      .attr("dy", "0.32em")
      .attr("x", d => sizeScale(d) + textOffset);
  };

  const svg = d3.select("svg");

  const colorScale = d3
    .scaleOrdinal()
    .domain(["AWD", "RWD"])
    .range(["red", "blue"]);

  // legend for AWD / RWD
  svg
    .append("g")
    .attr("transform", `translate(1200,100)`)
    .call(colorLegend, {
      colorScale,
      circleRadius: 10,
      spacing: 24,
      textOffset: 30
    });

  const sizeScale = d3
    .scaleSqrt()
    .domain([10, 70])
    .range([2, 13]);

  // legend for highway miles per gallon
  svg
    .append("g")
    .attr("transform", `translate(1200,300)`)
    .call(sizeLegend, {
      sizeScale,
      spacing: 30,
      textOffset: 10,
      numTicks: 3,
      circleFill: "black"
    });

  svg
    .append("text")
    .attr("x", 1175)
    .attr("y", 260)
    .text("Highway Miles")
    .style("font-size", "18px")
    .attr("alignment-baseline", "middle");

  svg
    .append("text")
    .attr("x", 1185)
    .attr("y", 280)
    .text("per Gallon")
    .style("font-size", "18px")
    .attr("alignment-baseline", "middle");

  //const svg = d3.select('svg');

  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const render = data => {
    const title = "Cars: Horsepower vs. Retail Price";

    const xValue = d => d.Horsepower;
    const xAxisLabel = "Horsepower";

    const yValue = d => d.Retail_price / 1000;
    const circleRadius = d => d.Highway_MilesPerGallon / 5; // encode miles per gallon via circle size
    const circlecolor = "red";
    const yAxisLabel = "Retail Price (x1000)";

    const margin = { top: 60, right: 130, bottom: 88, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(15);

    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(10);

    const yAxisG = g.append("g").call(yAxis);
    yAxisG.selectAll(".domain").remove();

    yAxisG
      .append("text") // label for y-axis
      .attr("class", "axis-label")
      .attr("y", -93)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .attr("transform", `rotate(-90)`)
      .attr("text-anchor", "middle")
      .text(yAxisLabel);

    const xAxisG = g
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0,${innerHeight})`);

    xAxisG.select(".domain").remove();

    xAxisG
      .append("text") // Label for x-axis
      .attr("class", "axis-label")
      .attr("y", 75)
      .attr("x", innerWidth / 2)
      .attr("fill", "black")
      .text(xAxisLabel);

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cy", d => yScale(yValue(d)))
      .attr("cx", d => xScale(xValue(d)))
      .attr("r", circleRadius)
      .style("stroke", "black")
      .style("opacity", 1)
      .style("stroke-width", 1.2)
      .style("fill-opacity", 0.8)
      // encode AWD/RWD by dot color
      .style("fill", function(d) {
        // red circle for awd, blue for RWD
        if (d.AWD === 1) {
          return "red";
        } else {
          return "blue";
        }
      })
      // handle what happens when mouse hovers over dot
      .on("mouseover", handleMouseOver)
      // handle what happens when mouse moves away
      .on("mouseout", handleMouseOut);

    g.append("text")
      .attr("class", "title")
      .attr("y", -10)
      .text(title);
  };
  //function to handle mousover characteristics
  function handleMouseOver(d, i) {
    d3.select(this)
      .attr("r", d.Highway_MilesPerGallon / 3)
      .style("fill", "orange");

    // display 6 attributes of selected circle
    var coordinate = d3.mouse(this);
    svg
      .append("text")
      .attr("id", "info8")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] - 90)
      .attr("class", "data")
      .text("Name:     " + d.Name);
    svg
      .append("text")
      .attr("id", "info7")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] - 70)
      .attr("class", "data")
      .text("Type:     " + d.Type);
    svg
      .append("text")
      .attr("id", "info1")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] + 50)
      .attr("class", "data")
      .text("Weight:     " + d.Weight);
    svg
      .append("text")
      .attr("id", "info2")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] + 30)
      .attr("class", "data")
      .text("Length:     " + d.Length);
    svg
      .append("text")
      .attr("id", "info3")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] + 10)
      .attr("class", "data")
      .text("Wheel Base: " + d.Wheel_Base);
    svg
      .append("text")
      .attr("id", "info4")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] - 10)
      .attr("class", "data")
      .text("Cylinders:  " + d.Cyl);
    svg
      .append("text")
      .attr("id", "info5")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] - 30)
      .attr("class", "data")
      .text("Engine Size:" + d.Engine_Size);
    svg
      .append("text")
      .attr("id", "info6")
      .attr("x", coordinate[0] + 110)
      .attr("y", coordinate[1] - 50)
      .attr("class", "data")
      .text("Width:      " + d.Width);
  }
  // handle mouseout characteristics
  function handleMouseOut(d, i) {
    d3.select(this)
      .attr("r", d.Highway_MilesPerGallon / 5)
      .style("fill", function(d) {
        if (d.AWD === 1) {
          return "red";
        } else {
          return "blue";
        }
      });

    d3.select(info8).remove();
    d3.select(info7).remove();
    d3.select(info1).remove();
    d3.select(info2).remove();
    d3.select(info3).remove();
    d3.select(info4).remove();
    d3.select(info5).remove();
    d3.select(info6).remove();
  }

  // resource: http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774

  d3.csv("https://vizhub.com/Charvijain16/datasets/cars1 - cars.csv").then(
    data => {
      data.forEach(d => {
        d.Name = d.Name;
        d.Type = d.Type;
        d.AWD = +d.AWD;
        d.RWD = +d.RWD;
        d.Retail_price = +d.Retail_price;
        d.Dealer_Cost = +d.Dealer_Cost;
        d.Horsepower = +d.Horsepower;
        d.Cyl = +d.Cyl;
        d.Engine_Size = +d.Engine_Size;
        d.City_MilesPerGallon = +d.City_MilesPerGallon;
        d.Highway_MilesPerGallon = +d.Highway_MilesPerGallon;
        d.Weight = +d.Weight;
        d.Wheel_Base = +d.Wheel_Base;
        d.Length = +d.Length;
        d.Width = +d.Width;
      });
      render(data);
    }
  );
})(d3);
