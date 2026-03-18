import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecords,
  updateItemStock,
  updateRecordStatus,
  addLog,
  addNotice,
} from "../lib/storage";
import { useAuth } from "../lib/AuthContext";

export default function MyRecords() {
  const navigate = useNavigate();
  const [records, setRecordsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const { username } = useAuth();

  const isHolder = (record) => {
    const h = record.currentHolder ?? record.applicantName;
    return h === username;
  };

  const isOverdue = (record) => {
    if (record.noReturn) return false;
    if (record.status !== "已批准") return false;
    if (!record.returnDate) return false;
    const today = new Date();
    const due = new Date(record.returnDate);
    // 只比较日期部分
    return due.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  const load = async () => {
    try {
      const r = await getRecords();
      // 显示申请人或当前持有人为当前用户的记录
      setRecordsState(
        r.filter(
          (record) =>
            record.applicantName === username ||
            (record.currentHolder && record.currentHolder === username)
        )
      );
    } catch (e) {
      console.error(e);
      alert("加载失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReturn = async (record) => {
    if (record.noReturn) {
      alert("该记录标记为无需归还");
      return;
    }
    if (record.status !== "已批准") {
      alert("只能归还状态为「已批准」的借用");
      return;
    }

    const ok = await updateItemStock(record.itemId, Number(record.quantity));
    if (!ok) {
      alert("库存更新失败");
      return;
    }

    await updateRecordStatus(record.id, "已归还");
    const updatedRecords = records.map((r) =>
      r.id === record.id ? { ...r, status: "已归还" } : r
    );
    setRecordsState(updatedRecords);

    await addLog({
      action: `样品 ${record.itemId} 已归还`,
      time: new Date().toLocaleString(),
    });
  };

  const handleReportLost = async (record) => {
    if (record.noReturn) {
      alert("该记录标记为无需归还");
      return;
    }
    if (record.status !== "已批准") {
      alert("只能对状态为「已批准」的记录上报丢失");
      return;
    }
    const ok = window.confirm("确认上报丢失吗？此操作不会恢复库存，只记录丢失情况。");
    if (!ok) return;

    await updateRecordStatus(record.id, "已丢失");
    const updatedRecords = records.map((r) =>
      r.id === record.id ? { ...r, status: "已丢失" } : r
    );
    setRecordsState(updatedRecords);

    const time = new Date().toLocaleString();
    await addLog({
      action: `样品 ${record.itemId} 被上报丢失`,
      time,
    });
    await addNotice({
      id: Date.now(),
      message: `样品 ${record.itemId} 被 ${record.applicantName || username} 上报丢失`,
      time,
    });
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page">
      <h1 className="page-title">我的借用记录</h1>
      <p className="page-subtitle">查看并归还已批准的借用</p>

      {records.length === 0 && <p className="page-subtitle">暂无记录</p>}

      {records.map((record) => (
        <div key={record.id} className="card record-card">
          <div className="record-meta">
            <p>
              <strong>样品ID</strong> {record.itemId} · <strong>数量</strong> {record.quantity}
              {record.transferredFrom && (
                <> · <strong>接收于</strong> {record.transferredFrom}</>
              )}
            </p>
            <p><strong>用途</strong> {record.purpose}</p>
            <p>
              {record.noReturn ? (
                <span style={{ color: "#34c759" }}>无需归还</span>
              ) : (
                <>
                  <strong>归还</strong> {record.returnDate}
                </>
              )}
              {" · "}
              <strong>状态</strong>{" "}
              <span style={isOverdue(record) ? { color: "#ff3b30", fontWeight: 600 } : {}}>
                {isOverdue(record) ? "已逾期" : record.status}
              </span>
            </p>
            <p><small>
              {record.createdAt}
              {record.transferredAt && ` · 转借于 ${record.transferredAt}`}
            </small></p>
          </div>

          {record.status === "已批准" && !record.noReturn && isHolder(record) && (
            <div className="record-actions">
              <button
                className="btn-primary"
                onClick={() => handleReturn(record)}
              >
                归还
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/transfer/${record.id}`)}
              >
                转借
              </button>
              <button
                className="btn-danger"
                onClick={() => handleReportLost(record)}
              >
                上报丢失
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
