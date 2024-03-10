// Referenced these sources to learn how to use d3.js
// https://d3-graph-gallery.com/barplot
// https://d3-graph-gallery.com/graph/pie_annotation.html
// https://www.youtube.com/watch?v=fX9uiqSok6k
// https://stackoverflow.com/questions/64986774/how-to-keep-and-hide-tooltip-on-mouse-hover-and-mouse-out for tooltips
// https://stackoverflow.com/questions/54852791/angular-d3-understanding-attrtween-function for pie chart smooth animations


const Quarter = {
    Fall: 'fall',
    Winter: 'winter',
    Spring: 'spring',
    Summer: 'summer'
}

const ExpenseType = {
    0: 'unassigned',
	1: 'entertainment',
    2: 'tuition',
    3: 'food',
    4: 'textbooks',
    5: 'transportation'
}

const IncomeType = {
    0: 'unassigned',
    1: 'grant',
    2: 'loan',
    3: 'wages',
    4: 'family'
}

// Initialize all of the arrays used for each quarter and year
let budgetData = [];
let curYear = 0;
const fall = [];
const winter = [];
const spring = [];
const summer = [];
const fallCount = [];
const winterCount = []; 
const springCount = []; 
const summerCount = [];
const quarters = [fall, winter, spring, summer];

// BAR CHART VARIABLES

// Get the Bar graph element from budget-report.html in order to get the css info
var barGraph = document.getElementById('bargraph')
var barGraphstyle = window.getComputedStyle(barGraph)

// Margins of the graph
var margins = {top: 30, bottom: 100, right: 50, left: 50}

// Get the graph width and height from css file and adjust to margins
var barGraphWidth = parseInt(barGraphstyle.getPropertyValue('width')) - margins.left - margins.right;
var barGraphHeight = parseInt(barGraphstyle.getPropertyValue('height')) - margins.top - margins.bottom;

// Append svg to our #graph variable that we set in budget-report.html
svg = d3.select('#bargraph')
.append('svg')
.attr('width', barGraphWidth + margins.left + margins.right)
.attr('height', barGraphHeight + margins.top + margins.bottom)
// create a group element for the axis labels and text
.append('g')
.attr('transform', 'translate(' + margins.left + "," + margins.top + ")");

// Positions the x axis and labels on the graph 
var xAxis = svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + barGraphHeight + ")")


// Positions the y axis and labels on the graph
var yAxis = svg.append("g")
.attr("class", "myYaxis");

// Create a scale for the x axis on the graph
const x = d3.scaleBand()
.range([0, barGraphWidth])
.padding(0.1);

// Create a scale for the y axis on the graph
const y = d3.scaleLinear()
.range([barGraphHeight, 0]);


// PIE CHART VARIABLES


// Get the Pie chart element from budget-report.html in order to get the css info
var pieChart = document.getElementById('piegraph')
var pieChartStyle = window.getComputedStyle(pieChart)

// Get the pie graph width and height from css file and adjust to margins
var pieChartWidth = parseInt(pieChartStyle.getPropertyValue('width'));
var pieChartHeight = parseInt(pieChartStyle.getPropertyValue('height'));

// Get the radius by getting the minimum between width and height and diving by 2
var radius = (Math.min(pieChartWidth, pieChartHeight) / 2) - margins.right;
var offsetX = pieChartWidth * 0.15 ;
var offsetY = 0;

// Append svg to our #piegraph variable that we set in budget-report.html
var svgPie = d3.select('#piegraph')
    .append('svg')
    .attr('width', pieChartWidth)
    .attr('height', pieChartHeight)
    .append('g')
    .style('fill', 'transparent') // Set initial fill color to transparent
    // set position to center of graph
    .attr('transform', `translate(${(pieChartWidth) / 2 - offsetX}, ${pieChartHeight / 2 - offsetY})`);



