/* ═══════════════════════════════════════════════════
   USER MANAGEMENT SYSTEM — script.js
   Connects to the Express REST API at http://localhost:5000
   Functions: fetchUsers, createUser, updateUser, deleteUser
═══════════════════════════════════════════════════ */

// ── API base URL — change if your server runs elsewhere ──
const API_URL = "http://localhost:5000/users";

// ── Module-level state ──
let allUsers   = [];       // full list from API (for search filtering)
let deleteId   = null;     // ID pending deletion confirmation

/* ══════════════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════════════ */
const form        = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const nameInput   = document.getElementById("name");
const emailInput  = document.getElementById("email");
const ageInput    = document.getElementById("age");
const formTitle   = document.getElementById("form-title");
const btnLabel    = document.getElementById("btn-label");
const submitBtn   = document.getElementById("submit-btn");
const cancelBtn   = document.getElementById("cancel-btn");
const formPanel   = document.querySelector(".form-panel");

const tbody       = document.getElementById("users-tbody");
const emptyState  = document.getElementById("empty-state");
const loadState   = document.getElementById("loading-state");
const searchInput = document.getElementById("search-input");
const refreshBtn  = document.getElementById("refresh-btn");

const totalCount  = document.getElementById("total-count");
const avgAge      = document.getElementById("avg-age");

const modalOverlay  = document.getElementById("modal-overlay");
const modalMsg      = document.getElementById("modal-msg");
const modalConfirm  = document.getElementById("modal-confirm");
const modalCancel   = document.getElementById("modal-cancel");

/* ══════════════════════════════════════════════════
   TOAST NOTIFICATION
   Shows a temporary success or error message.
══════════════════════════════════════════════════ */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const icon  = type === "success" ? "✔" : "✖";
  toast.textContent = `${icon}  ${message}`;
  toast.className   = `toast ${type} show`;

  // Auto-hide after 3 seconds
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

/* ══════════════════════════════════════════════════
   FETCH ALL USERS  →  GET /users
   Retrieves all users from the API and renders them.
══════════════════════════════════════════════════ */
async function fetchUsers() {
  showLoading(true);
  try {
    const response = await fetch(API_URL);

    // Check if the server responded with an error status
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const users = await response.json();
    allUsers = users;

    renderTable(users);
    updateStats(users);
  } catch (err) {
    console.error("fetchUsers:", err);
    showToast("Could not load users. Is the server running?", "error");
    showLoading(false);
    showEmpty(true);
  }
}

/* ══════════════════════════════════════════════════
   CREATE USER  →  POST /users
   Reads the form inputs and sends a POST request.
══════════════════════════════════════════════════ */
async function createUser(name, email, age) {
  try {
    const response = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, age: Number(age) }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Status ${response.status}`);
    }

    const newUser = await response.json();
    showToast(`User "${newUser.name}" created successfully!`);
    return newUser;
  } catch (err) {
    console.error("createUser:", err);
    showToast(`Failed to create user: ${err.message}`, "error");
    return null;
  }
}

/* ══════════════════════════════════════════════════
   UPDATE USER  →  PUT /users/:id
   Sends updated fields for an existing user.
══════════════════════════════════════════════════ */
async function updateUser(id, name, email, age) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, age: Number(age) }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Status ${response.status}`);
    }

    const updated = await response.json();
    showToast(`User "${updated.name}" updated successfully!`);
    return updated;
  } catch (err) {
    console.error("updateUser:", err);
    showToast(`Failed to update user: ${err.message}`, "error");
    return null;
  }
}

/* ══════════════════════════════════════════════════
   DELETE USER  →  DELETE /users/:id
   Deletes a user by their ID.
══════════════════════════════════════════════════ */
async function deleteUser(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    showToast("User deleted successfully.");
    return true;
  } catch (err) {
    console.error("deleteUser:", err);
    showToast("Failed to delete user.", "error");
    return false;
  }
}

