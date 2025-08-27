import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ChevronDown, User, Search } from 'lucide-react';
import { Input } from './ui/input';
import { useStore } from '../store';

// Shared constants to ensure referential stability
const EMPTY_ARRAY = [];

// Memoized selectors to prevent infinite loops
const selectPatients = (state) => {
  const data = state?.patients;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectSelectedPatientId = (state) => state?.selectedPatientId || 'patient-001';

export const PatientSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get patients from store using memoized selectors
  const patients = useStore(selectPatients);
  const selectedPatientId = useStore(selectSelectedPatientId);

  // Load patients on mount - NO function dependencies to avoid infinite loop
  useEffect(() => {
    const loadPatients = async () => {
      const store = useStore.getState();
      if (store.fetchPatients && patients.length === 0) {
        await store.fetchPatients();
      }
    };
    loadPatients();
  }, []); // Empty dependency array!

  // Get current patient - ensure patients is array
  const currentPatient = Array.isArray(patients) && patients.length > 0 
    ? (patients.find(p => p.id === selectedPatientId) || patients[0])
    : null;

  // Filter patients based on search - ensure patients is array
  const filteredPatients = Array.isArray(patients) 
    ? patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handlePatientSelect = (patient) => {
    const store = useStore.getState();
    store.setSelectedPatient && store.setSelectedPatient(patient.id);
    setSearchTerm('');
    
    // Store selection in localStorage for persistence
    localStorage.setItem('selectedPatientId', patient.id);
  };

  if (!currentPatient) {
    return (
      <Button variant="outline" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{currentPatient.name}</span>
          <span className="sm:hidden">{currentPatient.name.split(' ').map(n => n[0]).join('')}</span>
          {currentPatient.pipFlag && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              PIP
            </Badge>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Select Patient</DropdownMenuLabel>
        
        {/* Search Input */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Patient List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <DropdownMenuItem
                key={patient.id}
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{patient.name}</span>
                    {patient.pipFlag && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        PIP
                      </Badge>
                    )}
                    {patient.id === selectedPatientId && (
                      <Badge variant="default" className="text-xs px-1 py-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {patient.id} • {patient.insurance.provider}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    DOB: {new Date(patient.dob).toLocaleDateString()}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No patients found
            </div>
          )}
        </div>
        
        {searchTerm && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-muted-foreground text-center">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
