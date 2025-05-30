function goToSecondPage() {
    const isMobile = window.innerWidth < 399;

    const elementsToHide = [
        'introduction-page',
        'chart-introduction',
        'buttons-container',
        'chart-header',
        'chart',
        'second-introduction',
        'comparison-chart'
    ];

    const target = document.getElementById('second-page');

    if (isMobile) {
        // Just scroll smoothly on mobile
        target.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Hide elements, scroll, then show them again
        elementsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        target.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            elementsToHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
        }, 1000);
    }
}



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
function estimateRanking(totalPoints, gender) {
    const rankings = gender === 'male' ? atpRankings : wtaRankings;

    // Sort by rank (ascending)
    const sortedRankings = rankings.slice().sort((a, b) => a.rank - b.rank);

    // Find the lowest rank where player has at least this many points
    for (const player of sortedRankings) {
        if (totalPoints >= player.points) {
            return player.rank;
        }
    }

    // If not found (i.e. totalPoints too low), assign rank just beyond the last one
    return sortedRankings[sortedRankings.length - 1].rank + 1;
}



let menRankings = null;
let womenRankings = null;
let userEnteredRanking = null;

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


function getPointsForRanking(ranking, gender) {
    const rankings = gender === 'male' ? atpRankings : wtaRankings;
    if (!rankings || rankings.length === 0) return 0;

    const player = rankings.find(p => p.rank === ranking);
    return player ? parseInt(player.points) || 0 : 0;
}


function updateEstimatedRanking() {
    const gender = document.getElementById('gender').value;
    const numberOfEntries = document.getElementById('receipt-entries').childElementCount;
    const container = document.querySelector('.third-page-container');

    // Remove any existing dynamic paragraphs
    const existingParagraphs = container.querySelectorAll('.dynamic-paragraph');
    existingParagraphs.forEach(paragraph => paragraph.remove());

    // Remove the existing "add ranking" button, regardless of condition
    const existingButton = document.getElementById('add-ranking-button');
    if (existingButton) {
        existingButton.remove();
    }

    const rankingParagraph = document.createElement('p');
    rankingParagraph.classList.add('dynamic-paragraph');

    if (numberOfEntries === 0) {
        // Clear the user entered ranking when there are no entries
        userEnteredRanking = null;
        rankingParagraph.innerHTML = `add some tournaments above to see where you would stand in the rankings.`;
        container.appendChild(rankingParagraph);
        return;
    }

    // Calculate combined points
    let combinedPoints = totalPoints;
    let rankingPoints = 0;
    
    if (userEnteredRanking) {
        rankingPoints = getPointsForRanking(userEnteredRanking, gender);
        combinedPoints += rankingPoints;
    }

    if (combinedPoints === 0) {
        rankingParagraph.innerHTML = `based on your total points of <strong>${combinedPoints}</strong>, you would not be ranked.`;
        container.appendChild(rankingParagraph);
        return;
    }

    const estimatedRank = estimateRanking(combinedPoints, gender, numberOfEntries);
    let rankingText = '';

    if (userEnteredRanking) {
        rankingText = `based on your current ranking of ${userEnteredRanking} (${rankingPoints} points), and your recent ${totalPoints} points, `;
    } else {
        rankingText = `based on your total points of <strong>${combinedPoints}</strong>, `;
    }

    if (estimatedRank > 1000) {
        rankingText += `your new ranking would be over <strong>1,000</strong> in the World.`;
    } else {
        rankingText += `your new ranking would be around <strong>${estimatedRank}</strong> in the World.`;
    }

    rankingParagraph.innerHTML = rankingText;
    container.appendChild(rankingParagraph);

    if (estimatedRank <= 1000) {
        const qualifyingTournament = getQualifyingTournament(estimatedRank, gender);
        const tournamentParagraph = document.createElement('p');
        tournamentParagraph.classList.add('dynamic-paragraph');

        if (qualifyingTournament === 'W15' || qualifyingTournament === 'M15') {
            tournamentParagraph.innerHTML = `with this ranking, you would qualify for a <strong>${qualifyingTournament}</strong> event.`;
        } else if (qualifyingTournament.startsWith('ATP')) {
            tournamentParagraph.innerHTML = `with this ranking, you would qualify for an <strong>${qualifyingTournament}</strong> event or below.`;
        } else {
            tournamentParagraph.innerHTML = `with this ranking, you would qualify for a <strong>${qualifyingTournament}</strong> event or below.`;
        }

        container.appendChild(tournamentParagraph);
    }

    // Add button only if entries exist and rank is valid
    if (numberOfEntries > 0) {
        const addRankingButton = document.createElement('button');
        addRankingButton.id = 'add-ranking-button';
        addRankingButton.textContent = userEnteredRanking ? 'update ranking' : 'add ranking';
        
        addRankingButton.addEventListener('click', () => {
            // Remove existing popup if any
            const existingPopup = document.getElementById('ranking-popup');
            if (existingPopup) existingPopup.remove();
        
            // Create the popup container
            const popup = document.createElement('div');
            popup.id = 'ranking-popup';
            popup.innerHTML = `
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <p>do you currently hold a singles ranking?<br>if so, enter it below.</p>
                    <input type="number" id="user-ranking-input" placeholder="enter your ranking" min="1" 
                           value="${userEnteredRanking || ''}" />
                    <button id="submit-ranking">submit</button>
                    <button id="close-popup">cancel</button>
                </div>
            `;
            document.body.appendChild(popup);
        
            document.getElementById('close-popup').addEventListener('click', () => {
                popup.remove();
            });
        
            document.getElementById('submit-ranking').addEventListener('click', () => {
                const rankingValue = parseInt(document.getElementById('user-ranking-input').value, 10);
            
                if (!isNaN(rankingValue)) {
                    if (rankingValue > 1000) {
                        alert("please enter a ranking under 1000");
                    } else {
                        userEnteredRanking = rankingValue;
                        popup.remove();
                        updateEstimatedRanking();
                    }
                } else {
                    alert("please enter a valid number");
                }
            });
        });
        
        container.appendChild(addRankingButton);
    }
}

