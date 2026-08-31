/**
 * Persistence for the todo list, backed by localStorage.
 */

const STORAGE_KEY = 'simple-todo-app:todos';

/**
 * Read the saved todos.
 * @returns {Array<object>} the stored todos, or an empty array
 */
export function loadTodos() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupted payload: start clean rather than breaking the app.
    return [];
  }
}

/**
 * Persist the todos.
 * @param {Array<object>} todos
 */
export function saveTodos(todos) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** Remove everything this app has stored. */
export function clearTodos() {
  window.localStorage.removeItem(STORAGE_KEY);
}
