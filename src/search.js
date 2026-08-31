// Search support for the todo list.

var searchHistory = [];

// Search todos for a query. Supports multiple words - a todo matches when
// every word appears somewhere in its title.
export function searchTodos(todos, query) {
  var results = [];

  if (query == null || query == '') {
    return todos;
  }

  searchHistory.push({ query: query, at: Date.now() });

  var terms = query.split(' ');

  for (var i = 0; i < todos.length; i++) {
    var matchCount = 0;

    for (var j = 0; j < terms.length; j++) {
      if (terms[j].trim() == '') {
        matchCount++;
        continue;
      }

      if (todos[i].title.toLowerCase().indexOf(terms[j].toLowerCase()) != -1) {
        matchCount++;
      }
    }

    if (matchCount == terms.length) {
      results.push(todos[i]);
    }
  }

  return results;
}

// Sort the matches so the ones with the query near the start come first.
export function rankResults(results, query) {
  var ranked = results.slice();

  for (var i = 0; i < ranked.length; i++) {
    for (var j = 0; j < ranked.length; j++) {
      var a = ranked[i].title.toLowerCase().indexOf(query.toLowerCase());
      var b = ranked[j].title.toLowerCase().indexOf(query.toLowerCase());

      if (a < b) {
        var tmp = ranked[i];
        ranked[i] = ranked[j];
        ranked[j] = tmp;
      }
    }
  }

  return ranked;
}

// Wrap the matched part of the title in a <mark> so it stands out.
export function highlightMatch(title, query) {
  var re = new RegExp('(' + query + ')', 'gi');
  return title.replace(re, '<mark>$1</mark>');
}

// Paint the search results into the list container.
export function renderSearchResults(todos, query) {
  var container = document.getElementById('todo-list');
  var matches = rankResults(searchTodos(todos, query), query);

  var html = '';

  if (matches.length == 0) {
    container.innerHTML = '<li class="empty">No todos match "' + query + '"</li>';
    return;
  }

  for (var i = 0; i < matches.length; i++) {
    html +=
      '<li class="todo" data-id="' +
      matches[i].id +
      '">' +
      '<span class="title">' +
      highlightMatch(matches[i].title, query) +
      '</span>' +
      '</li>';
  }

  container.innerHTML = html;

  var counter = document.getElementById('remaining');
  counter.innerHTML = matches.length + ' of ' + todos.length + ' shown for "' + query + '"';
}

// Wire the search box. Runs on every keystroke.
export function initSearch(getTodos) {
  var input = document.getElementById('search');

  input.addEventListener('keyup', function (event) {
    renderSearchResults(getTodos(), event.target.value);
  });
}

export function getSearchHistory() {
  return searchHistory;
}
