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
          "icon": null,
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
          "slug": "spot-color",
          "name": "SPOT color",
          "type": "step",
          "summary": null,
          "icon": null,
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
          "color": 8,
          "url": "../maps-data/finalizing-file/spot-color.md"
        },
        {
          "id": "nm1gft",
          "slug": "registration-marks",
          "name": "REGISTRATION marks",
          "type": "step",
          "summary": null,
          "icon": null,
          "tags": [],
          "status": null,
          "refs": [],
          "refsCollapsed": false,
          "x": 1025,
          "y": 491,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/finalizing-file/registration-marks.md"
        },
        {
          "id": "nimjtv",
          "slug": "split-files",
          "name": "SPLIT files",
          "type": "step",
          "summary": null,
          "icon": null,
          "tags": [],
          "status": null,
          "refs": [],
          "refsCollapsed": false,
          "x": 1350,
          "y": 489,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/finalizing-file/split-files.md"
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
        },
        {
          "from": "nd3vvb",
          "to": "nm1gft",
          "label": "",
          "bend": 0,
          "color": null,
          "route": "bezier"
        },
        {
          "from": "nm1gft",
          "to": "nimjtv",
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
