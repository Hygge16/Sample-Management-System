/**
 * 统一数据层：支持 Supabase（云端共享）或 localStorage（本地开发）
 * 当配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 时使用 Supabase
 */

import { supabase, isSupabaseEnabled } from "./supabase.js";

const KEYS = {
  ITEMS: "items",
  RECORDS: "records",
  NOTICES: "notices",
  LOGS: "logs",
};

// --- 本地 fallback ---
function getLocal(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function setLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- 数据映射：DB snake_case <-> App camelCase ---
const toItem = (r) =>
  r
    ? {
        id: r.id,
        name: r.name,
        stock: r.stock ?? r.total_stock,
        totalStock: r.total_stock ?? r.stock,
        imageUrl: r.image_url ?? r.imageUrl ?? null,
      }
    : null;

const toRecord = (r) =>
  r
    ? {
        id: r.id,
        itemId: r.item_id,
        applicantName: r.applicant_name ?? r.applicantName ?? "匿名",
        currentHolder: r.current_holder ?? r.currentHolder ?? null,
        transferToken: r.transfer_token ?? r.transferToken ?? null,
        transferredFrom: r.transferred_from ?? r.transferredFrom ?? null,
        transferredAt: r.transferred_at ?? r.transferredAt ?? null,
        quantity: r.quantity,
        purpose: r.purpose,
        returnDate: r.return_date,
        noReturn: r.no_return ?? r.noReturn ?? false,
        status: r.status,
        createdAt: r.created_at,
      }
    : null;

const toNotice = (r) =>
  r ? { id: r.id, message: r.message, time: r.time } : null;

const toLog = (r) => (r ? { id: r.id, action: r.action, time: r.time } : null);

// ============ Items ============

export async function getItems() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase.from("items").select("*").order("id");
    if (error) throw error;
    return (data || []).map(toItem);
  }
  return getLocal(KEYS.ITEMS);
}

export async function setItems(items) {
  if (isSupabaseEnabled()) {
    const rows = items.map((i) => ({
      id: i.id,
      name: i.name,
      stock: i.stock ?? i.totalStock ?? 0,
      total_stock: i.totalStock ?? i.stock ?? 0,
      image_url: i.imageUrl ?? null,
    }));
    const { error } = await supabase.from("items").upsert(rows, {
      onConflict: "id",
    });
    if (error) throw error;
    return;
  }
  setLocal(KEYS.ITEMS, items);
}

export async function getItemById(id) {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return toItem(data);
  }
  return getLocal(KEYS.ITEMS).find((i) => i.id === id) ?? null;
}

export function getAvailableStock(item) {
  return Number(item?.stock ?? item?.totalStock ?? 0);
}

export async function updateItemStock(itemId, delta) {
  if (isSupabaseEnabled()) {
    const { data: item, error: fetchErr } = await supabase
      .from("items")
      .select("stock, total_stock")
      .eq("id", itemId)
      .single();
    if (fetchErr || !item) return false;

    const current = Number(item.stock ?? item.total_stock ?? 0);
    const next = current + delta;
    if (next < 0) return false;

    const { error: updateErr } = await supabase
      .from("items")
      .update({ stock: next })
      .eq("id", itemId);
    if (updateErr) return false;
    return true;
  }

  const items = getLocal(KEYS.ITEMS);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx < 0) return false;
  const item = items[idx];
  const current = getAvailableStock(item);
  const next = current + delta;
  if (next < 0) return false;
  items[idx] = { ...item, stock: next };
  if (item.totalStock == null) items[idx].totalStock = next;
  setLocal(KEYS.ITEMS, items);
  return true;
}

export async function addItem(item) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from("items").insert({
      id: item.id,
      name: item.name,
      stock: item.stock ?? item.totalStock ?? 0,
      total_stock: item.totalStock ?? item.stock ?? 0,
      image_url: item.imageUrl ?? null,
    });
    if (error) throw error;
    return;
  }
  const items = getLocal(KEYS.ITEMS);
  items.push(item);
  setLocal(KEYS.ITEMS, items);
}

export async function uploadImage(file) {
  if (isSupabaseEnabled()) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);
      
    return publicUrlData.publicUrl;
  } else {
    // Local fallback: convert to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

export async function updateItemImage(id, imageUrl) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase
      .from("items")
      .update({ image_url: imageUrl })
      .eq("id", id);
    if (error) throw error;
  } else {
    const items = getLocal(KEYS.ITEMS);
    const idx = items.findIndex((i) => i.id === id);
    if (idx > -1) {
      items[idx].imageUrl = imageUrl;
      setLocal(KEYS.ITEMS, items);
    }
  }
}

// ============ Records ============

export async function getRecords() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    return (data || []).map(toRecord);
  }
  return getLocal(KEYS.RECORDS);
}

