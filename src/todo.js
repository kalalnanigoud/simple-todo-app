/**
 * Core todo list logic.
 *
 * A TodoList owns an array of todo objects:
 *   { id, title, completed, createdAt }
 */

let nextId = 1;

export class TodoList {
  constructor(todos = []) {
    this.todos = todos;
  }

  /**
   * Add a todo to the list.
   * @param {string} title
   * @returns {object} the created todo
   */
  addTodo(title) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new Error('Todo title is required');
    }

    const todo = {
      id: nextId++,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(todo);
    return todo;
  }

  /**
   * Flip the completed flag on a todo.
   * @param {number} id
   * @returns {object|null} the updated todo, or null when not found
   */
  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      return null;
    }

    todo.completed = !todo.completed;
    return todo;
  }

  /**
   * Remove a todo from the list.
   * @param {number} id
   * @returns {boolean} whether a todo was removed
   */
  deleteTodo(id) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }

    this.todos.splice(index, 1);
    return true;
  }

  /**
   * Return todos matching a status filter.
   * @param {'all'|'active'|'completed'} filter
   */
  getTodos(filter = 'all') {
    switch (filter) {
      case 'active':
        return this.todos.filter((t) => !t.completed);
      case 'completed':
        return this.todos.filter((t) => t.completed);
      case 'all':
        return [...this.todos];
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  }

  /** Number of todos still open. */
  remainingCount() {
    return this.todos.filter((t) => !t.completed).length;
  }

  /** Drop every completed todo, returning how many were removed. */
  clearCompleted() {
    const before = this.todos.length;
    this.todos = this.todos.filter((t) => !t.completed);
    return before - this.todos.length;
  }
}
