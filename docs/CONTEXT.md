# CRE Bid Analyzer - Technical Context Document

## Project Overview

The CRE Bid Analyzer is an enterprise-grade solution designed for Commercial Real Estate (CRE) companies to streamline their bid analysis process. This document provides technical context and detailed specifications for development and implementation.

## Core Functionality

### Primary Objectives
1. **Bid Consolidation Engine**
   - Merge multiple contractor bid sheets into unified format
   - Support for CSV and XLSX input formats
   - Dynamic contractor column generation

2. **Smart Category Recognition**
   - Fuzzy logic matching system
   - Configurable matching thresholds (default: 80%)
   - Automated category alignment
   - Manual review flagging for low-confidence matches

3. **Price Analysis System**
   - Benchmark calculation engine
   - Multi-tier deviation detection
   - Automated outlier flagging
   
## Technical Architecture

### Data Flow Pipeline

1. **Input Processing Layer**
   ```
   Input Files → Validation → Cleaning → Standardization
   ```
   - Minimum required columns:
     - Category/Line Item
     - Price
     - Contractor Identifier (extracted or inferred)

2. **Data Transformation Layer**
   ```
   Clean Data → Category Matching → Price Analysis → Consolidation
   ```
   - Whitespace normalization
   - Numeric validation
   - Duplicate handling
   - Category alignment

3. **Analysis Layer**
   ```
   Consolidated Data → Statistical Analysis → Outlier Detection → Flag Generation
   ```
   - Deviation thresholds:
     - Level 1 (Orange): 5-10% from mean
     - Level 2 (Red): >10% from mean

4. **Output Generation Layer**
   ```
   Analyzed Data → XLSX Generation → Final Report
   ```

### Data Model

#### Input Schema
```
Contractor Bid File:
├── Category (string)
├── Price (numeric)
└── [Optional] Contractor Name (string)
```

#### Output Schema
```
Consolidated Report:
├── Line Item (string)
├── Contractor Columns (dynamic)
├── Benchmark Cost (numeric)
└── Flagged Issues (string)
```

### Database Schema

#### Tables

1. **Projects**
```sql
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(50) DEFAULT 'active',
    owner_id        UUID NOT NULL,
    settings        JSONB
);
```

2. **Contractors**
```sql
CREATE TABLE contractors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    contact_info    JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

3. **Bids**
```sql
CREATE TABLE bids (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    contractor_id   UUID NOT NULL REFERENCES contractors(id),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(50) DEFAULT 'pending',
    file_path       VARCHAR(512),
    original_filename VARCHAR(255),
    processed_data  JSONB,
    UNIQUE(project_id, contractor_id)
);
```

4. **Categories**
```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    name            VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    parent_id       UUID REFERENCES categories(id),
    UNIQUE(project_id, normalized_name)
);
```

5. **BidItems**
```sql
CREATE TABLE bid_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id          UUID NOT NULL REFERENCES bids(id),
    category_id     UUID NOT NULL REFERENCES categories(id),
    price           DECIMAL(19,4) NOT NULL,
    notes           TEXT,
    flags           JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bid_id, category_id)
);
```

6. **Analysis**
```sql
CREATE TABLE analysis (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    category_id     UUID NOT NULL REFERENCES categories(id),
    benchmark_price DECIMAL(19,4),
    stats           JSONB,
    flags           JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, category_id)
);
```

#### Indexes
```sql
-- Performance Indexes
CREATE INDEX idx_bids_project ON bids(project_id);
CREATE INDEX idx_bid_items_bid ON bid_items(bid_id);
CREATE INDEX idx_categories_project ON categories(project_id);
CREATE INDEX idx_analysis_project ON analysis(project_id);

-- Search Indexes
CREATE INDEX idx_categories_normalized_name ON categories(normalized_name);
CREATE INDEX idx_contractors_name ON contractors(name);

