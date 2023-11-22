// Create a UserContext to store the userId
import React, {createContext, useState, useContext} from 'react';

interface IUserContext {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const [userId, setUserId] = useState('');

  return (
    <UserContext.Provider value={{userId, setUserId}}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
