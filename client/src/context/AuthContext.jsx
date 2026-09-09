import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'user-demo-123',
    name: 'Alex Chen',
    email: 'demo@interviewcoach.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  });
  const [profile, setProfile] = useState({
    targetRole: 'Full Stack Engineer',
    experience: 'Senior (5+ yrs)',
    techStack: 'React, TypeScript, Node.js, Express, PostgreSQL, Redis',
    targetCompany: 'Top Tier Tech'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
          if (data.profile) setProfile(data.profile);
        }
      } catch (err) {
        // Fallback to demo profile
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('coach_token', data.token);
      setUser(data.user);
      if (data.profile) setProfile(data.profile);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await api.register(formData);
      localStorage.setItem('coach_token', data.token);
      setUser(data.user);
      if (data.profile) setProfile(data.profile);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('coach_token');
    setUser(null);
    setProfile(null);
  };

  const updateCandidateProfile = async (newProfile) => {
    try {
      const updated = await api.updateProfile(newProfile);
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      updateProfile: updateCandidateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
