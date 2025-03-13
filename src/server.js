const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const { analyzeBids, generateExcel } = require('./scripts/analyze-simple');

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from src directory
app.use(express.static(__dirname));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// File upload and analysis endpoint
app.post('/api/analyze', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const filePaths = req.files.map(file => file.path);
        console.log('Processing files:', filePaths);
        
        // Analyze the bids
        const { data, contractors } = await analyzeBids(filePaths);
        
        // Generate Excel workbook
        const workbook = await generateExcel(data, contractors);
        
        // Save the workbook to a temporary file
        const outputPath = path.join(__dirname, 'uploads', 'bid_comparison.xlsx');
        XLSX.writeFile(workbook, outputPath);
        
        // Read the file and send it as response
        const excelBuffer = await fs.readFile(outputPath);
        
        // Clean up uploaded files
        await Promise.all([
            ...filePaths.map(file => fs.unlink(file)),
            fs.unlink(outputPath)
        ]);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=bid_comparison.xlsx');
        res.send(excelBuffer);
        
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).json({ error: 'Error analyzing bids' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 