fetch('/budget') 
    .then(response => response.json()) 
    .then(data => {
        console.log(data);
        
        data.forEach(item => {
            const { quarter, year, category, type, amount } = item; 
            console.log(type);
            switch(quarter) {
                case 'fall':
                    if(fallCount.includes(year)) {}
                    else {
                        fallCount.push(year);
                    }
                    fall.push({ year, category, amount });
                break;
                case 'winter':
                    if(winterCount.includes(year)) {}
                    else {
                        winterCount.push(year);
                        // console.log(year.toString());
                    }
                    winter.push({ year, category, amount });
                break;
                case 'spring':
                    if(springCount.includes(year)) {}
                    else {
                        springCount.push(year);
                    }
                    spring.push({ year, category, amount });
                break;
                case 'summer':
                    if(summerCount.includes(year)) {}
                    else {
                        summerCount.push(year);
                    }
                    summer.push({ year, category, amount });
                break;
            }
        });
        console.log(budgetData.length);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })
    .finally(() => {
        curYear = fallCount[0];
        update(fall, fallCount);

        console.log(fallCount);
        console.log("Finally Block Executed")
});

function setYear(quarter){
    if(quarter == "fall") { curYear = fallCount[0];}
    else if (quarter == "winter") { curYear = winterCount[0];}
    else if (quarter == "spring") {curYear = springCount[0];}
    else if (quarter == "summer") { curYear = summerCount[0];}
}

function update(budgetData, count) {

    // Initialize data array
    let data = [];

    // // Remove all previous graphs made
    d3.select("#piegraph").selectAll("path").remove();
    d3.selectAll(".legend").selectAll("text").remove();

    //Get the legend container
    // const legendContainer = document.getElementById('legend');

    // // Remove all previous buttons made
    // legendContainer.innerHTML = '';

    // Get the button container from html to create buttons
    const buttonContainer = document.getElementById('buttonContainer');

    // Remove all previous buttons made
    buttonContainer.innerHTML = '';

    // Create Buttons for each unique year
    for (let i = 0; i <  count.length; i++) {
        // Create a new button element
        const button = document.createElement("button");

        // The buttons attributes
        button.textContent = count[i];
        button.setAttribute('id', `button${i}`);

        // The event the button runs, it will set the year to this buttons year then update data again
        button.addEventListener('click', () => {
            curYear = count[i];
            update(budgetData, count);
        });

        // Put the button in html
        buttonContainer.appendChild(button);
    }

    var total = 0;

    // For each of the data in this quarter, only add data for the specifed year
    for (const item of budgetData) {
        if(item.year == curYear && item.amount > 0) {
            data.push({ category: item.category, amount: item.amount});
            total += item.amount;
            console.log(total);
        }
    }

    // get the html container for the budget text
    const container = document.getElementById('budgetDataContainer');
    // remove all previous text created
    container.innerHTML = '';

    // Get the data for the current budget and put it inside the text
    data.forEach(item => {
        const div = document.createElement('div');
        div.textContent = `${item.category}: ${item.amount}`;
        container.appendChild(div);
    });

    // BAR GRAPH CODE

    var colors = d3.scaleOrdinal()
    .domain(data)
    .range(d3.schemeDark2)

    // set the categories that will be mapped on the x axis
    x.domain(data.map(function(d) {return d.category; }));

    xAxis.transition().duration(500).call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // set the y values that will be mapped on the y axis
    y.domain([0, d3.max(data, function(d) { return d.amount; })]);
    // Renders the y axis with labels and data increments
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Renders all the bars on the bar graph
    var bar = svg.selectAll("rect")
        .data(data) // Set data to our budget data array

    bar.enter()
    .append("rect")
    .merge(bar)
    .transition()
    .duration(500)
        .style("fill", "#24b574") // Fill the bar with greenish color #24b574
        //.style('fill', (d, i) => colors(i))
        .attr("x", data => x(data.category)) // Set x data to the data categories
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return barGraphHeight - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })
        .transition()
        .duration(500)
        .delay((d, i) => i * 50)
        .attr("x", data => x(data.category))
        .attr("width", x.bandwidth())
        .attr("height", data => barGraphHeight - y(data.amount))
        .attr("y", data => y(data.amount))

barHover = svg.selectAll("rect")

