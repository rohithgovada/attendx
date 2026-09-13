import React, { createContext, useContext, useState } from "react";
import { DEMO_USERS } from "../mockData/users";
import { api } from "../services/api";

const AuthContext = createContext(null);

const safeGetAuth = () => {
  try {
    const savedAuth = localStorage.getItem("attendx_auth");
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed && parsed.user) return parsed;
    }
  } catch {
    // fallback
  }

  // Default to student demo user on first visit or fallback
  const defaultUser = DEMO_USERS.student;
  const initial = {
    user: defaultUser,
    role: "student",
    token: "mock_initial_token"
  };
  try {
    localStorage.setItem("attendx_auth", JSON.stringify(initial));
  } catch {
    // fallback
  }
  return initial;
};

const safeSetAuth = (state) => {
  try {
    if (state && state.user) {
      localStorage.setItem("attendx_auth", JSON.stringify(state));
    } else {
      localStorage.removeItem("attendx_auth");
    }
  } catch {
    // fallback
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(safeGetAuth);
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
        safeSetAuth(nextState);
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
      safeSetAuth(nextState);
      return selectedUser;
    }
  };

  const logout = () => {
    const nextState = { user: null, role: null, token: null };
    setAuthState(nextState);
    safeSetAuth(nextState);
  };

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    const nextState = { ...authState, user: updated };
    setAuthState(nextState);
    safeSetAuth(nextState);
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
