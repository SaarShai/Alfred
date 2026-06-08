#!/usr/bin/env python3
"""Build the Screenery ops tabs (Job Tracker, Catalog, Stock) in the shared workbook.

Idempotent + non-destructive: only ADDS the three named tabs and writes inside them.
Skips any tab that already exists; never touches Confirmed Orders / Design Files / Files breakdown.
Uses the service-account writer (see ~/.config/screenery-design/sa.json via gsheet.py).
"""
import os, sys, urllib.parse
sys.path.insert(0, os.path.expanduser("~/Documents/screenery-lean/tools/gdocs"))
import gsheet  # noqa: E402

SID = "1prWDZlcRghV8GiKyVKoizm89P8RPTvOpkDditXk7crU"
ROWS = 500
TOKEN = gsheet.mint_token()

# colours (RGB 0..1)
GRAY  = {"red": 0.933, "green": 0.949, "blue": 0.969}
INDIGO= {"red": 0.878, "green": 0.906, "blue": 1.000}
TEAL  = {"red": 0.800, "green": 0.984, "blue": 0.945}
SLATE = {"red": 0.886, "green": 0.910, "blue": 0.941}
AMBER = {"red": 0.992, "green": 0.902, "blue": 0.541}


def get(url):
    return gsheet.api("GET", url, TOKEN)

def batch(reqs):
    return gsheet.api("POST", f"{gsheet.BASE}/{SID}:batchUpdate", TOKEN, {"requests": reqs})

def set_values(a1, vals):
    url = f"{gsheet.BASE}/{SID}/values/{urllib.parse.quote(a1)}?valueInputOption=RAW"
    return gsheet.api("PUT", url, TOKEN, {"values": vals})

def existing_titles():
    d = get(f"{gsheet.BASE}/{SID}?fields=sheets.properties.title")
    return {s["properties"]["title"] for s in d.get("sheets", [])}

def add_sheet(title, ncols):
    r = batch([{"addSheet": {"properties": {
        "title": title,
        "gridProperties": {"rowCount": ROWS, "columnCount": ncols, "frozenRowCount": 1},
    }}}])
    return r["replies"][0]["addSheet"]["properties"]["sheetId"]

def hdr_bg(gid, a, b, colour):
    return {"repeatCell": {
        "range": {"sheetId": gid, "startRowIndex": 0, "endRowIndex": 1,
                  "startColumnIndex": a, "endColumnIndex": b},
        "cell": {"userEnteredFormat": {"backgroundColor": colour,
                 "textFormat": {"bold": True}, "verticalAlignment": "MIDDLE",
                 "wrapStrategy": "WRAP"}},
        "fields": "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,wrapStrategy)"}}

def dropdown(gid, col, opts):
    return {"setDataValidation": {
        "range": {"sheetId": gid, "startRowIndex": 1, "endRowIndex": ROWS,
                  "startColumnIndex": col, "endColumnIndex": col + 1},
        "rule": {"condition": {"type": "ONE_OF_LIST",
                 "values": [{"userEnteredValue": v} for v in opts]},
                 "showCustomUi": True, "strict": False}}}

def checkbox(gid, col):
    return {"setDataValidation": {
        "range": {"sheetId": gid, "startRowIndex": 1, "endRowIndex": ROWS,
                  "startColumnIndex": col, "endColumnIndex": col + 1},
        "rule": {"condition": {"type": "BOOLEAN"}, "showCustomUi": True}}}

def datefmt(gid, col):
    return {"repeatCell": {
        "range": {"sheetId": gid, "startRowIndex": 1, "endRowIndex": ROWS,
                  "startColumnIndex": col, "endColumnIndex": col + 1},
        "cell": {"userEnteredFormat": {"numberFormat": {"type": "DATE", "pattern": "dd-mmm-yyyy"}}},
        "fields": "userEnteredFormat.numberFormat"}}

def colwidth(gid, col, px):
    return {"updateDimensionProperties": {
        "range": {"sheetId": gid, "dimension": "COLUMNS", "startIndex": col, "endIndex": col + 1},
        "properties": {"pixelSize": px}, "fields": "pixelSize"}}

def note(gid, col, text):
    return {"repeatCell": {
        "range": {"sheetId": gid, "startRowIndex": 0, "endRowIndex": 1,
                  "startColumnIndex": col, "endColumnIndex": col + 1},
        "cell": {"note": text}, "fields": "note"}}


