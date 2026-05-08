import { useState, useEffect, useCallback } from "react";
import {
  addItem,
  getItems,
  deleteItem,
  updateItem,
  addLog,
  getAvailableStock,
} from "../lib/storage";
import BackButton from "../components/BackButton";
import { ITEM_PLACEHOLDER } from "../lib/constants";

export default function AddItem() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editTotalStock, setEditTotalStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const list = await getItems();
      setItems(list);
    } catch (e) {
      console.error(e);
      alert("加载样品列表失败：" + (e?.message || e));
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditStock(String(getAvailableStock(item)));
    setEditTotalStock(String(Number(item.totalStock ?? item.stock ?? 0)));
    setEditImageUrl(item.imageUrl ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const nm = editName.trim();
    if (!nm) {
      alert("请输入样品名称");
      return;
    }
    const s = Number(editStock);
    const t = Number(editTotalStock);
    if (Number.isNaN(s) || s < 0) {
      alert("可用库存无效");
      return;
    }
    if (Number.isNaN(t) || t < 0) {
      alert("总库存无效");
      return;
    }
    if (s > t) {
      alert("可用库存不能大于总库存");
      return;
    }

    setSavingId(editingId);
    try {
      await updateItem(editingId, {
        name: nm,
        stock: s,
        totalStock: t,
        imageUrl: editImageUrl.trim() || null,
      });
      await addLog({
        action: `修改样品 ${nm}（ID ${editingId}）`,
        time: new Date().toLocaleString(),
      });
      alert("保存成功");
      setEditingId(null);
      await loadItems();
    } catch (e) {
      console.error(e);
      alert("保存失败：" + (e?.message || e));
    } finally {
      setSavingId(null);
    }
  };

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
      await addLog({
        action: `新增样品 ${newItem.name}（ID ${newItem.id}）`,
        time: new Date().toLocaleString(),
      });
      alert("样品添加成功");
      setName("");
      setStock("");
      setImageUrl("");
      await loadItems();
    } catch (e) {
      console.error(e);
      alert("添加失败：" + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `确定删除样品「${item.name}」吗？\n若仅有已结束记录，将一并清除关联借用记录。`
    );
    if (!ok) return;

    setDeletingId(item.id);
    try {
      await deleteItem(item.id);
      if (editingId === item.id) setEditingId(null);
      await addLog({
        action: `删除样品 ${item.name}（ID ${item.id}）`,
        time: new Date().toLocaleString(),
      });
      await loadItems();
    } catch (e) {
      console.error(e);
      alert("删除失败：" + (e?.message || e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <BackButton />
        <div style={{ textAlign: "center", flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            库存配置
          </h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0" }}>
            管理员：新增、修改、删除样品（借用中不可删）
          </p>
        </div>
        <div style={{ width: 72 }} />
      </div>

      <div className="card">
        <h3 style={{ margin: "0 0 16px", fontSize: "17px", fontWeight: 600 }}>
          新增样品
        </h3>
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

      <h3 style={{ margin: "24px 0 12px", fontSize: "17px", fontWeight: 600 }}>
        已有样品
      </h3>
      {listLoading && <p className="page-subtitle">加载中...</p>}
      {!listLoading && items.length === 0 && (
        <p className="page-subtitle">暂无样品</p>
      )}

      {!listLoading &&
        items.map((item) => {
          const avail = getAvailableStock(item);
          const total = Number(item.totalStock ?? item.stock ?? 0);

          if (editingId === item.id) {
            return (
              <div key={item.id} className="card" style={{ marginBottom: 12 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 16 }}>编辑样品</h4>
                <div className="form-group">
                  <label>名称</label>
                  <input
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>可用库存</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>总库存</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={editTotalStock}
                    onChange={(e) => setEditTotalStock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>图片链接（可选）</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://..."
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn-primary"
                    type="button"
                    style={{ width: "auto", flex: 1, minWidth: 100 }}
                    disabled={savingId === item.id}
                    onClick={handleSaveEdit}
                  >
                    {savingId === item.id ? "保存中..." : "保存"}
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    style={{ flex: 1, minWidth: 100 }}
                    disabled={savingId === item.id}
                    onClick={cancelEdit}
                  >
                    取消
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f2f2f7",
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.imageUrl || ITEM_PLACEHOLDER}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = ITEM_PLACEHOLDER;
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                  {item.name}
                </p>
                <p
                  style={{ margin: "4px 0 0", fontSize: 13, color: "#6e6e73" }}
                >
                  ID {item.id} · 可用 {avail} · 总库存 {total}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <button
                  className="btn-secondary"
                  type="button"
                  style={{ padding: "8px 14px", width: "auto" }}
                  onClick={() => startEdit(item)}
                >
                  编辑
                </button>
                <button
                  className="btn-danger"
                  type="button"
                  style={{ padding: "8px 14px", width: "auto" }}
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                >
                  {deletingId === item.id ? "删除中..." : "删除"}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
