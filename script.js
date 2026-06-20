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
            // GSAP's pin spacers come back when elements are restored, shifting the page layout.
            // Wait one frame for GSAP to refresh, then re-anchor to the target.
            requestAnimationFrame(() => {
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                requestAnimationFrame(() => {
                    target.scrollIntoView({ behavior: 'instant' });
                });
            });
        }, 1000);
    }
}

function goToFourthPage() {
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

    const target = document.getElementById('fourth-page');

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
            requestAnimationFrame(() => {
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                requestAnimationFrame(() => {
                    target.scrollIntoView({ behavior: 'instant' });
                });
            });
        }, 1000);
    }
}


let totalSinglesPoints = 0;
let totalDoublesPoints = 0;

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
    totalSinglesPoints = 0;
    totalDoublesPoints = 0;  

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
    fetchCSV('tables/Men_Point_System.csv', data => menPointSystem = data);
    fetchCSV('tables/Men_Prize_Money.csv', data => menPrizeMoney = data);
    fetchCSV('tables/Women_Point_System.csv', data => womenPointSystem = data);
    fetchCSV('tables/Women_Prize_Money.csv', data => womenPrizeMoney = data);
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
            competitionType: competitionType,
            tournamentLevel: tournamentLevel,
            prizeMoney: prizeMoneyRow[round],
            points: pointSystemRow[round]
        };
    }

    return null; // No matching data found
}


let totalMoney = 0;

function updateReceipt(data) {
    if (data) {

        console.log('Data received in updateReceipt:', data);

        const receiptEntries = document.getElementById('receipt-entries');
        const entry = document.createElement('p');

        
        // Create individual spans for each element
        entry.innerHTML = `
            <span>${data.tournamentLevel}</span>
            <span>${data.prizeMoney}</span>
            <span>${data.points}pts</span>
            <span>${data.competitionType}</span> 
        `;

        // Append the entry to the receipt
        receiptEntries.appendChild(entry);

        // Remove '$' and ',' using a global regex to handle all formatting
        const prizeMoneyRaw = parseFloat(data.prizeMoney.replace(/[^0-9.]/g, ''));

        // Update correct total
        if (data.competitionType.toLowerCase() === 'doubles') {
            totalDoublesPoints += parseInt(data.points);
        } else {
            totalSinglesPoints += parseInt(data.points);
        }

        totalMoney += prizeMoneyRaw;

        // Update the total row at the bottom (show total as formatted currency)
        document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
        document.getElementById('total-points').textContent = `${totalSinglesPoints + totalDoublesPoints}pts`;

        // Update the number of entries in the total row
        document.getElementById('total-entries').textContent = receiptEntries.childElementCount;

    } else {
        alert('No data found for the selected options.');
    }
}

// let totalPoints = 0; 


function updateReceipt(data) {
    if (data) {
        const receiptEntries = document.getElementById('receipt-entries');
        const entry = document.createElement('p');

        // Create individual spans for each element
        entry.innerHTML = `
            <span>${data.tournamentLevel}</span>
            <span>${data.prizeMoney}</span>
            <span>${data.points}pts</span>
            <span>${data.competitionType}</span> 
        `;

        // Append the entry to the receipt
        receiptEntries.appendChild(entry);

        // Remove '$' and ',' using a global regex to handle all formatting
        const prizeMoneyRaw = parseFloat(data.prizeMoney.replace(/[^0-9.]/g, ''));

        // Update correct total
        if (data.competitionType.toLowerCase() === 'doubles') {
            totalDoublesPoints += parseInt(data.points);
        } else {
            totalSinglesPoints += parseInt(data.points);
        }

        totalMoney += prizeMoneyRaw;

        // Update the total row at the bottom (show total as formatted currency)
        document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
        document.getElementById('total-points').textContent = `${totalSinglesPoints + totalDoublesPoints}pts`;

        // Update the number of entries in the total row
        document.getElementById('total-entries').textContent = receiptEntries.childElementCount;

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
    totalSinglesPoints = 0;
    totalDoublesPoints = 0;

    // Update the total row at the bottom
    document.getElementById('total-money').textContent = `$0.00`;
    document.getElementById('total-points').textContent = `0pts`;

    // Reset the number of entries in the total row
    document.getElementById('total-entries').textContent = '0';

    // Update the estimated ranking if you use that function here
    updateEstimatedRanking();
});

