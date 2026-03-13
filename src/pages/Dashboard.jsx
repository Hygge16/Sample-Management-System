import { useEffect, useState } from "react";
import { getItems, getRecords, getAvailableStock } from "../lib/storage";
import { ITEM_PLACEHOLDER } from "../lib/constants";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [i, r] = await Promise.all([getItems(), getRecords()]);
        setItems(i);
        setRecords(r);
      } catch (e) {
        console.error(e);
        alert("加载失败：" + (e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStats = (itemId) => {
    const related = records.filter((r) => r.itemId === itemId);
    const pending = related.filter((r) => r.status === "待审批").length;
    const approved = related
      .filter((r) => r.status === "已批准")
      .reduce((sum, r) => sum + Number(r.quantity), 0);
    const returned = related
      .filter((r) => r.status === "已归还")
      .reduce((sum, r) => sum + Number(r.quantity), 0);
    const lost = related
      .filter((r) => r.status === "已丢失")
      .reduce((sum, r) => sum + Number(r.quantity), 0);
    return { approved, returned, lost, pending };
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="page">
      <h1 className="page-title">库存总览</h1>
      <p className="page-subtitle">各样品库存与借用统计</p>

      <div className="dashboard-grid">
        {items.map((item) => {
          const stats = getStats(item.id);
          const stock = Number(item.stock) ?? Number(item.totalStock) ?? 0;
          const available =
            getAvailableStock(item) || stock - stats.approved + stats.returned;

          return (
            <div key={item.id} className="card dashboard-card">
              <div className="item-thumb">
                <img
                  src={item.imageUrl || ITEM_PLACEHOLDER}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = ITEM_PLACEHOLDER;
                  }}
                />
              </div>
              <div className="item-body">
                <h3>{item.name}</h3>
                <div className="stats">
                  <p>总库存 {stock} · 可用 {available}</p>
                  <p>
                    已借出 {stats.approved} · 已归还 {stats.returned} · 丢失 {stats.lost} · 待审批 {stats.pending}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
