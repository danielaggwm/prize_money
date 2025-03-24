// Update Tournament Level options based on gender.
document.getElementById('gender').addEventListener('change', function () {
    const gender = this.value;
    const tournamentLevelSelect = document.getElementById('tournament-level');
    tournamentLevelSelect.innerHTML = '';
  
    let options = [];
    if (gender === 'female') {
        options = ['W15', 'W35', 'W50', 'W75', 'W100', 'WTA 125', 'WTA 250', 'WTA 500', 'WTA 1000'];
    } else if (gender === 'male') {
        options = ['M15', 'M25', 'Challenger 50', 'Challenger 75', 'Challenger 100', 'Challenger 125', 'Challenger 175', 'ATP 250', 'ATP 500', 'ATP 1000'];
    }
  
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        tournamentLevelSelect.appendChild(optionElement);
    });
    updateRoundLevelOptions();

    // Clear the receipt when gender changes
    clearReceipt();
});

// Function to clear the receipt and reset totals
function clearReceipt() {
    const receiptEntries = document.getElementById('receipt-entries');
    receiptEntries.innerHTML = '';  // Clear all entries
    totalMoney = 0;  // Reset the total money
    totalPoints = 0;  // Reset the total points

    // Update the total row at the bottom
    document.getElementById('total-money').textContent = `$0.00`;
    document.getElementById('total-points').textContent = `0pts`;

    // Reset the number of entries in the total row
    document.getElementById('total-entries').textContent = '0';
}


// Update Round Level options based on competition type and tournament level.
function updateRoundLevelOptions() {
    const gender = document.getElementById('gender').value;
    const competitionType = document.getElementById('competition-type').value;
    const tournamentLevel = document.getElementById('tournament-level').value;
    const roundLevelSelect = document.getElementById('round-level');
    roundLevelSelect.innerHTML = '';
    
    // Default round options.
    let roundOptions = ['Winner', 'Finalist', 'Semifinalist', 'Quarterfinalist', 'R16', 'R32'];
    
    // Adjust based on gender and competition.
    if (gender === 'female') {
      if (competitionType === 'Doubles') {
        roundOptions = ['Winner', 'Finalist', 'Semifinalist', 'Quarterfinalist', 'R16'];
        if (tournamentLevel === 'WTA 1000') {
          roundOptions.push('R32');
        }
      } else if (competitionType === 'Singles') {
        if (tournamentLevel === 'WTA 500') {
          roundOptions.push('R48');
        } else if (tournamentLevel === 'WTA 1000') {
          roundOptions.push('R56');
        }
      }
    } else if (gender === 'male') {
      if (competitionType === 'Doubles') {
        roundOptions = ['Winner', 'Finalist', 'Semifinalist', 'Quarterfinalist', 'R16'];
        if (tournamentLevel === 'ATP 1000') {
          roundOptions.push('R32');
        }
      } else if (competitionType === 'Singles') {
        if (tournamentLevel === 'ATP 1000') {
          roundOptions.push('R56');
        }
      }
    }
    
    // Populate round level dropdown.
    roundOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      roundLevelSelect.appendChild(optionElement);
    });
}
  
// Listen to competition type and tournament level changes to update rounds.
document.getElementById('competition-type').addEventListener('change', updateRoundLevelOptions);
document.getElementById('tournament-level').addEventListener('change', updateRoundLevelOptions);
document.getElementById('gender').dispatchEvent(new Event('change'));
  
// Helper: Map round names (e.g., "Winner") to the csv header.
function getRoundAbbreviation(round) {
    return round; // No abbreviation now, just return the full term
}

// Global variables to store CSV data
let menPointSystem = null;
let menPrizeMoney = null;
let womenPointSystem = null;
let womenPrizeMoney = null;

// Function to fetch and parse a CSV file
function fetchCSV(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    callback(results.data);
                }
            });
        })
        .catch(error => console.error(`Error fetching ${file}:`, error));
}

