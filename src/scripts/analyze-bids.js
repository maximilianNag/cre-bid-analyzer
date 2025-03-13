const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to parse currency strings to numbers
function parseCurrency(value) {
    if (!value || typeof value !== 'string') return 0;
    return parseFloat(value.replace(/[$,]/g, '')) || 0;
}

// Function to format numbers as currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Function to calculate statistics
function calculateStats(prices) {
    const validPrices = prices.filter(p => p > 0);
    if (validPrices.length === 0) return { avg: 0, min: 0, max: 0, range: 0 };
    
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const range = max - min;
    
    return { avg, min, max, range };
}

// Function to determine price flag based on deviation from average
function getPriceFlag(price, avg) {
    if (!price || !avg) return '';
    const deviation = Math.abs((price - avg) / avg) * 100;
    if (deviation > 10) return 'Red';
    if (deviation > 5) return 'Orange';
    return '';
}

// Function to determine price variation level
function getPriceVariation(price, avg) {
    if (price === 0) return '';
    const variation = Math.abs((price - avg) / avg) * 100;
    if (variation > 10) return 'High';
    if (variation > 5) return 'Medium';
    return 'Low';
}

// Main analysis function
async function analyzeBids() {
    try {
        // Read all bid files
        const bidsFolder = path.join(__dirname, '../../.qodo/CRE EX Folder');
        console.log('Looking for files in:', bidsFolder);
        const files = fs.readdirSync(bidsFolder).filter(f => f.endsWith('.csv'));
        console.log('Found files:', files);
        
        // Store all bids data
        const bids = [];
        const contractors = [];
        
        // Read each file
        for (const file of files) {
            const filePath = path.join(bidsFolder, file);
            console.log('Processing file:', filePath);
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // Extract contractor name
            const contractorName = data[0][0].replace('Contractor Bidding: ', '').trim();
            contractors.push(contractorName);
            
            // Process bid data
            const bidData = {};
            for (let i = 5; i < data.length - 1; i++) {
                if (data[i][0] && data[i][1]) {
                    bidData[data[i][0]] = parseCurrency(data[i][1]);
                }
            }
            bids.push(bidData);
        }
        
        // Get all unique categories
        const categories = [...new Set(bids.flatMap(bid => Object.keys(bid)))];
        
        // Create header row with contractor columns and their corresponding flag columns
        const headerRow = ['Category'];
        contractors.forEach(contractor => {
            headerRow.push(contractor, `Flag - ${contractor}`);
        });
        headerRow.push('Min', 'Max', 'Avg', 'Range', 'Variation Level');
        
        // Prepare analysis data
        const analysisData = [headerRow];
        
        // Calculate statistics for each category
        for (const category of categories) {
            const prices = bids.map(bid => bid[category] || 0);
            const stats = calculateStats(prices);
            
            const row = [category];
            
            // Add contractor prices and their flags
            prices.forEach(price => {
                row.push(price ? formatCurrency(price) : 'N/A');
                row.push(getPriceFlag(price, stats.avg));
            });
            
            // Add statistics
            row.push(
                formatCurrency(stats.min),
                formatCurrency(stats.max),
                formatCurrency(stats.avg),
                formatCurrency(stats.range),
                getPriceVariation(stats.range, stats.avg)
            );
            
            analysisData.push(row);
        }
        
        // Create workbook and add data
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(analysisData);
        
        // Set column widths (adjusted for flag columns)
        const colWidths = [40];
        contractors.forEach(() => {
            colWidths.push(15, 12); // Width for contractor price and flag columns
        });
        colWidths.push(15, 15, 15, 15, 15); // Statistics columns
        
        worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bid Analysis');
        
        // Save workbook
        const outputPath = path.join(__dirname, '../../bid-analysis.xlsx');
        XLSX.writeFile(workbook, outputPath);
        
        console.log(`Analysis complete! File saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

analyzeBids().catch(console.error); 