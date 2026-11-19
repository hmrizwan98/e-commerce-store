"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { exportCsv } from "@/lib/analytics/export";
import {
  executeProductBulkImportAction,
  executeProductBulkExportAction,
} from "../actions";
import type {
  ProductBulkOperation,
  BulkImportProductItem,
} from "@/types/product-bulk-operation";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const SAMPLE_CSV_HEADERS = [
  "Name",
  "Price",
  "CompareAtPrice",
  "SKU",
  "Stock",
  "Category",
  "Description",
  "Images",
  "Status",
];

const SAMPLE_CSV_ROWS: (string | number)[][] = [
  [
    "T9 Vintage Dragon Metal Body Hair Trimmer",
    999,
    1499,
    "TRM-001",
    50,
    "Personal Care, Grooming",
    "Rechargeable vintage style hair trimmer with durable metal body and USB charger.",
    "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800",
    "active",
  ],
  [
    "Luxury Stainless Steel Quartz Watch",
    2499,
    3999,
    "WCH-002",
    30,
    "Accessories, Watches",
    "Water resistant quartz movement wristwatch with date display.",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
    "active",
  ],
  [
    "Casual Canvas Sneakers - White",
    1850,
    2500,
    "SNK-003",
    20,
    "Footwear",
    "Comfortable everyday low-top white canvas sneakers.",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    "active",
  ],
];

interface ParsedFileSummary {
  fileName: string;
  fileSize: string;
  totalRows: number;
  validProducts: BulkImportProductItem[];
  invalidRowsCount: number;
}

const cardClass =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xs";

function cleanNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const BulkActionsPanel: React.FC<{ history: ProductBulkOperation[] }> = ({
  history: initialHistory,
}) => {
  const [history, setHistory] = useState<ProductBulkOperation[]>(initialHistory);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<ParsedFileSummary | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Download Sample CSV
  const handleDownloadSample = () => {
    exportCsv("sample-products-template", SAMPLE_CSV_HEADERS, SAMPLE_CSV_ROWS);
  };

  // 2. Real CSV / Excel Export
  const handleExport = async () => {
    setExporting(true);
    setImportFeedback(null);
    try {
      const res = await executeProductBulkExportAction();
      if (!res.rows.length) {
        setImportFeedback({
          type: "error",
          message: "No products found to export.",
        });
        return;
      }
      exportCsv(res.filename, res.headers, res.rows);
      setHistory((prev) => [
        {
          id: `export-${Date.now()}`,
          type: "export",
          status: "completed",
          fileName: `${res.filename}.csv`,
          rowCount: res.count,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      setImportFeedback({
        type: "success",
        message: `Exported ${res.count} products successfully.`,
      });
    } catch (err: any) {
      setImportFeedback({
        type: "error",
        message: err.message || "Failed to export products.",
      });
    } finally {
      setExporting(false);
    }
  };

  // 3. File selection & Parsing (CSV or XLSX)
  const processFile = async (file: File) => {
    setImportFeedback(null);

    const fileSizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("No worksheet found in file.");
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
        workbook.Sheets[firstSheetName],
        { defval: "" }
      );

      if (!rawRows.length) {
        throw new Error("The uploaded file contains no data rows.");
      }

      const validProducts: BulkImportProductItem[] = [];
      let invalidCount = 0;

      for (const row of rawRows) {
        // Skip purely empty lines / rows
        const hasAnyContent = Object.values(row).some(
          (val) => val !== null && val !== undefined && String(val).trim() !== ""
        );
        if (!hasAnyContent) continue;

        // Map flexible column headers (e.g. Title, Name, Product Name, Price, etc.)
        const mapped: Record<string, any> = {};
        for (const [rawKey, rawVal] of Object.entries(row)) {
          const norm = normalizeKey(rawKey);
          if (["name", "title", "productname", "product"].includes(norm)) {
            mapped.name = String(rawVal).trim();
          } else if (["price", "unitprice", "regularprice"].includes(norm)) {
            mapped.price = cleanNumber(rawVal);
          } else if (["compareatprice", "compareprice", "originalprice", "saleprice"].includes(norm)) {
            mapped.compareAtPrice = cleanNumber(rawVal);
          } else if (["sku", "barcode", "code"].includes(norm)) {
            mapped.sku = String(rawVal).trim();
          } else if (["stock", "qty", "quantity", "inventory"].includes(norm)) {
            mapped.stock = cleanNumber(rawVal);
          } else if (["category", "categories", "collection"].includes(norm)) {
            mapped.category = String(rawVal).trim();
          } else if (["description", "desc", "details"].includes(norm)) {
            mapped.description = String(rawVal).trim();
          } else if (["images", "image", "photos", "photo"].includes(norm)) {
            const rawImages = String(rawVal).trim();
            mapped.images = rawImages
              ? rawImages
                  .split(/[,;\n]/)
                  .map((url) => url.trim())
                  .filter((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"))
              : [];
          } else if (["status", "state"].includes(norm)) {
            mapped.status = String(rawVal).trim().toLowerCase() === "draft" ? "draft" : "active";
          }
        }

        if (mapped.name && typeof mapped.price === "number") {
          validProducts.push({
            name: mapped.name,
            price: mapped.price,
            compareAtPrice: mapped.compareAtPrice || undefined,
            sku: mapped.sku || undefined,
            stock: mapped.stock ?? 0,
            category: mapped.category || undefined,
            description: mapped.description || undefined,
            images: mapped.images || [],
            status: mapped.status || "active",
          });
        } else {
          invalidCount++;
        }
      }

      setParsedSummary({
        fileName: file.name,
        fileSize: fileSizeStr,
        totalRows: rawRows.length,
        validProducts,
        invalidRowsCount: invalidCount,
      });
    } catch (err: any) {
      setImportFeedback({
        type: "error",
        message: err.message || "Failed to read file.",
      });
      setParsedSummary(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 4. Execute Real Bulk Import
  const handleExecuteImport = async () => {
    if (!parsedSummary || !parsedSummary.validProducts.length) return;

    setImporting(true);
    setImportFeedback(null);

    try {
      const res = await executeProductBulkImportAction(
        parsedSummary.validProducts,
        parsedSummary.fileName
      );

      if (res.success) {
        setHistory((prev) => [
          {
            id: `import-${Date.now()}`,
            type: "import",
            status: "completed",
            fileName: parsedSummary.fileName,
            rowCount: res.importedCount,
            createdAt: Date.now(),
          },
          ...prev,
        ]);
        setImportFeedback({
          type: "success",
          message: `Successfully imported ${res.importedCount} products into your store!`,
        });
        setParsedSummary(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setImportFeedback({
          type: "error",
          message: res.errors.join(", ") || "Import failed.",
        });
      }
    } catch (err: any) {
      setImportFeedback({
        type: "error",
        message: err.message || "An error occurred during import.",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClearSelectedFile = () => {
    setParsedSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Feedback Banner */}
      {importFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            importFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {importFeedback.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{importFeedback.message}</span>
        </div>
      )}

      {/* Card 1: Sample CSV Template */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <DocumentArrowDownIcon className="w-5 h-5 text-indigo-600" />
              1. Download Sample CSV Template
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
              Use our pre-formatted template with standard columns (Name, Price, SKU, Stock, Category, Images, etc.) to format your product data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-100 transition-colors shadow-xs flex-shrink-0"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* Card 2: Bulk Import Products */}
      <div className={cardClass}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CloudArrowUpIcon className="w-5 h-5 text-indigo-600" />
            2. Import Products via CSV or Excel
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Upload your CSV (.csv) or Excel (.xlsx) spreadsheet. Automatic category mapping and unique slug generation are applied.
          </p>
        </div>

        {/* Dropzone / File Picker */}
        {!parsedSummary ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-neutral-800/20"
          >
            <CloudArrowUpIcon className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Click to select or drag and drop your spreadsheet
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Supports .csv, .xlsx, and .xls files up to 20MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Details & Summary */}
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  {parsedSummary.fileName.endsWith(".xlsx") ? "XLSX" : "CSV"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {parsedSummary.fileName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {parsedSummary.fileSize} • {parsedSummary.validProducts.length} valid products detected
                    {parsedSummary.invalidRowsCount > 0 && ` (${parsedSummary.invalidRowsCount} invalid rows will be skipped)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  disabled={importing}
                  className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
                  aria-label="Remove selected file"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || !parsedSummary.validProducts.length}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Importing {parsedSummary.validProducts.length} Products…
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      Start Import ({parsedSummary.validProducts.length} Products)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Table of First 5 Products */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="p-2 bg-slate-50 dark:bg-neutral-800/60 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Preview of first {Math.min(5, parsedSummary.validProducts.length)} products:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Stock</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {parsedSummary.validProducts.slice(0, 5).map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30">
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                        {p.name}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                        {p.price}
                      </td>
                      <td className="p-2.5 text-neutral-500">{p.sku || "—"}</td>
                      <td className="p-2.5 text-neutral-500">{p.stock}</td>
                      <td className="p-2.5 text-neutral-500">{p.category || "—"}</td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                          {p.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Bulk Export Products */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownTrayIcon className="w-5 h-5 text-indigo-600" />
              Export Products Catalog
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-lg">
              Download a complete CSV backup of all active products in this store, including names, prices, SKUs, inventory, and image URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs flex-shrink-0 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Exporting Catalog…
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export All Products (.CSV)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card 4: Operations History */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Bulk Operations History
        </h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {history.map((record) => {
            const isCompleted = record.status === "completed";
            const isFailed = record.status === "failed";
            return (
              <div
                key={record.id}
                className="py-3 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg ${
                      record.type === "import"
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300"
                    }`}
                  >
                    {record.type === "import" ? (
                      <CloudArrowUpIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <span className="font-semibold capitalize text-slate-900 dark:text-white mr-2">
                      {record.type}
                    </span>
                    {record.fileName && (
                      <span className="text-neutral-500 font-mono text-xs">
                        {record.fileName}
                      </span>
                    )}
                    {typeof record.rowCount === "number" && (
                      <span className="ml-2 text-neutral-400 text-xs">
                        ({record.rowCount} products)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        : isFailed
                        ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                        : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                    }`}
                  >
                    {record.status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>
            );
          })}
          {!history.length && (
            <p className="text-sm text-neutral-500 py-3">No bulk activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
