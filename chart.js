let isFirstLoad = true; // Flag to track first load

// Create tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");


const isMobile = window.innerWidth <= 450;


const milestones = [
    {
        id: "us-open",
        year: 1973,
        text: isMobile
            ? "1973: US Open parity "
            : "In 1973, US Open became the first Grand Slam to offer equal prize money, largely due to Billie Jean King"
    },
    {
        id: "aus-open",
        year: 2001,
        text: isMobile
            ? "2001: AO parity"
            : "In 2001, Australian Open achieves parity"
    },
    {
        id: "roland-garros",
        year: 2006,
        text: isMobile
            ? "2006: French Open parity"
            : "French Open achieves parity in 2006"
    },
    {
        id: "wimbledon",
        year: 2007,
        text: isMobile
            ? "2007: Wimbledon parity"
            : "Lastly, in 2007, Wimbledon achieves parity"
    }
];
    
// Format numbers as M (for millions) or K (for thousands)
function formatNumber(value) {
    if (value === 0) {
        return '';  // Return an empty string if the value is 0
    } else if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(2) + ' M';  // Converts to millions
    } else if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(0) + ' K';  // Converts to thousands
    } else {
        return value;  // No formatting for smaller numbers
    }
}

function wrap(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy")) || 0;
        let tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

const categoryDisplayNames = {
    "aus_open_women": "Australian Open",
    "aus_open_men": "Australian Open",
    "roland_garros_women": "Roland Garros",
    "roland_garros_men": "Roland Garros",
    "wimbledon_women": "Wimbledon",
    "wimbledon_men": "Wimbledon",
    "us_open_women": "US Open",
    "us_open_men": "US Open"
};


// Load the data from CSV
d3.csv("tables/singles_slams.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year;
        d.wimbledon_women = +d.wimbledon_women;
        d.wimbledon_men = +d.wimbledon_men;
        d.us_open_women = +d.us_open_women;
        d.us_open_men = +d.us_open_men;
        d.aus_open_women = +d.aus_open_women;
        d.aus_open_men = +d.aus_open_men;
        d.roland_garros_women = +d.roland_garros_women;
        d.roland_garros_men = +d.roland_garros_men;
    });

    const rowHeight = isMobile ? 4.5 : 2.7;
    const baseWidth = isMobile ? 500 : 500;
    

    const margin = { top: 20, right: 70, bottom: 20, left: 70 };
    // if (window.innerWidth <= 768) { // mobile breakpoint
    //     margin = { top: 20, right: 30, bottom: 10, left: 30 };
    // }

    const width = baseWidth - margin.left - margin.right;

    const height = data.length * rowHeight + margin.top + margin.bottom;
    const svg = d3.select("#chart").attr("viewBox", [0, 0, width, height]);

    const gap = 10000;

    const x = d3.scaleLinear()
        .domain([
            -d3.max(data, d => d.wimbledon_men + d.us_open_men + d.aus_open_men + d.roland_garros_men),
            d3.max(data, d => d.wimbledon_women + d.us_open_women + d.aus_open_women + d.roland_garros_women)
        ])
        .range([margin.left + 0, width - margin.right]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    const categories = [
        { key: "aus_open_women", color: "#9dd0ec", sign: -1 },
        { key: "roland_garros_women", color: "#c36333", sign: -1 },
        { key: "wimbledon_women", color: "#7cb49c", sign: -1 },
        { key: "us_open_women", color: "#f1eee9", sign: -1 },
        
        { key: "aus_open_men", color: "#9dd0ec", sign: 1 },
        { key: "roland_garros_men", color: "#c36333", sign: 1 },
        { key: "wimbledon_men", color: "#7cb49c", sign: 1 },
        { key: "us_open_men", color: "#f1eee9", sign: 1 }
    ];

    // Function to update chart with selected categories
    function updateChart(selectedCategories) {
        // Clear previous bars and texts
        svg.selectAll(".chart-bars").remove();         
        svg.selectAll(".milestone-dot").remove();      
        svg.selectAll(".milestone-line").remove();     
        svg.selectAll(".milestone-label").remove();   
        svg.selectAll(".milestone-rect").remove();   
        svg.selectAll(".total-women").remove();    
        svg.selectAll(".total-men").remove();  
        svg.selectAll(".percentage-difference").remove();  
        
        const chartBars = svg.append("g")
            .attr("class", "chart-bars")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(0,${y(d.year)})`);
        
        chartBars.each(function(d) {
            let negativeOffset = 0;
            let positiveOffset = 0;
        
            selectedCategories.forEach(cat => {
                const value = cat.sign * d[cat.key];
        
                // Create the bars for each category
                d3.select(this).append("rect")
                    .attr("x", x(cat.sign > 0 ? positiveOffset + gap*100 : negativeOffset + value - gap*100))
                    .attr("width", Math.abs(x(value) - x(0)))
                    .attr("height", y.bandwidth())
                    .attr("fill", cat.color)

                    .on("mouseover", function(event) {
                        const displayName = categoryDisplayNames[cat.key] || cat.key; // Fallback to cat.key if no mapping exists
                        tooltip.style("visibility", "visible")
                            .text(`Year: ${d.year} | ${displayName}: ${formatNumber(Math.abs(value))}`);
                    })

                    .on("mousemove", function(event) {
                        // Update the tooltip position as the mouse moves
                        tooltip.style("top", (event.pageY + 10) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", function() {
                        // Hide the tooltip when mouse leaves
                        tooltip.style("visibility", "hidden");
                    });
        
                if (cat.sign > 0) {
                    positiveOffset += value;
                } else {
                    negativeOffset += value;
                }
            });
        
            // Create text for women total
            const totalWomen = selectedCategories
                .filter(c => c.key.endsWith("_women"))
                .reduce((sum, c) => {
                    if (d.year === 1968 && c.key.includes("aus_open")) {
                        return sum; // Skip Australian Open for 1968
                    }
                    return sum + d[c.key];
                }, 0);

            // Create text for men total
            const totalMen = selectedCategories
                .filter(c => c.key.endsWith("_men"))
                .reduce((sum, c) => {
                    if (d.year === 1968 && c.key.includes("aus_open")) {
                        return sum; // Skip Australian Open for 1968
                    }
                    return sum + d[c.key];
                }, 0);


            // Calculate percentage difference only for years before 2008
            if (d.year < 2009 && (d.year - 1968) % 4 === 0) {
                const validWomenTotal = selectedCategories
                    .filter(c => c.key.endsWith("_women"))
                    .reduce((sum, c) => {
                        if (d.year === 1968 && c.key.includes("aus_open")) return sum;
                        return sum + d[c.key];
                    }, 0);
                
                const validMenTotal = selectedCategories
                    .filter(c => c.key.endsWith("_men"))
                    .reduce((sum, c) => {
                        if (d.year === 1968 && c.key.includes("aus_open")) return sum;
                        return sum + d[c.key];
                    }, 0);

                const percentageDifference = validWomenTotal > 0 ? 
                    ((validMenTotal - validWomenTotal) / validWomenTotal) * 100 : 0;
                
                svg.append("text")
                    .attr("class", "percentage-difference")
                    .attr("x", x(0))
                    .attr("y", y(d.year) + y.bandwidth() / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .text(`${percentageDifference.toFixed(1)}%`);
            }

            // Show text every 4 years starting from 1968
            if ((d.year - 1968) % 4 === 0) {
            svg.append("text")
                .attr("x", x(totalWomen) + 11)
                .attr("y", y(d.year) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "start")
                .attr("class", "total-women")
                .text(formatNumber(totalWomen));
            }


            // Show text every 4 years starting from 1968
            if ((d.year - 1968) % 4 === 0) {
            svg.append("text")
                .attr("x", x(-totalMen) - 10)
                .attr("y", y(d.year) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "end")
                .attr("class", "total-men")
                .text(formatNumber(totalMen));
            }

        });    
        
        milestones.forEach(milestone => {
            // Get the data for the milestone year
            const milestoneData = data.find(d => d.year === milestone.year);
            if (!milestoneData) return;
        
            // Calculate the endpoint of the active women's bar
            const totalWomen = selectedCategories
                .filter(c => c.key.endsWith("_women"))
                .reduce((sum, c) => sum + milestoneData[c.key], 0);
        
            // Calculate the endpoint of the active men's bar
            const totalMen = selectedCategories
                .filter(c => c.key.endsWith("_men"))
                .reduce((sum, c) => sum + milestoneData[c.key], 0);
        
            // Determine the starting x position based on the women's or men's side
            const isRolandGarros = milestone.id === "roland-garros";
            const isAustralianOpen = milestone.id === "aus-open";
            const isWimbledon = milestone.id === "wimbledon";

            const startX = isRolandGarros ? x(-totalMen) : x(totalWomen); // Use men's side for Roland Garros
        
            const milestoneLineLength = 50;
            
            // Adjust position for Roland Garros (place it on the men's side)
            const lineX1 = isRolandGarros ? startX - milestoneLineLength : startX + 9;
            const lineX2 = isRolandGarros ? startX - 8 : startX + milestoneLineLength;
            const textX = isRolandGarros ? startX - milestoneLineLength - 60 : startX + milestoneLineLength + 4;
            const textAnchor = "start";
        
            let textY = y(milestone.year) + y.bandwidth() / 2;

            // Adjust Y position for specific cases on mobile
            const isMobile = window.innerWidth <= 450;
            if (isMobile) {
                if (isAustralianOpen) {
                    textY += 5; // Lower the text for Aus Open
                } else if (isWimbledon) {
                    textY -= 5; // Raise the text for Wimbledon
                }
            }


            // Add a small dot at the start of the milestone line
            svg.append("circle")
                .attr("class", `milestone-dot ${milestone.id}`)
                .attr("cx", isRolandGarros ? startX - 8.5 : startX + 9)
                .attr("cy", y(milestone.year) + y.bandwidth() / 2)
                .attr("r", 0.8)  // Adjust the radius for desired size
                .attr("fill", "#e1ebea");

            // Add a milestone line starting from the end of the active bar
            svg.append("line")
                .attr("class", `milestone-line ${milestone.id}`)
                .attr("x1", lineX1)
                .attr("x2", lineX2)
                .attr("y1", y(milestone.year) + y.bandwidth() / 2)
                .attr("y2", y(milestone.year) + y.bandwidth() / 2)
                .attr("stroke-width", 0.3)
                .attr("stroke", "#e1ebea");

            // Add annotation text
            const text = svg.append("text")
                .attr("class", `milestone-label ${milestone.id}`)
                .attr("x", textX)
                .attr("y", textY)
                .attr("dy", "0.35em")
                .attr("text-anchor", textAnchor) 
                .text(milestone.text)
                .call(wrap,75);

            // Function to position the rectangle
            const positionRectangle = () => {
                const isMobile = window.innerWidth <= 450;
                const textBBox = text.node().getBBox();
            
                // Calculate x position with conditional offset for Roland Garros
                const xPos = isRolandGarros
                    ? (isMobile ? textBBox.x - textBBox.width + 68 : textBBox.x - textBBox.width + 58)
                    : textBBox.x - 4;

                
                // Adjust Y for specific cases on mobile
                let yPos = textBBox.y - 3;
                
                if (isAustralianOpen && isMobile) {
                    yPos += 0.5;
                } else if (isWimbledon && isMobile) {
                    yPos -= 1.5;
                }

            
                svg.insert("rect", `.milestone-label.${milestone.id}`)
                    .attr("class", `milestone-rect ${milestone.id}`)
                    .attr("x", xPos)
                    .attr("y", yPos)
                    .attr("width", textBBox.width + 9)
                    .attr("height", textBBox.height + 7)
                    .attr("fill", "var(--tennis-blue)")
                    .attr("rx", 3)
                    .attr("ry", 3);
            };
            

            // Apply delay only on first load
            if (isFirstLoad) {
                setTimeout(positionRectangle, 100); // Delay of 100ms on first load
            } else {
                positionRectangle(); // No delay on subsequent updates
            }
        });

        // After the first load, set the flag to false
        isFirstLoad = false;
    }

    // Initial chart setup with all categories selected by default
    let selectedCategories = categories;  // Select all categories by default

    // Update the chart when the page loads with all selected categories
    updateChart(selectedCategories);
    
    // Track selected buttons
    let selectedButtons = new Set();

    // Configuration for each button
    const chartConfigs = {
        "wimbledon": {
            categories: [
                { key: "wimbledon_women", color: "#7cb49c", sign: -1 },
                { key: "wimbledon_men", color: "#7cb49c", sign: 1 }
            ],
            milestones: () => showMilestones(".wimbledon")
        },
        "us-open": {
            categories: [
                { key: "us_open_women", color: "#f1eee9", sign: -1 },
                { key: "us_open_men", color: "#f1eee9", sign: 1 }
            ],
            milestones: () => showMilestones(".us-open")
        },
        "aus-open": {
            categories: [
                { key: "aus_open_women", color: "#9dd0ec", sign: -1 },
                { key: "aus_open_men", color: "#9dd0ec", sign: 1 }
            ],
            milestones: () => showMilestones(".aus-open")
        },
        "roland-garros": {
            categories: [
                { key: "roland_garros_women", color: "#c36333", sign: -1 },
                { key: "roland_garros_men", color: "#c36333", sign: 1 }
            ],
            milestones: () => showMilestones(".roland-garros")
        }
    };

    // Function to show milestones for all selected buttons
    function showMilestones() {
        // Hide all milestones initially
        d3.selectAll(".milestone-line, .milestone-label, .milestone-dot, .milestone-rect").style("display", "none");

        // If no buttons are selected, show all milestones
        if (selectedButtons.size === 0) {
            milestones.forEach(milestone => {
                d3.selectAll(`.${milestone.id}`).style("display", null);
            });
        } else {
            // Show milestones for all selected buttons
            selectedButtons.forEach(buttonId => {
                const className = `.${buttonId}`;
                d3.selectAll(className).style("display", null);
            });
        }
    }

    // Add event listeners dynamically
    Object.keys(chartConfigs).forEach(id => {
        const button = document.getElementById(id);
        button.addEventListener("click", () => {
            if (selectedButtons.has(id)) {
                selectedButtons.delete(id);
                button.classList.remove("selected-button"); // Remove the stroke class
            } else {
                selectedButtons.add(id);
                button.classList.add("selected-button"); // Add the stroke class
            }

            // If no buttons are selected, reset to default categories
            if (selectedButtons.size === 0) {
                selectedCategories = [...categories]; // Reset to default categories
            } else {
                // Update selected categories based on selected buttons
                selectedCategories = [];
                selectedButtons.forEach(buttonId => {
                    selectedCategories.push(...chartConfigs[buttonId].categories);
                });
            }

            // Update the chart with the selected categories
            updateChart(selectedCategories);

            // Show milestones for all selected buttons
            showMilestones();
        });
    });

    svg.select(".y-axis path").remove();  // Remove the axis line
});