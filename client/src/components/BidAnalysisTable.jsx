import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Typography } from '@mui/material';

const BidAnalysisTable = ({ data, contractors }) => {
  // Generate columns dynamically based on contractors
  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      width: 300,
      flex: 1
    },
    ...contractors.flatMap(contractor => [
      {
        field: `${contractor}_price`,
        headerName: contractor,
        width: 150,
        valueFormatter: (params) => {
          if (params.value === 'N/A') return 'N/A';
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(params.value);
        }
      },
      {
        field: `${contractor}_flag`,
        headerName: `Flag - ${contractor}`,
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              backgroundColor: 
                params.value === 'Red' ? '#ffebee' :
                params.value === 'Orange' ? '#fff3e0' :
                'transparent',
              color: 
                params.value === 'Red' ? '#c62828' :
                params.value === 'Orange' ? '#ef6c00' :
                'inherit',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              width: '100%',
              textAlign: 'center'
            }}
          >
            {params.value}
          </Box>
        )
      }
    ]),
    {
      field: 'min',
      headerName: 'Min',
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(params.value);
      }
    },
    {
      field: 'max',
      headerName: 'Max',
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(params.value);
      }
    },
    {
      field: 'avg',
      headerName: 'Average',
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(params.value);
      }
    },
    {
      field: 'range',
      headerName: 'Range',
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(params.value);
      }
    }
  ];

  // Transform data for the grid
  const rows = data.map((row, index) => {
    const gridRow = {
      id: index,
      category: row[0]
    };

    let colIndex = 1;
    contractors.forEach(contractor => {
      gridRow[`${contractor}_price`] = row[colIndex];
      gridRow[`${contractor}_flag`] = row[colIndex + 1];
      colIndex += 2;
    });

    gridRow.min = row[colIndex];
    gridRow.max = row[colIndex + 1];
    gridRow.avg = row[colIndex + 2];
    gridRow.range = row[colIndex + 3];

    return gridRow;
  });

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Bid Analysis Results
      </Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
          density="comfortable"
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem'
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default BidAnalysisTable; 