// Event listener for Rewind Button 
document.getElementById('rewind-button').addEventListener('click', function () {
    const receiptEntries = document.getElementById('receipt-entries');

    if (receiptEntries.lastChild) {
        const lastEntry = receiptEntries.lastChild;

        const prizeMoneyText = lastEntry.querySelector('span:nth-child(2)').textContent;
        const pointsText = lastEntry.querySelector('span:nth-child(3)').textContent;
        const competitionTypeText = lastEntry.querySelector('span:nth-child(4)').textContent;

        const prizeMoneyRaw = parseFloat(prizeMoneyText.replace(/[^0-9.]/g, ''));
        const pointsRaw = parseInt(pointsText.replace('pts', ''));

        if (competitionTypeText.toLowerCase() === 'doubles') {
            totalDoublesPoints -= pointsRaw;
        } else {
            totalSinglesPoints -= pointsRaw;
        }

        totalMoney -= prizeMoneyRaw;

        // Remove the entry
        receiptEntries.removeChild(lastEntry);

        // Update the totals
        document.getElementById('total-money').textContent = `$${totalMoney.toLocaleString()}`;
        document.getElementById('total-points').textContent = `${totalSinglesPoints + totalDoublesPoints}pts`;
        document.getElementById('total-entries').textContent = receiptEntries.childElementCount;

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
let atpDoublesRankings = null;
let wtaDoublesRankings = null;

fetch('atp_rankings.json')
    .then(response => response.json())
    .then(data => atpRankings = data);

fetch('wta_rankings.json')
    .then(response => response.json())
    .then(data => wtaRankings = data);

fetch('atp_doubles_rankings.json')
    .then(r => r.json())
    .then(data => atpDoublesRankings = data);

fetch('wta_doubles_rankings.json')
    .then(r => r.json())
    .then(data => wtaDoublesRankings = data); 

// Function to estimate the ranking based on total points and number of entries
function estimateRanking(points, gender, type = 'singles') {
    let rankings;

    if (gender === 'male') {
        rankings = (type === 'doubles') ? atpDoublesRankings : atpRankings;
    } else {
        rankings = (type === 'doubles') ? wtaDoublesRankings : wtaRankings;
    }

    if (!rankings || rankings.length === 0) return 1001; // No data fallback

    // Sort ascending by rank (lowest rank = best player)
    const sorted = rankings.slice().sort((a, b) => a.rank - b.rank);

    // Find the first player whose points are less than or equal to input points
    for (const player of sorted) {
        if (points >= player.points) {
            return player.rank;
        }
    }

    // If no player has fewer points, ranking would be worse than last player
    return sorted[sorted.length - 1].rank + 1;
}



let menRankings = null;
let womenRankings = null;
// let userEnteredRanking = null;
let userEnteredSinglesRanking = null;
let userEnteredDoublesRanking = null;


// Fetch the rankings CSV files on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchCSV('tables/Men_Rankings.csv', data => menRankings = data);
    fetchCSV('tables/Women_Rankings.csv', data => womenRankings = data);
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


function getPointsForRanking(ranking, gender, type = 'singles') {
    let rankings;

    if (gender === 'male') {
        rankings = (type === 'doubles') ? atpDoublesRankings : atpRankings;
    } else {
        rankings = (type === 'doubles') ? wtaDoublesRankings : wtaRankings;
    }

    if (!rankings || rankings.length === 0) return 0;

    const player = rankings.find(p => p.rank === ranking);
    return player ? parseInt(player.points) || 0 : 0;
}


function updateEstimatedRanking() {
    const gender = document.getElementById('gender').value;
    const numberOfEntries = document.getElementById('receipt-entries').childElementCount;
    const container = document.querySelector('.third-page-container');

    // Clear previous content
    container.querySelectorAll('.dynamic-paragraph').forEach(p => p.remove());
    const existingButton = document.getElementById('add-ranking-button');
    if (existingButton) existingButton.remove();

    // If no entries and no points, show default message
    if (totalSinglesPoints === 0 && totalDoublesPoints === 0) {
        const p = document.createElement('p');
        p.classList.add('dynamic-paragraph');
        p.textContent = 'add some tournaments above to see where you would stand in the rankings.';
        container.appendChild(p);
        return;
    }

    // Get starting points from ranking
    const singlesRankingPoints = userEnteredSinglesRanking ? getPointsForRanking(userEnteredSinglesRanking, gender, 'singles') : 0;
    const doublesRankingPoints = userEnteredDoublesRanking ? getPointsForRanking(userEnteredDoublesRanking, gender, 'doubles') : 0;

    const combinedSinglesPoints = totalSinglesPoints + singlesRankingPoints;
    const combinedDoublesPoints = totalDoublesPoints + doublesRankingPoints;

    // --- SINGLES PARAGRAPH ---
    if (totalSinglesPoints > 0) {
        const estSinglesRank = estimateRanking(combinedSinglesPoints, gender, 'singles');
        let singlesText = '';

        if (userEnteredSinglesRanking) {
            singlesText = `based on your current ranking of <strong>${userEnteredSinglesRanking}</strong> (${singlesRankingPoints} points), and your recent <strong>${totalSinglesPoints}</strong> points, your new ranking would be around <strong>${estSinglesRank > 1000 ? '1,000+' : estSinglesRank}</strong> in the World.`;
        } else {
            singlesText = `based on your total points of <strong>${combinedSinglesPoints}</strong>, your new singles ranking would be around <strong>${estSinglesRank > 1000 ? '1,000+' : estSinglesRank}</strong> in the World.`;
        }

        const singlesQualify = getQualifyingTournament(estSinglesRank, gender, 'singles');
        singlesText += ` With this ranking, you would qualify for a <strong>${singlesQualify}</strong> event.`;

        const singlesP = document.createElement('p');
        singlesP.classList.add('dynamic-paragraph');
        singlesP.innerHTML = singlesText;
        container.appendChild(singlesP);
    }

    // --- DOUBLES PARAGRAPH ---
    if (totalDoublesPoints > 0) {
        const estDoublesRank = estimateRanking(combinedDoublesPoints, gender, 'doubles');
        let doublesText = '';

        if (userEnteredDoublesRanking) {
            doublesText = `with your current doubles ranking of <strong>${userEnteredDoublesRanking}</strong> (${doublesRankingPoints} points), and your new <strong>${totalDoublesPoints}</strong> points, you would be ranked around <strong>${estDoublesRank > 1000 ? '1,000+' : estDoublesRank}</strong> in the World.`;
        } else {
            doublesText = `with your <strong>${combinedDoublesPoints}</strong> doubles points, you would be ranked around <strong>${estDoublesRank > 1000 ? '1,000+' : estDoublesRank}</strong> in the World.`;
        }

        const doublesP = document.createElement('p');
        doublesP.classList.add('dynamic-paragraph');
        doublesP.innerHTML = doublesText;
        container.appendChild(doublesP);
    }

    // --- RANKING BUTTON ---
    if (numberOfEntries > 0 || userEnteredSinglesRanking || userEnteredDoublesRanking) {
        const addRankingButton = document.createElement('button');
        addRankingButton.id = 'add-ranking-button';
        addRankingButton.textContent = (userEnteredSinglesRanking || userEnteredDoublesRanking) ? 'update ranking' : 'add ranking';

        addRankingButton.addEventListener('click', () => {
            const existingPopup = document.getElementById('ranking-popup');
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.id = 'ranking-popup';
            popup.innerHTML = `
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <p>do you currently hold a ranking? <br>if so, please enter it below.</p>
                    <div class="ranking-options">
                        <label class="ranking-label">
                            <input type="radio" name="ranking-type" value="singles" ${userEnteredSinglesRanking ? 'checked' : ''}>Singles</label>
                        <label class="ranking-label">
                            <input type="radio" name="ranking-type" value="doubles" ${userEnteredDoublesRanking ? 'checked' : ''}>Doubles</label>
                    </div>
                    <input type="number" id="user-ranking-input" placeholder="enter your ranking" min="1" max="1000" 
                        value="${userEnteredSinglesRanking || userEnteredDoublesRanking || ''}" />
                    <div style="margin-top: 12px;">
                        <button id="submit-ranking">Submit</button>
                        <button id="close-popup">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);

            document.getElementById('close-popup').addEventListener('click', () => {
                popup.remove();
            });

            document.getElementById('submit-ranking').addEventListener('click', () => {
                const rankingValue = parseInt(document.getElementById('user-ranking-input').value, 10);
                const selectedType = document.querySelector('input[name="ranking-type"]:checked').value;

                if (!isNaN(rankingValue)) {
                    if (rankingValue < 1 || rankingValue > 1000) {
                        alert("Please enter a ranking between 1 and 1000.");
                        return;
                    }
                    if (selectedType === 'singles') {
                        userEnteredSinglesRanking = rankingValue;
                    } else {
                        userEnteredDoublesRanking = rankingValue;
                    }
                    popup.remove();
                    updateEstimatedRanking();
                } else {
                    alert("Please enter a valid number.");
                }
            });
        });

        container.appendChild(addRankingButton);
    }
}



document.getElementById('clear-button').addEventListener('click', () => {
    userEnteredSinglesRanking = null;
    userEnteredDoublesRanking = null; 
    updateEstimatedRanking();
});


document.getElementById('add-button').addEventListener('click', updateEstimatedRanking);
document.getElementById('rewind-button').addEventListener('click', updateEstimatedRanking);

document.getElementById('gender').addEventListener('change', () => {
    userEnteredSinglesRanking = null;
    userEnteredDoublesRanking = null;
    updateEstimatedRanking();
});


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
    
    // Only apply scroll effect for screens larger than 450px
    if (window.innerWidth <= 450) {
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
        const gap = window.innerWidth <= 450 ? 90 : 120;
        let totalScrollDistance = 0;

        // Calculate total scrollable distance dynamically
        boxes.forEach(box => {
            totalScrollDistance += box.offsetWidth - gap;
        });

        // Function to get total scroll distance dynamically
        function getTotalScrollDistance() {
            return totalScrollDistance - (window.innerWidth <= 450 ? -65 : 0);
        }

        // Function to get start position dynamically based on screen width
        function getStartPosition() {
            return window.innerWidth <= 450 ? "top 15%" : "top top";
        }

        // Initial position for mobile screens
        function getInitialXPosition() {
            return window.innerWidth <= 450 ? -85 : 0;
        }

        // If the screen is 450px or smaller, do not apply scroll trigger
        if (window.innerWidth <= 450) {
            // Stack boxes vertically on smaller screens
            gsap.set(carousel, { x: 0 });
            carousel.style.display = 'block';
            boxes.forEach(box => box.style.display = 'block');
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

  
// rankings section
const genderButtons = document.querySelectorAll('.gender-btn');
  const typeButtons = document.querySelectorAll('.type-btn');
  const tbody = document.querySelector('.rankings-table tbody');

  let currentGender = 'MEN';
  let currentType = 'SINGLES';

  function getJsonFileName() {
    const gender = currentGender.toLowerCase(); // 'men' or 'women'
    const isDoubles = currentType === 'DOUBLES';
  
    const base = gender === 'men' ? 'atp' : 'wta';
    return isDoubles ? `${base}_doubles_rankings.json` : `${base}_rankings.json`;
  }

  const invisibleFlag = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+';

  function updateTable(data) {
    tbody.innerHTML = ''; // Clear current rows
  
    const invisibleFlag = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+';
  
    data.forEach(player => {
      const row = document.createElement('tr');
      const flagUrl = `https://www.wtatennis.com/resources/v6.48.3/i/elements/flags/${player.country.toLowerCase()}.svg`;
  
      row.innerHTML = `
        <td>${player.rank}</td>
        <td>
          <img class="flag-icon" src="${flagUrl}" alt="${player.country} flag"
               onerror="this.src='${invisibleFlag}'" />
          ${player.player}
        </td>
        <td>${player.age}</td>
        <td>${player.points}</td>
      `;
  
      tbody.appendChild(row);
    });
  }

  async function loadRankings() {
    const file = getJsonFileName();
    try {
      const response = await fetch(file);
      const data = await response.json();
      updateTable(data);
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  }

  // Initial load
  loadRankings();

  // Toggle logic
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentGender = btn.textContent.trim();
      loadRankings();
    });
  });

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentType = btn.textContent.includes('SINGLES') ? 'SINGLES' : 'DOUBLES';
      loadRankings();
    });
  });

