const STORAGE_KEY = "controla.actions.v1";
const STATUSES = ["Pendiente", "En progreso", "Completada"];

const sampleActions = [
  { id: crypto.randomUUID(), title: "Actualizar matriz de riesgos operativos", description: "Revisar controles y asignar responsables para los riesgos críticos.", owner: "Lucía Fernández", priority: "Alta", dueDate: futureDate(2), status: "En progreso", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Documentar proceso de altas de clientes", description: "Centralizar pasos y evidencias del proceso comercial.", owner: "Diego Salas", priority: "Media", dueDate: futureDate(7), status: "Pendiente", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Cerrar observación de control de accesos", description: "Confirmar revisión trimestral de permisos del equipo.", owner: "María Paredes", priority: "Alta", dueDate: futureDate(-1), status: "Completada", createdAt: new Date().toISOString() },
];

let actions = [];
let supabase = null;
const elements = Object.fromEntries([
  ["actionsBody", "actions-body"],
  ["emptyState", "empty-state"],
  ["resultCount", "result-count"],
  ["navCount", "nav-count"],
  ["search", "search"],
  ["statusFilter", "status-filter"],
  ["actionDialog", "action-dialog"],
  ["actionForm", "action-form"],
  ["actionId", "action-id"],
  ["dialogTitle", "dialog-title"],
  ["connectionLabel", "connection-label"],
  ["toast", "toast"],
  ["saveButton", "save-button"],
].map(([property, id]) => [property, document.getElementById(id)]));

function futureDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadLocalActions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : sampleActions;
  } catch (error) {
    console.error("No se pudieron leer las acciones guardadas localmente.", error);
    return sampleActions;
  }
}

