window.MAPS = {
  "order": [
    "orders-operations",
    "screenery-flow"
  ],
  "maps": {
    "orders-operations": {
      "slug": "orders-operations",
      "id": "m-ords01",
      "title": "Orders Operations",
      "url": "../maps-data/orders-operations/index.md",
      "nodes": [
        {
          "id": "n-oi01",
          "slug": "order-intake",
          "name": "Order intake",
          "type": "step",
          "x": 103,
          "y": 149,
          "lane": null,
          "link_map": null,
          "url": "../maps-data/orders-operations/order-intake.md"
        },
        {
          "id": "n-jt01",
          "slug": "job-tracker",
          "name": "Job Tracker",
          "type": "subprocess-link",
          "x": 421,
          "y": 150,
          "lane": null,
          "link_map": "screenery-flow",
          "url": "../maps-data/orders-operations/job-tracker.md"
        },
        {
          "id": "n-shp01",
          "slug": "shipping",
          "name": "Shipping & close",
          "type": "step",
          "x": 720,
          "y": 140,
          "lane": null,
          "link_map": null,
          "url": "../maps-data/orders-operations/shipping.md"
        }
      ],
      "edges": [
        {
          "from": "n-oi01",
          "to": "n-jt01",
          "label": "log job"
        },
        {
          "from": "n-jt01",
          "to": "n-shp01",
          "label": "completed"
        }
      ]
    },
    "screenery-flow": {
      "slug": "screenery-flow",
      "id": "m-scrn01",
      "title": "Screenery — Operating Flow",
      "url": "../maps-data/screenery-flow/index.md",
      "nodes": [
        {
          "id": "n-conf01",
          "slug": "confirm-order",
          "name": "Confirm the order",
          "type": "step",
          "x": 100,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "url": "../maps-data/screenery-flow/confirm-order.md"
        },
        {
          "id": "n-open01",
          "slug": "open-job",
          "name": "Open job & make files",
          "type": "step",
          "x": 337,
          "y": 217,
          "lane": "Saar",
          "link_map": null,
          "url": "../maps-data/screenery-flow/open-job.md"
        },
        {
          "id": "n-col01",
          "slug": "colour-stock-check",
          "name": "Check colour vs stock",
          "type": "step",
          "x": 540,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "url": "../maps-data/screenery-flow/colour-stock-check.md"
        },
        {
          "id": "n-hand01",
          "slug": "handoff",
          "name": "Hand off to factory",
          "type": "step",
          "x": 760,
          "y": 220,
          "lane": "Saar",
          "link_map": null,
          "url": "../maps-data/screenery-flow/handoff.md"
        },
        {
          "id": "n-sch01",
          "slug": "schedule-run",
          "name": "Schedule the run",
          "type": "step",
          "x": 760,
          "y": 360,
          "lane": "Alan",
          "link_map": null,
          "url": "../maps-data/screenery-flow/schedule-run.md"
        },
        {
          "id": "n-prod01",
          "slug": "produce-log",
          "name": "Produce & log",
          "type": "step",
          "x": 980,
          "y": 500,
          "lane": "Factory",
          "link_map": null,
          "url": "../maps-data/screenery-flow/produce-log.md"
        },
        {
          "id": "n-rec01",
          "slug": "reconcile-stock",
          "name": "Reconcile stock",
          "type": "step",
          "x": 1200,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "url": "../maps-data/screenery-flow/reconcile-stock.md"
        },
        {
          "id": "n-ship01",
          "slug": "ship-close",
          "name": "Ship & close",
          "type": "step",
          "x": 1420,
          "y": 80,
          "lane": "Alicia",
          "link_map": null,
          "url": "../maps-data/screenery-flow/ship-close.md"
        }
      ],
      "edges": [
        {
          "from": "n-open01",
          "to": "n-col01",
          "label": "breakdown frozen"
        },
        {
          "from": "n-col01",
          "to": "n-hand01",
          "label": "colour OK"
        },
        {
          "from": "n-hand01",
          "to": "n-sch01",
          "label": "schedule"
        },
        {
          "from": "n-sch01",
          "to": "n-prod01",
          "label": "start production"
        },
        {
          "from": "n-prod01",
          "to": "n-rec01",
          "label": "sheets used"
        },
        {
          "from": "n-rec01",
          "to": "n-ship01",
          "label": ""
        },
        {
          "from": "n-conf01",
          "to": "n-open01",
          "label": "open row + files"
        }
      ]
    }
  }
};
