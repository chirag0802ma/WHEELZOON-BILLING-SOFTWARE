const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
export async function fetchProducts(){ const r = await fetch(`${API_BASE}/products`); return r.json(); }
export async function createProduct(p){ const r = await fetch(`${API_BASE}/products`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}); return r.json(); }
export async function createInvoice(inv){ const r = await fetch(`${API_BASE}/create-invoice`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inv)}); return r.json(); }
export async function listInvoices(){ const r = await fetch(`${API_BASE}/invoices`); return r.json(); }
