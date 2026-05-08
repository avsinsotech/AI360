import API_BASE_URL from '../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt') || ''}`
});

// ── Mandate APIs ──────────────────────────────────────────────────────────────

export async function listMandates() {
  const res = await fetch(`${API_BASE_URL}/mandates`, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function getMandate(id) {
  const res = await fetch(`${API_BASE_URL}/mandates/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function createMandate(payload) {
  const res = await fetch(`${API_BASE_URL}/mandates`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function refreshMandate(id) {
  const res = await fetch(`${API_BASE_URL}/mandates/${id}/refresh`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function deleteMandate(id) {
  const res = await fetch(`${API_BASE_URL}/mandates/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function cancelMandate(id) {
  const res = await fetch(`${API_BASE_URL}/mandates/${id}/cancel`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function createInstallmentForMandate(mandateId, payload) {
  const res = await fetch(`${API_BASE_URL}/mandates/${mandateId}/installment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

// Get the real-time aggregated metrics for the dashboard
export async function getDashboardMetrics(timeRange = '7days') {
  const res = await fetch(`${API_BASE_URL}/mandates/dashboard?timeRange=${timeRange}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}
