// login.js
async function loginUser(phone, password) {
  const res = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });

  const data = await res.json();
  console.log(data);
}