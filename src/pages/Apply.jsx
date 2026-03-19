import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getItemById,
  getAvailableStock,
  addRecord,
  addNotice,
} from "../lib/storage";
import { useAuth } from "../lib/AuthContext";
import BackButton from "../components/BackButton";

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [noReturn, setNoReturn] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItemById(id).then((found) => {
      setItem(found);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (!purpose) {
      alert("请填写用途");
      return;
    }
    if (!noReturn && !returnDate) {
      alert("请选择归还时间，或勾选无需归还");
      return;
    }

    if (!item) {
      alert("样品不存在");
      return;
    }

    const available = getAvailableStock(item);
    if (quantity > available) {
      alert("库存不足！");
      return;
    }

    const newRecord = {
      id: Date.now(),
      itemId: id,
      applicantName: username || "匿名",
      quantity,
      purpose,
      returnDate,
      noReturn,
      status: "待审批",
      createdAt: new Date().toLocaleString(),
    };

    try {
      await addRecord(newRecord);
      await addNotice({
        id: Date.now(),
        message: `有新的借用申请：样品 ${id}`,
        time: new Date().toLocaleString(),
      });
      alert("申请提交成功！");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("提交失败：" + (e?.message || e));
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!item) return <div className="page"><p className="page-subtitle">样品不存在</p></div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <BackButton />
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>申请借用</h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0" }}>{item.name}</p>
        </div>
        <div style={{ width: 72 }} />
      </div>

      <div className="card">
        <div className="form-group">
          <label>数量</label>
          <input
            className="form-input"
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </div>

        <div className="form-group">
          <label>用途</label>
          <input
            className="form-input"
            type="text"
            placeholder="请简要说明借用目的"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>归还时间</label>
          <input
            className="form-input"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            disabled={noReturn}
          />
        </div>

        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            id="noReturn"
            type="checkbox"
            checked={noReturn}
            onChange={(e) => setNoReturn(e.target.checked)}
          />
          <label htmlFor="noReturn" style={{ margin: 0, fontSize: 14, color: "#6e6e73" }}>
            此为消耗品 / 无需归还
          </label>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          提交申请
        </button>
      </div>
    </div>
  );
}
