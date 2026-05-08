import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function readSavedAuth() {
  const savedRole = localStorage.getItem("auth_role");
  const savedName = localStorage.getItem("auth_username") || "";
  return {
    role: savedRole || null,
    username: savedRole ? savedName : "",
  };
}

export function AuthProvider({ children }) {
  const [{ role, username }, setAuth] = useState(readSavedAuth);

  const login = (selectedRole, name) => {
    setAuth({ role: selectedRole, username: name || "" });
    localStorage.setItem("auth_role", selectedRole);
    if (name) {
      localStorage.setItem("auth_username", name);
    } else {
      localStorage.removeItem("auth_username");
    }
  };

  const logout = () => {
    setAuth({ role: null, username: "" });
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_username");
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useAuth() {
  return useContext(AuthContext);
}
