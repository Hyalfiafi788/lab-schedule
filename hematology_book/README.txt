Essentials of Hematology — A Concise Illustrated Guide
======================================================

Contents of this package
-------------------------
- Essentials_of_Hematology.pdf   : The complete illustrated book (print-ready, A4).
- hematology_atlas.html          : The source HTML (open in any browser).
- images/                        : All illustrations used in the book.
- render.sh                      : Script that regenerates the PDF from the HTML (uses headless Chrome).

Topics
------
Part I — Morphology
  1. How to Read a Peripheral Blood Smear
  2. Red Blood Cell Morphology (size, colour, shape, inclusions)
  3. White Blood Cell Morphology (the five leukocytes)
  4. Platelet Morphology
Part II — Coagulation
  5. Overview of Hemostasis
  6. Primary Hemostasis — The Platelet Plug
  7. Secondary Hemostasis — The Coagulation Cascade (intrinsic / extrinsic / common)
  8. Anticoagulants & Fibrinolysis
  9. Coagulation Laboratory Tests (PT/INR, aPTT, TT, fibrinogen, D-dimer)
Part III — Atlas of Abnormal Cell Morphology (with photos)
 10. Abnormal Red Cells & Inclusions (Howell-Jolly, stippling, bite/blister, NRBC, rouleaux, agglutination)
 11. Abnormal White Cells (blasts & Auer rods, hypersegmented neutrophil, reactive lymphocytes, smudge cells)
 12. Morphology Alert — Cell -> Diagnosis lookup table
Part IV — Beginner's Guide: Reading a Blood Smear (with photos)
 13. Step 1 — Making a Good Blood Film (wedge technique, film regions)
 14. Step 2 — Microscope Set-up & Scanning (10x/40x/100x, battlement track)
 15. Step 3 — A Beginner's Read, Step by Step (8-step routine, good vs bad film)
Part V — Interpreting the CBC & Blood Parasites (with photos)
 16. Reading the Full Blood Count (parameters & reference ranges)
 17. The Anemia Approach by MCV (micro/normo/macrocytic + reticulocytes)
 18. Interpreting White Cell & Platelet Counts (causes tables, pancytopenia)
 19. Blood Parasites — Malaria on the Film (ring forms, gametocyte, thick vs thin film)
 20. Quick Reference Tables

Notes
-----
- Text is in concise English; figures are labelled.
- The cell illustrations are stylised educational figures (AI-rendered), not real
  patient microscopy. The coagulation cascade is a hand-built, text-accurate diagram.
- Reference ranges vary between laboratories — always use your own validated values.
- Educational reference only; not a substitute for validated clinical/laboratory protocols.

To regenerate the PDF:
  bash render.sh
