# Scenarios

## Under the hood

1. Pdb file picked
2. Uses ngl to parse chains from file
3. Select chain
4. Preprocess pdb file: select chain | rename chain to A or B | fix insertion codes | select alt loc
5. Parse chains/residues from preprocessed file
6. Uses restraints calculate_accessibility endpoint to get surface residues
7. Select an active redidue
8. Uses restraints passive_from_active endpoint to get passive residues
9. Repeat steps 7-8 until satisfied
10. Steps 1-9 for second pdb file
11. Uses actpass_to_ambig endpoint to generate ambig tbl file
12. Uses restrain bodies endpoint of both pdb files to generate unambig tbl file
13. Create archive with workflow, processed pdb files and tbl files
