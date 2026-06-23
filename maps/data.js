window.MAPS = {
  "order": [
    "orders-operations",
    "screenery-flow",
    "illustrator",
    "layers",
    "finalizing-file"
  ],
  "maps": {
    "orders-operations": {
      "slug": "orders-operations",
      "id": "m-ords01",
      "title": "Orders Operations",
      "kind": "process",
      "url": "../maps-data/orders-operations/index.md",
      "nodes": [],
      "edges": [],
      "frames": []
    },
    "screenery-flow": {
      "slug": "screenery-flow",
      "id": "m-scrn01",
      "title": "Screenery — Operating Flow",
      "kind": "process",
      "url": "../maps-data/screenery-flow/index.md",
      "nodes": [],
      "edges": [],
      "frames": []
    },
    "illustrator": {
      "slug": "illustrator",
      "id": "ill001",
      "title": "Illustrator",
      "kind": "process",
      "url": "../maps-data/illustrator/index.md",
      "nodes": [],
      "edges": [],
      "frames": []
    },
    "layers": {
      "slug": "layers",
      "id": "lay001",
      "title": "Layers",
      "kind": "process",
      "url": "../maps-data/layers/index.md",
      "nodes": [],
      "edges": [],
      "frames": []
    },
    "finalizing-file": {
      "slug": "finalizing-file",
      "id": "m79v9v",
      "title": "Finalizing File",
      "kind": "process",
      "url": "../maps-data/finalizing-file/index.md",
      "nodes": [
        {
          "id": "ntdz88",
          "slug": "overlapping-paths",
          "name": "OVERLAPPING paths",
          "type": "step",
          "summary": null,
          "tags": [],
          "status": null,
          "refs": [],
          "refsCollapsed": false,
          "x": 442,
          "y": 490,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/finalizing-file/overlapping-paths.md"
        },
        {
          "id": "nd3vvb",
          "slug": "create-spot-layer-objects",
          "name": "create spot layer objects",
          "type": "step",
          "summary": null,
          "tags": [],
          "status": null,
          "refs": [],
          "refsCollapsed": false,
          "x": 753,
          "y": 490,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/finalizing-file/create-spot-layer-objects.md"
        }
      ],
      "edges": [
        {
          "from": "ntdz88",
          "to": "nd3vvb",
          "label": "",
          "bend": 0,
          "color": null,
          "route": "bezier"
        }
      ],
      "frames": []
    }
  },
  "issues": []
};
