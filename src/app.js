/**
 * DOM wiring for the todo app.
 */

import { TodoList } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

const list = new TodoList(loadTodos());
let currentFilter = 'all';

/** Escape text before it goes anywhere near the DOM. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build the list markup for the current filter. */
export function renderTodos(container = document.getElementById('todo-list')) {
  if (!container) {
    return;
  }

  const todos = list.getTodos(currentFilter);
  container.replaceChildren();

  for (const todo of todos) {
    const item = document.createElement('li');
    item.dataset.id = String(todo.id);
    item.className = todo.completed ? 'todo completed' : 'todo';
    item.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''} />
      <span class="title">${escapeHtml(todo.title)}</span>
      <button class="delete" type="button">x</button>
    `;
    container.appendChild(item);
  }

  const counter = document.getElementById('remaining');
  if (counter) {
    counter.textContent = `${list.remainingCount()} remaining`;
  }
}

/** Handle the add-todo form. */
export function handleSubmit(event) {
  event.preventDefault();

  const input = document.getElementById('new-todo');
  if (!input) {
    return;
  }

  try {
    list.addTodo(input.value);
    input.value = '';
    saveTodos(list.todos);
    renderTodos();
  } catch (error) {
    const status = document.getElementById('status');
    if (status) {
      status.textContent = error.message;
    }
  }
}

/** Handle clicks inside the list (toggle and delete). */
export function handleListClick(event) {
  const item = event.target.closest('li[data-id]');
  if (!item) {
    return;
  }

  const id = Number(item.dataset.id);

  if (event.target.matches('input[type="checkbox"]')) {
    list.toggleTodo(id);
  } else if (event.target.matches('button.delete')) {
    list.deleteTodo(id);
  } else {
    return;
  }

  saveTodos(list.todos);
  renderTodos();
}

/** Change the active status filter. */
export function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

export function init() {
  document.getElementById('todo-form')?.addEventListener('submit', handleSubmit);
  document.getElementById('todo-list')?.addEventListener('click', handleListClick);

  for (const button of document.querySelectorAll('[data-filter]')) {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  }

  renderTodos();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