-- Timestamp Indexes
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_bids_submission_date ON bids(submission_date);
```

### Application Structure

```
cre-bid-analyzer/
├── .github/                    # GitHub Actions and workflows
│   └── workflows/
│
├── src/                        # Source code
│   ├── api/                    # API endpoints
│   │   ├── routes/            # Route definitions
│   │   ├── middlewares/       # Custom middlewares
│   │   └── validators/        # Request validation
│   │
│   ├── core/                  # Core business logic
│   │   ├── analysis/         # Price analysis engine
│   │   ├── matching/         # Category matching logic
│   │   └── processing/       # File processing logic
│   │
│   ├── db/                    # Database related code
│   │   ├── migrations/       # Database migrations
│   │   ├── models/          # Data models
│   │   └── seeds/           # Seed data
│   │
│   ├── services/             # Business services
│   │   ├── project/         # Project management
│   │   ├── contractor/      # Contractor management
│   │   └── analysis/        # Analysis service
│   │
│   ├── utils/                # Utility functions
│   │   ├── excel/          # Excel handling
│   │   ├── validation/     # Data validation
│   │   └── security/       # Security utilities
│   │
│   └── config/              # Configuration files
│
├── tests/                    # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/          # Test fixtures
│
├── docs/                     # Documentation
│   ├── api/                # API documentation
│   ├── deployment/         # Deployment guides
│   └── development/        # Development guides
│
├── scripts/                  # Utility scripts
│   ├── setup/             # Setup scripts
│   └── deployment/        # Deployment scripts
│
├── public/                   # Public assets
│   ├── images/
│   └── static/
│
├── client/                   # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   │
│   ├── public/           # Static files
│   └── tests/            # Frontend tests
│
├── docker/                   # Docker configuration
│   ├── dev/
│   └── prod/
│
├── .env.example             # Environment variables example
├── docker-compose.yml       # Docker compose configuration
├── package.json             # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Implementation Details

### Core Components

1. **File Handler**
   - Multi-file upload support
   - Format validation
   - Data extraction
   - Error handling

2. **Category Matcher**
   - Fuzzy matching algorithm
   - Confidence scoring
   - Match validation
   - Manual review flagging

3. **Price Analyzer**
   - Statistical calculations
   - Outlier detection
   - Flag generation
   - Benchmark computation

4. **Report Generator**
   - XLSX file creation
   - Dynamic column handling
   - Formatting rules
   - Flag visualization

### Security Considerations

1. **Data Privacy**
   - Temporary storage only
   - No persistent data
   - Secure file handling
   - Automatic cleanup

2. **Processing Security**
   - Input validation
   - File size limits
   - Format restrictions
   - Error boundaries

## Performance Specifications

### System Requirements

1. **Processing Capacity**
   - Support for multiple concurrent uploads
   - Handle large XLSX/CSV files
   - Efficient memory usage
   - Quick response times

2. **Optimization Targets**
   - Category matching speed
   - Memory efficiency
   - Output generation time
   - User feedback latency

### Error Handling

1. **Input Validation**
   - File format verification
   - Data structure validation
   - Content type checking
   - Size limit enforcement

2. **Processing Errors**
   - Graceful failure handling
   - User feedback
   - Error logging
   - Recovery procedures

## Development Guidelines

### Technology Stack

1. **Backend Options**
   - Python with Pandas
   - Node.js with data processing libraries

2. **Required Libraries**
   - Excel Processing: OpenPyXL/XlsxWriter
   - Fuzzy Matching: FuzzyWuzzy/RapidFuzz
   - Data Processing: Pandas or equivalent

### Best Practices

1. **Code Organization**
   - Modular architecture
   - Clear separation of concerns
   - Comprehensive error handling
   - Detailed logging

2. **Performance Optimization**
   - Efficient algorithms
   - Memory management
   - Caching strategies
   - Asynchronous processing

## Quality Assurance

### Testing Requirements

1. **Unit Tests**
   - File processing
   - Category matching
   - Price analysis
   - Report generation

2. **Integration Tests**
   - End-to-end workflows
   - Error scenarios
   - Edge cases
   - Performance benchmarks

### Validation Criteria

1. **Accuracy Metrics**
   - Category matching precision
   - Price calculation accuracy
   - Flag generation reliability
   - Output consistency

2. **Performance Metrics**
   - Processing time
   - Memory usage
   - Response latency
   - System stability

---

*This context document serves as the technical specification for the CRE Bid Analyzer project. It should be used as the primary reference for development, testing, and maintenance activities.*
