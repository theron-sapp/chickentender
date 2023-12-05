// contexts/UsersArrayContext.tsx

import React, {createContext, useState, useContext, useCallback} from 'react';

// Define a type for user data
type User = {
  username: string;
  // Add more user properties as needed
};

// Define a type for the context state
type UsersArrayContextType = {
  users: User[];
  addUser: (user: User) => void;
  removeUser: (username: string) => void;
  clearUsers: () => void;
};

interface UsersArrayProviderProps {
  children: React.ReactNode;
}

// Create the context
const UsersArrayContext = createContext<UsersArrayContextType | undefined>(
  undefined,
);

// Define the provider component
export const UsersArrayProvider: React.FC<UsersArrayProviderProps> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  // Function to add a new user
  const addUser = useCallback((newUser: User | User[]) => {
    setUsers(prevUsers => {
      if (Array.isArray(newUser)) {
        // Concatenate arrays to avoid duplicates
        return [...prevUsers, ...newUser.filter(u => !prevUsers.includes(u))];
      } else {
        // Add a single user if not already in the array
        return prevUsers.some(user => user.username === newUser.username)
          ? prevUsers
          : [...prevUsers, newUser];
      }
    });
  }, []);

  // Function to remove a user by username
  const removeUser = useCallback((username: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
  }, []);

  // Function to clear all users
  const clearUsers = useCallback(() => {
    setUsers([]);
  }, []);

  return (
    <UsersArrayContext.Provider
      value={{users, addUser, removeUser, clearUsers}}>
      {children}
    </UsersArrayContext.Provider>
  );
};

// Hook to use the UsersContext
export const useUsersArray = () => {
  const context = useContext(UsersArrayContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
