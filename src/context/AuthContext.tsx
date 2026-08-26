import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'status' | 'joinedDate'>) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
}

const STORAGE_KEY_USER = 'florachain_current_user';
const STORAGE_KEY_USERS = 'florachain_users_list';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users from localStorage', e);
      }
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    return MOCK_USERS[0]; // Dr. Evelyn Vance (Admin) by default
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'CONSUMER') {
      const consumerUser: User = {
        id: 'USR-CONS-GUEST',
        name: 'Guest Consumer',
        email: 'consumer@public.net',
        role: 'CONSUMER',
        organization: 'Public Consumer Portal',
        location: 'Global',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(consumerUser);
      return;
    }

    const matchedUser = users.find(u => u.role === newRole && u.status === 'ACTIVE');
    if (matchedUser) {
      setCurrentUser(matchedUser);
    } else {
      // Create fallback active user for this role
      const fallbackUser: User = {
        id: `USR-${newRole.substring(0, 3)}-01`,
        name: `${newRole.charAt(0) + newRole.slice(1).toLowerCase()} Operator`,
        email: `${newRole.toLowerCase()}@florachain.org`,
        role: newRole,
        organization: `${newRole} Organization Hub`,
        location: 'Verified Node Location',
        status: 'ACTIVE',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(fallbackUser);
    }
  };

  const login = (email: string, role?: UserRole): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() || (role && u.role === role));
    if (user) {
      setCurrentUser(user);
      return true;
    }
    if (role) {
      switchRole(role);
      return true;
    }
    return false;
  };

  const logout = () => {
    switchRole('CONSUMER');
  };

  const registerUser = (userData: Omit<User, 'id' | 'status' | 'joinedDate'>) => {
    const newUser: User = {
      ...userData,
      id: `USR-${userData.role.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: userData.role === 'CONSUMER' ? 'ACTIVE' : 'PENDING_APPROVAL',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const approveUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: 'ACTIVE' as const } : u))
    );
  };

  const rejectUser = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: 'REJECTED' as const } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role: currentUser.role,
        isAuthenticated: currentUser.role !== 'CONSUMER',
        switchRole,
        login,
        logout,
        registerUser,
        approveUser,
        rejectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