// Fetch all CSV files on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchCSV('Men_Point_System.csv', data => menPointSystem = data);
    fetchCSV('Men_Prize_Money.csv', data => menPrizeMoney = data);
    fetchCSV('Women_Point_System.csv', data => womenPointSystem = data);
    fetchCSV('Women_Prize_Money.csv', data => womenPrizeMoney = data);
});

// Function to get prize money and points from CSV data
function getDataFromCSV(gender, tournamentLevel, competitionType, round) {
    const prizeMoneyData = gender === 'female' ? womenPrizeMoney : menPrizeMoney;
    const pointSystemData = gender === 'female' ? womenPointSystem : menPointSystem;

    console.log('Selected Options:', {
        gender,
        tournamentLevel,
        competitionType,
        round
    });

    // Find the matching row in prize money data
    const prizeMoneyRow = prizeMoneyData.find(row => {
        return row['Category'] === tournamentLevel && row['Singles or Doubles'] === competitionType;
    });

    // Find the matching row in point system data
    const pointSystemRow = pointSystemData.find(row => {
        return row['Category'] === tournamentLevel && row['Singles or Doubles'] === competitionType;
    });

    console.log('Prize Money Row:', prizeMoneyRow);
    console.log('Point System Row:', pointSystemRow);

    if (prizeMoneyRow && pointSystemRow) {
        return {
            tournamentLevel: tournamentLevel,
            prizeMoney: prizeMoneyRow[round],
            points: pointSystemRow[round]
        };
    }

    return null; // No matching data found
}


let totalMoney = 0;
let totalPoints = 0;

// Function to update the receipt by adding a new entry
// function updateReceipt(data) {
//     if (data) {
//         const receiptEntries = document.getElementById('receipt-entries');
//         const entry = document.createElement('p');

//         // Create individual spans for each element
//         entry.innerHTML = `
//             <span>${data.tournamentLevel}</span>
//             <span>${data.prizeMoney}</span>
//             <span>${data.points}pts</span>
//         `;

//         // Append the entry to the receipt
//         receiptEntries.appendChild(entry);

//         // Remove '$' and ',' using a global regex to handle all formatting
//         const prizeMoneyRaw = parseFloat(data.prizeMoney.replace(/[^0-9.]/g, ''));

//         // Update totals with the raw values
//         totalMoney += prizeMoneyRaw;
//         totalPoints += parseInt(data.points);

//         // Update the total row at the bottom (show total as formatted currency)
//         document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
//         document.getElementById('total-points').textContent = `${totalPoints}pts`;

//     } else {
//         alert('No data found for the selected options.');
//     }
// }

function updateReceipt(data) {
    if (data) {
        const receiptEntries = document.getElementById('receipt-entries');
        const entry = document.createElement('p');

        // Create individual spans for each element
        entry.innerHTML = `
            <span>${data.tournamentLevel}</span>
            <span>${data.prizeMoney}</span>
            <span>${data.points}pts</span>
        `;

        // Append the entry to the receipt
        receiptEntries.appendChild(entry);

        // Remove '$' and ',' using a global regex to handle all formatting
        const prizeMoneyRaw = parseFloat(data.prizeMoney.replace(/[^0-9.]/g, ''));

        // Update totals with the raw values
        totalMoney += prizeMoneyRaw;
        totalPoints += parseInt(data.points);

        // Update the total row at the bottom (show total as formatted currency)
        document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
        document.getElementById('total-points').textContent = `${totalPoints}pts`;

        // Update the number of entries in the total row
        const numberOfEntries = receiptEntries.childElementCount;
        document.getElementById('total-entries').textContent = numberOfEntries;

    } else {
        alert('No data found for the selected options.');
    }
}

