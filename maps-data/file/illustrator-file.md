---
nid: ns8gr5
title: "Illustrator FILE"
type: step
x: 639
y: 340
---

# Illustrator FILE

## ILLUSTRATOR LAYERS

* distinguish between product layers (front, back, middle) and illustrator layers (a feature of illustrator)
* Every Screenery .ai file uses Illustrator layers (not to be confused with physical product layers). Each layer encodes ONE fabricator operation. 
* Stroke color, stroke weight, and CMYK on each layer are CANONICAL — drift is a defect.



1.1 Layer order (top → bottom)
 1. registration marks (black fill)
 2. notes (n/a)
 3. bevel (3 pt stroke, yellow)
 4. hinge (5 pt stroke, orange)
 5. groove (5 pt stroke, magenta)
 6. cut (10 pt stroke, color by product layer)
 7. print (raster/vector graphics)
 8. spot layer (white color under-print)


1.2 Notes — non-cutting
Annotations, dashed accommodation-area guides, off-artboard adhering diagrams, template references, agent comments, helper labels, any guide that must NOT reach the cutter. 


1.3 Bevel — yellow, 3 pt
Chamfered-edge cuts. A "half-groove" (one side of a V-groove) that softens what would otherwise be a sharp 90° edge.
 Stroke: 3 pt
 Color: Yellow
 CMYK: 0, 0, 100, 0
 CNC setting: "inside" for closed paths
 CNC depth: 11 mm deep (1 mm remainder) on 12 mm sheets
 8 mm deep (1 mm remainder) on 9 mm sheets
Path rules: must overlap an underlying cut path; may extend BEYOND the cut contour for overcut tolerance or connecting neighboring bevels; 

1.4 Hinge — orange, 5 pt
Deep V-groove scored into the product layer, leaving a thin 2-2.5 mm felt remainder so a flap section can BEND relative to the rest.
 Stroke: 5 pt
 Color: Orange
 CMYK: 0, 49.804, 100, 0
 CNC depth: 9.5 mm deep (2.5 mm remainder) on 12 mm sheets
 6.5 mm deep (2.5 mm remainder) on 9 mm sheets
Scope: doors, windows, connector flaps. Typically: hinge runs along pivoting side. Ends at a corner or curve. If curve - bevel or groove takes over from there. 
1.5 Groove — magenta, 5 pt
Partial-depth V-groove for decorative patterns (brick lines, shapes, etc.).
 Stroke: 5 pt
 Color: Magenta
 CMYK: 0, 94.902, 20, 0
 CNC depth: 5 mm deep (7 mm remainder) on 12 mm sheets
 4 mm deep (5 mm remainder) on 9 mm sheets

1.6 Cut — 10 pt, stroke color indicates product layer
Full-depth through-cuts. 
 Stroke: 10 pt
 Color: by product layer
 CNC: full-depth (through the sheet)
 CNC: cut should run first, then hinge, groove or bevel (to prevent drag of material)
 Stroke color | Product layer | Hex | CMYK
 --------------|----------------|----------|------------------------
 Black | front | #000000 | 0, 0, 0, 100
 Blue | middle | #0000FF | 85.098, 49.804, 0, 0
 Green | back | #008000 | 74.902, 0, 100, 0
 
All three product layers coexist on the same cut Illustrator layer — distinguished by stroke color (and naming).
Artboard membership is LOOSE — any artboard may carry parts of any product layer. Don't infer product layer from artboard. Best practice priorities: product layer parts on the same artboard as much as possible; if not - front and back layer parts on the same artboard excluding middle layer parts who get their own layer. 

1.7 Print
Default-print artwork for the UV-flatbed print pass.
Print types:
 - default print — graphics on front + back layer external surfaces
 - middle print — graphics on middle layer, visible through front cutouts
 - white-spot under-print — see §1.8
1.8 White spot layer
White-ink UNDER-print: applied beneath color ink on darker felt.
 Layer name: "white spot layer" (canonical)
 Also: "spot white layer", "white layer"

1.9 Cross-layer rules and don'ts


## ARTBOARDS

* SIZE = 2440x1220mm (default)
