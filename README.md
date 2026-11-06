# oscar-leung.github.io

The one-page portfolio site at [oscar-leung.github.io](https://oscar-leung.github.io): QA automation and SDET work, the 2026 projects (Job Radar, labeleval, Retrace), and a downloadable resume and CV.

Static HTML, CSS and JavaScript. No build step, no framework, no dependencies. GitHub Pages serves the repo root from `main`.

## What is here

| Path | Purpose |
|---|---|
| `index.html` | The site. Projects, timeline, skills, contact. |
| `resume.html`, `resume.pdf`, `cv.pdf` | Resume and CV. The PDFs are exported by hand from the current source document; replace them together. |
| `css/`, `js/`, `assets/` | Styles, the small amount of script, images and icons. |
| `og-image.png`, `og-image.svg` | Social preview card. Edit the SVG, re-export the PNG at 1200x630. |
| `sitemap.xml`, `sitemap-portfolio.xml`, `robots.txt` | Search engine plumbing. Add a line to the sitemap when a page is added. |
| `ads.txt`, `google*.html` | AdSense and Search Console verification. Leave as is. |

## Run it locally

```bash
git clone https://github.com/oscar-leung/oscar-leung.github.io
cd oscar-leung.github.io
python3 -m http.server 8000
# open http://localhost:8000
```

## Checks before pushing

- Every `github.com/oscar-leung/...` link points at a repo that exists and is not archived.
- The project cards match the pinned repos on the GitHub profile.
- `resume.pdf` and `cv.pdf` were exported from the same version of the source document.

## License

Code (HTML, CSS, JavaScript) is MIT, see [LICENSE](LICENSE). The written content, resume, CV and images are © Oscar Leung, all rights reserved.