// Event listener for Add Button
document.getElementById('add-button').addEventListener('click', function () {
    const gender = document.getElementById('gender').value;
    const tournamentLevel = document.getElementById('tournament-level').value;
    const competitionType = document.getElementById('competition-type').value;
    const round = document.getElementById('round-level').value;

    if (menPointSystem && menPrizeMoney && womenPointSystem && womenPrizeMoney) {
        const data = getDataFromCSV(gender, tournamentLevel, competitionType, round);
        updateReceipt(data);
    } else {
        alert('CSV files not loaded yet. Please wait.');
    }
});

// Event listener for Clear Button (removes all entries)
document.getElementById('clear-button').addEventListener('click', function () {
    const receiptEntries = document.getElementById('receipt-entries');
    
    // Clear all entries in the receipt
    receiptEntries.innerHTML = '';

    // Reset the totals to 0
    totalMoney = 0;
    totalPoints = 0;

    // Update the total row at the bottom
    document.getElementById('total-money').textContent = `$0.00`;
    document.getElementById('total-points').textContent = `0pts`;

    // Reset the number of entries in the total row
    document.getElementById('total-entries').textContent = '0';
});

// Event listener for Rewind Button 
document.getElementById('rewind-button').addEventListener('click', function () {
    const receiptEntries = document.getElementById('receipt-entries');
    
    // Check if there are any entries to remove
    if (receiptEntries.lastChild) {
        // Get the last entry's prize money and points before removing it
        const lastEntry = receiptEntries.lastChild;
        const prizeMoneyText = lastEntry.querySelector('span:nth-child(2)').textContent; // Prize money is the second span
        const pointsText = lastEntry.querySelector('span:nth-child(3)').textContent; // Points are the third span

        // Remove '$' and ',' from prize money and convert to a number
        const prizeMoneyRaw = parseFloat(prizeMoneyText.replace(/[^0-9.]/g, ''));
        
        // Remove 'pts' from points and convert to a number
        const pointsRaw = parseInt(pointsText.replace('pts', ''));

        // Remove the last entry from the DOM
        receiptEntries.removeChild(lastEntry);

        // Adjust the totals by subtracting the last entry's values
        totalMoney -= prizeMoneyRaw;
        totalPoints -= pointsRaw;

        // Update the total row at the bottom
        document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
        document.getElementById('total-points').textContent = `${totalPoints}pts`;

        // Update the number of entries in the total row
        const numberOfEntries = receiptEntries.childElementCount;
        document.getElementById('total-entries').textContent = numberOfEntries;

        // Update the estimated ranking
        updateEstimatedRanking();
    }
});

// Get the button and popup elements
const infoButton = document.getElementById('info-button');
const infoPopup = document.getElementById('info-popup');

// Show the popup on hover
infoButton.addEventListener('mouseenter', () => {
    infoPopup.style.display = 'block';
});

// Hide the popup when the mouse leaves
infoButton.addEventListener('mouseleave', () => {
    infoPopup.style.display = 'none';
});



// Load the ATP and WTA rankings JSON files
let atpRankings = null;
let wtaRankings = null;

fetch('atp_rankings.json')
    .then(response => response.json())
    .then(data => atpRankings = data);

fetch('wta_rankings.json')
    .then(response => response.json())
    .then(data => wtaRankings = data);

// Function to estimate the ranking based on total points and number of entries
function estimateRanking(totalPoints, gender, numberOfEntries) {
    const rankings = gender === 'male' ? atpRankings : wtaRankings;

    // Assuming the totalPoints correlates with rank, find the first player with fewer points
    let estimatedRank = rankings.findIndex(player => {
        return parseInt(player.points) <= totalPoints;
    });

    if (estimatedRank === -1) {
        // If no player has fewer points, set rank to the last player in the list
        estimatedRank = rankings.length;
    }

    // Cap the estimated rank at 1 (cannot be ranked higher than #1)
    estimatedRank = Math.max(1, estimatedRank);

    return estimatedRank;
}


let menRankings = null;
let womenRankings = null;

// Fetch the rankings CSV files on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchCSV('Men_Rankings.csv', data => menRankings = data);
    fetchCSV('Women_Rankings.csv', data => womenRankings = data);
});

