import React, {createContext, useState, useContext} from 'react';

interface IUserContext {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const [username, setUsername] = useState('');

  return (
    <UserContext.Provider value={{username, setUsername}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
