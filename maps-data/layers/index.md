---
nid: lay001
title: "Layers"
type: map
nodes: [front-layer, middle-layer, back-layer, test]
edges:
  - {from: back-layer, to: front-layer, label: ""}
  - {from: front-layer, to: test, label: "", bend: 19}
---
# Layers

Sub-workflow of the Illustrator map. Build out the real layer-handling steps
here (each with a machine-checkable `gate:`).
