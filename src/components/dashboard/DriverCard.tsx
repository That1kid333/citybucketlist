import React from 'react';
import { Driver } from '../../types/driver';
import { Star } from '@mui/icons-material';
import { Box, Typography, Avatar, Paper, Chip } from '@mui/material';

interface DriverCardProps {
  driver: Driver;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      {/* Driver Photo and Name */}
      <Avatar
        src={driver.photoURL || driver.photo}
        alt={driver.name}
        sx={{ width: 80, height: 80 }}
      />
      <Typography variant="h6" component="h2" align="center">
        {driver.name}
      </Typography>

      {/* Rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Star sx={{ color: '#FFD700' }} />
        <Typography>{driver.rating?.toFixed(1) || '5.0'}</Typography>
      </Box>

      {/* Vehicle Image */}
      {driver.vehicle && (
        <Box 
          component="img"
          src="/vehicle-placeholder.png" // You'll need to add this image to your public folder
          alt={`${driver.vehicle.make} ${driver.vehicle.model}`}
          sx={{ 
            width: '100%', 
            maxHeight: 150, 
            objectFit: 'contain',
            mt: 1 
          }}
        />
      )}

      {/* Vehicle Details */}
      {driver.vehicle && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Vehicle Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography color="text.secondary" variant="body2">Make:</Typography>
              <Typography>{driver.vehicle.make}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">Model:</Typography>
              <Typography>{driver.vehicle.model}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">Year:</Typography>
              <Typography>{driver.vehicle.year}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">Color:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{driver.vehicle.color}</Typography>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: driver.vehicle.color.toLowerCase(),
                    border: '1px solid #ddd'
                  }} 
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Availability Status */}
      <Chip
        label={driver.available ? "Available" : "Unavailable"}
        color={driver.available ? "success" : "default"}
        sx={{ mt: 2 }}
      />
    </Paper>
  );
};

export default DriverCard;
