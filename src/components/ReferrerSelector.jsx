import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Search, User } from 'lucide-react';
import { useStore } from '../store';

// Stable empty array constant
const EMPTY_ARRAY = [];

// Memoized selectors for stable references
const selectProviders = (state) => {
  const data = state?.providers;
  return Array.isArray(data) ? data : EMPTY_ARRAY;
};

const selectSelectedReferrerId = (state) => state?.selectedReferrerId || 'provider-001';

export const ReferrerSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get referrers from store using memoized selectors
  const providers = useStore(selectProviders);
  const selectedReferrerId = useStore(selectSelectedReferrerId);

  // Load providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      const store = useStore.getState();
      if (store.fetchProviders && providers.length === 0) {
        await store.fetchProviders();
      }
    };
    loadProviders();
  }, [providers.length]);

  // Memoized current referrer
  const currentReferrer = useMemo(() => {
    if (!Array.isArray(providers) || providers.length === 0) return null;
    return providers.find(p => p.id === selectedReferrerId) || providers[0];
  }, [providers, selectedReferrerId]);

  // Memoized filtered providers
  const filteredProviders = useMemo(() => {
    if (!Array.isArray(providers)) return EMPTY_ARRAY;
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [providers, searchTerm]);

  const handleReferrerSelect = useCallback((provider) => {
    const store = useStore.getState();
    if (store.setSelectedReferrer) {
      store.setSelectedReferrer(provider.id);
    }
    setSearchTerm('');
    setIsOpen(false);
    localStorage.setItem('selectedReferrerId', provider.id);
  }, []);

  if (!currentReferrer) {
    return <div>Loading referrers...</div>;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="truncate">
            {currentReferrer.name}
          </span>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search referrers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className={`m-2 cursor-pointer transition-colors hover:bg-muted ${
                    provider.id === selectedReferrerId ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleReferrerSelect(provider)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm truncate">
                            {provider.name}
                          </div>
                          {provider.id === selectedReferrerId && (
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {provider.specialty}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {provider.facility}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No referrers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
