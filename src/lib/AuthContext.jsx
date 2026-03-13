import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'user' | 'admin' | null
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("auth_role");
    const savedName = localStorage.getItem("auth_username");
    if (savedRole) {
      setRole(savedRole);
      if (savedName) setUsername(savedName);
    }
  }, []);

  const login = (selectedRole, name) => {
    setRole(selectedRole);
    setUsername(name);
    localStorage.setItem("auth_role", selectedRole);
    if (name) {
      localStorage.setItem("auth_username", name);
    } else {
      localStorage.removeItem("auth_username");
    }
  };

  const logout = () => {
    setRole(null);
    setUsername("");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_username");
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
