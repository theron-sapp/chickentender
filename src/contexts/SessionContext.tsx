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
  users: {username: string}[];
  expiresAt: string;
  restaurants: Restaurant[];
  votes: any[]; // Define the structure of votes as required
  results?: any; // Add results to the session type
}

interface ISessionContext {
  session: Session | null;
  setSession: (session: Session) => void;
  results: any; // The results state
  setResults: (results: any) => void; // Function to set the results state
}

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionContext = createContext<ISessionContext | undefined>(undefined);

export const SessionProvider: React.FC<SessionProviderProps> = ({children}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<any>(null);

  return (
    <SessionContext.Provider value={{session, setSession, results, setResults}}>
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
