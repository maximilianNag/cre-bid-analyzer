# CRE Bid Analyzer

A powerful web application for analyzing and comparing commercial real estate contractor bids. This tool helps streamline the bid analysis process by automatically processing multiple contractor bid sheets and providing detailed comparisons and insights.

## Features

- 📊 Automated bid analysis
- 📈 Statistical comparisons (min, max, average, range)
- 🚩 Price variation flagging
- 📑 Excel report generation
- 🖥️ User-friendly web interface
- 📁 Drag-and-drop file upload

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cre-bid-analyzer.git
   cd cre-bid-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   cd src
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## Usage

1. Open the web interface
2. Drag and drop your bid files (CSV format)
3. Click "Analyze Bids"
4. Download the generated Excel report

## Input File Format

The application expects CSV files with the following format:
- First row: "Contractor Bidding: [Contractor Name]"
- Starting from row 5: Two columns
  - Column A: Category/Line Item
  - Column B: Price

## Technologies Used

- Node.js
- Express.js
- XLSX library
- HTML5/CSS3
- Vanilla JavaScript

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 