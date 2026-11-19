import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { slugify } from "../src/lib/utils/slugify";

test("slugify: produces clean, URL-safe slugs and handles special characters", () => {
  assert.equal(slugify("T9 Vintage Dragon Style Metal Body Hair Trimmer"), "t9-vintage-dragon-style-metal-body-hair-trimmer");
  assert.equal(slugify("Men's & Women's Watch @ 50% Off!"), "mens-womens-watch-50-off");
  assert.equal(slugify("Casual Sneakers (White / Red)"), "casual-sneakers-white-red");
});

test("CSV / Excel parsing: XLSX parses standard product CSV format properly", () => {
  const sampleCsv = `Name,Price,CompareAtPrice,SKU,Stock,Category,Description,Images,Status
"Leather Jacket",4500,5500,JKT-01,25,"Clothing, Outerwear","Genuine leather jacket","https://example.com/1.jpg, https://example.com/2.jpg",active
"Wireless Earbuds",2200,,EAR-02,50,Electronics,"High quality sound",https://example.com/ear.jpg,draft`;

  const wb = XLSX.read(sampleCsv, { type: "string" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].Name, "Leather Jacket");
  assert.equal(rows[0].Price, 4500);
  assert.equal(rows[0].CompareAtPrice, 5500);
  assert.equal(rows[0].SKU, "JKT-01");
  assert.equal(rows[0].Stock, 25);
  assert.equal(rows[0].Category, "Clothing, Outerwear");
  assert.equal(rows[1].Name, "Wireless Earbuds");
  assert.equal(rows[1].Price, 2200);
  assert.equal(rows[1].Status, "draft");
});

test("Unique slug collision resolution: appends counter when base slug exists", () => {
  const existingSlugs = new Set(["t9-trimmer", "t9-trimmer-2"]);
  const rawName = "T9 Trimmer";
  let baseSlug = slugify(rawName);
  let candidateSlug = baseSlug;
  let counter = 2;
  while (existingSlugs.has(candidateSlug)) {
    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  assert.equal(candidateSlug, "t9-trimmer-3");
});

