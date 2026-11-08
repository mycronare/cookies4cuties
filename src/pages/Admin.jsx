import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const PROOF_BUCKET = import.meta.env.VITE_PROOF_BUCKET || 'payment-proofs';
const PAGE_SIZE = 20;
const STATUSES = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];

const PRODUCT_NAMES = { 1: 'Box of Six', 2: 'Single Palm-Sized' }; // match your products table ids
const LOCATIONS = { pampanga: 'Vista Mall Pampanga', katipunan: 'Cityland 101 Xavierville', rockwell: 'One Rockwell East' };
const METHODS = { online: 'Online (QR)', cash_on_pickup: 'Cash on pickup', cash_on_delivery: 'Cash on delivery' };

const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function proofLink(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return supabase.storage.from(PROOF_BUCKET).getPublicUrl(path).data.publicUrl;
}

const inputClass =
  'w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#8E5A52]/40 focus:border-[#8E5A52]';

function Field({ label, children }) {
  return (
    <label className="block text-xs font-bold text-slate-600">
      <span className="block mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('adminKey') || '');
  const [keyInput, setKeyInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    email: '', order_status: '', payment_method: '', payment_verified: '', pickup_location: '', sort: 'created_at:desc',
  });

  const logout = (msg = '') => {
    sessionStorage.removeItem('adminKey');
    setKey('');
    setOrders([]);
    setLoginError(msg);
  };

  const api = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(API_URL + path, { ...opts, headers: { 'x-admin-key': key, ...(opts.headers || {}) } });
      if (res.status === 401 || res.status === 403) {
        logout('That admin key was not accepted.');
        throw new Error('auth');
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === 'string' ? d : d ? JSON.stringify(d) : res.statusText);
      }
      return body;
    },
    [key]
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setError('');
    const p = new URLSearchParams({ limit: PAGE_SIZE, offset });
    const [sort_by, sort_order] = filters.sort.split(':');
    p.set('sort_by', sort_by);
    p.set('sort_order', sort_order);
    ['email', 'order_status', 'payment_method', 'payment_verified', 'pickup_location'].forEach((k) => {
      if (filters[k].trim()) p.set(k, filters[k].trim());
    });
    try {
      setOrders(await api('/admin/orders?' + p));
    } catch (e) {
      if (e.message !== 'auth') setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key, offset, filters, api]);

  // Reload when filters/page change (debounced so typing in the email box is smooth)
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const update = async (id, fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    try {
      await api(`/admin/orders/${id}`, { method: 'PATCH', body: fd });
      load();
    } catch (e) {
      if (e.message !== 'auth') alert('Could not update order: ' + e.message);
    }
  };

  const setFilter = (k, v) => {
    setOffset(0);
    setFilters((f) => ({ ...f, [k]: v }));
  };

  /* ---------- Login ---------- */
  if (!key) {
    return (
      <div className="min-h-screen bg-[#BCE3EB] flex items-center justify-center p-4 font-['Inter']">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!keyInput.trim()) return;
            sessionStorage.setItem('adminKey', keyInput.trim());
            setKey(keyInput.trim());
            setKeyInput('');
            setLoginError('');
          }}
          className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center"
        >
          <h1 className="font-['Chomage'] text-4xl text-[#8E5A52] mb-1">Admin</h1>
          <p className="text-xs text-slate-500 mb-5">Enter your admin key to see orders.</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Admin key"
            autoComplete="current-password"
            className={inputClass + ' text-center'}
          />
          {loginError && <p className="text-[#FF3B30] text-xs font-medium mt-3">{loginError}</p>}
          <button className="w-full bg-[#8E5A52] text-white py-3 rounded-full font-['Chomage'] text-xl mt-4 hover:opacity-90 transition cursor-pointer">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const pending = orders.filter((o) => o.order_status === 'pending').length;
  const unpaid = orders.filter((o) => !o.payment_verified).length;
  const total = orders.reduce((s, o) => s + Number(o.total_price || 0), 0);

  /* ---------- Dashboard ---------- */
  return (
    <div className="min-h-screen bg-[#BCE3EB] p-4 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-['Chomage'] text-4xl text-[#8E5A52]">Orders</h1>
          <div className="flex gap-2">
            <button onClick={load} className="bg-[#8E5A52] text-white px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 cursor-pointer">
              Refresh
            </button>
            <button onClick={() => logout()} className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-50 cursor-pointer">
              Log out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            ['Orders on this page', orders.length],
            ['Pending', pending],
            ['Awaiting payment check', unpaid],
            ['Total on this page', peso(total)],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-3xl p-4 shadow-sm text-center">
              <div className="font-['Chomage'] text-2xl text-[#8E5A52]">{value}</div>
              <div className="text-[11px] text-slate-500 font-bold mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Email">
            <input value={filters.email} onChange={(e) => setFilter('email', e.target.value)} placeholder="Search email" className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={filters.order_status} onChange={(e) => setFilter('order_status', e.target.value)} className={inputClass}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Payment">
            <select value={filters.payment_method} onChange={(e) => setFilter('payment_method', e.target.value)} className={inputClass}>
              <option value="">All</option>
              {Object.entries(METHODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Payment check">
            <select value={filters.payment_verified} onChange={(e) => setFilter('payment_verified', e.target.value)} className={inputClass}>
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Not verified</option>
            </select>
          </Field>
          <Field label="Pickup">
            <select value={filters.pickup_location} onChange={(e) => setFilter('pickup_location', e.target.value)} className={inputClass}>
              <option value="">All</option>
              {Object.entries(LOCATIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Sort">
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className={inputClass}>
              <option value="created_at:desc">Newest first</option>
              <option value="created_at:asc">Oldest first</option>
              <option value="total_price:desc">Highest total</option>
              <option value="total_price:asc">Lowest total</option>
            </select>
          </Field>
        </div>

        {loading && <p className="text-center text-sm text-[#8E5A52] font-['Chomage'] text-xl py-6">Loading orders…</p>}
        {error && <p role="alert" className="bg-white text-[#FF3B30] rounded-3xl p-4 text-xs font-medium mb-3">Could not load orders: {error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="bg-white rounded-3xl p-8 text-center text-sm text-slate-500">No orders match these filters.</p>
        )}

        <div className="space-y-3">
          {orders.map((o) => {
            const link = proofLink(o.proof_url);
            const when = o.created_at ? new Date(o.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '';
            return (
              <div key={o.id} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div className="font-['Chomage'] text-2xl text-[#8E5A52]">Order #{o.id}</div>
                    <div>{when}</div>
                    <div className="text-slate-700 font-bold">{o.email}</div>
                    <div>{o.phone}</div>
                    <div>Pickup: {LOCATIONS[o.pickup_location] || o.pickup_location}</div>
                  </div>
                  <div className="font-['Chomage'] text-2xl text-slate-800">{peso(o.total_price)}</div>
                </div>

                <div className="flex flex-wrap gap-2 my-3 text-[11px] font-bold">
                  <span className={`px-3 py-1 rounded-full ${o.order_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{o.order_status}</span>
                  <span className="px-3 py-1 rounded-full bg-[#8E5A52]/10 text-[#8E5A52]">{METHODS[o.payment_method] || o.payment_method}</span>
                  <span className={`px-3 py-1 rounded-full ${o.payment_verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {o.payment_verified ? 'Payment verified' : 'Payment not verified'}
                  </span>
                </div>

                <div className="border-y border-dashed border-slate-200 py-2 text-xs text-slate-700 space-y-1">
                  {parseItems(o.items).map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{PRODUCT_NAMES[i.product_id] || `Product #${i.product_id}`}</span>
                      <span className="font-bold">x {i.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <select
                    value={o.order_status}
                    onChange={(e) => update(o.id, { order_status: e.target.value })}
                    aria-label={`Status for order ${o.id}`}
                    className={inputClass + ' !w-auto'}
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {!o.payment_verified && (
                    <button
                      onClick={() => confirm(`Mark order #${o.id} as paid?`) && update(o.id, { payment_verified: true })}
                      className="bg-[#8E5A52] text-white px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                      Mark as paid
                    </button>
                  )}
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="bg-[#BCE3EB] text-slate-800 px-4 py-2 rounded-full text-xs font-bold hover:bg-[#a6d5df]">
                      View proof of payment
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-5 pb-8">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="font-['Chomage'] text-xl text-[#8E5A52]">Page {offset / PAGE_SIZE + 1}</span>
          <button
            disabled={orders.length < PAGE_SIZE}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}