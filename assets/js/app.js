'use strict';

(function() {
  var IDEAS_URL = 'data/ideas.json';

  function createElement(tagName, options) {
    var element = document.createElement(tagName);

    if (!options) {
      return element;
    }

    if (options.className) {
      element.className = options.className;
    }

    if (options.text) {
      element.textContent = options.text;
    }

    if (options.attributes) {
      Object.keys(options.attributes).forEach(function(name) {
        element.setAttribute(name, options.attributes[name]);
      });
    }

    return element;
  }

  function formatDate(dateString) {
    var date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? dateString : date.toLocaleString();
  }

  function createBadge(text, className) {
    return createElement('span', {
      className: 'badge ' + className,
      text: text
    });
  }

  function createDetailItem(term, description) {
    var fragment = document.createDocumentFragment();
    fragment.appendChild(createElement('dt', {text: term}));
    fragment.appendChild(createElement('dd', {text: description}));
    return fragment;
  }

  function createTagList(tags) {
    var list = createElement('ul', {className: 'tag-list mb-4'});

    tags.forEach(function(tag) {
      var item = createElement('li');
      item.appendChild(createBadge(
          tag,
          'text-bg-primary-subtle text-primary-emphasis'
      ));
      list.appendChild(item);
    });

    return list;
  }

  function createLinksList(links) {
    if (!links.length) {
      return createElement('p', {
        className: 'mb-0 text-body-secondary',
        text: 'No supporting links yet.'
      });
    }

    var list = createElement('ul', {className: 'list-group list-group-flush'});

    links.forEach(function(link) {
      var item = createElement('li', {className: 'list-group-item px-0'});
      var anchor = createElement('a', {
        className: 'text-decoration-none',
        attributes: {
          href: link.url
        }
      });
      var icon = createElement('i', {
        className: 'bi bi-link-45deg me-1',
        attributes: {
          'aria-hidden': 'true'
        }
      });
      var label = createElement('span', {
        className: 'fw-semibold',
        text: link.description
      });
      var meta = createElement('div', {
        className: 'small text-body-secondary',
        text: link.type
      });

      anchor.appendChild(icon);
      anchor.appendChild(label);
      item.appendChild(anchor);
      item.appendChild(meta);
      list.appendChild(item);
    });

    return list;
  }

  function createNotesList(notes) {
    if (!notes.length) {
      return createElement('p', {
        className: 'mb-0 text-body-secondary',
        text: 'No notes yet.'
      });
    }

    var container = createElement('div', {className: 'vstack gap-3'});

    notes.forEach(function(note) {
      var noteCard = createElement('section', {className: 'border rounded-3 p-3'});
      var title = createElement('h4', {className: 'h6 mb-1', text: note.title});
      var text = createElement('p', {className: 'mb-2', text: note.text});
      var meta = createElement('p', {
        className: 'small text-body-secondary mb-0',
        text: note.author + ' · ' + formatDate(note.date)
      });

      noteCard.appendChild(title);
      noteCard.appendChild(text);
      noteCard.appendChild(meta);
      container.appendChild(noteCard);
    });

    return container;
  }

  function createUserStory(idea) {
    var column = createElement('div', {className: 'col-md-6'});
    var heading = createElement('h4', {className: 'h5', text: 'User story'});
    var details = createElement('dl', {className: 'detail-list mb-0'});

    details.appendChild(createDetailItem('As a', idea.userStory.asA));
    details.appendChild(createDetailItem('I want', idea.userStory.iWant));
    details.appendChild(createDetailItem('So that', idea.userStory.soThat));

    column.appendChild(heading);
    column.appendChild(details);
    return column;
  }

  function createIdeaDetails(idea) {
    var column = createElement('div', {className: 'col-md-6'});
    var heading = createElement('h4', {className: 'h5', text: 'Idea details'});
    var details = createElement('dl', {className: 'detail-list mb-0'});

    details.appendChild(createDetailItem('Author', idea.author));
    details.appendChild(createDetailItem('Status', idea.status));
    details.appendChild(createDetailItem('Updated', formatDate(idea.modifiedAt)));

    column.appendChild(heading);
    column.appendChild(details);
    return column;
  }

  function createSectionColumn(title, content) {
    var column = createElement('div', {className: 'col-md-6'});
    column.appendChild(createElement('h4', {className: 'h5', text: title}));
    column.appendChild(content);
    return column;
  }

  function createIdeaCard(idea) {
    var wrapper = createElement('div', {className: 'col-12'});
    var article = createElement('article', {className: 'card shadow-sm overflow-hidden'});
    var row = createElement('div', {className: 'row g-0'});
    var imageColumn = createElement('div', {className: 'col-lg-5'});
    var contentColumn = createElement('div', {className: 'col-lg-7'});
    var body = createElement('div', {className: 'card-body p-4'});
    var badgeRow = createElement('div', {
      className: 'd-flex flex-wrap align-items-center gap-2 mb-3'
    });
    var title = createElement('h3', {className: 'card-title h2 mb-2', text: idea.title});
    var tagline = createElement('p', {
      className: 'fs-5 text-body-secondary mb-3',
      text: idea.tagline
    });
    var narrative = createElement('p', {className: 'mb-4', text: idea.narrative});
    var sectionsRow = createElement('div', {className: 'row g-4'});
    var image = createElement('img', {
      className: 'img-fluid w-100 h-100 idea-image',
      attributes: {
        src: idea.image,
        alt: idea.title + ' preview'
      }
    });

    badgeRow.appendChild(createBadge(idea.status, 'text-bg-success'));
    if (idea.favorite) {
      badgeRow.appendChild(createBadge('Favorite', 'text-bg-warning'));
    }

    sectionsRow.appendChild(createUserStory(idea));
    sectionsRow.appendChild(createIdeaDetails(idea));
    sectionsRow.appendChild(createSectionColumn('Helpful links', createLinksList(idea.links)));
    sectionsRow.appendChild(createSectionColumn('Notes', createNotesList(idea.notes)));

    imageColumn.appendChild(image);
    body.appendChild(badgeRow);
    body.appendChild(title);
    body.appendChild(tagline);
    body.appendChild(narrative);
    body.appendChild(createTagList(idea.tags));
    body.appendChild(sectionsRow);
    contentColumn.appendChild(body);
    row.appendChild(imageColumn);
    row.appendChild(contentColumn);
    article.appendChild(row);
    wrapper.appendChild(article);

    return wrapper;
  }

  function renderIdeas(ideas) {
    var ideaList = document.querySelector('#idea-list');
    var statusMessage = document.querySelector('#status-message');

    if (!Array.isArray(ideas) || !ideas.length) {
      statusMessage.textContent = 'No ideas were returned from the JSON file.';
      return;
    }

    ideaList.replaceChildren();
    ideas.forEach(function(idea) {
      ideaList.appendChild(createIdeaCard(idea));
    });
    statusMessage.textContent = 'Loaded ' + ideas.length + ' idea from local JSON.';
  }

  function showError() {
    var statusMessage = document.querySelector('#status-message');
    statusMessage.textContent = 'Could not load the local JSON file, so the placeholder stays visible.';
  }

  function loadIdeas() {
    fetch(IDEAS_URL)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Request failed');
          }

          return response.json();
        })
        .then(renderIdeas)
        .catch(showError);
  }

  document.addEventListener('DOMContentLoaded', loadIdeas);
})();
