// ==============================
// Aqua Sentinel - Demo Data Generator
// Generates 24 hours of realistic water quality data
// ==============================

function generateRealistic24HourData() {
    console.log('🚀 Generating 24 hours of demo data...');
    
    const history = [];
    const now = new Date();
    
    // Generate one reading every 5 minutes for 24 hours = 288 readings
    for (let i = 287; i >= 0; i--) {
        const readingTime = new Date(now.getTime() - (i * 5 * 60 * 1000));
        
        // Create realistic data with natural variations
        const reading = {
            date: readingTime.toISOString().split('T')[0],
            time: readingTime.toLocaleTimeString('en-US', { hour12: false }),
            ph: generateRealisticValue(7.2, 0.8, 6.0, 8.5),
            tds: generateRealisticValue(350, 80, 100, 700),
            turbidity: generateRealisticValue(3, 1.5, 0, 8),
            temp: generateRealisticValue(24, 2, 18, 30),
            do: generateRealisticValue(6.5, 1.5, 4, 10),
            metal: generateRealisticValue(0.008, 0.003, 0.000, 0.12),
            timestamp: readingTime.toISOString()
        };
        
        history.push(reading);
    }
    
    // Save to localStorage
    localStorage.setItem('aquaReadingsHistory', JSON.stringify(history));
    
    console.log(`✅ Generated ${history.length} readings for 24 hours`);
    console.log('📊 Data saved to localStorage');
    console.log('🎯 Go to History page to view data');
    
    return history;
}

// Generate realistic value with natural variation
function generateRealisticValue(base, variation, min, max) {
    // Add gaussian-like variation
    const random = (Math.random() + Math.random() + Math.random() - 1.5) * variation;
    let value = base + random;
    
    // Clamp to min/max
    value = Math.max(min, Math.min(max, value));
    
    return parseFloat(value.toFixed(2));
}

// Add button to dashboard
function addDemoDataButton() {
    const dashboardHeader = document.querySelector('.dashboard-header');
    
    if (dashboardHeader) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.textAlign = 'center';
        
        const button = document.createElement('button');
        button.textContent = '📊 Generate 24h Demo Data';
        button.style.cssText = `
            background: linear-gradient(90deg, #0077b6, #0077b6);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 119, 182, 0.3);
        `;
        
        button.onmouseover = () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 6px 20px rgba(0, 119, 182, 0.5)';
        };
        
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(0, 119, 182, 0.3)';
        };
        
        button.onclick = () => {
            generateRealistic24HourData();
            
            // Show success message
            alert('✅ 24 hours of demo data generated!\n\nGo to "Historical Data" page to view it.');
            
            // Optional: Change button text temporarily
            const originalText = button.textContent;
            button.textContent = '✅ Data Generated!';
            button.disabled = true;
            button.style.opacity = '0.7';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.opacity = '1';
            }, 3000);
        };
        
        buttonContainer.appendChild(button);
        dashboardHeader.appendChild(buttonContainer);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    if (window.location.pathname.includes('dashboard.html') || window.location.pathname === '/') {
        addDemoDataButton();
    }
});