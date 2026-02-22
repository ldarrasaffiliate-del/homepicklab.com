# homepicklab.com

Static site (HTML/CSS/vanilla JS).

## Local preview

This site uses root-absolute paths like `/styles.css`, so you need a local HTTP server (opening `index.html` via `file://` won’t load assets correctly).

From the repo folder:

### Windows (Git Bash / PowerShell)

If you need to `cd` first, paths differ by shell:

- Git Bash: `cd "/c/Path/To/homepicklab.com"`
- WSL: `cd "/mnt/c/Path/To/homepicklab.com"`
- PowerShell: `cd "C:\Path\To\homepicklab.com"`

```bash
py -m http.server 8000
```

### macOS / Linux

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

### Alternatives (if you don’t have Python)

```bash
npx --yes http-server -p 8000 .
# or
php -S 127.0.0.1:8000 -t .
```
