import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { isSupabaseEnabled } from "../lib/supabase";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleUserLogin = () => {
    if (!username.trim()) {
      alert("请输入你的姓名");
      return;
    }
    login("user", username.trim());
    navigate("/");
  };

  const handleAdminLogin = () => {
    // 默认密码为 123456，可通过环境变量配置
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "123456";
    if (adminPassword !== correctPassword) {
      alert("密码错误");
      return;
    }
    login("admin", "管理员");
    navigate("/");
  };

  return (
    <div className="page" style={{ paddingTop: "60px", textAlign: "center" }}>
      <h1 className="page-title" style={{ fontSize: "32px", marginBottom: "8px" }}>
        仓库管理系统
      </h1>
      <p className="page-subtitle" style={{ marginBottom: "40px" }}>
        请选择您的身份
      </p>
      <p style={{ fontSize: "12px", color: "#8e8e93", marginBottom: "24px" }}>
        {isSupabaseEnabled() ? "✓ 云端同步" : "⚠ 本地数据（未配置 Supabase，各设备数据独立）"}
      </p>

      <div style={{ maxWidth: "320px", margin: "0 auto", textAlign: "left" }}>
        <div className="card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginTop: 0, fontSize: "18px" }}>我是申请人</h3>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>你的姓名</label>
            <input
              className="form-input"
              placeholder="请输入姓名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleUserLogin}>
            进入系统
          </button>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "16px" }}>
          {!showAdminLogin ? (
            <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setShowAdminLogin(true)}>
              我是管理员
            </button>
          ) : (
            <div style={{ textAlign: "left" }}>
              <h3 style={{ marginTop: 0, fontSize: "18px" }}>管理员登录</h3>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <input
                  className="form-input"
                  type="password"
                  placeholder="请输入管理员密码"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={handleAdminLogin}>
                登录
              </button>
              <button 
                className="btn-secondary" 
                style={{ width: "100%", marginTop: "8px", border: "none" }} 
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword("");
                }}
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
