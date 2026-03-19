import { useNavigate } from "react-router-dom";

const btnStyle = {
  padding: "6px 12px",
  fontSize: "14px",
  background: "transparent",
  color: "#8e8e93",
  border: "1px solid #d2d2d7",
  borderRadius: "8px",
  cursor: "pointer",
};

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button style={btnStyle} onClick={() => navigate(-1)}>
      ← 返回
    </button>
  );
}