function getQualifyingTournament(estimatedRank, gender) {
    const rankings = gender === 'male' ? menRankings : womenRankings;

    // Find the highest tournament level the player qualifies for
    for (const row of rankings) {
        if (estimatedRank <= row.Ranking) {
            return row.Category;
        }
    }

    // If the player doesn't qualify for any tournament, return the lowest level
    return rankings[rankings.length - 1].Category;
}

function updateEstimatedRanking() {
    const gender = document.getElementById('gender').value;

    // Get the number of entries (tournaments) from the receipt
    const numberOfEntries = document.getElementById('receipt-entries').childElementCount;

    // Select the container where the paragraphs will be added
    const container = document.querySelector('.third-page-container');

    // Remove previous dynamically added paragraphs (those with the 'dynamic-paragraph' class)
    const existingParagraphs = container.querySelectorAll('.dynamic-paragraph');
    existingParagraphs.forEach(paragraph => {
        paragraph.remove();
    });

    // Create a new paragraph for the ranking estimation
    const rankingParagraph = document.createElement('p');
    rankingParagraph.classList.add('dynamic-paragraph');  // Add the class to the new paragraph

    // Default message when no tournaments are added
    if (numberOfEntries === 0) {
        rankingParagraph.innerHTML = `add some tournaments above to see where you would stand in the rankings.`;
    } 
    // Handle the case where totalPoints is 0 (but there are entries)
    else if (totalPoints === 0) {
        rankingParagraph.innerHTML = `based on your total points of <strong>${totalPoints}</strong>, you would not be ranked.`;
    } 
    // Handle the case where there are entries and totalPoints > 0
    else {
        // Calculate the estimated rank
        const estimatedRank = estimateRanking(totalPoints, gender, numberOfEntries);

        // Handle the case where the estimated rank is above 1000
        if (estimatedRank > 1000) {
            rankingParagraph.innerHTML = `based on your total points of <strong>${totalPoints}</strong>, you would be ranked over <strong>1,000</strong> in the World.`;
        } 
        // Default case for other rankings
        else {
            rankingParagraph.innerHTML = `based on your total points of <strong>${totalPoints}</strong>, your ranking would be around <strong>${estimatedRank}</strong> in the World.`;
        }

        // Append the ranking paragraph first
        container.appendChild(rankingParagraph);

        // Add a new paragraph for the qualifying tournament information
        if (estimatedRank <= 1000) {
            const qualifyingTournament = getQualifyingTournament(estimatedRank, gender);
            const tournamentParagraph = document.createElement('p');
            tournamentParagraph.classList.add('dynamic-paragraph');

            // Check if the qualifying tournament is W15 or M15
            if (qualifyingTournament === 'W15' || qualifyingTournament === 'M15') {
                tournamentParagraph.innerHTML = `with this ranking, you would qualify for a <strong>${qualifyingTournament}</strong> event.`;
            } 
            // Check if the qualifying tournament is an ATP event (ATP 250, ATP 500, ATP 1000)
            else if (qualifyingTournament.startsWith('ATP')) {
                tournamentParagraph.innerHTML = `with this ranking, you would qualify for an <strong>${qualifyingTournament}</strong> event or below.`;
            } 
            // Default case for other tournaments
            else {
                tournamentParagraph.innerHTML = `with this ranking, you would qualify for a <strong>${qualifyingTournament}</strong> event or below.`;
            }

            container.appendChild(tournamentParagraph); // Append after the ranking paragraph
        }
    }

    // If no qualifying tournament paragraph is added, ensure the ranking paragraph is still appended
    if (numberOfEntries === 0 || totalPoints === 0 || estimatedRank > 1000) {
        container.appendChild(rankingParagraph);
    }
}

document.getElementById('clear-button').addEventListener('click', updateEstimatedRanking);
document.getElementById('add-button').addEventListener('click', updateEstimatedRanking);
document.getElementById('rewind-button').addEventListener('click', updateEstimatedRanking);

