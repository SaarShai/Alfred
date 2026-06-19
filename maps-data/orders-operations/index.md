---
nid: m-ords01
title: "Orders Operations"
type: map
nodes: [order-intake, job-tracker, shipping]
edges:
  - {from: order-intake, to: job-tracker, label: "log job"}
  - {from: job-tracker, to: shipping, label: "completed"}
---
# Orders Operations

High-level operations map. The Job Tracker node opens the detailed Screenery operating flow.
