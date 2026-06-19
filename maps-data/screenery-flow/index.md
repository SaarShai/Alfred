---
nid: m-scrn01
title: "Screenery — Operating Flow"
type: map
nodes: [confirm-order, open-job, colour-stock-check, handoff, schedule-run, produce-log, reconcile-stock, ship-close]
edges:
  - {from: open-job, to: colour-stock-check, label: "breakdown frozen"}
  - {from: colour-stock-check, to: handoff, label: "colour OK"}
  - {from: handoff, to: schedule-run, label: "schedule"}
  - {from: schedule-run, to: produce-log, label: "start production"}
  - {from: produce-log, to: reconcile-stock, label: "sheets used"}
  - {from: reconcile-stock, to: ship-close, label: ""}
  - {from: confirm-order, to: open-job, label: "open row + files"}
---
# Screenery — Operating Flow

One shared sheet. Every job is one row in the Job Tracker spine, filled by each actor as it advances — that row is also the status dashboard. Status lives in the sheet, not email.
