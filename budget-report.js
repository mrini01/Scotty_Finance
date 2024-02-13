// Referenced these sources to learn how to use d3.js
// https://d3-graph-gallery.com/barplot


// Manually setting the amounts for now 
// TODO: Set these values to data acquired from user
amount_used = 500;
remaining_fund = 300;
out_of_pocket = 200;

// Array of budget data
const budgetData = [
    { category: "Amount Used", amount: amount_used },
    { category: "Remaining Fund", amount: remaining_fund},
    { category: "Out of Pocket",  amount: out_of_pocket }
    
];


// Functions to update the values for the variables on the HTML labels
function setAmountUsed(amount){
    document.getElementById("amount_used_value").innerHTML = amount;
}

function setRemaingFund(amount){
    document.getElementById("remaining_fund_value").innerHTML = amount;
}

function setOutOfPocket(amount){
    document.getElementById("out_of_pocket_value").innerHTML = amount;
}

// Update all of the labels with the proper values
setAmountUsed(amount_used);
setRemaingFund(remaining_fund);
setOutOfPocket(out_of_pocket);

// Get the graph element from budget-report.html in order to get the css info
var graph = document.getElementById('graph')
var graphstyle = window.getComputedStyle(graph)

// Margins of the graph
var margins = {top: 30, bottom: 30, right: 30, left: 30}

// Get the graph width and height from css file and adjust to margins
var graphWidth = parseInt(graphstyle.getPropertyValue('width')) - margins.left - margins.right;
var graphHeight = parseInt(graphstyle.getPropertyValue('height')) - margins.top - margins.bottom;

// Append svg to our #graph variable that we set in budget-report.html
var svg = d3.select('#graph')
    .append('svg')
    .attr('width', graphWidth + margins.left + margins.right)
    .attr('height', graphHeight + margins.top + margins.bottom)
    // create a group element for the axis labels and text
    .append('g')
    .attr('transform', 'translate(' + margins.left + "," + margins.top + ")");

// Create a scale for the x axis on the graph
const x = d3.scaleBand()
  .domain(budgetData.map(data => data.category))
  .range([0, graphWidth])
  .padding(0.1);

// Positions the x axis and labels on the graph 
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + graphHeight + ")");

// Create a scale for the y axis on the graph
const y = d3.scaleLinear()
  .domain([0, d3.max(budgetData, data => data.amount)])
  .range([graphHeight, 0]);

// Positions the y axis and labels on the graph
var yAxis = svg.append("g")
  .attr("class", "myYaxis");

// set the categories that will be mapped on the x axis
x.domain(budgetData.map(function(d) {return d.category; }));
// Renders the x axis with labels and data increments
xAxis.call(d3.axisBottom(x));

// set the y values that will be mapped on the y axis
y.domain([0, d3.max(budgetData, function(d) { return d.amount; })]);
// Renders the y axis with labels and data increments
yAxis.transition().duration(1000).call(d3.axisLeft(y));

// Renders all the bars on the bar graph
svg.selectAll(".bar")
  .data(budgetData) // Set data to our budget data array
  .enter().append("rect") // create a new bar for each element
    .style("fill", "#24b574") // Fill the bar with greenish color #24b574
    .attr("class", "bar")
    .attr("x", data => x(data.category)) // Set x data to the budgetData categories
    .attr("y", data => y(data.amount)) // Set y data to the budgetData amounts for each category
    .attr("width", x.bandwidth())
    .attr("height", data => graphHeight - y(data.amount));