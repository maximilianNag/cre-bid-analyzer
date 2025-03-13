const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseCurrency(value) {
    if (!value || typeof value === 'number') return value || 0;
    // Remove currency symbols, commas, and spaces, then convert to float
    return parseFloat(value.replace(/[$,\s]/g, '')) || 0;
}

function formatCurrency(value) {
    if (value === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function calculateStats(prices) {
    const validPrices = prices.filter(p => p > 0);
    if (validPrices.length === 0) return { avg: 0, min: 0, max: 0, range: 0 };
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const range = max - min;
    return { avg, min, max, range };
}

function getPriceFlag(price, avg) {
    if (!price || !avg) return '';
    const deviation = Math.abs((price - avg) / avg) * 100;
    if (deviation > 10) return 'Red';
    if (deviation > 5) return 'Orange';
    return '';
}

async function analyzeBids(filePaths) {
    try {
        const bids = [];
        const contractors = [];
        
        // Read each file
        for (const filePath of filePaths) {
            console.log('Processing file:', filePath);
            
            try {
                // Read the CSV/Excel file
                const workbook = XLSX.readFile(filePath);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convert to JSON with specific options
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    raw: false,
                    defval: ''
                });
                
                // Extract contractor name from the first row
                const contractorName = data[0][0].replace('Contractor Bidding:', '').trim();
                contractors.push(contractorName);
                
                // Process bid data starting from row 5
                const bidData = {};
                for (let i = 4; i < data.length; i++) {
                    const row = data[i];
                    if (row && row[0] && row[1]) {
                        const category = row[0].trim();
                        const price = parseCurrency(row[1]);
                        if (category && !category.toLowerCase().includes('total')) {
                            bidData[category] = price;
                        }
                    }
                }
                bids.push(bidData);
                console.log(`Processed ${Object.keys(bidData).length} items for ${contractorName}`);
            } catch (error) {
                console.error(`Error processing file ${filePath}:`, error);
                throw new Error(`Failed to process file ${path.basename(filePath)}: ${error.message}`);
            }
        }
        
        if (bids.length === 0) {
            throw new Error('No valid bid data found in the uploaded files');
        }
        
        // Get all unique categories
        const categories = [...new Set(bids.flatMap(bid => Object.keys(bid)))].sort();
        console.log(`Found ${categories.length} unique categories`);
        
        // Create header row
        const headerRow = ['Category'];
        contractors.forEach(contractor => {
            headerRow.push(contractor, `Flag - ${contractor}`);
        });
        headerRow.push('Min', 'Max', 'Avg', 'Range');
        
        // Prepare analysis data
        const analysisData = [headerRow];
        
        // Process each category
        for (const category of categories) {
            const prices = bids.map(bid => bid[category] || 0);
            const stats = calculateStats(prices);
            
            const row = [category];
            
            // Add each contractor's price and flag
            prices.forEach(price => {
                row.push(price ? formatCurrency(price) : 'N/A');
                row.push(getPriceFlag(price, stats.avg));
            });
            
            // Add statistics
            row.push(
                formatCurrency(stats.min),
                formatCurrency(stats.max),
                formatCurrency(stats.avg),
                formatCurrency(stats.range)
            );
            
            analysisData.push(row);
        }
        
        return {
            data: analysisData,
            contractors: contractors
        };
    } catch (error) {
        console.error('Error in analyzeBids:', error);
        throw error;
    }
}

function generateExcel(data, contractors) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = [40]; // Category column
    contractors.forEach(() => {
        colWidths.push(15, 12); // Price and flag columns
    });
    colWidths.push(15, 15, 15, 15); // Statistics columns
    
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bid Analysis');
    return workbook;
}

module.exports = {
    analyzeBids,
    generateExcel
}; 