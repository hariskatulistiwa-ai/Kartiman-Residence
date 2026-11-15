// Penyimpanan data sederhana berbasis file JSON (tanpa database server).
// Semua data disimpan di data/db.json dan ditulis secara atomik.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { seed } from './seed.js';

export const DATA_DIR = process.env.DATA_DIR || path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

let db;
let writeTimer = null;

function load() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      console.error('[store] db.json rusak, membuat cadangan dan memulai ulang dari seed:', err.message);
      fs.copyFileSync(DB_FILE, DB_FILE + '.broken-' + Date.now());
      db = seed();
    }
  } else {
    db = seed();
  }
  // Pastikan semua kunci ada (untuk upgrade versi)
  const base = seed();
  db.settings = { ...base.settings, ...(db.settings || {}) };
  for (const key of ['stories', 'thanks', 'greetings', 'frames']) {
    if (!Array.isArray(db[key])) db[key] = base[key];
  }
  flush();
}

function flush() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function save() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(flush, 150);
}

export function saveNow() {
  clearTimeout(writeTimer);
  flush();
}

export const uid = () => crypto.randomBytes(6).toString('hex');

export function getDB() {
  return db;
}

export function replaceDB(next) {
  db = next;
  saveNow();
}

load();
