import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount } from '../types/auth';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAdmin: boolean;
  users: UserAccount[];
  loginStudent: (emailOrUser: string, pass: string) => { success: boolean; message?: string };
  loginAdmin: (username: string, pass: string) => { success: boolean; message?: string };
  registerStudent: (name: string, email: string, pass: string, roll: string, dept: string) => { success: boolean; message?: string };
  logout: () => void;
  removeStudent: (id: string) => void;
  addStudentByAdmin: (name: string, email: string, roll: string, dept: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminPortalOpen: boolean;
  setIsAdminPortalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USERS = 'uav_virtual_lab_users_db';
const STORAGE_KEY_CURRENT_USER = 'uav_virtual_lab_current_user';

// Authorized Admins specified by user:
// RITHIK, LAKSHMI NARASIMMAN with password: admin@psg
const AUTHORIZED_ADMINS = ['RITHIK', 'LAKSHMI NARASIMMAN'];
const ADMIN_PASSWORD = 'admin@psg';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading users database', e);
      }
    }
    // Default initial seeded users
    return [
      {
        id: 'admin_rithik',
        name: 'RITHIK',
        email: 'rithik@psg.aero',
        password: ADMIN_PASSWORD,
        rollNumber: 'ADMIN-01',
        department: 'Aerospace Engineering (HOD)',
        role: 'admin',
        createdAt: '2026-01-15T09:00:00Z',
        lastActive: new Date().toISOString(),
        completedExpCount: 10,
      },
      {
        id: 'admin_lakshmi',
        name: 'LAKSHMI NARASIMMAN',
        email: 'lakshminarasimman@psg.aero',
        password: ADMIN_PASSWORD,
        rollNumber: 'ADMIN-02',
        department: 'Aeronautical Faculty / Lab Director',
        role: 'admin',
        createdAt: '2026-01-15T09:00:00Z',
        lastActive: new Date().toISOString(),
        completedExpCount: 10,
      },
      {
        id: 'student_demo',
        name: 'Vasanth Kumar',
        email: 'vasanth@psg.edu',
        password: 'student@psg',
        rollNumber: 'PSG-AERO-2026-042',
        department: 'B.E Aeronautical Engineering',
        role: 'student',
        createdAt: '2026-02-10T11:20:00Z',
        lastActive: new Date().toISOString(),
        completedExpCount: 4,
      },
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading current user', e);
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Student Login
  const loginStudent = (emailOrUser: string, pass: string): { success: boolean; message?: string } => {
    const cleanInput = emailOrUser.trim().toLowerCase();
    const user = users.find(
      (u) => (u.email.toLowerCase() === cleanInput || u.name.toLowerCase() === cleanInput || u.rollNumber.toLowerCase() === cleanInput)
    );

    if (!user) {
      return { success: false, message: 'Invalid Username / Email ID. Please check your credentials or create a new account.' };
    }

    if (user.password !== pass) {
      return { success: false, message: 'Incorrect Password. Please try again.' };
    }

    const updatedUser: UserAccount = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    return { success: true };
  };

  // Admin Login
  const loginAdmin = (username: string, pass: string): { success: boolean; message?: string } => {
    const trimmedUser = username.trim().toUpperCase();

    if (!AUTHORIZED_ADMINS.includes(trimmedUser)) {
      return {
        success: false,
        message: `Unauthorized Admin Name. Only official administrators (${AUTHORIZED_ADMINS.join(' or ')}) can access the Admin Portal.`,
      };
    }

    if (pass !== ADMIN_PASSWORD) {
      return { success: false, message: 'Incorrect Admin Master Password.' };
    }

    const existingAdmin = users.find((u) => u.name.toUpperCase() === trimmedUser && u.role === 'admin');
    const adminAccount: UserAccount = existingAdmin || {
      id: `admin_${trimmedUser.toLowerCase().replace(/\s+/g, '_')}`,
      name: trimmedUser,
      email: `${trimmedUser.toLowerCase().replace(/\s+/g, '')}@psg.aero`,
      password: ADMIN_PASSWORD,
      rollNumber: 'ADMIN-DIRECTOR',
      department: 'Aerospace Engineering Department',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedExpCount: 10,
    };

    setCurrentUser(adminAccount);
    return { success: true };
  };

  // Student Registration (Any user worldwide can create an account)
  const registerStudent = (
    name: string,
    email: string,
    pass: string,
    roll: string,
    dept: string
  ): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this Email ID already exists. Please login instead.' };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      password: pass,
      rollNumber: roll.trim() || `PSG-${Math.floor(1000 + Math.random() * 9000)}`,
      department: dept.trim() || 'Aeronautical Engineering',
      role: 'student',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedExpCount: 0,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const removeStudent = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  const addStudentByAdmin = (name: string, email: string, roll: string, dept: string) => {
    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: 'student@psg',
      rollNumber: roll.trim(),
      department: dept.trim() || 'Aerospace Engineering',
      role: 'student',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      completedExpCount: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const isAdmin = currentUser?.role === 'admin' || (currentUser ? AUTHORIZED_ADMINS.includes(currentUser.name.toUpperCase()) : false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        users,
        loginStudent,
        loginAdmin,
        registerStudent,
        logout,
        removeStudent,
        addStudentByAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminPortalOpen,
        setIsAdminPortalOpen,
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
