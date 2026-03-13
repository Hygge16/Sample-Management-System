import { useEffect, useState } from "react";
import { getLogs } from "../lib/storage";

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
      <h1 className="page-title">操作日志</h1>
      <p className="page-subtitle">系统操作记录</p>

      {logs.map((log) => (
        <div key={log.id} className="card">
          <p style={{ margin: "0 0 4px" }}>{log.action}</p>
          <small style={{ color: "#8e8e93" }}>{log.time}</small>
        </div>
      ))}
    </div>
  );
}