def build_job_tracker():
    title = "Job Tracker"
    # Production Files / Instructions are NOT columns here — those live in Files Breakdown
    # (File/Instructions/Folder cols) and, for standards, in Catalog. Job Tracker tracks STATUS.
    headers = ["Order ID", "Hotel / Client", "Theme", "Model", "Type", "Qty", "Target",
               "Files Ready?", "Breakdown Ready?", "Colour OK?", "Planned Start", "Planned Ship",
               "Stage", "Stage Date", "Sheets Used", "Production Feedback", "Notes"]
    gid = add_sheet(title, len(headers))
    set_values(f"'{title}'!A1", [headers])
    reqs = [
        hdr_bg(gid, 0, 7, GRAY), hdr_bg(gid, 7, 9, INDIGO), hdr_bg(gid, 9, 10, TEAL),
        hdr_bg(gid, 10, 12, SLATE), hdr_bg(gid, 12, 16, AMBER), hdr_bg(gid, 16, 17, GRAY),
        dropdown(gid, 4, ["Standard", "Bespoke"]),
        dropdown(gid, 12, ["Cut+Print", "Glued", "Boxed", "Shipped"]),
        checkbox(gid, 7), checkbox(gid, 8), checkbox(gid, 9),
        datefmt(gid, 6), datefmt(gid, 10), datefmt(gid, 11), datefmt(gid, 13),
        colwidth(gid, 1, 150), colwidth(gid, 15, 240), colwidth(gid, 16, 200),
        note(gid, 4, "Standard = reuse from Catalog. Bespoke = Saar builds. Any variant/modifier -> Bespoke."),
        note(gid, 7, "Saar: tick when files are ready (built, or reused from Catalog). Files live in Files Breakdown / Catalog."),
        note(gid, 9, "Alicia: tick after checking breakdown colours vs the Stock tab."),
        note(gid, 10, "Alan: planned start from real factory capacity."),
        note(gid, 12, "Factory: update after each stage (Cut+Print -> Glued -> Boxed -> Shipped)."),
        note(gid, 14, "Factory: actual sheets used incl. extras/mistakes/tests."),
        note(gid, 15, "Factory: errors, issues, things to fix in the design next time."),
    ]
    batch(reqs)
    return gid

def build_catalog():
    title = "Catalog"
    headers = ["Theme", "Model", "Final Files", "Breakdown Ref",
               "Default Colours / Sheets", "Delivered to factory?", "Notes / known issues"]
    gid = add_sheet(title, len(headers))
    set_values(f"'{title}'!A1", [headers])
    seed = [[t, "Standard", "", "", "", False, ""] for t in
            ["Castle", "Marine", "Space", "Birthday", "Princess", "Festive", "Cafe", "Gingerbread"]]
    set_values(f"'{title}'!A2", seed)
    reqs = [
        hdr_bg(gid, 0, 7, INDIGO),
        checkbox(gid, 5),
        colwidth(gid, 2, 200), colwidth(gid, 3, 160), colwidth(gid, 4, 200), colwidth(gid, 6, 260),
        note(gid, 2, "Link to the final production-file package."),
        note(gid, 5, "Tick once the final files are delivered to the factory."),
        note(gid, 6, "Recurring design lessons / fixes for next time (Saar curates)."),
    ]
    batch(reqs)
    return gid

def build_stock():
    title = "Stock"
    headers = ["Colour", "Thickness", "Qty (sheets)", "Supplier", "Reorder point",
               "On order?", "Last updated", "Notes"]
    gid = add_sheet(title, len(headers))
    set_values(f"'{title}'!A1", [headers])
    seed = [
        ["cement", "12mm", "", "", "", False, "", ""],
        ["dark+light grey", "24mm", "", "", "", False, "", ""],
        ["blue", "12mm", "", "", "", False, "", ""],
        ["different blue", "12mm", "", "", "", False, "", ""],
        ["tangerine", "9mm", "", "", "", False, "", ""],
        ["yellow+tangerine", "24mm", "", "", "", False, "", ""],
    ]
    set_values(f"'{title}'!A2", seed)
    reqs = [
        hdr_bg(gid, 0, 8, TEAL),
        dropdown(gid, 3, ["UK", "China"]),
        checkbox(gid, 5),
        datefmt(gid, 6),
        colwidth(gid, 0, 150), colwidth(gid, 7, 240),
        note(gid, 3, "UK = fast / on-demand / pricier. China = bulk / ~2 months."),
        note(gid, 4, "Reorder when Qty drops to this. Keep conservative."),
        note(gid, 6, "Reset from the monthly factory stock photo."),
    ]
    batch(reqs)
    return gid


def main():
    have = existing_titles()
    plan = [("Job Tracker", build_job_tracker), ("Catalog", build_catalog), ("Stock", build_stock)]
    for name, fn in plan:
        if name in have:
            print(f"SKIP (already exists): {name}")
            continue
        gid = fn()
        print(f"BUILT {name}  gid={gid}")


if __name__ == "__main__":
    main()
