import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';

export const SearchFilters = React.memo(({ onSearch, bodyParts, modalityOptions, initialValues = {} }) => {
  const [location, setLocation] = useState(initialValues.location || '');
  const [bodyPart, setBodyPart] = useState(initialValues.bodyPart || '');
  const [modalities, setModalities] = useState(initialValues.modalities || []);
  const [dateRange, setDateRange] = useState(initialValues.dateRange || { start: '', end: '' });

  // Add debugging to see what's being passed
  console.log('SearchFilters - bodyParts prop:', bodyParts);
  console.log('SearchFilters - modalityOptions prop:', modalityOptions);
  console.log('SearchFilters - initialValues:', initialValues);

  // Synchronize form state with initialValues when they change
  useEffect(() => {
    if (initialValues.location !== undefined) {
      setLocation(initialValues.location);
    }
    if (initialValues.bodyPart !== undefined) {
      setBodyPart(initialValues.bodyPart);
    }
    if (initialValues.modalities !== undefined) {
      setModalities(initialValues.modalities);
    }
    if (initialValues.dateRange !== undefined) {
      setDateRange(initialValues.dateRange || { start: '', end: '' });
    }
  }, [initialValues]);

  const handleSearch = () => {
    onSearch({
      location,
      bodyPart,
      modalities,
      dateRange: dateRange.start && dateRange.end ? dateRange : null
    });
  };

  const handleModalityChange = (modality, checked) => {
    if (checked) {
      const newModalities = [...modalities, modality];
      setModalities(newModalities);
    } else {
      const newModalities = modalities.filter(m => m !== modality);
      setModalities(newModalities);
    }
  };

  const clearFilters = () => {
    setLocation('');
    setBodyPart('');
    setModalities([]);
    setDateRange({ start: '', end: '' });
    // Call onSearch with empty params to show all centers
    onSearch({
      location: '',
      bodyPart: '',
      modalities: [],
      dateRange: null
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Search Filters</h3>
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City or ZIP code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Body Part Selector */}
      <div className="space-y-2">
        <Label htmlFor="bodyPart">Body Part</Label>
        <select
          id="bodyPart"
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">All Body Parts</option>
          {bodyParts && bodyParts.length > 0 ? (
            bodyParts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))
          ) : (
            <option value="" disabled>Loading body parts...</option>
          )}
        </select>
      </div>

      {/* Modality Selector */}
      <div className="space-y-3">
        <Label>Modalities</Label>
        <div className="space-y-2">
          {modalityOptions && modalityOptions.length > 0 ? (
            modalityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={modalities.includes(option.value)}
                  onCheckedChange={(checked) => handleModalityChange(option.value, checked)}
                />
                <Label htmlFor={option.value} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Loading modalities...</div>
          )}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="space-y-2">
        <Label>Date Range (Optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={dateRange?.start || ''}
            onChange={(e) => setDateRange({ ...(dateRange || {}), start: e.target.value })}
            className="text-sm"
          />
          <Input
            type="date"
            value={dateRange?.end || ''}
            onChange={(e) => setDateRange({ ...(dateRange || {}), end: e.target.value })}
            className="text-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="w-full"
          disabled={!location.trim() && !bodyPart && modalities.length === 0}
        >
          🔍 Search Centers
        </Button>
        <Button 
          onClick={clearFilters} 
          variant="outline" 
          className="w-full"
        >
          🗑️ Clear Filters
        </Button>
      </div>

      {/* Quick Search Suggestions */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Search</h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSearch({ location: 'Miami', bodyPart: '', modalities: [], dateRange: null })}
          >
            🏖️ Miami Centers
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSearch({ location: '', bodyPart: '1', modalities: [], dateRange: null })}
          >
            🧠 Brain MRI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSearch({ location: '', bodyPart: '', modalities: ['MRI'], dateRange: null })}
          >
            🔬 MRI Scans
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => onSearch({ location: '', bodyPart: '', modalities: ['Nuclear Medicine'], dateRange: null })}
          >
            ☢️ Nuclear Medicine
          </Button>
        </div>
      </div>
    </div>
  );
});

SearchFilters.displayName = 'SearchFilters';
