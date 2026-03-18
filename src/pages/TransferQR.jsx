import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getRecordById, getItemById, setTransferToken } from "../lib/storage";
import { useAuth } from "../lib/AuthContext";

export default function TransferQR() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { username } = useAuth();
  const [record, setRecord] = useState(null);
  const [item, setItem] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const r = await getRecordById(recordId);
      const holder = (r?.currentHolder ?? r?.applicantName ?? "").trim();
      const u = (username ?? "").trim();
      if (!r || r.status !== "已批准" || holder !== u) {
        setRecord(null);
        setLoading(false);
        return;
      }
      setRecord(r);
      const i = await getItemById(r.itemId);
      setItem(i);

      const t = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await setTransferToken(recordId, t);
      setToken(t);
      setLoading(false);
    })();
  }, [recordId, username]);

  if (loading) return <div className="loading">加载中...</div>;
  if (!record) return <div className="page"><p className="page-subtitle">记录不存在或无法转借</p></div>;

  const url = `${window.location.origin}/receive/${recordId}/${token}`;

  return (
    <div className="page">
      <h1 className="page-title">转借二维码</h1>
      <p className="page-subtitle">
        请让对方扫描此二维码完成接收
      </p>

      <div className="card" style={{ textAlign: "center", padding: "24px" }}>
        <p style={{ marginBottom: 16, fontSize: 15 }}>
          {item?.name ?? record.itemId} · 数量 {record.quantity}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <QRCodeSVG value={url} size={200} level="M" />
        </div>
        <p style={{ fontSize: 12, color: "#8e8e93", wordBreak: "break-all" }}>
          {url}
        </p>
        <button
          className="btn-secondary"
          style={{ marginTop: 20 }}
          onClick={() => navigate("/records")}
        >
          返回
        </button>
      </div>
    </div>
  );
}
