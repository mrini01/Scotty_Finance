// Referenced these sources to learn how to use d3.js
// https://d3-graph-gallery.com/barplot
// https://d3-graph-gallery.com/graph/pie_annotation.html
// https://www.youtube.com/watch?v=fX9uiqSok6k


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


//import './database.js'
// import { getExpenses, getUser, getBudgetForUserId } from './database.js';

// Manually setting the amounts for now 
// TODO: Set these values to data acquired from user
// amount_used = 500;
// remaining_fund = 300;
// out_of_pocket = 200;

// // // // Array of budget data
// const Data = [
//     { category: "Amount Used", amount: amount_used },
//     { category: "Remaining Fund", amount: remaining_fund},
//     { category: "Out of Pocket",  amount: out_of_pocket }
    
// ];

// console.log(Data);

const budgetData = [];

fetch('/budget') 
    .then(response => response.json()) 
    .then(data => {
        //const dataParsed = JSON.parse(response);
        // console.log(dataParsed.id);
        // console.log(dataParsed.budgetId);
        // console.log(dataParsed.amount);
        // console.log(dataParsed.type);
        console.log(data);
        
        data.forEach(item => {
            const { type, amount } = item; 
            const category = ExpenseType[type] || 'Unknown'; 
            budgetData.push({ category, amount });
        });
        console.log(budgetData.length);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })
    .finally(() => {



        const container = document.getElementById('budgetDataContainer');

        // Plugging in data to html text labels
        budgetData.forEach(item => {
            const div = document.createElement('div');
            div.textContent = `${item.category}: ${item.amount}`;
            container.appendChild(div);
        });

        console.log(budgetData.length);
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

        // // Update all of the labels with the proper values
        // setAmountUsed(amount_used);
        // setRemaingFund(remaining_fund);
        // setOutOfPocket(out_of_pocket);

        // BAR GRAPH CODE

        // Get the Bar graph element from budget-report.html in order to get the css info
        var barGraph = document.getElementById('bargraph')
        var barGraphstyle = window.getComputedStyle(barGraph)

        // Margins of the graph
        var margins = {top: 30, bottom: 30, right: 30, left: 30}

        // Get the graph width and height from css file and adjust to margins
        var barGraphWidth = parseInt(barGraphstyle.getPropertyValue('width')) - margins.left - margins.right;
        var barGraphHeight = parseInt(barGraphstyle.getPropertyValue('height')) - margins.top - margins.bottom;

        // Append svg to our #graph variable that we set in budget-report.html
        var svg = d3.select('#bargraph')
            .append('svg')
            .attr('width', barGraphWidth + margins.left + margins.right)
            .attr('height', barGraphHeight + margins.top + margins.bottom)
            // create a group element for the axis labels and text
            .append('g')
            .attr('transform', 'translate(' + margins.left + "," + margins.top + ")");

        // Create a scale for the x axis on the graph
        const x = d3.scaleBand()
        .domain(budgetData.map(data => data.category))
        .range([0, barGraphWidth])
        .padding(0.1);

        // Positions the x axis and labels on the graph 
        var xAxis = svg.append("g")
        .attr("transform", "translate(0," + barGraphHeight + ")");

        // Create a scale for the y axis on the graph
        const y = d3.scaleLinear()
        .domain([0, d3.max(budgetData, data => data.amount)])
        .range([barGraphHeight, 0]);

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
            .attr("height", data => barGraphHeight - y(data.amount))
            .on('mouseover', function(d, i) {
                d3.select(this)
                .style('fill', '#1b8f5b')
                .transition().duration(500)  
            })
            .on('mouseout', function(d, i) {
                d3.select(this)
                .style("fill", "#24b574")
                .transition().duration(500)
            })


        // PIE CHART CODE

        // Get the Pie chart element from budget-report.html in order to get the css info
        var pieChart = document.getElementById('piegraph')
        var pieChartStyle = window.getComputedStyle(pieChart)

        // Get the pie graph width and height from css file and adjust to margins
        var pieChartWidth = parseInt(pieChartStyle.getPropertyValue('width'));
        var pieChartHeight = parseInt(pieChartStyle.getPropertyValue('height'));

        // Colors of pie chart
        // var colors = d3.scaleOrdinal(['#7326AB', '#2A59A9', '#E5A1D4']) // Manually set colors
        // Use color scheme to automatically assign colors
        var colors = d3.scaleOrdinal()
        .domain(budgetData)
        .range(d3.schemeDark2)

        // Get the radius by getting the minimum between width and height and diving by 2
        var radius = Math.min(pieChartWidth, pieChartHeight) / 2;

        // Append svg to our #piegraph variable that we set in budget-report.html
        var svgPie = d3.select('#piegraph')
            .append('svg')
            .attr('width', pieChartWidth)
            .attr('height', pieChartHeight)
            .append('g')
            .attr('transform', `translate(${pieChartWidth / 2}, ${pieChartHeight / 2})`); // set position to center of graph

        // map the budgetdata to to a new variable
        var pieData = budgetData.map(d => ({ category: d.category, amount: d.amount }));

        // Define variables for the pie chart slices
        var pie = d3.pie().value(d => d.amount).sort(null)
        var arc = d3.arc().innerRadius(0).outerRadius(radius*.8)
        var hoverArc = d3.arc().innerRadius(0).outerRadius(radius * 0.9)

        // set up pie chart
        var temp = svgPie.selectAll('.arc')
            .data(pie(pieData))
            .enter().append('g')
            .attr('class', 'arc')

        // Renders slices for pie chart
        temp.append('path')
            .attr('d', arc)
            .attr('class', 'arc')
            .style('fill', (d, i) => colors(i))
            .style('fill-opacity', 0.8)
            .style('stroke', '#11141C')
            .style('stroke-width', 4)
            .on('mouseover', function(d, i) {
                d3.select(this)
                .style('fill-opacity', 1)
                .transition().duration(500)
                .attr('d', hoverArc)
            })
            .on('mouseout', function(d, i) {
                d3.select(this)
                .style('fill-opacity', .8)
                .transition().duration(500)
                .attr('d', arc)
            })

        // Added labels to pie chart
        temp.append('text')
            .text(d => `${d.data.category} ${d.data.amount}`)
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .style('font-size', 14)
            .style('font-weight', 800)
            .style('fill', '#FFFFFF')
            .style('text-anchor', 'middle')

});