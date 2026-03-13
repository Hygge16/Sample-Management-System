import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { role, username, logout } = useAuth();

  const userTiles = [
    { path: "/scan", icon: "📦", label: "扫码借用" },
    { path: "/records", icon: "📋", label: "我的记录" },
  ];

  const adminTiles = [
    { path: "/dashboard", icon: "📊", label: "库存总览" },
    { path: "/admin", icon: "✅", label: "管理员审批" },
    { path: "/logs", icon: "📝", label: "操作日志" },
    { path: "/add", icon: "➕", label: "新增样品" },
  ];

  const tiles = role === "admin" ? [...userTiles, ...adminTiles] : userTiles;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>仓库管理系统</h1>
        <button 
          style={{ padding: "6px 12px", fontSize: "14px", background: "transparent", color: "#8e8e93", border: "1px solid #d2d2d7" }} 
          onClick={logout}
        >
          退出
        </button>
      </div>
      <p className="page-subtitle">
        欢迎，{role === "admin" ? "管理员" : username}
      </p>

      <div className="home-grid">
        {tiles.map((t) => (
          <div
            key={t.path}
            className="home-tile"
            onClick={() => navigate(t.path)}
          >
            <span className="tile-icon">{t.icon}</span>
            <span className="tile-label">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
