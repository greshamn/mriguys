import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { X, ChevronDown } from 'lucide-react';

// Insurance options - these would typically come from a store or API
const insuranceOptions = [
  { value: 'blue-cross', label: 'Blue Cross Blue Shield' },
  { value: 'aetna', label: 'Aetna' },
  { value: 'cigna', label: 'Cigna' },
  { value: 'unitedhealth', label: 'UnitedHealth' },
  { value: 'humana', label: 'Humana' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' }
];

export const HorizontalSearchFilters = React.memo(({ onSearch, bodyParts, modalityOptions, initialValues = {} }) => {
  const [location, setLocation] = useState(initialValues.location || '');
  const [bodyPart, setBodyPart] = useState(initialValues.bodyPart || '');
  const [modalities, setModalities] = useState(initialValues.modalities || []);
  const [insurances, setInsurances] = useState(initialValues.insurances || []);
  const [dateRange, setDateRange] = useState(initialValues.dateRange || { start: '', end: '' });
  const [modalitiesDropdownOpen, setModalitiesDropdownOpen] = useState(false);
  const [insurancesDropdownOpen, setInsurancesDropdownOpen] = useState(false);
  const modalitiesDropdownRef = useRef(null);
  const insurancesDropdownRef = useRef(null);

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
    if (initialValues.insurances !== undefined) {
      setInsurances(initialValues.insurances);
    }
    if (initialValues.dateRange !== undefined) {
      setDateRange(initialValues.dateRange || { start: '', end: '' });
    }
  }, [initialValues]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalitiesDropdownRef.current && !modalitiesDropdownRef.current.contains(event.target)) {
        setModalitiesDropdownOpen(false);
      }
      if (insurancesDropdownRef.current && !insurancesDropdownRef.current.contains(event.target)) {
        setInsurancesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    onSearch({
      location,
      bodyPart,
      modalities,
      insurances,
      dateRange: dateRange.start && dateRange.end ? dateRange : null
    });
  };

  const handleModalitySelect = (modality) => {
    if (modalities.includes(modality)) {
      setModalities(modalities.filter(m => m !== modality));
    } else {
      setModalities([...modalities, modality]);
    }
  };

  const removeModality = (modality) => {
    setModalities(modalities.filter(m => m !== modality));
  };

  const handleInsuranceSelect = (insurance) => {
    if (insurances.includes(insurance)) {
      setInsurances(insurances.filter(i => i !== insurance));
    } else {
      setInsurances([...insurances, insurance]);
    }
  };

  const removeInsurance = (insurance) => {
    setInsurances(insurances.filter(i => i !== insurance));
  };

  const clearFilters = () => {
    setLocation('');
    setBodyPart('');
    setModalities([]);
    setInsurances([]);
    setDateRange({ start: '', end: '' });
    // Call onSearch with empty params to show all centers
    onSearch({
      location: '',
      bodyPart: '',
      modalities: [],
      insurances: [],
      dateRange: null
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Search Filters</h3>
        <Button 
          onClick={clearFilters} 
          variant="outline" 
          size="sm"
        >
          Clear All
        </Button>
      </div>

      {/* Horizontal Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
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
          <Label htmlFor="bodyPart" className="text-sm font-medium">Body Part</Label>
          <Select value={bodyPart || "all"} onValueChange={(value) => setBodyPart(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Body Parts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Body Parts</SelectItem>
              {bodyParts && bodyParts.length > 0 ? (
                bodyParts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>Loading body parts...</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Modalities Multi-Select Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Modalities</Label>
          <div className="relative" ref={modalitiesDropdownRef}>
            <Button
              variant="outline"
              onClick={() => setModalitiesDropdownOpen(!modalitiesDropdownOpen)}
              className="w-full justify-between"
            >
              {modalities.length > 0 ? `${modalities.length} selected` : "Select modalities"}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {modalitiesDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  {modalityOptions && modalityOptions.length > 0 ? (
                    modalityOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => handleModalitySelect(option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={modalities.includes(option.value)}
                          readOnly
                          className="mr-2"
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">Loading modalities...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insurance Multi-Select Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Insurance Accepted</Label>
          <div className="relative" ref={insurancesDropdownRef}>
            <Button
              variant="outline"
              onClick={() => setInsurancesDropdownOpen(!insurancesDropdownOpen)}
              className="w-full justify-between"
            >
              {insurances.length > 0 ? `${insurances.length} selected` : "Select insurance"}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {insurancesDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  {insuranceOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => handleInsuranceSelect(option.value)}
                    >
                      <input
                        type="checkbox"
                        checked={insurances.includes(option.value)}
                        readOnly
                        className="mr-2"
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={dateRange?.start || ''}
              onChange={(e) => setDateRange({ ...(dateRange || {}), start: e.target.value })}
              className="text-sm"
              placeholder="Start"
            />
            <Input
              type="date"
              value={dateRange?.end || ''}
              onChange={(e) => setDateRange({ ...(dateRange || {}), end: e.target.value })}
              className="text-sm"
              placeholder="End"
            />
          </div>
        </div>
      </div>

      {/* Selected Modalities Display */}
      {modalities.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Modalities:</Label>
          <div className="flex flex-wrap gap-2">
            {modalities.map((modality) => {
              const option = modalityOptions?.find(opt => opt.value === modality);
              return (
                <Badge key={modality} variant="secondary" className="flex items-center gap-1">
                  {option?.label || modality}
                  <button
                    onClick={() => removeModality(modality)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Insurances Display */}
      {insurances.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Insurance:</Label>
          <div className="flex flex-wrap gap-2">
            {insurances.map((insurance) => {
              const option = insuranceOptions.find(opt => opt.value === insurance);
              return (
                <Badge key={insurance} variant="secondary" className="flex items-center gap-1">
                  {option?.label || insurance}
                  <button
                    onClick={() => removeInsurance(insurance)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSearch}
          disabled={!location.trim() && !bodyPart && modalities.length === 0 && insurances.length === 0}
        >
          🔍 Search Centers
        </Button>
      </div>
    </div>
  );
});

HorizontalSearchFilters.displayName = 'HorizontalSearchFilters';
