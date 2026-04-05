const API_URL = "http://localhost:5000";

/* ================= TOKEN ================= */
function getToken() {
  return localStorage.getItem("token");
}

/* ================= SIGNUP ================= */
async function signup() {
  const res = await fetch("http://localhost:5000/auth/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: document.getElementById("sname").value,
      email: document.getElementById("semail").value,
      age: document.getElementById("sage").value,
      password: document.getElementById("spass").value
    })
  });

  alert("Signup done");
}

/* ================= LOGIN ================= */
async function login() {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: document.getElementById("lemail").value,
      password: document.getElementById("lpass").value
    })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "index.html"; // dashboard
  } else {
    alert("Login failed");
  }
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ================= GET USERS ================= */
async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      "Authorization": getToken()
    }
  });

  const data = await res.json();

  const list = document.getElementById("usersList");
  list.innerHTML = "";

  data.forEach(user => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${user.name} (${user.email})
      <button onclick="deleteUser(${user.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

/* ================= CREATE USER ================= */
async function createUser() {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": getToken()
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      age: age.value
    })
  });

  if (res.ok) {
    fetchUsers();
  } else {
    alert("Error creating user");
  }
}

/* ================= DELETE USER ================= */
async function deleteUser(id) {
  await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": getToken()
    }
  });

  fetchUsers();
}

/* ================= AUTO LOAD ================= */
if (window.location.pathname.includes("dashboard.html")) {
  fetchUsers();
}