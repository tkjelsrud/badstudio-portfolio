 # Bad Studio — static site

This repository is a lightweight Jekyll-based static site using a small set of reusable includes and CSS files.

Local preview (two easy options):

1) Docker (no Ruby install required)

```bash
# from repo root
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll -w /srv/jekyll jekyll/jekyll:latest \
	sh -c "gem install webrick --no-document >/dev/null && jekyll serve --host 0.0.0.0 --watch"
# open http://localhost:4000
```

2) Native Jekyll (if you have Ruby/Jekyll installed)

```bash
bundle exec jekyll serve --livereload
# or
jekyll serve --livereload
# open http://localhost:4000
```

Publish to GitHub Pages (simple):

- Push this repository to GitHub (e.g., `origin/main`).
- In the repository settings → Pages, set the source to `main` (or `master`) branch and the root `/` (the repository root). GitHub Pages will build the site with Jekyll automatically.
- If you use a custom domain, keep the `CNAME` file in the repo (already present) and add the domain in Pages settings.

Notes and troubleshooting:
- GitHub Pages runs Jekyll with a whitelist of plugins. Do not add plugins to `_config.yml` unless you plan to build with GitHub Actions.
- If your site requires a plugin not supported by Pages, I can add a GitHub Actions workflow that builds the site and deploys the `_site` output to the `gh-pages` branch.

What I can do next for you:
- Convert the remaining HTML pages to Jekyll pages (I already converted `index.html` and `about.html`).
- Add a GitHub Actions deploy workflow if you want full control over the build and plugins.
- Verify Pages settings and the DNS/CNAME configuration if you provide the GitHub repo URL and/or custom domain.

Want me to add a GitHub Actions workflow to build & deploy automatically? (recommended if you need non-standard gems/plugins.)

