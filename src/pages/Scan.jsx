import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItems, getAvailableStock } from "../lib/storage";
import { ITEM_PLACEHOLDER } from "../lib/constants";

export default function Scan() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getItems()
      .then((raw) =>
        raw.map((item) => ({
          ...item,
          totalStock: item.totalStock ?? item.stock ?? 0,
          availableStock: getAvailableStock(item),
        }))
      )
      .then(setItems)
      .catch((e) => {
        console.error(e);
        alert("加载失败：" + (e?.message || e));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const id = (item.id || "").toLowerCase();
        return (
          name.includes(normalizedQuery) ||
          id.includes(normalizedQuery)
        );
      })
    : items;

  return (
    <div className="page">
      <h1 className="page-title">选择样品</h1>
      <p className="page-subtitle">点击样品卡片申请借用</p>

      <div className="form-group">
        <label>搜索样品</label>
        <input
          className="form-input"
          placeholder="按名称或 ID 搜索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 && (
        <p className="page-subtitle">暂无匹配的样品</p>
      )}

      {filteredItems.map((item) => (
        <div
          key={item.id}
          className="card item-card"
          onClick={() => navigate(`/item/${item.id}`)}
        >
          <div className="item-thumb">
            <img
              src={item.imageUrl || ITEM_PLACEHOLDER}
              alt={item.name}
              onError={(e) => {
                e.target.src = ITEM_PLACEHOLDER;
              }}
            />
          </div>
          <div className="item-info">
            <h3>{item.name}</h3>
            <p>可用 {item.availableStock} / 共 {item.totalStock}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
