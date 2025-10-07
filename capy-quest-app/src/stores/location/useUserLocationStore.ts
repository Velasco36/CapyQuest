import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Coordinates {
  lng: number;
  lat: number;
}

interface UserLocationStore {
  userLocation: Coordinates | null;
  locationError: string | null;
  setUserLocation: (location: Coordinates | null) => void;
  setLocationError: (error: string | null) => void;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useUserLocationStore = create<UserLocationStore>()(
  persist(
    (set, get) => ({
      userLocation: null,
      locationError: null,
      
      setUserLocation: (location) => set({ userLocation: location, locationError: null }),
      
      setLocationError: (error) => set({ locationError: error }),
      
      requestLocation: (): Promise<void> => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            set({ locationError: 'La geolocalización no está soportada por este navegador' });
            resolve();
            return;
          }

          set({ locationError: null });

          const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          };

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                lng: position.coords.longitude,
                lat: position.coords.latitude
              };
              set({ userLocation: coords, locationError: null });
              resolve();
            },
            (error) => {
              const errorMessage = 
                error.code === error.PERMISSION_DENIED ? 'Permiso de ubicación denegado' :
                error.code === error.TIMEOUT ? 'Tiempo de espera agotado' :
                error.code === error.POSITION_UNAVAILABLE ? 'Ubicación no disponible' :
                `No se pudo obtener la ubicación: ${error.message}`;
              
              set({ locationError: errorMessage });
              resolve();
            },
            options
          );
        });
      },
      
      clearLocation: () => set({ userLocation: null, locationError: null })
    }),
    {
      name: 'user-location-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        userLocation: state.userLocation 
      })
    }
  )
);