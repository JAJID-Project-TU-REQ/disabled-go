import React, { createContext, useContext, useState, PropsWithChildren } from 'react';

export type SelectedLocation = {
  latitude: number;
  longitude: number;
  address: string;
} | null;

interface LocationState {
  selectedLocation: SelectedLocation;
  setSelectedLocation: (location: SelectedLocation) => void;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: PropsWithChildren) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside a LocationProvider');
  }
  return context;
};

