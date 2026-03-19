import { useEffect, useState } from "react";
import { getLogs } from "../lib/storage";
import BackButton from "../components/BackButton";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs()
      .then(setLogs)
      .catch((e) => {
        console.error(e);
        alert("加载失败：" + (e?.message || e));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <BackButton />
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>操作日志</h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0" }}>系统操作记录</p>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {logs.map((log) => (
        <div key={log.id} className="card">
          <p style={{ margin: "0 0 4px" }}>{log.action}</p>
          <small style={{ color: "#8e8e93" }}>{log.time}</small>
        </div>
      ))}
    </div>
  );
}