export async function setRecords(records) {
  if (isSupabaseEnabled()) {
    const rows = records.map((r) => ({
      id: r.id,
      item_id: r.itemId,
      applicant_name: r.applicantName ?? "匿名",
      current_holder: r.currentHolder ?? null,
      transfer_token: r.transferToken ?? null,
      quantity: r.quantity,
      purpose: r.purpose,
      return_date: r.returnDate,
      no_return: r.noReturn ?? false,
      status: r.status,
      created_at: r.createdAt,
    }));
    const { error } = await supabase.from("records").upsert(rows, {
      onConflict: "id",
    });
    if (error) throw error;
    return;
  }
  setLocal(KEYS.RECORDS, records);
}

export async function addRecord(record) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from("records").insert({
      id: record.id,
      item_id: record.itemId,
      applicant_name: record.applicantName ?? "匿名",
      current_holder: record.currentHolder ?? record.applicantName ?? "匿名",
      quantity: record.quantity,
      purpose: record.purpose,
      return_date: record.returnDate,
      no_return: record.noReturn ?? false,
      status: record.status,
      created_at: record.createdAt,
    });
    if (error) throw error;
    return;
  }
  const records = getLocal(KEYS.RECORDS);
  const r = { ...record, currentHolder: record.currentHolder ?? record.applicantName ?? "匿名" };
  records.push(r);
  setLocal(KEYS.RECORDS, records);
}

export async function getRecordById(id) {
  const numId = /^\d+$/.test(String(id)) ? Number(id) : id;
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("id", numId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return toRecord(data);
  }
  const r = getLocal(KEYS.RECORDS).find((x) => x.id == id || x.id === numId);
  return r ? { ...r, currentHolder: r.currentHolder ?? r.applicantName } : null;
}

export async function setTransferToken(recordId, token) {
  const numId = /^\d+$/.test(String(recordId)) ? Number(recordId) : recordId;
  if (isSupabaseEnabled()) {
    const { error } = await supabase
      .from("records")
      .update({ transfer_token: token, updated_at: new Date().toISOString() })
      .eq("id", numId);
    if (error) throw error;
    return;
  }
  const records = getLocal(KEYS.RECORDS).map((r) =>
    (r.id === recordId || r.id === numId) ? { ...r, transferToken: token } : r
  );
  setLocal(KEYS.RECORDS, records);
}

export async function transferRecord(recordId, newHolder, fromHolder) {
  const numId = /^\d+$/.test(String(recordId)) ? Number(recordId) : recordId;
  const transferTime = new Date().toLocaleString();
  if (isSupabaseEnabled()) {
    const { error } = await supabase
      .from("records")
      .update({
        applicant_name: newHolder,
        current_holder: newHolder,
        transfer_token: null,
        transferred_from: fromHolder ?? null,
        transferred_at: transferTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", numId);
    if (error) throw error;
    return;
  }
  const records = getLocal(KEYS.RECORDS).map((r) =>
    (r.id === recordId || r.id === numId)
      ? { ...r, applicantName: newHolder, currentHolder: newHolder, transferToken: null, transferredFrom: fromHolder, transferredAt: transferTime }
      : r
  );
  setLocal(KEYS.RECORDS, records);
}

export async function updateRecordStatus(id, status) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase
      .from("records")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return;
  }
  const records = getLocal(KEYS.RECORDS).map((r) =>
    r.id === id ? { ...r, status } : r
  );
  setLocal(KEYS.RECORDS, records);
}

// ============ Notices ============

export async function getNotices() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    return (data || []).map(toNotice);
  }
  return getLocal(KEYS.NOTICES);
}

export async function addNotice(notice) {
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from("notices").insert({
      id: notice.id,
      message: notice.message,
      time: notice.time,
    });
    if (error) throw error;
    return;
  }
  const notices = getLocal(KEYS.NOTICES);
  notices.push(notice);
  setLocal(KEYS.NOTICES, notices);
}

export async function removeNoticesByItemId(itemId) {
  if (isSupabaseEnabled()) {
    const { data: list } = await supabase
      .from("notices")
      .select("id")
      .ilike("message", `%${itemId}%`);
    if (list?.length) {
      await supabase.from("notices").delete().in("id", list.map((n) => n.id));
    }
    return;
  }
  const notices = getLocal(KEYS.NOTICES).filter(
    (n) => !n.message?.includes(itemId)
  );
  setLocal(KEYS.NOTICES, notices);
}

// ============ Logs ============

export async function getLogs() {
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    return (data || []).map(toLog);
  }
  return getLocal(KEYS.LOGS);
}

export async function addLog(log) {
  const row = {
    id: log.id ?? Date.now(),
    action: log.action,
    time: log.time,
  };
  if (isSupabaseEnabled()) {
    const { error } = await supabase.from("logs").insert(row);
    if (error) throw error;
    return;
  }
  const logs = getLocal(KEYS.LOGS);
  logs.push(row);
  setLocal(KEYS.LOGS, logs);
}