barHover.on('mouseover', function(d, i) {
        d3.select(this)
        .style('fill', "#1b8f5b")
        .transition().duration(500)
        const x = d.pageX + "px";
        const y = d.pageY + "px";
        d3.select("#tooltip")
            .style("left", x)
            .style("top", y)
            .text(`${i.category} $${i.amount}`)
            .classed("hidden", false);
    })
    .on('mouseout', function(d, i) {
        d3.select(this)
        .style('fill', "#24b574")
        .transition().duration(500)
        d3.select("#tooltip").classed("hidden", true); // Hide the tooltip
    })

    bar.exit()
        .remove()

    // PIE CHART CODE

    // map the data to to a new variable
    var pieData = data.map(d => ({ category: d.category, amount: d.amount }));

    // Define variables for the pie chart slices    
    var pie = d3.pie().value(d => d.amount).sort(data.amount)
    var arcInitial = d3.arc().innerRadius(0).outerRadius(radius*.7)
    var arc = d3.arc().innerRadius(0).outerRadius(radius*.7)
    var hoverArc = d3.arc().innerRadius(0).outerRadius(radius * 0.8)

    var startAngle = 0;
    // set up pie chart
    var temp = svgPie.selectAll('path')
        .data(pie(pieData))

    // Renders slices for pie chart
    temp.enter()
    .append('path')
    .merge(temp)
    .style('fill', (d, i) => colors(i))
    .each(function(d) {
        var endAngle = startAngle + (d.endAngle - d.startAngle);
        d3.select(this)
          .transition()
          .duration(1000) // Duration of pie slice animation
          // Animation from reference at the beginning that creates new slices in a smooth way
          .attrTween("d", function() {
            var interpolateStart = d3.interpolate(0, d.startAngle);
            var interpolateEnd = d3.interpolate(0, d.endAngle);
            return function(t) {
              d.startAngle = interpolateStart(t);
              d.endAngle = interpolateEnd(t);
              return arc(d);
            };
          });
        startAngle = endAngle; // Update start angle accumulator
    })

        .style('fill', (d, i) => colors(i))
        .style('fill-opacity', 0.8)
        .style('stroke', '#11141C')
        .style('stroke-width', 3)
        .on("end", function(d) {
            startAngle += (d.endAngle - d.startAngle); // Update start angle accumulator
          })
    
    var pieHover = svgPie.selectAll("path");
    
    pieHover.on('mouseover', function(d, i) {
            d3.select(this)
            .style('fill-opacity', 1)
            .transition().duration(500)
            .attr('d', hoverArc)
            const x = d.pageX + "px";
            const y = d.pageY + "px";
            d3.select("#tooltip")
                .style("left", x)
                .style("top", y)
                .text(`${i.data.category} $${i.data.amount}`)
                .classed("hidden", false);
        })
        .on('mouseout', function(d, i) {
            d3.select(this)
            .style('fill-opacity', .8)
            .transition().duration(500)
            .attr('d', arc)
            d3.select("#tooltip").classed("hidden", true); // Hide the tooltip
        })

        temp.exit()
            .remove()

        var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

var width = pieChartWidth/4;

// Legend
var legend = svgPie.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
    .data(pie(data))

legend.enter()
    .append("g")
    .attr("class", "legend")  
    .attr("transform", function(d,i){
        return "translate(" + (pieChartWidth/4 *1.4) + "," + (i * 25 - pieChartHeight * .45) +")"; // Position the legend to the right of the pie chart
    })
    .append("rect") // make a matching color rect
    .transition()
    .duration(500)
    .attr("width", 10)
    .attr("height", 10)
    .style('fill', (d, i) => colors(i))

var legendText = svgPie.selectAll(".legend")   
    .append("text") // add the text
    .text(d => `${d.data.category} ${((d.data.amount / total) * 100).toFixed(1)}%`)
    .style('fill', 'black') // Set initial fill color to transparent
    .style("font-size", 14)
    .attr("y", 10)
    .attr("x", 11)
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1)

legend.exit()
    .remove();  
}
