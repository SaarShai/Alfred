#!/usr/bin/env python3
"""Lean D3-canvas validator for maps/ and dashboard/ (adopted from Warp's pr-walkthrough validate_d3_canvas.py).

Static checks (zero deps, always run):
  - data.js parses and has content
  - app.js declares the `d3-canvas-ready` boot signal
  - no control bytes in the JS (the NUL/SOH class that silently breaks grep/parsers)
Optional browser check (only if `playwright` is installed; skipped with a hint otherwise):
  - loads the page headless (file:// by default — no server needed; or --url)
  - waits for body.d3-canvas-ready, fails on body.d3-canvas-error
  - asserts no console/page errors; reports rendered node count

Usage:
  python3 tools/validate_canvas.py maps
  python3 tools/validate_canvas.py dashboard --browser
  python3 tools/validate_canvas.py maps --browser --url http://localhost:8780
"""
import argparse
import json
import pathlib
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent
APPS = {
    "maps": {"var": "window.MAPS", "node_sel": "g.node"},
    "dashboard": {"var": "window.TREES", "node_sel": "g.node"},
}


def _extract(data_js, var):
    s = data_js.strip()
    prefix = var + " = "
    if not s.startswith(prefix):
        return None, "data.js does not start with '%s'" % prefix
    body = s[len(prefix):].rstrip()
    if body.endswith(";"):
        body = body[:-1]
    try:
        return json.loads(body), None
    except Exception as e:
        return None, "data.js JSON parse failed: %s" % e


def static_checks(app_dir, cfg):
    errs, notes = [], []
    d = REPO / app_dir
    obj, err = _extract((d / "data.js").read_text(), cfg["var"])
    if err:
        errs.append(err)
    else:
        if isinstance(obj, dict):                       # maps: {order, maps, issues}
            count = len(obj.get("order", []))
            nodes = sum(len(m.get("nodes", [])) for m in obj.get("maps", {}).values())
        else:                                           # dashboard: [tree, ...]
            count = len(obj)

            def cnt(ns):
                return sum(1 + cnt(n.get("children", [])) for n in ns)

            nodes = cnt(obj)
        if count == 0:
            errs.append("data.js has no maps/trees")
        notes.append("data.js: %d top-level, %d nodes" % (count, nodes))
    app_js = (d / "app.js").read_text()
    if "d3-canvas-ready" not in app_js:
        errs.append("app.js missing the d3-canvas-ready boot signal")
    for f in ("app.js", "build.js", "serve.js"):
        p = d / f
        if p.exists():
            b = p.read_bytes()
            if any(c < 9 or 13 < c < 32 for c in b):
                errs.append("%s: contains control bytes (breaks grep/parsers)" % f)
    return errs, notes


def browser_check(app_dir, cfg, url, timeout):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None, ["playwright not installed — browser check skipped "
                      "(pip install playwright && python3 -m playwright install chromium)"]
    target = url or ("file://" + str(REPO / app_dir / "index.html"))
    errs, notes, console = [], [], []
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        pg = br.new_page(viewport={"width": 1440, "height": 960})
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: console.append(str(e)))
        try:
            pg.goto(target, timeout=timeout)
            pg.wait_for_selector("body.d3-canvas-ready, body.d3-canvas-error", timeout=timeout)
            state = pg.evaluate(
                "document.body.classList.contains('d3-canvas-error') ? 'error' : "
                "(document.body.classList.contains('d3-canvas-ready') ? 'ready' : 'none')")
            nodes = pg.eval_on_selector_all(cfg["node_sel"], "els => els.length")
            if state == "error":
                errs.append("canvas booted into d3-canvas-error state")
            elif state != "ready":
                errs.append("canvas never became ready")
            else:
                notes.append("browser: ready, %d %s rendered" % (nodes, cfg["node_sel"]))
        except Exception as e:
            errs.append("browser load/inspect failed: %s" % e)
        finally:
            br.close()
    if console:
        errs.append("console errors: " + " | ".join(console[:5]))
    return errs, notes


def main():
    ap = argparse.ArgumentParser(description="Lean D3-canvas validator (maps/ + dashboard/).")
    ap.add_argument("app", choices=sorted(APPS))
    ap.add_argument("--browser", action="store_true", help="also run the headless render check (needs playwright)")
    ap.add_argument("--url", help="page URL for the browser check (default: file://.../<app>/index.html)")
    ap.add_argument("--timeout", type=int, default=15000, help="browser timeout ms")
    a = ap.parse_args()
    cfg = APPS[a.app]
    errs, notes = static_checks(a.app, cfg)
    skipped = False
    if a.browser:
        berrs, bnotes = browser_check(a.app, cfg, a.url, a.timeout)
        notes += bnotes
        if berrs is None:
            skipped = True
        else:
            errs += berrs
    for n in notes:
        print("  ·", n)
    if errs:
        for e in errs:
            print("FAIL -", e)
        return 1
    tail = " (static only; --browser needs playwright)" if (not a.browser or skipped) else ""
    print("PASS - %s canvas validated%s" % (a.app, tail))
    return 0


if __name__ == "__main__":
    sys.exit(main())
