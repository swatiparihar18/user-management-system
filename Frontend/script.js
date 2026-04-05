if (!localStorage.getItem("token")) {
  alert("Please login first");
}
const API_URL = "http://localhost:5000/users";

let allUsers = [];
let deleteId = null;

/* ================= TOAST ================= */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const icon = type === "success" ? "✔" : "✖";
  toast.textContent = `${icon} ${message}`;
  toast.className = `toast ${type} show`;

  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ================= TOKEN HELPER ================= */
function getToken() {
  return localStorage.getItem("token");
}

/* ================= FETCH USERS ================= */
async function fetchUsers() {
  showLoading(true);
  try {
    const res = await fetch(API_URL, {
      headers: {
        "Authorization": getToken()
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    allUsers = data;

    renderTable(data);
    updateStats(data);
  } catch (err) {
    showToast("Login first!", "error");
    showEmpty(true);
  }
}

/* ================= CREATE ================= */
async function createUser(name, email, age) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ name, email, age: Number(age) })
    });

    if (!res.ok) throw new Error("Error");

    const data = await res.json();
    showToast("User created!");
    return data;
  } catch (err) {
    showToast("Create failed", "error");
    return null;
  }
}

/* ================= UPDATE ================= */
async function updateUser(id, name, email, age) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ name, email, age: Number(age) })
    });

    if (!res.ok) throw new Error("Error");

    const data = await res.json();
    showToast("Updated!");
    return data;
  } catch (err) {
    showToast("Update failed", "error");
    return null;
  }
}

/* ================= DELETE ================= */
async function deleteUser(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": getToken()
      }
    });

    if (!res.ok) throw new Error("Error");

    showToast("Deleted!");
    return true;
  } catch {
    showToast("Delete failed", "error");
    return false;
  }
}

/* ================= SIGNUP ================= */
async function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const age = document.getElementById("age").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/auth/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, age, password })
  });

  if (res.ok) {
    showToast("Signup successful!");
  } else {
    showToast("Signup failed", "error");
  }
}

/* ================= LOGIN ================= */
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    showToast("Login successful!");
    fetchUsers();
  } else {
    showToast("Login failed", "error");
  }
}

/* ================= FORM ================= */
document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("user-id").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const age = document.getElementById("age").value;

  let success;

  if (id) {
    success = await updateUser(id, name, email, age);
  } else {
    success = await createUser(name, email, age);
  }

  if (success) {
    e.target.reset();
    fetchUsers();
  }
});

/* ================= UI ================= */
function renderTable(users) {
  const tbody = document.getElementById("users-tbody");

  if (!users.length) {
    tbody.innerHTML = "";
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.age}</td>
      <td>
        <button onclick="editUser(${u.id}, '${u.name}', '${u.email}', ${u.age})">Edit</button>
        <button onclick="removeUser(${u.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

function editUser(id, name, email, age) {
  document.getElementById("user-id").value = id;
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("age").value = age;
}

async function removeUser(id) {
  const ok = await deleteUser(id);
  if (ok) fetchUsers();
}

function showLoading(show) {
  document.getElementById("loading-state").style.display = show ? "block" : "none";
}

function showEmpty(show) {
  document.getElementById("empty-state").style.display = show ? "block" : "none";
}

function updateStats(users) {
  document.getElementById("total-count").textContent = users.length;
}

/* ================= INIT ================= */
fetchUsers();