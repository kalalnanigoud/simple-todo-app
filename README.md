# Simple Todo App

A small vanilla JavaScript todo application used as a code-review fixture.

## Features

- Add, toggle, and delete todos
- Filter by status (all / active / completed)
- Persists to `localStorage`

## Getting started

```bash
npm install
npm test
```

Open `index.html` in a browser to use the app.

## Project layout

```
src/
  todo.js      todo list logic
  storage.js   localStorage persistence
  app.js       DOM wiring and rendering
tests/
  todo.test.js
```
