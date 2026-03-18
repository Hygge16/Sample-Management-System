import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Item from "./pages/Item";
import Apply from "./pages/Apply";
import MyRecords from "./pages/MyRecords";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import AddItem from "./pages/AddItem";
import TransferQR from "./pages/TransferQR";
import ReceiveTransfer from "./pages/ReceiveTransfer";

function RequireAuth({ children, requireAdmin }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (requireAdmin && role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={(() => { const b = import.meta.env.BASE_URL.replace(/\/$/, ""); return b === "." ? "" : b || ""; })()}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/scan" element={<RequireAuth><Scan /></RequireAuth>} />
          <Route path="/item/:id" element={<RequireAuth><Item /></RequireAuth>} />
          <Route path="/apply/:id" element={<RequireAuth><Apply /></RequireAuth>} />
          <Route path="/records" element={<RequireAuth><MyRecords /></RequireAuth>} />
          <Route path="/transfer/:recordId" element={<RequireAuth><TransferQR /></RequireAuth>} />
          <Route path="/receive/:recordId/:token" element={<RequireAuth><ReceiveTransfer /></RequireAuth>} />
          
          <Route path="/admin" element={<RequireAuth requireAdmin><Admin /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth requireAdmin><Dashboard /></RequireAuth>} />
          <Route path="/logs" element={<RequireAuth requireAdmin><Logs /></RequireAuth>} />
          <Route path="/add" element={<RequireAuth requireAdmin><AddItem /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;