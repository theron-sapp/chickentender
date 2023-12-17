// contexts/UserContext.tsx

import React, {createContext, useState, useContext} from 'react';

interface ISessionCodeInputContext {
  sessionCode: string;
  setSessionCode: React.Dispatch<React.SetStateAction<string>>;
}

const SessionCodeInputContext = createContext<
  ISessionCodeInputContext | undefined
>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const [sessionCode, setSessionCode] = useState('');

  return (
    <SessionCodeInputContext.Provider value={{sessionCode, setSessionCode}}>
      {children}
    </SessionCodeInputContext.Provider>
  );
};

export const useSessionCodeInput = () => {
  const context = useContext(SessionCodeInputContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
