'use client';

import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Chip
} from '@mui/material';
import { DateRange, CalendarToday, EventNote } from '@mui/icons-material';
import { useStore } from '@/store/useStore';

export const DateRangeSelector = () => {
  const { timeRange, customStartDate, customEndDate, toggleTimeRange, setCustomDateRange } = useStore();
  const [open, setOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customStartDate || '2025-02-01');
  const [tempEndDate, setTempEndDate] = useState(customEndDate || new Date().toISOString().split('T')[0]);

  const handleCustomRange = () => {
    setCustomDateRange(tempStartDate, tempEndDate);
    setOpen(false);
  };

  const getButtonText = () => {
    switch (timeRange) {
      case 'current-month':
        return 'September 2025';
      case 'all-time':
        return 'Gesamtergebnis';
      case 'custom':
        return `${customStartDate || ''} - ${customEndDate || ''}`;
      default:
        return 'Zeitraum wählen';
    }
  };

  const getButtonIcon = () => {
    switch (timeRange) {
      case 'current-month':
        return <CalendarToday />;
      case 'all-time':
        return <DateRange />;
      case 'custom':
        return <EventNote />;
      default:
        return <CalendarToday />;
    }
  };

  return (
    <Box className="flex items-center space-x-2">
      {/* Haupt-Toggle Button */}
      <Button
        variant="outlined"
        size="small"
        startIcon={getButtonIcon()}
        onClick={toggleTimeRange}
        className="text-xs"
      >
        {getButtonText()}
      </Button>

      {/* Custom Range Button */}
      {timeRange !== 'custom' && (
        <Button
          variant="text"
          size="small"
          startIcon={<EventNote />}
          onClick={() => setOpen(true)}
          className="text-xs"
        >
          Benutzerdefiniert
        </Button>
      )}

      {/* Custom Date Range Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box className="flex items-center space-x-2">
            <EventNote className="text-bitcoin-orange" />
            <Typography variant="h6">Benutzerdefinierter Zeitraum</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent className="space-y-4">
          <Typography variant="body2" className="text-gray-600 mb-4">
            Wähle einen spezifischen Zeitraum für die Anzeige der Kaffee-Eingänge:
          </Typography>
          
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Startdatum"
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: '2025-02-01', // Frühestes Datum: 1. Februar 2025
                max: new Date().toISOString().split('T')[0] // Spätestes Datum: heute
              }}
              fullWidth
            />
            <TextField
              label="Enddatum"
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: '2025-02-01', // Frühestes Datum: 1. Februar 2025
                max: new Date().toISOString().split('T')[0] // Spätestes Datum: heute
              }}
              fullWidth
            />
          </Box>

          {/* Beispiel-Zeiträume */}
          <Box className="mt-4">
            <Typography variant="caption" className="text-gray-500 mb-2 block">
              Schnellauswahl:
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip
                label="Februar 2025"
                size="small"
                onClick={() => {
                  setTempStartDate('2025-02-01');
                  setTempEndDate('2025-02-28');
                }}
                className="cursor-pointer"
              />
              <Chip
                label="März 2025"
                size="small"
                onClick={() => {
                  setTempStartDate('2025-03-01');
                  setTempEndDate('2025-03-31');
                }}
                className="cursor-pointer"
              />
              <Chip
                label="Q1 2025"
                size="small"
                onClick={() => {
                  setTempStartDate('2025-02-01');
                  setTempEndDate('2025-03-31');
                }}
                className="cursor-pointer"
              />
              <Chip
                label="Seit Anfang"
                size="small"
                onClick={() => {
                  setTempStartDate('2025-02-01');
                  setTempEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="cursor-pointer"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleCustomRange} 
            variant="contained"
            className="bg-bitcoin-orange hover:bg-bitcoin-orange/90"
          >
            Anwenden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};