# Scenarios

## Under the hood

1. Pdb file picked
2. Show user uploaded pdb file in ngl
3. Uses ngl to parse chains from file
4. Select chain
5. Preprocess pdb file: select chain | rename chain to A or B | fix insertion codes | select alt loc
6. Parse chains/residues from preprocessed file
7. Uses restraints calculate_accessibility endpoint to get surface residues
8. Show processed pdb file in ngl
9. Select an active redidue
10. Uses restraints passive_from_active endpoint to get passive residues
11. Repeat steps 7-8 until satisfied
12. Steps 1-9 for second pdb file
13. Uses actpass_to_ambig endpoint to generate ambig tbl file
14. Uses restrain bodies endpoint of both pdb files to generate unambig tbl file
15. Create archive with workflow, processed pdb files and tbl files
