# Scenarios

## Under the hood

1. Pdb file picked
2. Show user uploaded pdb file in ngl
3. Uses ngl to parse chains from file
4. Select chain
5. Preprocess pdb file with pdbtools via haddock3 restaints web service
6. Compute bodies contraints of chain
7. Parse chains/residues from preprocessed file
8. Uses restraints calculate_accessibility endpoint to get surface residues
9. Show processed pdb file in ngl
10. Select an active redidue
11. Uses restraints passive_from_active endpoint to get passive residues
12. Repeat steps 7-8 until satisfied
13. Steps 1-9 for second pdb file
14. Uses actpass_to_ambig endpoint to generate ambig tbl file
15. Concatenate body contraints of both chains and if not empty use as unambig tbl file
16. Create archive with workflow, processed pdb files and tbl files
