// contexts/SessionContext.tsx
import React, {createContext, useState, useContext} from 'react';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  address: string;
  rating: number;
  price: string;
  distance: number;
  url: string;
}

interface Session {
  code: string;
  sessionCreator: string;
  users: string[];
  expiresAt: string;
  restaurants: Restaurant[];
  votes: any[]; // Define the structure of votes as required
}

interface ISessionContext {
  session: Session | null;
  setSession: (session: Session) => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionContext = createContext<ISessionContext | undefined>(undefined);

export const SessionProvider: React.FC<SessionProviderProps> = ({children}) => {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <SessionContext.Provider value={{session, setSession}}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook to use the SessionContext
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
