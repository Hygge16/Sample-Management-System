import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getRecordById,
  getItemById,
  transferRecord,
  addLog,
  addNotice,
} from "../lib/storage";
import { useAuth } from "../lib/AuthContext";
import BackButton from "../components/BackButton";

export default function ReceiveTransfer() {
  const { recordId, token } = useParams();
  const navigate = useNavigate();
  const { username } = useAuth();
  const [record, setRecord] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await getRecordById(recordId);
      if (!r) {
        setError("记录不存在");
        setLoading(false);
        return;
      }
      if (r.status !== "已批准") {
        setError("该借用已结束，无法接收");
        setLoading(false);
        return;
      }
      const holder = r.currentHolder ?? r.applicantName;
      if (holder === username) {
        setError("您已是当前持有人，无需接收");
        setLoading(false);
        return;
      }
      if (r.transferToken !== token) {
        setError("转借链接已失效，请让对方重新出示二维码");
        setLoading(false);
        return;
      }
      setRecord(r);
      const i = await getItemById(r.itemId);
      setItem(i);
      setLoading(false);
    })();
  }, [recordId, token, username]);

  const handleConfirm = async () => {
    if (!record || !username) return;
    const fromHolder = record.currentHolder ?? record.applicantName;
    await transferRecord(record.id, username, fromHolder);
    const time = new Date().toLocaleString();
    await addLog({
      action: `样品 ${record.itemId} 由 ${record.currentHolder ?? record.applicantName} 转交给 ${username}`,
      time,
    });
    await addNotice({
      id: Date.now() + 1,
      message: `样品 ${record.itemId} 已由 ${record.currentHolder ?? record.applicantName} 转交给 ${username}`,
      time,
    });
    alert("接收成功");
    navigate("/records");
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) {
    return (
      <div className="page">
        <div style={{ marginBottom: "12px" }}>
          <BackButton />
        </div>
        <p className="page-subtitle" style={{ color: "#ff3b30" }}>{error}</p>
        <button className="btn-secondary" onClick={() => navigate("/records")}>
          返回
        </button>
      </div>
    );
  }

  const fromName = record.currentHolder ?? record.applicantName;

  return (
    <div className="page">
      <div style={{ marginBottom: "12px" }}>
        <BackButton />
      </div>
      <h1 className="page-title">确认接收</h1>
      <p className="page-subtitle">请确认您已收到实物后再点击接收</p>

      <div className="card">
        <p><strong>样品</strong> {item?.name ?? record.itemId}</p>
        <p><strong>数量</strong> {record.quantity}</p>
        <p><strong>转出人</strong> {fromName}</p>
        <p><strong>接收人</strong> {username}</p>

        <button
          className="btn-primary"
          onClick={handleConfirm}
          style={{ marginTop: 20 }}
        >
          确认接收
        </button>
        <button
          className="btn-secondary"
          style={{ marginTop: 12, width: "100%" }}
          onClick={() => navigate("/records")}
        >
          取消
        </button>
      </div>
    </div>
  );
}
