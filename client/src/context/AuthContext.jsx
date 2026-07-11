import React, { createContext, useContext, useEffect, useState } from "react";
import * as authAPI from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details from Express server (port 5000) using Python User's ID
  const syncProfile = async (userData) => {
    if (!userData) return;
    try {
      const emailQuery = encodeURIComponent(userData.email || "");
      const nameQuery = encodeURIComponent(userData.name || "User");
      const roleQuery = encodeURIComponent((userData.role || "student").toLowerCase());
      
      const res = await fetch(
        `http://localhost:5000/api/users/${userData.id}?email=${emailQuery}&name=${nameQuery}&role=${roleQuery}`
      );
      if (res.ok) {
        const profData = await res.json();
        setProfile(profData);
      }
    } catch (err) {
      console.warn("Express backend profile synchronization unavailable:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authAPI.me()
      .then(async (res) => {
        setUser(res.data);
        await syncProfile(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem("token", res.data.access_token);
    const me = await authAPI.me();
    setUser(me.data);
    await syncProfile(me.data);
    return me.data;
  };

  const signup = async (email, password, name, role = "STUDENT") => {
    const res = await authAPI.signup({
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("token", res.data.access_token);
    const me = await authAPI.me();
    setUser(me.data);
    await syncProfile(me.data);
    return me.data;
  };

  const adminLogin = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem("token", res.data.access_token);
    const me = await authAPI.me();
    if (me.data.role !== "ADMIN") {
      localStorage.removeItem("token");
      throw new Error("Access Denied: Not an administrator.");
    }
    setUser(me.data);
    await syncProfile(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
  };

  // Called after Google OAuth sets the JWT token in localStorage
  const loginWithToken = async () => {
    try {
      const me = await authAPI.me();
      setUser(me.data);
      await syncProfile(me.data);
      return me.data;
    } catch (err) {
      localStorage.removeItem("token");
      throw err;
    }
  };

  const updateProfile = async (updatedPayload) => {
    if (!user) return false;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedPayload)
      });
      if (res.ok) {
        // Deep merge logic to keep previous fields
        setProfile((prev) => ({
          ...prev,
          ...updatedPayload,
          profile: {
            ...prev?.profile,
            ...(updatedPayload.profile || {})
          },
          company: {
            ...prev?.company,
            ...(updatedPayload.company || {})
          }
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating profile in Express backend:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        loading,
        login,
        signup,
        adminLogin,
        logout,
        loginWithToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);