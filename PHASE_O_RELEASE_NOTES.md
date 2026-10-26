# QC Toolbox — Phase O: dark warning contrast fix

- Corrected the brown SOP/production warning text in qc-dairy-v2.html, including the priceSyncInfo status line.
- Scoped light and dark styles with specificity above existing !important styles.
- Dark background #402d10; main text #fff1c7; secondary text #ffe0a0; border #e9b95b.
- Light background #fff4dc, dark brown lettering #603e08.
- Existing logic, Supabase configuration, other page styles, navigation and A5 output remain unchanged.
- Added qc-warning-contrast-phaseO.css to SW cache; version v39.
- Visual verification on the user's actual display remains outstanding.
