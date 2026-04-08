const API_URL = "https://user-management-system-yf0m.onrender.com";

/* ================= TOKEN ================= */
function getToken() {
  return localStorage.getItem("token");
}

/* ================= TOAST ================= */
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = (type === "success" ? "✓ " : "✕ ") + msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

/* ================= SIGNUP ================= */
async function signup() {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     document.getElementById("sname").value,
        email:    document.getElementById("semail").value,
        age:      document.getElementById("sage").value,
        password: document.getElementById("spass").value
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Signup successful! Please log in.");
    } else {
      showToast(data.message || "Signup failed", "error");
    }

  } catch (e) {
    showToast("Network error during signup", "error");
  }
}

/* ================= LOGIN ================= */
async function login() {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:    document.getElementById("lemail").value,
        password: document.getElementById("lpass").value
      })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      showToast(data.message || "Login failed", "error");
    }
  } catch (e) {
    showToast("Network error during login", "error");
  }
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ================= STATS ================= */
function updateStats(users) {
  const totalEl = document.getElementById("total-count");
  const avgEl   = document.getElementById("avg-age");
  if (!totalEl || !avgEl) return;

  totalEl.textContent = users.length;

  if (users.length === 0) {
    avgEl.textContent = "—";
    return;
  }
  const avg = users.reduce((sum, u) => sum + Number(u.age), 0) / users.length;
  avgEl.textContent = avg.toFixed(1);
}

/* ================= RENDER TABLE ================= */
function renderUsers(users) {
  const tbody      = document.getElementById("users-tbody");
  const emptyState = document.getElementById("empty-state");
  const loadState  = document.getElementById("loading-state");

  if (!tbody) return;

  if (loadState) loadState.style.display = "none";

  if (users.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = users.map(user => `
    <tr id="row-${user.id}">
      <td>#${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${user.age}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="startEdit(${user.id}, '${escapeHtml(user.name)}', '${escapeHtml(user.email)}', ${user.age})">Edit</button>
          <button class="btn btn-delete" onclick="confirmDelete(${user.id}, '${escapeHtml(user.name)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  updateStats(users);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ================= SEARCH ================= */
let allUsers = [];

function filterUsers(query) {
  const q = query.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
  renderUsers(filtered);
}

/* ================= FETCH USERS ================= */
async function fetchUsers() {
  const loadState = document.getElementById("loading-state");
  if (loadState) loadState.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { "Authorization": getToken() }
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    allUsers = await res.json();
    renderUsers(allUsers);
  } catch (e) {
    if (loadState) loadState.style.display = "none";
    showToast("Failed to load users", "error");
  }
}

/* ================= CREATE / UPDATE USER ================= */
async function submitUser(e) {
  e.preventDefault();

  const id    = document.getElementById("user-id").value;
  const name  = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age   = document.getElementById("age").value.trim();

  if (!name || !email || !age) {
    showToast("All fields are required", "error");
    return;
  }

  const isEdit  = !!id;
  const url     = isEdit ? `${API_URL}/users/${id}` : `${API_URL}/users`;
  const method  = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type":  "application/json",
        "Authorization": getToken()
      },
      body: JSON.stringify({ name, email, age })
    });

    if (res.ok) {
      showToast(isEdit ? "User updated!" : "User created!");
      resetForm();
      fetchUsers();
    } else {
      const err = await res.json();
      showToast(err.message || "Error saving user", "error");
    }
  } catch (e) {
    showToast("Network error", "error");
  }
}

/* ================= EDIT MODE ================= */
function startEdit(id, name, email, age) {
  document.getElementById("user-id").value   = id;
  document.getElementById("name").value      = name;
  document.getElementById("email").value     = email;
  document.getElementById("age").value       = age;

  const formTitle  = document.getElementById("form-title");
  const btnLabel   = document.getElementById("btn-label");
  const cancelBtn  = document.getElementById("cancel-btn");
  const formPanel  = document.querySelector(".form-panel");

  if (formTitle) formTitle.textContent = "Edit User";
  if (btnLabel)  btnLabel.textContent  = "Save Changes";
  if (cancelBtn) cancelBtn.style.display = "inline-flex";
  if (formPanel) formPanel.classList.add("editing");

  // Scroll form into view on mobile
  document.querySelector(".form-panel")?.scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  document.getElementById("user-id").value = "";
  document.getElementById("user-form")?.reset();

  const formTitle = document.getElementById("form-title");
  const btnLabel  = document.getElementById("btn-label");
  const cancelBtn = document.getElementById("cancel-btn");
  const formPanel = document.querySelector(".form-panel");

  if (formTitle) formTitle.textContent = "Add New User";
  if (btnLabel)  btnLabel.textContent  = "Create User";
  if (cancelBtn) cancelBtn.style.display = "none";
  if (formPanel) formPanel.classList.remove("editing");
}

/* ================= DELETE WITH MODAL ================= */
let pendingDeleteId = null;

function confirmDelete(id, name) {
  pendingDeleteId = id;
  const overlay = document.getElementById("modal-overlay");
  const msg     = document.getElementById("modal-msg");
  if (msg) msg.textContent = `Delete "${name}"? This cannot be undone.`;
  if (overlay) overlay.style.display = "flex";
}

async function deleteUser() {
  if (!pendingDeleteId) return;

  try {
    const res = await fetch(`${API_URL}/users/${pendingDeleteId}`, {
      method: "DELETE",
      headers: { "Authorization": getToken() }
    });

    if (res.ok) {
      showToast("User deleted.");
      fetchUsers();
    } else {
      showToast("Failed to delete user", "error");
    }
  } catch (e) {
    showToast("Network error", "error");
  }

  pendingDeleteId = null;
  document.getElementById("modal-overlay").style.display = "none";
}

/* ================= INIT (index.html / dashboard) ================= */
const isMainApp = window.location.pathname.includes("index.html")
               || window.location.pathname === "/"
               || window.location.pathname.endsWith("/");

if (isMainApp) {
  // Auth guard
  if (!getToken()) {
    window.location.href = "login.html";
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();

    // Form submit
    document.getElementById("user-form")
      ?.addEventListener("submit", submitUser);

    // Cancel edit
    document.getElementById("cancel-btn")
      ?.addEventListener("click", resetForm);

    // Refresh button
    document.getElementById("refresh-btn")
      ?.addEventListener("click", function () {
        this.classList.add("spinning");
        fetchUsers().finally(() => this.classList.remove("spinning"));
      });

    // Search
    document.getElementById("search-input")
      ?.addEventListener("input", e => filterUsers(e.target.value));

    // Modal buttons
    document.getElementById("modal-confirm")
      ?.addEventListener("click", deleteUser);

    document.getElementById("modal-cancel")
      ?.addEventListener("click", () => {
        pendingDeleteId = null;
        document.getElementById("modal-overlay").style.display = "none";
      });

    // Close modal on overlay click
    document.getElementById("modal-overlay")
      ?.addEventListener("click", function (e) {
        if (e.target === this) {
          pendingDeleteId = null;
          this.style.display = "none";
        }
      });
  });
}