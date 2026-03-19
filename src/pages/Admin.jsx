import { useEffect, useState } from "react";
import {
  getRecords,
  getNotices,
  getItemById,
  getAvailableStock,
  updateItemStock,
  updateRecordStatus,
  removeNoticesByItemId,
  addLog,
} from "../lib/storage";
import { supabase, isSupabaseEnabled } from "../lib/supabase";
import BackButton from "../components/BackButton";

export default function Admin() {
  const [records, setRecordsState] = useState([]);
  const [notices, setNoticesState] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOverdue = (record) => {
    if (record.noReturn) return false;
    if (record.status !== "已批准") return false;
    if (!record.returnDate) return false;
    const today = new Date();
    const due = new Date(record.returnDate);
    return due.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  const load = async () => {
    try {
      const [r, n] = await Promise.all([getRecords(), getNotices()]);
      setRecordsState(r);
      setNoticesState(n);
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

  useEffect(() => {
    if (!isSupabaseEnabled() || !supabase) return;
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "records" },
        (payload) => {
          load();
          if (payload.new?.status === "待审批" && "Notification" in window) {
            Notification.requestPermission().then((p) => {
              if (p === "granted") {
                new Notification("新借用申请", {
                  body: `样品 ${payload.new?.item_id} 有新的借用申请，请及时处理`,
                });
              }
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "records" },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notices" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (recordId, newStatus) => {
    const r = records.find((rec) => rec.id === recordId);
    if (!r) return;

    if (newStatus === "已批准") {
      const item = await getItemById(r.itemId);
      const available = getAvailableStock(item);
      if (available < Number(r.quantity)) {
        alert("库存不足，无法批准");
        return;
      }
      const ok = await updateItemStock(r.itemId, -Number(r.quantity));
      if (!ok) {
        alert("库存更新失败");
        return;
      }
      await removeNoticesByItemId(r.itemId);
      await addLog({
        action: `样品 ${r.itemId} 被${newStatus}`,
        time: new Date().toLocaleString(),
      });
      setNoticesState(await getNotices());
    }

    await updateRecordStatus(recordId, newStatus);
    const updatedRecords = records.map((rec) =>
      rec.id === recordId ? { ...rec, status: newStatus } : rec
    );
    setRecordsState(updatedRecords);
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <BackButton />
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>管理员审批</h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0" }}>处理借用申请</p>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {notices.length > 0 && (
        <>
          <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: 12 }}>通知</h3>
          {notices.map((notice) => (
            <div key={notice.id} className="card notice-card">
              <p style={{ margin: "0 0 4px" }}>{notice.message}</p>
              <small style={{ color: "#8e8e93" }}>{notice.time}</small>
            </div>
          ))}
        </>
      )}

      <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "24px 0 12px" }}>申请列表</h3>
      {records.length === 0 && <p className="page-subtitle">暂无申请</p>}

      {records.map((record) => (
        <div key={record.id} className="card record-card">
          <div className="record-meta">
            <p>
              <strong>样品ID</strong> {record.itemId} · <strong>申请人</strong> {record.applicantName}
            </p>
            <p>
              <strong>数量</strong> {record.quantity} · <strong>用途</strong> {record.purpose}
            </p>
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
          </div>

          {record.status === "待审批" && (
            <div className="record-actions">
              <button
                className="btn-success"
                onClick={() => updateStatus(record.id, "已批准")}
              >
                批准
              </button>
              <button
                className="btn-danger"
                onClick={() => updateStatus(record.id, "已拒绝")}
              >
                拒绝
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
