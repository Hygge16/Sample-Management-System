import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getItemById, getAvailableStock, uploadImage, updateItemImage } from "../lib/storage";
import { ITEM_PLACEHOLDER } from "../lib/constants";
import BackButton from "../components/BackButton";

export default function Item() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getItemById(id)
      .then((found) => {
        if (found) {
          const stock = getAvailableStock(found);
          const totalStock = Number(found.totalStock ?? found.stock ?? 0);
          setItem({ ...found, stock, totalStock });
        } else {
          setItem(null);
        }
      })
      .catch((e) => {
        console.error(e);
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      await updateItemImage(id, url);
      setItem((prev) => ({ ...prev, imageUrl: url }));
      alert("图片更新成功");
    } catch (error) {
      console.error(error);
      alert("上传失败：" + (error.message || error));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const available = item ? (item.stock ?? item.totalStock ?? 0) : 0;
  const total = item ? (item.totalStock ?? item.stock ?? 0) : 0;

  if (loading) return <div className="loading">加载中...</div>;
  if (!item) return (
    <div className="page">
      <div style={{ marginBottom: "12px" }}>
        <BackButton />
      </div>
      <p className="page-subtitle">样品不存在</p>
    </div>
  );

  return (
    <div className="page">
      <div style={{ marginBottom: "12px" }}>
        <BackButton />
      </div>
      <div className="card item-detail">
        <div className="item-hero" style={{ position: "relative" }}>
          <img
            src={item.imageUrl || ITEM_PLACEHOLDER}
            alt={item.name}
            onError={(e) => {
              e.target.src = ITEM_PLACEHOLDER;
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(0,0,0,0.6)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              backdropFilter: "blur(4px)"
            }}
          >
            {uploading ? "上传中..." : "更换图片"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
        <h2>{item.name}</h2>
        <p className="item-stock">可用库存 {available} / 总库存 {total}</p>

        <button
          className="btn-primary"
          onClick={() => navigate(`/apply/${id}`)}
        >
          申请借用
        </button>
      </div>
    </div>
  );
}
