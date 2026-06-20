window.MAPS = {
  "order": [
    "orders-operations",
    "screenery-flow",
    "illustrator",
    "layers"
  ],
  "maps": {
    "orders-operations": {
      "slug": "orders-operations",
      "id": "m-ords01",
      "title": "Orders Operations",
      "kind": "process",
      "url": "../maps-data/orders-operations/index.md",
      "nodes": [
        {
          "id": "n-oi01",
          "slug": "order-intake",
          "name": "Order intake",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 14,
          "y": 260,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/orders-operations/order-intake.md"
        },
        {
          "id": "n-jt01",
          "slug": "job-tracker",
          "name": "Job Tracker",
          "type": "subprocess-link",
          "refs": [],
          "refsCollapsed": false,
          "x": 414,
          "y": 386,
          "lane": null,
          "link_map": "screenery-flow",
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/orders-operations/job-tracker.md"
        },
        {
          "id": "n-shp01",
          "slug": "shipping",
          "name": "Shipping & close",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 845,
          "y": 64,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/orders-operations/shipping.md"
        }
      ],
      "edges": [
        {
          "from": "n-oi01",
          "to": "n-jt01",
          "label": "log job",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-jt01",
          "to": "n-shp01",
          "label": "completed",
          "bend": 3,
          "color": null
        }
      ],
      "frames": []
    },
    "screenery-flow": {
      "slug": "screenery-flow",
      "id": "m-scrn01",
      "title": "Screenery — Operating Flow",
      "kind": "process",
      "url": "../maps-data/screenery-flow/index.md",
      "nodes": [
        {
          "id": "n-conf01",
          "slug": "confirm-order",
          "name": "Confirm the order",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 57,
          "y": 85,
          "lane": "Alicia",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/confirm-order.md"
        },
        {
          "id": "n-open01",
          "slug": "open-job",
          "name": "Open job & make files",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 337,
          "y": 217,
          "lane": "Saar",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/open-job.md"
        },
        {
          "id": "n-col01",
          "slug": "colour-stock-check",
          "name": "Check colour vs stock",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 600,
          "y": 79,
          "lane": "Alicia",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/colour-stock-check.md"
        },
        {
          "id": "n-hand01",
          "slug": "handoff",
          "name": "Hand off to factory",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 760,
          "y": 220,
          "lane": "Saar",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/handoff.md"
        },
        {
          "id": "n-sch01",
          "slug": "schedule-run",
          "name": "Schedule the run",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 760,
          "y": 360,
          "lane": "Alan",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/schedule-run.md"
        },
        {
          "id": "n-prod01",
          "slug": "produce-log",
          "name": "Produce & log",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 980,
          "y": 500,
          "lane": "Factory",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/produce-log.md"
        },
        {
          "id": "n-rec01",
          "slug": "reconcile-stock",
          "name": "Reconcile stock",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 1200,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/reconcile-stock.md"
        },
        {
          "id": "n-ship01",
          "slug": "ship-close",
          "name": "Ship & close",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 1420,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/screenery-flow/ship-close.md"
        }
      ],
      "edges": [
        {
          "from": "n-open01",
          "to": "n-col01",
          "label": "breakdown frozen",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-col01",
          "to": "n-hand01",
          "label": "colour OK",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-hand01",
          "to": "n-sch01",
          "label": "schedule",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-sch01",
          "to": "n-prod01",
          "label": "start production",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-prod01",
          "to": "n-rec01",
          "label": "sheets used",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-rec01",
          "to": "n-ship01",
          "label": "",
          "bend": 0,
          "color": null
        },
        {
          "from": "n-conf01",
          "to": "n-open01",
          "label": "open row + files",
          "bend": 0,
          "color": null
        }
      ],
      "frames": []
    },
    "illustrator": {
      "slug": "illustrator",
      "id": "ill001",
      "title": "Illustrator",
      "kind": "process",
      "url": "../maps-data/illustrator/index.md",
      "nodes": [
        {
          "id": "ill100",
          "slug": "start",
          "name": "Start",
          "type": "step",
          "refs": [
            {
              "target": "ne7nyc",
              "label": "back layer"
            },
            {
              "target": "nev4as",
              "label": "middle layer"
            }
          ],
          "refsCollapsed": true,
          "x": 95,
          "y": 161,
          "lane": null,
          "link_map": null,
          "gate": "./cli/bin/screenery-design illustrator --help",
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/illustrator/start.md"
        },
        {
          "id": "nvjd2r",
          "slug": "layers",
          "name": "Layers",
          "type": "subprocess-link",
          "refs": [],
          "refsCollapsed": false,
          "x": 306,
          "y": 360,
          "lane": null,
          "link_map": "layers",
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/illustrator/layers.md"
        },
        {
          "id": "ndtqgw",
          "slug": "test",
          "name": "test",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 370,
          "y": 114,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/illustrator/test.md"
        },
        {
          "id": "nrd1ju",
          "slug": "tester",
          "name": "tester",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 408,
          "y": 251,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": null,
          "url": "../maps-data/illustrator/tester.md"
        }
      ],
      "edges": [],
      "frames": []
    },
    "layers": {
      "slug": "layers",
      "id": "lay001",
      "title": "Layers",
      "kind": "process",
      "url": "../maps-data/layers/index.md",
      "nodes": [
        {
          "id": "nxp98d",
          "slug": "front-layer",
          "name": "front layer",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 234,
          "y": 216,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": 8,
          "url": "../maps-data/layers/front-layer.md"
        },
        {
          "id": "nev4as",
          "slug": "middle-layer",
          "name": "middle layer",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 257,
          "y": 356,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": 5,
          "url": "../maps-data/layers/middle-layer.md"
        },
        {
          "id": "ne7nyc",
          "slug": "back-layer",
          "name": "back layer",
          "type": "step",
          "refs": [],
          "refsCollapsed": false,
          "x": 253,
          "y": 470,
          "lane": null,
          "link_map": null,
          "gate": null,
          "scale": 1,
          "hl": false,
          "color": 7,
          "url": "../maps-data/layers/back-layer.md"
        }
      ],
      "edges": [],
      "frames": []
    }
  }
};
