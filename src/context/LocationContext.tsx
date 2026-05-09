import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentLocation, type LocationData } from '../lib/location';

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationData | null>;
  setManualLocation: (lat: number, lon: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('carepath-location');
    if (saved) {
      try {
         setLocation(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (location) {
      sessionStorage.setItem('carepath-location', JSON.stringify(location));
    } else {
      sessionStorage.removeItem('carepath-location');
    }
  }, [location]);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCurrentLocation();
      setLocation(data);
      return data;
    } catch (err: any) {
      console.warn(err);
      setError("Unable to retrieve your location natively. Please allow location access or try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = (lat: number, lon: number) => {
    setLocation({ latitude: lat, longitude: lon, timestamp: Date.now() });
    setError(null);
  };

  return (
    <LocationContext.Provider value={{ location, isLoading, error, requestLocation, setManualLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
