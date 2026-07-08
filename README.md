# micro-fetch-json

> teaching demo that uses the Fetch API to load a local JSON file and render app idea data into the DOM.

## What is the Fetch API?

The Fetch API is the modern browser API for making HTTP requests from JavaScript.

In plain terms: it lets your frontend ask for data (usually JSON), wait for the server response, and then update the page.

## Quick CORS intro

CORS (Cross-Origin Resource Sharing) is a browser security rule that controls whether one origin can request data from another origin.

An origin is the combination of protocol + host + port, for example:

1. `http://localhost:8000`
2. `https://api.example.com`

If your frontend and API are on different origins, the API must allow that origin with CORS headers (for example `Access-Control-Allow-Origin`) or the browser will block the response.

In this repo, `index.html` and `data/ideas.json` are served from the same origin, so CORS is not the main issue. The bigger local gotcha is serving over HTTP instead of opening the file directly.

## Fetch compared to other ways to get data

Common options in frontend apps:

1. Fetch API (built into modern browsers)
2. XMLHttpRequest (older browser API)
3. jQuery `$.ajax()` / `$.getJSON()` (library wrapper)
4. Axios (third-party HTTP client)

Quick comparison:

| Option | Built in? | Promise-based? | Best use |
| --- | --- | --- | --- |
| Fetch API | Yes | Yes | Default choice in modern browser apps |
| XMLHttpRequest | Yes | No (callback/event style) | Legacy codebases |
| jQuery AJAX | No (requires jQuery) | Usually callback/deferred style | jQuery-heavy legacy projects |
| Axios | No (install dependency) | Yes | Apps that want interceptors, request cancellation helpers, and richer defaults |

Why Fetch is usually preferred:

1. No extra dependency to install
2. Promise-based and works cleanly with `async/await`
3. Standard web platform API (widely documented and supported)

## When and why to use Fetch

Use Fetch when your page needs data that is not hardcoded in the HTML.

Common scenarios:

1. Load JSON from your backend API
2. Submit forms asynchronously (`POST`, `PUT`, `DELETE`)
3. Refresh parts of a page without full reloads
4. Load local/static JSON in demos and prototypes (like this repo)

## How Fetch works

Typical flow:

1. Call `fetch(url, options)`
2. Wait for the response Promise to resolve
3. Check `response.ok` and status code
4. Parse the response body (usually `response.json()`)
5. Render the data, or show an error state

Important detail: Fetch only rejects on network-level failures. HTTP errors like `404` or `500` still resolve, so check `response.ok` yourself.

## What `fetch()` returns

`fetch()` returns a Promise that resolves to a `Response` object.

Useful `Response` properties/methods:

1. `response.ok`: `true` for HTTP 2xx, otherwise `false`
2. `response.status`: numeric status code (`200`, `404`, `500`, etc.)
3. `response.statusText`: status text (`OK`, `Not Found`, etc.)
4. `response.headers`: response headers
5. `response.json()`: parse body as JSON (returns another Promise)
6. `response.text()`: parse body as plain text

Example mental model:

1. `fetch(...)` gives you metadata first (`status`, `ok`, headers)
2. You choose how to read the body (`json()`, `text()`, etc.)
3. The parsed body is the actual data you render/use in your app

## What the returned data usually looks like

For JSON APIs, parsed data is commonly one of these shapes:

1. Array of items

```json
[
	{"id": 1, "name": "Item A"},
	{"id": 2, "name": "Item B"}
]
```

2. Single object

```json
{
	"id": 42,
	"name": "One item",
	"status": "active"
}
```

3. Wrapped payload (metadata + data)

```json
{
	"data": [
		{"id": 1, "name": "Item A"}
	],
	"total": 1,
	"page": 1
}
```

How to use it safely:

1. Log the parsed value once during development (`console.log(data)`)
2. Verify expected type (`Array.isArray(data)` or object checks)
3. Handle empty states (`[]`, missing fields)
4. Map only the fields your UI needs

## Simple code examples

### 1) Basic GET request

