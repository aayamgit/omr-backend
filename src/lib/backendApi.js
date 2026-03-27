const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function parseJson(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export async function apiGetMe() {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  return parseJson(res);
}

export async function apiListTemplates() {
  const res = await fetch('/api/template/list', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  return parseJson(res);
}

export async function apiSaveTemplate(payload) {
  const res = await fetch('/api/template/save', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson(res);
}

export async function apiWalletSummary() {
  const res = await fetch('/api/wallet/summary', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  return parseJson(res);
}

export async function apiDeductCredits(payload) {
  const res = await fetch('/api/wallet/deduct', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson(res);
}

export async function apiSaveScanLog(payload) {
  const res = await fetch('/api/scan/log', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson(res);
}