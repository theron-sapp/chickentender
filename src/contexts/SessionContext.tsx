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
  votes: any[];
  results?: any;
  votingComplete: boolean;
}

interface ISessionContext {
  session: Session | null;
  setSession: (session: Session | null) => void;
  setResults: (results: any) => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionContext = createContext<ISessionContext | undefined>(
  undefined,
);

export const SessionProvider: React.FC<SessionProviderProps> = ({children}) => {
  const [session, setSession] = useState<Session | null>(null);
  const setResults = (newResults: any) => {
    setSession(prevSession => {
      if (prevSession) {
        return {...prevSession, results: newResults};
      }
      return prevSession;
    });
  };

  return (
    <SessionContext.Provider value={{session, setSession, setResults}}>
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