```js
fetch('/api/items')
	.then(function(response) {
		// Fetch resolves even on 404/500, so we check HTTP status ourselves.
		if (!response.ok) {
			throw new Error('Request failed: ' + response.status);
		}

		// Parse response body from JSON text to a real JS value.
		// This returns a Promise.
		return response.json();
	})
	.then(function(data) {
		// `data` is now parsed JSON (array/object, depending on API).
		console.log('Items:', data);
	})
	.catch(function(error) {
		// Catches network failures and errors thrown above.
		console.error('Fetch error:', error.message);
	});
```

### 2) GET request with async/await

```js
async function loadItems() {
	try {
		// Step 1: request data from the endpoint.
		var response = await fetch('/api/items');

		// Step 2: validate the HTTP response.
		if (!response.ok) {
			throw new Error('Request failed: ' + response.status);
		}

		// Step 3: parse JSON body into a JS value.
		var data = await response.json();

		// Step 4: use the parsed data.
		console.log('Items:', data);
	} catch (error) {
		// Handles network errors + thrown status errors.
		console.error('Fetch error:', error.message);
	}
}
```

### 3) POST JSON data

```js
fetch('/api/items', {
	method: 'POST',
	headers: {
		// Tell the server that request body is JSON.
		'Content-Type': 'application/json'
	},
	// Convert JS object to JSON string for transport.
	body: JSON.stringify({name: 'New item'})
})
	.then(function(response) {
		if (!response.ok) {
			throw new Error('Create failed: ' + response.status);
		}

		// Many APIs return the created resource as JSON.
		return response.json();
	})
	.then(function(createdItem) {
		// `createdItem` is parsed JSON from server response.
		console.log('Created:', createdItem);
	})
	.catch(function(error) {
		console.error(error.message);
	});
```

### 4) Shape-checking before rendering

```js
fetch('/api/items')
	.then(function(response) {
		if (!response.ok) {
			throw new Error('Request failed: ' + response.status);
		}
		return response.json();
	})
	.then(function(data) {
		// Guard against unexpected API payload shape.
		if (!Array.isArray(data)) {
			throw new Error('Expected an array of items.');
		}

		data.forEach(function(item) {
			// Use only the properties you expect in UI.
			console.log(item.id, item.name);
		});
	})
	.catch(function(error) {
		console.error(error.message);
	});
```

## How this repo uses Fetch

This app demonstrates a classic read-and-render pattern:

1. The page shows placeholder card content first.
2. On `DOMContentLoaded`, JavaScript runs `loadIdeas()`.
3. `loadIdeas()` calls `fetch('data/ideas.json')`.
4. The code checks `response.ok` and throws a custom error if needed.
5. It parses JSON with `response.json()`.
6. `renderIdeas()` builds DOM nodes and replaces placeholder content.
7. If anything fails, `showError()` updates the status message.

The JSON file in this repo is an array of idea objects containing fields such as:

1. `title`, `tagline`, `narrative`
2. `userStory` object
3. `links` array
4. `notes` array
5. metadata like `status`, `author`, and timestamps

What `response.json()` looks like in this repo:

```js
[
	{
		id: 'idea-1751932800000',
		title: 'LEGO Set Match Builder',
		tags: ['lego', 'inventory', 'search', 'recommendation'],
		userStory: {
			asA: 'LEGO collector',
			iWant: 'to enter one piece and compare it to the sets I already own',
			soThat: 'I can quickly figure out where the piece belongs and what sets may be incomplete'
		},
		links: [
			{type: 'repo', description: 'Prototype repository', url: '...'}
		],
		notes: [
			{id: 'note-...', title: 'First demo scope', text: '...', author: 'bcumbie', date: '...'}
		]
	}
]
```

How the app uses that shape:

1. `renderIdeas(ideas)` expects an array and checks for empty/invalid data.
2. It loops each `idea` and passes it to `createIdeaCard(idea)`.
3. Card builders read nested fields like `idea.userStory.asA`, `idea.links`, and `idea.notes`.
4. If fetch/parsing fails, `showError()` updates UI status text.