async function connectDatabase() {
  try {
    const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = await import("./config.js");
    if (!SUPABASE_URL.includes("supabase.co") || SUPABASE_PUBLISHABLE_KEY.startsWith("TU_")) {
      loadDemoMode();
      return;
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await client.from("actions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    supabase = client;
    actions = data.map(fromDatabase);
    elements.connectionLabel.textContent = "Supabase conectado";
    document.querySelector(".connection-pill").classList.add("connected");
    render();
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") console.error("No se pudo conectar a Supabase; se mantiene el modo local.", error);
    loadDemoMode();
  }
}

function loadDemoMode() {
  supabase = null;
  actions = loadLocalActions();
  elements.connectionLabel.textContent = "Modo demostración";
  document.querySelector(".connection-pill").classList.remove("connected");
  render();
}

function fromDatabase(row) {
  return { id: row.id, title: row.title, description: row.description ?? "", owner: row.owner, priority: row.priority, dueDate: row.due_date, status: row.status, createdAt: row.created_at };
}

function toDatabase(action) {
  return { title: action.title, description: action.description, owner: action.owner, priority: action.priority, due_date: action.dueDate, status: action.status };
}

function persistLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

function isOverdue(action) {
  return action.status !== "Completada" && action.dueDate < futureDate(0);
}

function render() {
  const query = elements.search.value.trim().toLocaleLowerCase("es");
  const statusFilter = elements.statusFilter.value;
  const filtered = actions.filter((action) => {
    const searchable = `${action.title} ${action.owner} ${action.description}`.toLocaleLowerCase("es");
    return searchable.includes(query) && (statusFilter === "Todas" || action.status === statusFilter);
  });

  elements.actionsBody.replaceChildren(...filtered.map(createRow));
  elements.emptyState.hidden = filtered.length > 0;
  elements.resultCount.textContent = `Mostrando ${filtered.length} ${filtered.length === 1 ? "acción" : "acciones"}`;
  elements.navCount.textContent = actions.length;
  document.getElementById("stat-total").textContent = actions.length;
  document.getElementById("stat-progress").textContent = actions.filter((action) => action.status === "En progreso").length;
  document.getElementById("stat-done").textContent = actions.filter((action) => action.status === "Completada").length;
  document.getElementById("stat-overdue").textContent = actions.filter(isOverdue).length;
}

function createRow(action) {
  const row = document.createElement("tr");
  const actionCell = document.createElement("td");
  actionCell.className = "action-cell";
  const title = document.createElement("strong");
  title.textContent = action.title;
  const description = document.createElement("small");
  description.textContent = action.description || "Sin descripción";
  actionCell.append(title, description);

  const ownerCell = document.createElement("td");
  ownerCell.innerHTML = `<span class="owner-avatar">${escapeHtml(initials(action.owner))}</span><span class="owner-name"></span>`;
  ownerCell.querySelector(".owner-name").textContent = action.owner;

  const priorityCell = document.createElement("td");
  const priority = document.createElement("span");
  priority.className = `priority ${action.priority.toLowerCase()}`;
  priority.innerHTML = `<i></i>${escapeHtml(action.priority)}`;
  priorityCell.append(priority);

  const dateCell = document.createElement("td");
  dateCell.className = isOverdue(action) ? "date-overdue" : "";
  dateCell.textContent = formatDate(action.dueDate);

  const statusCell = document.createElement("td");
  const status = document.createElement("select");
  status.className = `status-select ${statusClass(action.status)}`;
  status.setAttribute("aria-label", `Cambiar estado de ${action.title}`);
  for (const label of STATUSES) {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    status.append(option);
  }
  status.value = action.status;
  status.addEventListener("change", () => changeStatus(action.id, status.value));
  statusCell.append(status);

  const menuCell = document.createElement("td");
  menuCell.className = "row-actions";
  const edit = createIconButton("Editar acción", "✎", () => openDialog(action));
  const remove = createIconButton("Eliminar acción", "⌫", () => deleteAction(action));
  menuCell.append(edit, remove);
  row.append(actionCell, ownerCell, priorityCell, dateCell, statusCell, menuCell);
  return row;
}

function createIconButton(label, icon, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "row-icon-button";
  button.setAttribute("aria-label", label);
  button.textContent = icon;
  button.addEventListener("click", onClick);
  return button;
}

function statusClass(status) {
  return status === "Completada" ? "done" : status === "En progreso" ? "in-progress" : "pending";
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

async function changeStatus(id, status) {
  const action = actions.find((item) => item.id === id);
  if (!action) return;
  if (supabase) {
    const { error } = await supabase.from("actions").update({ status }).eq("id", id);
    if (error) return showToast("No se pudo actualizar el estado. Intenta de nuevo.", true);
  }
  action.status = status;
  if (!supabase) persistLocal();
  render();
  showToast("Estado actualizado.");
}

async function deleteAction(action) {
  if (!window.confirm(`¿Eliminar “${action.title}”? Esta acción no se puede deshacer.`)) return;
  if (supabase) {
    const { error } = await supabase.from("actions").delete().eq("id", action.id);
    if (error) return showToast("No se pudo eliminar la acción. Intenta de nuevo.", true);
  }
  actions = actions.filter((item) => item.id !== action.id);
  if (!supabase) persistLocal();
  render();
  showToast("Acción eliminada.");
}

function openDialog(action = null) {
  elements.actionForm.reset();
  elements.actionId.value = action?.id ?? "";
  elements.dialogTitle.textContent = action ? "Editar acción" : "Nueva acción";
  document.getElementById("title").value = action?.title ?? "";
  document.getElementById("description").value = action?.description ?? "";
  document.getElementById("owner").value = action?.owner ?? "";
  document.getElementById("due-date").value = action?.dueDate ?? futureDate(7);
  document.getElementById("priority").value = action?.priority ?? "Media";
  document.getElementById("status").value = action?.status ?? "Pendiente";
  elements.actionDialog.showModal();
}

elements.actionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(elements.actionForm);
  const existingId = elements.actionId.value;
  const current = actions.find((action) => action.id === existingId);
  const action = {
    id: existingId || crypto.randomUUID(),
    title: form.get("title").trim(),
    description: form.get("description").trim(),
    owner: form.get("owner").trim(),
    dueDate: form.get("dueDate"),
    priority: form.get("priority"),
    status: form.get("status"),
    createdAt: current?.createdAt ?? new Date().toISOString(),
  };

  elements.saveButton.disabled = true;
  try {
    if (supabase) {
      const request = existingId
        ? supabase.from("actions").update(toDatabase(action)).eq("id", existingId)
        : supabase.from("actions").insert(toDatabase(action));
      const { error } = await request;
      if (error) throw error;
    }
    if (existingId) actions = actions.map((item) => item.id === existingId ? action : item);
    else actions.unshift(action);
    if (!supabase) persistLocal();
    elements.actionDialog.close();
    render();
    showToast(existingId ? "Acción actualizada." : "Acción creada.");
  } catch (error) {
    console.error("No se pudo guardar la acción.", error);
    showToast("No se pudo guardar. Revisa la conexión con la base de datos.", true);
  } finally {
    elements.saveButton.disabled = false;
  }
});

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("visible");
  window.setTimeout(() => elements.toast.classList.remove("visible"), 2800);
}

document.getElementById("new-action").addEventListener("click", () => openDialog());
document.getElementById("empty-create").addEventListener("click", () => openDialog());
document.getElementById("close-dialog").addEventListener("click", () => elements.actionDialog.close());
document.getElementById("cancel-dialog").addEventListener("click", () => elements.actionDialog.close());
elements.search.addEventListener("input", render);
elements.statusFilter.addEventListener("change", render);
document.getElementById("refresh").addEventListener("click", () => supabase ? connectDatabase() : render());

connectDatabase();