// Modify your clear button event listener to also clear the ranking
document.getElementById('clear-button').addEventListener('click', () => {
    userEnteredRanking = null; // Clear the ranking when clearing entries
    updateEstimatedRanking();
});


document.getElementById('add-button').addEventListener('click', updateEstimatedRanking);
document.getElementById('rewind-button').addEventListener('click', updateEstimatedRanking);
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
    
    // Only apply scroll effect for screens larger than 400px
    if (window.innerWidth < 400) {
        // For small screens, just display the slides vertically without scroll effect
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

    // Function to calculate total scroll distance dynamically
    function getTotalScrollDistance() {
        let adjustment = window.innerWidth < 400 ? 50 : 20; // Reduce distance by 50px on small screens
        return (slideWidth + gap) * (slides.length - 1) - adjustment;
    }

    // Adjust the initial position for smaller screens
    function getStartPosition() {
        return window.innerWidth < 400 ? "top 10%" : "top top"; 
    }

    function getInitialXPosition() {
        return window.innerWidth < 400 ? 20 : 0; // Shifts left by 20px on small screens
    }
    
    // Create the horizontal scroll animation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".carousel-scroll-container",
            start: getStartPosition(),
            end: () => `+=${getTotalScrollDistance() + window.innerWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,  
            fastScrollEnd: true,  
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
    
    tl.fromTo(carousel, 
        { x: getInitialXPosition() }, // Adjusts starting position for small screens
        { x: -getTotalScrollDistance(), ease: "none" }
    );
    
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
    
    requestAnimationFrame(function() {
        const carousel = document.querySelector('.boxes-carousel');
        const boxes = document.querySelectorAll('.box, .box_2');
        const scrollContainer = document.querySelector('.box-carousel-scroll-container');
        const section = document.getElementById('second-introduction');
        
        if (!carousel || !boxes.length || !scrollContainer || !section) {
            console.error('Required elements not found!');
            return;
        }
        
        boxes[0].classList.add('active');
        
        // Adjust gap based on screen width
        const gap = window.innerWidth < 400 ? 90 : 120; 
        let totalScrollDistance = 0;
        
        // Calculate total scrollable distance dynamically
        boxes.forEach(box => {
            totalScrollDistance += box.offsetWidth - gap;
        });

        // Function to get total scroll distance dynamically
        function getTotalScrollDistance() {
            return totalScrollDistance - (window.innerWidth < 400 ? -65 : 0); 
        }

        // Function to get start position dynamically based on screen width
        function getStartPosition() {
            return window.innerWidth < 400 ? "top 15%" : "top top";
        }

        // Initial position for mobile screens
        function getInitialXPosition() {
            return window.innerWidth < 400 ? -85 : 0; // Shift slightly left for mobile
        }
        
        // If the screen is smaller than 400px, do not apply scroll trigger
        if (window.innerWidth < 400) {
            // Stack boxes vertically on smaller screens
            gsap.set(carousel, { x: 0 });
            carousel.style.display = 'block';
            boxes.forEach(box => box.style.display = 'block'); // Stack the boxes vertically
            return;
        }

        // Apply GSAP scroll effect for larger screens
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: getStartPosition(),
                end: () => `+=${getTotalScrollDistance() + window.innerWidth * 0.8}`,
                scrub: 1,
                pin: scrollContainer,
                anticipatePin: 1,
                invalidateOnRefresh: true,  
                fastScrollEnd: true,  
                onUpdate: (self) => {
                    const progress = self.progress;
                    const activeIndex = Math.min(boxes.length - 1, Math.floor(progress * boxes.length));
                    boxes.forEach((box, index) => {
                        box.classList.toggle('active', index === activeIndex);
                    });
                },
                markers: false 
            }
        });

        tl.fromTo(carousel, 
            { x: getInitialXPosition() }, 
            { x: -getTotalScrollDistance(), ease: "none" }
        );

        // Refresh ScrollTrigger after a short delay
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Kill any existing ScrollTriggers and refresh for new layout
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                ScrollTrigger.refresh();
            }, 250);
        });
    });
});

  