//   download button
document.querySelector('.download-button').addEventListener('click', async () => {
    const file = getJsonFileName();
    try {
      const response = await fetch(file);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      a.click();
  
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  });

//   search logic
const searchBtn = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');
const autocompleteList = document.querySelector('.autocomplete-list');
const searchIcon = searchBtn.querySelector('img');

let currentData = []; // Store current loaded JSON

searchBtn.addEventListener('click', () => {
    const isActive = searchInput.style.display === 'inline-block';
  
    // Toggle input visibility
    searchInput.style.display = isActive ? 'none' : 'inline-block';
  
    // Clear search and reset table when closing
    if (isActive) {
      searchInput.value = '';
      updateTable(currentData);
    } else {
      searchInput.focus();
    }
  
    // Swap icons
    const searchIcon = searchBtn.querySelector('img');
    searchIcon.src = isActive ? 'search.svg' : 'close.svg';
    searchIcon.alt = isActive ? 'Search' : 'Close';
  
    // Toggle background class
    searchBtn.classList.toggle('active-search', !isActive);
  });
  
  

// Update table after initial load
async function loadRankings() {
  const file = getJsonFileName();
  try {
    const response = await fetch(file);
    const data = await response.json();
    currentData = data; // Save for search
    updateTable(data);
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}


// Handle pressing Enter to search
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
  
    if (query === '') {
      updateTable(currentData); // Show all if input is empty
      return;
    }
  
    const filtered = currentData.filter(player =>
      player.player.toLowerCase().includes(query)
    );
  
    updateTable(filtered);
  });

  const filterBtn = document.querySelector('.filter-button');
  const filterPopup = document.querySelector('.filter-popup');
  const regionBtn = document.querySelector('.region-filter-btn');
  const rankingBtn = document.querySelector('.ranking-filter-btn');
  const dynamicFilters = document.querySelector('.dynamic-filters');
  const resetBtn = document.querySelector('.reset-filter-btn');
  const closeFilterBtn = document.querySelector('.close-filter-btn');
  
  let filtersInitialized = false; // Track if first-time filter load happened
  
  // Show/hide filter popup on button click
  filterBtn.addEventListener('click', () => {
    const isVisible = filterPopup.style.display === 'block';
    filterPopup.style.display = isVisible ? 'none' : 'block';
  
    if (!isVisible && !filtersInitialized) {
      regionBtn.click(); // simulate click to load region filters
      filtersInitialized = true;
    }
  });
  
  // Region filter logic
  regionBtn.addEventListener('click', () => {
    if (!currentData.length) return;
  
    regionBtn.classList.add('active');
    rankingBtn.classList.remove('active');
    dynamicFilters.innerHTML = '';
  
    const countries = [...new Set(currentData.map(p => p.country))].sort();
  
    countries.forEach(code => {
      const flagUrl = `https://www.wtatennis.com/resources/v6.48.3/i/elements/flags/${code.toLowerCase()}.svg`;
      const img = new Image();
      img.src = flagUrl;
  
      img.onload = () => {
        const div = document.createElement('div');
        div.className = 'country-filter';
        div.innerHTML = `<img src="${flagUrl}" width="20" height="14" alt="${code}"/> <span>${code}</span>`;
        div.style.cursor = 'pointer';
  
        div.addEventListener('click', () => {
          const filtered = currentData.filter(p => p.country === code);
          updateTable(filtered);
          filterPopup.style.display = 'none';
        });
  
        dynamicFilters.appendChild(div);
      };
    });
  });
  
  // Ranking filter logic
  rankingBtn.addEventListener('click', () => {
    if (!currentData.length) return;
  
    rankingBtn.classList.add('active');
    regionBtn.classList.remove('active');
    dynamicFilters.innerHTML = '';
  
    for (let i = 0; i < 1000; i += 50) {
      const start = i + 1;
      const end = i + 50;
      const btn = document.createElement('button');
      btn.classList.add('ranking-range-btn');
      btn.textContent = `${start}-${end}`;
      btn.style.cursor = 'pointer';
      btn.style.marginBottom = '0.5rem';
      btn.style.padding = '6px 12px';
  
      btn.addEventListener('click', () => {
        const filtered = currentData.filter(p => p.rank >= start && p.rank <= end);
        updateTable(filtered);
        filterPopup.style.display = 'none';
      });
  
      dynamicFilters.appendChild(btn);
    }
  });
  
  // Reset filter logic
  resetBtn.addEventListener('click', () => {
    if (!currentData.length) return;
    updateTable(currentData);
    filterPopup.style.display = 'none';
  });
  
  // Close popup logic
  closeFilterBtn.addEventListener('click', () => {
    filterPopup.style.display = 'none';
  });
  

const searchWrapper = document.querySelector('.search-wrapper');
const searchButton = document.querySelector('.search-button');
const filterButton = document.querySelector('.filter-button');
const downloadButton = document.querySelector('.download-button');

searchButton.addEventListener('click', () => {
  searchWrapper.classList.toggle('active');

  // Hide or show filter button on mobile
  if (window.innerWidth <= 450) {
    const isActive = searchWrapper.classList.contains('active');
    filterButton.style.display = isActive ? 'none' : 'block';
    downloadButton.style.display = isActive ? 'none' : 'block';
  }
});
