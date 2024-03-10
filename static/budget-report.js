// Referenced these sources to learn how to use d3.js
// https://d3-graph-gallery.com/barplot
// https://d3-graph-gallery.com/graph/pie_annotation.html
// https://www.youtube.com/watch?v=fX9uiqSok6k
// https://stackoverflow.com/questions/64986774/how-to-keep-and-hide-tooltip-on-mouse-hover-and-mouse-out for tooltips


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
});

function update(budgetData, count) {

    // Initialize data array
    let data = [];

    // Remove all previous graphs made
    d3.select("#bargraph").selectAll("*").remove();
    d3.select("#piegraph").selectAll("*").remove();

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

    // Get the Bar graph element from budget-report.html in order to get the css info
    var barGraph = document.getElementById('bargraph')
    var barGraphstyle = window.getComputedStyle(barGraph)

    // Margins of the graph
    var margins = {top: 30, bottom: 100, right: 50, left: 50}

    // Get the graph width and height from css file and adjust to margins
    var barGraphWidth = parseInt(barGraphstyle.getPropertyValue('width')) - margins.left - margins.right;
    var barGraphHeight = parseInt(barGraphstyle.getPropertyValue('height')) - margins.top - margins.bottom;

    var colors = d3.scaleOrdinal()
    .domain(data)
    .range(d3.schemeDark2)

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
    .domain(data.map(data => data.category))
    .range([0, barGraphWidth])
    .padding(0.1);

    // set the categories that will be mapped on the x axis
    x.domain(data.map(function(d) {return d.category; }));
    // Renders the x axis with labels and data increments
    // xAxis.call(d3.axisBottom(x));

    // Positions the x axis and labels on the graph 
    var xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + barGraphHeight + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

    // Create a scale for the y axis on the graph
    const y = d3.scaleLinear()
    .domain([0, d3.max(data, data => data.amount)])
    .range([barGraphHeight, 0]);

    // Positions the y axis and labels on the graph
    var yAxis = svg.append("g")
    .attr("class", "myYaxis");

    // set the y values that will be mapped on the y axis
    y.domain([0, d3.max(data, function(d) { return d.amount; })]);
    // Renders the y axis with labels and data increments
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Renders all the bars on the bar graph
    svg.selectAll(".bar")
    .data(data) // Set data to our budget data array
    .enter()
    .append("rect")
        .style("fill", "#24b574") // Fill the bar with greenish color #24b574
        //.style('fill', (d, i) => colors(i))
        .attr("class", "bar")
        .attr("x", data => x(data.category)) // Set x data to the data categories
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return barGraphHeight - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })
    
    var u = svg.selectAll("rect")
        .transition() // and apply changes to all of them
        .duration(1000)
            .attr("y", data => y(data.amount)) // Set y data to the data amounts for each category
            .attr("height", data => barGraphHeight - y(data.amount))
            .delay(function(d,i){console.log(i) ; return(i*100)})
            


    // PIE CHART CODE

    // Get the Pie chart element from budget-report.html in order to get the css info
    var pieChart = document.getElementById('piegraph')
    var pieChartStyle = window.getComputedStyle(pieChart)

    // Get the pie graph width and height from css file and adjust to margins
    var pieChartWidth = parseInt(pieChartStyle.getPropertyValue('width'));
    var pieChartHeight = parseInt(pieChartStyle.getPropertyValue('height'));

    // Get the radius by getting the minimum between width and height and diving by 2
    var radius = (Math.min(pieChartWidth, pieChartHeight) / 2) - (Math.max(margins.left + margins.right, margins.bottom + margins.top));

    // Append svg to our #piegraph variable that we set in budget-report.html
    var svgPie = d3.select('#piegraph')
        .append('svg')
        .attr('width', pieChartWidth)
        .attr('height', pieChartHeight)
        .append('g')
        .attr('transform', `translate(${(pieChartWidth*.8) / 2}, ${pieChartHeight / 2})`); // set position to center of graph

    // map the data to to a new variable
    var pieData = data.map(d => ({ category: d.category, amount: d.amount }));

    // Define variables for the pie chart slices
    var pie = d3.pie().value(d => d.amount).sort(null)
    var arc = d3.arc().innerRadius(0).outerRadius(radius*.8)
    var hoverArc = d3.arc().innerRadius(0).outerRadius(radius * 0.9)

    // set up pie chart
    var temp = svgPie.selectAll('.arc')
        .data(pie(pieData))
        .enter().append('g')
        .attr('class', 'arc')
      //  .attr('transform', `translate(${pieChartWidth/2 - 400})`); 

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


        var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Added labels to pie chart
    temp.append('text')
        //.text(d => `${d.data.category} ${((d.data.amount / total) * 100).toFixed(2)}%`)
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .style('font-size', 14)
        .style('font-weight', 800)
        .style('fill', '#FFFFFF')
        .style('text-anchor', 'middle')


var width = pieChartWidth/4;

// Legend
var legendG = temp.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
    .data(pie(data))
    .enter().append("g")
    .attr("transform", function(d,i){
        return "translate(" + (pieChartWidth/4 *1.2) + "," + (i * 25 - pieChartHeight * .4) +")"; // Position the legend to the right of the pie chart
    })
    .attr("class", "legend");   

legendG.append("rect") // make a matching color rect
    .attr("width", 10)
    .attr("height", 10)
    .style('fill', (d, i) => colors(i))

legendG.append("text") // add the text
    .text(d => `${d.data.category} ${((d.data.amount / total) * 100).toFixed(2)}%`)
    .style("font-size", 14)
    .attr("y", 10)
    .attr("x", 11);
}
