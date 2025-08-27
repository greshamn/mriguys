import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteCenters, setFavoriteCenters] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});

  // Load favorites and preferences from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('mriguys-favorite-centers');
    const savedHistory = localStorage.getItem('mriguys-search-history');
    const savedPreferences = localStorage.getItem('mriguys-user-preferences');

    if (savedFavorites) {
      try {
        setFavoriteCenters(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorite centers:', error);
      }
    }

    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }

    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mriguys-favorite-centers', JSON.stringify(favoriteCenters));
  }, [favoriteCenters]);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mriguys-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mriguys-user-preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const addFavoriteCenter = (center) => {
    setFavoriteCenters(prev => {
      const exists = prev.find(fav => fav.id === center.id);
      if (exists) return prev;
      return [...prev, { ...center, addedAt: new Date().toISOString() }];
    });
  };

  const removeFavoriteCenter = (centerId) => {
    setFavoriteCenters(prev => prev.filter(fav => fav.id !== centerId));
  };

  const toggleFavoriteCenter = (center) => {
    const isFavorite = favoriteCenters.some(fav => fav.id === center.id);
    if (isFavorite) {
      removeFavoriteCenter(center.id);
    } else {
      addFavoriteCenter(center);
    }
  };

  const isFavoriteCenter = (centerId) => {
    return favoriteCenters.some(fav => fav.id === centerId);
  };

  const addSearchToHistory = (searchParams) => {
    const searchEntry = {
      id: Date.now().toString(),
      params: searchParams,
      timestamp: new Date().toISOString(),
      resultCount: 0 // This will be updated when search is executed
    };

    setSearchHistory(prev => {
      // Remove duplicate searches (same parameters)
      const filtered = prev.filter(entry => 
        JSON.stringify(entry.params) !== JSON.stringify(searchParams)
      );
      // Add new search at the beginning
      return [searchEntry, ...filtered.slice(0, 9)]; // Keep only last 10 searches
    });
  };

  const updateSearchResultCount = (searchParams, resultCount) => {
    setSearchHistory(prev => 
      prev.map(entry => 
        JSON.stringify(entry.params) === JSON.stringify(searchParams)
          ? { ...entry, resultCount }
          : entry
      )
    );
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const updateUserPreferences = (newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const getLastSearch = () => {
    return searchHistory[0] || null;
  };

  const getFavoriteCentersByLocation = (location) => {
    if (!location) return favoriteCenters;
    return favoriteCenters.filter(center => 
      center.address.city.toLowerCase().includes(location.toLowerCase()) ||
      center.address.state.toLowerCase().includes(location.toLowerCase()) ||
      center.address.zip.includes(location)
    );
  };

  const value = {
    favoriteCenters,
    searchHistory,
    userPreferences,
    addFavoriteCenter,
    removeFavoriteCenter,
    toggleFavoriteCenter,
    isFavoriteCenter,
    addSearchToHistory,
    updateSearchResultCount,
    clearSearchHistory,
    updateUserPreferences,
    getLastSearch,
    getFavoriteCentersByLocation
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
