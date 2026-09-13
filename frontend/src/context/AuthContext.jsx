import React, { createContext, useContext, useState } from "react";
import { DEMO_USERS } from "../mockData/users";
import { api } from "../services/api";

const AuthContext = createContext(null);

const getInitialAuthState = () => {
  try {
    const savedAuth = localStorage.getItem("attendx_auth");
    if (savedAuth) {
      return JSON.parse(savedAuth);
    }
  } catch {
    // fallback
  }

  // Default to student demo user on first visit
  const defaultUser = DEMO_USERS.student;
  const initial = {
    user: defaultUser,
    role: "student",
    token: "mock_initial_token"
  };
  localStorage.setItem("attendx_auth", JSON.stringify(initial));
  return initial;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const [loading, setLoading] = useState(false);

  const { user, role, token } = authState;

  const login = async (email, password, selectedRole) => {
    setLoading(true);
    try {
      const res = await api.login(email, password, selectedRole);
      if (res.success) {
        const nextState = {
          user: res.user,
          role: res.user.role,
          token: res.token
        };
        setAuthState(nextState);
        localStorage.setItem("attendx_auth", JSON.stringify(nextState));
        return { success: true, role: res.user.role };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAs = (roleKey) => {
    const selectedUser = DEMO_USERS[roleKey];
    if (selectedUser) {
      const mockToken = `token_${roleKey}_${Date.now()}`;
      const nextState = {
        user: selectedUser,
        role: roleKey,
        token: mockToken
      };
      setAuthState(nextState);
      localStorage.setItem("attendx_auth", JSON.stringify(nextState));
      return selectedUser;
    }
  };

  const logout = () => {
    setAuthState({ user: null, role: null, token: null });
    localStorage.removeItem("attendx_auth");
  };

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    const nextState = { ...authState, user: updated };
    setAuthState(nextState);
    localStorage.setItem("attendx_auth", JSON.stringify(nextState));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        loginAs,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
