// 初始化库存（只执行一次）
if (!localStorage.getItem("items")) {
  const initialItems = [
    { id: "1", name: "样品A", stock: 10, totalStock: 10, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=256" },
    { id: "2", name: "样品B", stock: 5, totalStock: 5, imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=256" },
  ];
  localStorage.setItem("items", JSON.stringify(initialItems));
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
