import API_BASE_URL from '../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt') || ''}`
});

// ── Installment APIs ──────────────────────────────────────────────────────────

export async function listInstallments(mandateId) {
  const res = await fetch(`${API_BASE_URL}/installments?mandate_id=${mandateId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function getInstallment(id) {
  const res = await fetch(`${API_BASE_URL}/installments/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function refreshInstallment(id) {
  const res = await fetch(`${API_BASE_URL}/installments/${id}/refresh`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function skipInstallment(id) {
  const res = await fetch(`${API_BASE_URL}/installments/${id}/skip`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}

export async function retryInstallment(id, scheduleDate) {
  const res = await fetch(`${API_BASE_URL}/installments/${id}/retry`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ schedule_date: scheduleDate }),
  });
  if (!res.ok) throw new Error((await res.json())?.message || res.statusText);
  return res.json();
}