/* ══════════════════════════════════════════════════
   FORM SUBMIT HANDLER
   Decides whether to create or update based on
   whether a user ID is stored in the hidden input.
══════════════════════════════════════════════════ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id    = userIdInput.value.trim();
  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  const age   = ageInput.value.trim();

  // Basic client-side validation
  if (!name || !email || !age) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  // Disable button to prevent double-submit
  submitBtn.disabled = true;

  let success = false;

  if (id) {
    // ── UPDATE existing user ──
    const result = await updateUser(id, name, email, age);
    success = !!result;
  } else {
    // ── CREATE new user ──
    const result = await createUser(name, email, age);
    success = !!result;
  }

  submitBtn.disabled = false;

  if (success) {
    resetForm();
    fetchUsers(); // Refresh the table
  }
});

/* ══════════════════════════════════════════════════
   EDIT BUTTON (table row)
   Populates the form with the user's current data.
══════════════════════════════════════════════════ */
function handleEdit(user) {
  // Populate form fields
  userIdInput.value = user.id;
  nameInput.value   = user.name;
  emailInput.value  = user.email;
  ageInput.value    = user.age;

  // Switch form to "Edit" mode
  formTitle.textContent = "Edit User";
  btnLabel.textContent  = "Update User";
  submitBtn.querySelector(".btn-icon").textContent = "✎";
  cancelBtn.style.display = "inline-flex";

  // Visual indicator that we're in edit mode
  formPanel.classList.add("editing");

  // Scroll the form into view (useful on mobile)
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  nameInput.focus();
}

/* ══════════════════════════════════════════════════
   DELETE BUTTON (table row)
   Opens the confirmation modal before deleting.
══════════════════════════════════════════════════ */
function handleDeleteClick(id, name) {
  deleteId = id;
  modalMsg.textContent = `"${name}" will be permanently removed.`;
  modalOverlay.style.display = "flex";
}

// Modal: Confirm delete
modalConfirm.addEventListener("click", async () => {
  if (!deleteId) return;
  modalOverlay.style.display = "none";

  const success = await deleteUser(deleteId);
  deleteId = null;

  if (success) fetchUsers(); // Refresh table
});

// Modal: Cancel
modalCancel.addEventListener("click", () => {
  modalOverlay.style.display = "none";
  deleteId = null;
});

// Close modal when clicking outside the box
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = "none";
    deleteId = null;
  }
});

/* ══════════════════════════════════════════════════
   CANCEL EDIT
   Resets the form back to "Add" mode.
══════════════════════════════════════════════════ */
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  userIdInput.value       = "";
  formTitle.textContent   = "Add New User";
  btnLabel.textContent    = "Create User";
  submitBtn.querySelector(".btn-icon").textContent = "+";
  cancelBtn.style.display = "none";
  formPanel.classList.remove("editing");
}

/* ══════════════════════════════════════════════════
   REFRESH BUTTON
══════════════════════════════════════════════════ */
refreshBtn.addEventListener("click", () => {
  refreshBtn.classList.add("spinning");
  fetchUsers().finally(() => {
    setTimeout(() => refreshBtn.classList.remove("spinning"), 600);
  });
});

/* ══════════════════════════════════════════════════
   SEARCH / FILTER
   Filters the local `allUsers` array by name or email
   without making extra API calls.
══════════════════════════════════════════════════ */
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) {
    renderTable(allUsers);
    return;
  }
  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
  );
  renderTable(filtered);
});

/* ══════════════════════════════════════════════════
   RENDER TABLE
   Builds the <tbody> rows from a users array.
══════════════════════════════════════════════════ */
function renderTable(users) {
  showLoading(false);

  if (!users || users.length === 0) {
    tbody.innerHTML = "";
    showEmpty(true);
    return;
  }

  showEmpty(false);

  // Build all rows as an HTML string (fast DOM update)
  tbody.innerHTML = users
    .map(
      (user) => `
        <tr id="row-${user.id}">
          <td>#${user.id}</td>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${user.age}</td>
          <td>
            <div class="action-btns">
              <button
                class="btn btn-edit"
                onclick="handleEdit(${JSON.stringify(user).replace(/"/g, '&quot;')})"
                title="Edit user"
              >Edit</button>
              <button
                class="btn btn-delete"
                onclick="handleDeleteClick(${user.id}, '${escapeHtml(user.name)}')"
                title="Delete user"
              >Delete</button>
            </div>
          </td>
        </tr>`
    )
    .join("");
}

/* ══════════════════════════════════════════════════
   UPDATE STATS (total count + average age)
══════════════════════════════════════════════════ */
function updateStats(users) {
  totalCount.textContent = users.length;

  if (users.length === 0) {
    avgAge.textContent = "—";
    return;
  }

  const avg = users.reduce((sum, u) => sum + Number(u.age), 0) / users.length;
  avgAge.textContent = avg.toFixed(1);
}

/* ══════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════ */
function showLoading(visible) {
  loadState.style.display = visible ? "block" : "none";
  if (visible) tbody.innerHTML = "";
}

function showEmpty(visible) {
  emptyState.style.display = visible ? "block" : "none";
}

// Prevents XSS from user-supplied data being injected into the DOM
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ══════════════════════════════════════════════════
   INIT — load users when page first loads
══════════════════════════════════════════════════ */
fetchUsers();
