import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import apiClient from '../services/api';

interface AuthContextType {
  currentUser: User;
  users: User[];
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean> | boolean;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'status' | 'joinedDate'>, password?: string) => Promise<void> | void;
  approveUser: (userId: string) => Promise<void> | void;
  rejectUser: (userId: string) => Promise<void> | void;
}

const STORAGE_KEY_USER = 'florachain_current_user';
const STORAGE_KEY_USERS = 'florachain_users_list';
const STORAGE_KEY_TOKEN = 'florachain_jwt_token';

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
    return users.find(u => u.role === 'CONSUMER') || users[6];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Attempt to fetch fresh users from backend if admin
  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      apiClient.get('/auth/users')
        .then(res => {
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setUsers(res.data);
          }
        })
        .catch(() => {
          // Backend offline, keep local state
        });
    }
  }, [currentUser.role]);

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

  const login = async (email: string, role?: UserRole, password?: string): Promise<boolean> => {
    try {
      const pwd = password || 'password123';
      const res = await apiClient.post('/auth/login', { email, password: pwd });
      if (res.data && res.data.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.data.token);
        if (res.data.user) {
          setCurrentUser(res.data.user);
          return true;
        }
      }
    } catch (e) {
      console.info('Backend auth fallback to local session state');
    }

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
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    switchRole('CONSUMER');
  };

  const registerUser = async (userData: Omit<User, 'id' | 'status' | 'joinedDate'>, password?: string) => {
    try {
      const res = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: password || 'password123',
        role: userData.role,
        organization: userData.organization,
        location: userData.location,
        certifications: userData.certifications,
        avatarUrl: userData.avatarUrl,
      });
      if (res.data && res.data.user) {
        setUsers(prev => [res.data.user, ...prev]);
        return;
      }
    } catch (e) {
      console.info('Backend registration fallback to local state');
    }

    const newUser: User = {
      ...userData,
      id: `USR-${userData.role.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: userData.role === 'CONSUMER' ? 'ACTIVE' : 'PENDING_APPROVAL',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const approveUser = async (userId: string) => {
    try {
      await apiClient.put(`/auth/users/${userId}/approve`);
    } catch (e) {
      console.info('Backend approveUser fallback to local state');
    }
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: 'ACTIVE' as const } : u))
    );
  };

  const rejectUser = async (userId: string) => {
    try {
      await apiClient.put(`/auth/users/${userId}/reject`);
    } catch (e) {
      console.info('Backend rejectUser fallback to local state');
    }
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
