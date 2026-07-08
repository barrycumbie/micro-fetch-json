# micro-fetch-json

Small teaching demo that fetches a local JSON file and renders one app idea into the DOM.

## Run locally

Because the page uses `fetch()` to load `/home/runner/work/micro-fetch-json/micro-fetch-json/data/ideas.json`, serve the project over HTTP instead of opening `index.html` directly from the file system.

Example:

```bash
cd /home/runner/work/micro-fetch-json/micro-fetch-json
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/index.html`.
