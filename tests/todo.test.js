import { describe, it, expect, beforeEach } from 'vitest';
import { TodoList } from '../src/todo.js';

describe('TodoList', () => {
  let list;

  beforeEach(() => {
    list = new TodoList();
  });

  describe('addTodo', () => {
    it('adds a todo with a trimmed title', () => {
      const todo = list.addTodo('  buy milk  ');

      expect(todo.title).toBe('buy milk');
      expect(todo.completed).toBe(false);
      expect(list.todos).toHaveLength(1);
    });

    it('throws on an empty title', () => {
      expect(() => list.addTodo('   ')).toThrow('Todo title is required');
    });
  });

  describe('toggleTodo', () => {
    it('flips the completed flag', () => {
      const todo = list.addTodo('write tests');

      expect(list.toggleTodo(todo.id).completed).toBe(true);
      expect(list.toggleTodo(todo.id).completed).toBe(false);
    });

    it('returns null for an unknown id', () => {
      expect(list.toggleTodo(9999)).toBeNull();
    });
  });

  describe('getTodos', () => {
    it('filters by active status', () => {
      const first = list.addTodo('one');
      list.addTodo('two');
      list.toggleTodo(first.id);

      expect(list.getTodos('active')).toHaveLength(1);
      expect(list.getTodos('active')[0].title).toBe('two');
    });
  });
});