// Event listener for gender change
document.getElementById('gender').addEventListener('change', updateEstimatedRanking);


// Get the button and popup elements
const infoButton2 = document.getElementById('info-button-2');
const infoPopup2 = document.getElementById('info-popup-2');

// Show the popup on hover
infoButton.addEventListener('mouseenter', () => {
    infoPopup.style.display = 'block';
});

// Hide the popup when the mouse leaves
infoButton.addEventListener('mouseleave', () => {
    infoPopup.style.display = 'none';
});


// FIRST SCROLL SLIDER
document.addEventListener('DOMContentLoaded', function() {
    // Verify GSAP is loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded!');
        return;
    }
    
    gsap.registerPlugin(ScrollTrigger);
    
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.slide');
    const scrollContainer = document.querySelector('.carousel-scroll-container');
    
    // Check if elements exist
    if (!carousel || !slides.length || !scrollContainer) {
        console.error('Required elements not found!');
        return;
    }
    
    // Set initial active slide
    slides[0].classList.add('active');
    
    // Calculate total scrollable distance
    const slideWidth = slides[0].offsetWidth;
    const gap = 30;
    const totalScrollDistance = (slideWidth + gap) * (slides.length - 1);
    
    // Create the horizontal scroll animation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".carousel-scroll-container",
            start: "top top",
            end: () => `+=${totalScrollDistance + window.innerWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const activeIndex = Math.min(
                    slides.length - 1, 
                    Math.floor(progress * slides.length)
                );
                
                // Update active class
                slides.forEach((slide, index) => {
                    slide.classList.toggle('active', index === activeIndex);
                });
            },
            onEnter: () => {
                document.body.style.overflow = 'auto';
            },
            onLeaveBack: () => {
                document.body.style.overflow = 'auto';
            },
            markers: false 
        }
    });
    
    tl.to(carousel, {
        x: -totalScrollDistance,
        ease: "none"
    });
    
    // Handle window resize
    function handleResize() {
        ScrollTrigger.refresh();
    }
    
    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
    
    // Initial refresh
    ScrollTrigger.refresh();
});

// SECOND SCROLL SLIDER
document.addEventListener('DOMContentLoaded', function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded!');
        return;
    }
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Wait for the next frame to ensure all elements are rendered
    requestAnimationFrame(function() {
        const carousel = document.querySelector('.boxes-carousel');
        const boxes = document.querySelectorAll('.box, .box_2');
        const scrollContainer = document.querySelector('.box-carousel-scroll-container');
        const section = document.getElementById('second-introduction');
        
        if (!carousel || !boxes.length || !scrollContainer || !section) {
            console.error('Required elements not found!');
            return;
        }
        
        // Set initial active box
        boxes[0].classList.add('active');
        
        // Calculate total scrollable distance
        const gap = 120;
        let totalScrollDistance = 0;
        
        // Get all box widths and calculate the total scrollable distance
        boxes.forEach(box => {
            totalScrollDistance += box.offsetWidth - gap; // Add gap between boxes
        });
        
        // Create the horizontal scroll animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section, // Use the parent section as trigger
                start: "top top", // Same as first carousel
                end: () => `+=${totalScrollDistance + window.innerWidth * 0.8}`,
                scrub: 1,
                pin: scrollContainer, // More precise pin target
                anticipatePin: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const activeIndex = Math.min(
                        boxes.length - 1, 
                        Math.floor(progress * boxes.length)
                    );
                    
                    // Update active class
                    boxes.forEach((box, index) => {
                        box.classList.toggle('active', index === activeIndex);
                    });
                },
                markers: false 
            }
        });
        
        tl.to(carousel, {
            x: -totalScrollDistance,
            ease: "none"
        });
        
        // Force a refresh after a short delay to ensure correct calculations
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
            }, 250);
        });
    });
});




