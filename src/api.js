const BASE_URL = "http://localhost:8080/api";

export function getAuthHeader(email, password) {
  return "Basic " + btoa(`${email}:${password}`);
}

export async function apiGet(path, auth) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost(path, body, auth) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
export async function apiPostNoBody(path, auth) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
export async function apiPostPublic(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.text();
}