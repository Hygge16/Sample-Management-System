/**
 * 导出库存与借用记录为 Excel
 */
import * as XLSX from "xlsx";
import { getAvailableStock } from "./storage";

/**
 * @param {Array} items - 样品列表
 * @param {Array} records - 借用记录
 * @param {string} filename - 导出文件名
 */
export function exportInventoryExcel(items, records, filename = "库存与借用记录.xlsx") {
  const wb = XLSX.utils.book_new();

  // 计算各样品借出数量
  const borrowedByItem = {};
  records
    .filter((r) => r.status === "已批准")
    .forEach((r) => {
      borrowedByItem[r.itemId] = (borrowedByItem[r.itemId] || 0) + Number(r.quantity);
    });

  // Sheet 1: 库存表
  const stockHeaders = ["样品ID", "样品名称", "总库存", "目前库存", "已借出数量"];
  const stockRows = items.map((item) => {
    const total = Number(item.totalStock ?? item.stock ?? 0);
    const borrowed = borrowedByItem[item.id] || 0;
    const available = getAvailableStock(item) ?? total - borrowed;
    return [item.id, item.name, total, available, borrowed];
  });
  const wsStock = XLSX.utils.aoa_to_sheet([stockHeaders, ...stockRows]);
  XLSX.utils.book_append_sheet(wb, wsStock, "库存表");

  // Sheet 2: 借用记录表
  const recordHeaders = [
    "记录ID",
    "样品ID",
    "样品名称",
    "申请人",
    "当前持有人",
    "数量",
    "用途",
    "申请时间",
    "借出时间",
    "计划归还日期",
    "实际归还时间",
    "状态",
    "转借来源",
    "转借时间",
    "无需归还",
  ];
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i.name]));
  const fmtTime = (t) => (t ? new Date(t).toLocaleString("zh-CN") : "-");
  const recordRows = records.map((r) => {
    // 借出时间：已批准时，有转借用转借时间，否则用申请时间近似
    const loanTime =
      r.status === "已批准"
        ? r.transferredAt
          ? fmtTime(r.transferredAt)
          : fmtTime(r.createdAt)
        : "-";
    const returnTime =
      r.status === "已归还"
        ? r.updatedAt
          ? fmtTime(r.updatedAt)
          : r.returnDate ?? "-"
        : "-";
    return [
      r.id,
      r.itemId,
      itemMap[r.itemId] ?? r.itemId,
      r.applicantName,
      r.currentHolder ?? r.applicantName ?? "-",
      r.quantity,
      r.purpose,
      fmtTime(r.createdAt),
      loanTime,
      r.noReturn ? "无需归还" : (r.returnDate ?? "-"),
      returnTime,
      r.status,
      r.transferredFrom ?? "-",
      r.transferredAt ?? "-",
      r.noReturn ? "是" : "否",
    ];
  });
  const wsRecords = XLSX.utils.aoa_to_sheet([recordHeaders, ...recordRows]);
  XLSX.utils.book_append_sheet(wb, wsRecords, "借用记录");

  XLSX.writeFile(wb, filename);
}
