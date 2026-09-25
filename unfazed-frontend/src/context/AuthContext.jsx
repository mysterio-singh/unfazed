import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [therapist, setTherapist] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("unfazed_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/therapist/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setTherapist(response.data.therapist);
        }
      } catch (error) {
        localStorage.removeItem("unfazed_token");
        setToken(null);
        setTherapist(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    if (response.data.success) {
      const newToken = response.data.token;

      localStorage.setItem("unfazed_token", newToken);

      setToken(newToken);
      setTherapist(response.data.therapist);
    }

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
    });

    if (response.data.success) {
      const newToken = response.data.token;

      localStorage.setItem("unfazed_token", newToken);

      setToken(newToken);
      setTherapist(response.data.therapist);
    }

    return response.data;
  };
  const updateProfile = async (profileData) => {
  const response = await axiosInstance.put(
    "/therapist/profile",
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data.success) {
    setTherapist(response.data.therapist);
  }

  return response.data;
};

  const logout = () => {
    localStorage.removeItem("unfazed_token");
    setToken(null);
    setTherapist(null);
  };

  return (
    <AuthContext.Provider
  value={{
    therapist,
    token,
    loading,
    login,
    register,
    updateProfile,
    logout,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};