const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
const bloodGroupDisplay = {
  A_POS: "A+", A_NEG: "A-",
  B_POS: "B+", B_NEG: "B-",
  AB_POS: "AB+", AB_NEG: "AB-",
  O_POS: "O+", O_NEG: "O-",
};

export function formatBloodGroup(group) {
  return bloodGroupDisplay[group] || group;
}