import { useState } from "react";
import { addItem } from "../lib/storage";

export default function AddItem() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const qty = Number(stock) || 0;
    if (!name.trim()) {
      alert("请输入样品名称");
      return;
    }
    if (qty <= 0) {
      alert("请输入有效的库存数量");
      return;
    }

    setLoading(true);
    try {
      const newItem = {
        id: Date.now().toString(),
        name: name.trim(),
        stock: qty,
        totalStock: qty,
        imageUrl: imageUrl.trim() || null,
      };
      await addItem(newItem);
      alert("样品添加成功");
      setName("");
      setStock("");
      setImageUrl("");
    } catch (e) {
      console.error(e);
      alert("添加失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">新增样品</h1>
      <p className="page-subtitle">填写样品信息，图片链接可选</p>

      <div className="card">
        <div className="form-group">
          <label>样品名称</label>
          <input
            className="form-input"
            placeholder="例如：STM32 开发板"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>库存数量</label>
          <input
            className="form-input"
            type="number"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>图片链接（可选）</label>
          <input
            className="form-input"
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? "添加中..." : "添加样品"}
        </button>
      </div>
    </div>
  );
}
