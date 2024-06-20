import { describe, expect, test } from "vitest";
import { hetGrep } from "./hetGrep";

const pdb8TRE_orig = `\
HEADER    LIGASE                                  09-AUG-23   8TRE              
TITLE     CRYSTAL STRUCTURE OF THE HUMAN TRIP12 WWE DOMAIN (ISOFORM 2) IN       
TITLE    2 COMPLEX WITH ATP                                                     
COMPND    MOL_ID: 1;                                                            
COMPND   2 MOLECULE: ISOFORM 2 OF E3 UBIQUITIN-PROTEIN LIGASE TRIP12;           
COMPND   3 CHAIN: A;                                                            
COMPND   4 FRAGMENT: WWE DOMAIN;                                                
COMPND   5 SYNONYM: E3 UBIQUITIN-PROTEIN LIGASE FOR ARF,ULF,HECT-TYPE E3        
COMPND   6 UBIQUITIN TRANSFERASE TRIP12,THYROID RECEPTOR-INTERACTING PROTEIN 12,
COMPND   7 TR-INTERACTING PROTEIN 12,TRIP-12;                                   
COMPND   8 EC: 2.3.2.26;                                                        
COMPND   9 ENGINEERED: YES                                                      
SOURCE    MOL_ID: 1;                                                            
SOURCE   2 ORGANISM_SCIENTIFIC: HOMO SAPIENS;                                   
SOURCE   3 ORGANISM_COMMON: HUMAN;                                              
SOURCE   4 ORGANISM_TAXID: 9606;                                                
SOURCE   5 GENE: TRIP12, KIAA0045, ULF;                                         
SOURCE   6 EXPRESSION_SYSTEM: ESCHERICHIA COLI;                                 
SOURCE   7 EXPRESSION_SYSTEM_TAXID: 562                                         
KEYWDS    TRIP12, ISOFORM 2, WWE, SGC, TRANSPORT PROTEIN, STRUCTURAL GENOMICS,  
KEYWDS   2 PSI-BIOLOGY, STRUCTURAL GENOMICS CONSORTIUM, LIGASE                  
EXPDTA    X-RAY DIFFRACTION                                                     
AUTHOR    S.KIMANI,A.DONG,Y.LI,C.H.ARROWSMITH,A.M.EDWARDS,L.HALABELIAN,         
AUTHOR   2 STRUCTURAL GENOMICS CONSORTIUM (SGC)                                 
REVDAT   1   20-DEC-23 8TRE    0                                                
JRNL        AUTH   S.KIMANI,A.DONG,Y.LI,C.H.ARROWSMITH,A.M.EDWARDS,L.HALABELIAN 
JRNL        TITL   CRYSTAL STRUCTURE OF THE HUMAN TRIP12 WWE DOMAIN (ISOFORM 2) 
JRNL        TITL 2 IN COMPLEX WITH ATP                                          
JRNL        REF    TO BE PUBLISHED                                              
JRNL        REFN                                                                
REMARK   2                                                                      
REMARK   2 RESOLUTION.    1.40 ANGSTROMS.                                       
REMARK   3                                                                      
REMARK   3 REFINEMENT.                                                          
REMARK   3   PROGRAM     : REFMAC 5.8.0258                                      
REMARK   3   AUTHORS     : MURSHUDOV,SKUBAK,LEBEDEV,PANNU,STEINER,              
REMARK   3               : NICHOLLS,WINN,LONG,VAGIN                             
REMARK   3                                                                      
REMARK   3    REFINEMENT TARGET : MAXIMUM LIKELIHOOD                            
REMARK   3                                                                      
REMARK   3  DATA USED IN REFINEMENT.                                            
REMARK   3   RESOLUTION RANGE HIGH (ANGSTROMS) : 1.40                           
REMARK   3   RESOLUTION RANGE LOW  (ANGSTROMS) : 33.04                          
REMARK   3   DATA CUTOFF            (SIGMA(F)) : NULL                           
REMARK   3   COMPLETENESS FOR RANGE        (%) : 97.5                           
REMARK   3   NUMBER OF REFLECTIONS             : 12941                          
REMARK   3                                                                      
REMARK   3  FIT TO DATA USED IN REFINEMENT.                                     
REMARK   3   CROSS-VALIDATION METHOD          : THROUGHOUT                      
REMARK   3   FREE R VALUE TEST SET SELECTION  : RANDOM                          
REMARK   3   R VALUE     (WORKING + TEST SET) : 0.195                           
REMARK   3   R VALUE            (WORKING SET) : 0.193                           
REMARK   3   FREE R VALUE                     : 0.228                           
REMARK   3   FREE R VALUE TEST SET SIZE   (%) : 4.600                           
REMARK   3   FREE R VALUE TEST SET COUNT      : 630                             
REMARK   3                                                                      
REMARK   3  FIT IN THE HIGHEST RESOLUTION BIN.                                  
REMARK   3   TOTAL NUMBER OF BINS USED           : NULL                         
REMARK   3   BIN RESOLUTION RANGE HIGH       (A) : 1.40                         
REMARK   3   BIN RESOLUTION RANGE LOW        (A) : 1.43                         
REMARK   3   REFLECTION IN BIN     (WORKING SET) : 710                          
REMARK   3   BIN COMPLETENESS (WORKING+TEST) (%) : 74.78                        
REMARK   3   BIN R VALUE           (WORKING SET) : 0.3430                       
REMARK   3   BIN FREE R VALUE SET COUNT          : 40                           
REMARK   3   BIN FREE R VALUE                    : 0.4320                       
REMARK   3                                                                      
REMARK   3  NUMBER OF NON-HYDROGEN ATOMS USED IN REFINEMENT.                    
REMARK   3   PROTEIN ATOMS            : 595                                     
REMARK   3   NUCLEIC ACID ATOMS       : 0                                       
REMARK   3   HETEROGEN ATOMS          : 32                                      
REMARK   3   SOLVENT ATOMS            : 54                                      
REMARK   3                                                                      
REMARK   3  B VALUES.                                                           
REMARK   3   FROM WILSON PLOT           (A**2) : NULL                           
REMARK   3   MEAN B VALUE      (OVERALL, A**2) : 20.36                          
REMARK   3   OVERALL ANISOTROPIC B VALUE.                                       
REMARK   3    B11 (A**2) : -1.89000                                             
REMARK   3    B22 (A**2) : 1.27000                                              
REMARK   3    B33 (A**2) : 0.61000                                              
REMARK   3    B12 (A**2) : 0.00000                                              
REMARK   3    B13 (A**2) : 0.00000                                              
REMARK   3    B23 (A**2) : 0.00000                                              
REMARK   3                                                                      
REMARK   3  ESTIMATED OVERALL COORDINATE ERROR.                                 
REMARK   3   ESU BASED ON R VALUE                            (A): 0.077         
REMARK   3   ESU BASED ON FREE R VALUE                       (A): 0.079         
REMARK   3   ESU BASED ON MAXIMUM LIKELIHOOD                 (A): 0.058         
REMARK   3   ESU FOR B VALUES BASED ON MAXIMUM LIKELIHOOD (A**2): 1.481         
REMARK   3                                                                      
REMARK   3 CORRELATION COEFFICIENTS.                                            
REMARK   3   CORRELATION COEFFICIENT FO-FC      : 0.965                         
REMARK   3   CORRELATION COEFFICIENT FO-FC FREE : 0.949                         
REMARK   3                                                                      
REMARK   3  RMS DEVIATIONS FROM IDEAL VALUES        COUNT    RMS    WEIGHT      
REMARK   3   BOND LENGTHS REFINED ATOMS        (A):   731 ; 0.011 ; 0.013       
REMARK   3   BOND LENGTHS OTHERS               (A):   640 ; 0.001 ; 0.018       
REMARK   3   BOND ANGLES REFINED ATOMS   (DEGREES):  1009 ; 1.487 ; 1.660       
REMARK   3   BOND ANGLES OTHERS          (DEGREES):  1477 ; 1.368 ; 1.590       
REMARK   3   TORSION ANGLES, PERIOD 1    (DEGREES):    90 ; 6.832 ; 5.000       
REMARK   3   TORSION ANGLES, PERIOD 2    (DEGREES):    50 ;24.487 ;19.600       
REMARK   3   TORSION ANGLES, PERIOD 3    (DEGREES):   119 ;15.642 ;15.000       
REMARK   3   TORSION ANGLES, PERIOD 4    (DEGREES):    11 ;11.825 ;15.000       
REMARK   3   CHIRAL-CENTER RESTRAINTS       (A**3):    97 ; 0.075 ; 0.200       
REMARK   3   GENERAL PLANES REFINED ATOMS      (A):   861 ; 0.010 ; 0.020       
REMARK   3   GENERAL PLANES OTHERS             (A):   179 ; 0.005 ; 0.020       
REMARK   3   NON-BONDED CONTACTS REFINED ATOMS (A):  NULL ;  NULL ;  NULL       
REMARK   3   NON-BONDED CONTACTS OTHERS        (A):  NULL ;  NULL ;  NULL       
REMARK   3   NON-BONDED TORSION REFINED ATOMS  (A):  NULL ;  NULL ;  NULL       
REMARK   3   NON-BONDED TORSION OTHERS         (A):  NULL ;  NULL ;  NULL       
REMARK   3   H-BOND (X...Y) REFINED ATOMS      (A):  NULL ;  NULL ;  NULL       
REMARK   3   H-BOND (X...Y) OTHERS             (A):  NULL ;  NULL ;  NULL       
REMARK   3   POTENTIAL METAL-ION REFINED ATOMS (A):  NULL ;  NULL ;  NULL       
REMARK   3   POTENTIAL METAL-ION OTHERS        (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY VDW REFINED ATOMS        (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY VDW OTHERS               (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY H-BOND REFINED ATOMS     (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY H-BOND OTHERS            (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY METAL-ION REFINED ATOMS  (A):  NULL ;  NULL ;  NULL       
REMARK   3   SYMMETRY METAL-ION OTHERS         (A):  NULL ;  NULL ;  NULL       
REMARK   3                                                                      
REMARK   3  ISOTROPIC THERMAL FACTOR RESTRAINTS.     COUNT   RMS    WEIGHT      
REMARK   3   MAIN-CHAIN BOND REFINED ATOMS  (A**2):   339 ; 1.970 ; 1.955       
REMARK   3   MAIN-CHAIN BOND OTHER ATOMS    (A**2):   338 ; 1.896 ; 1.945       
REMARK   3   MAIN-CHAIN ANGLE REFINED ATOMS (A**2):   436 ; 2.998 ; 2.927       
REMARK   3   MAIN-CHAIN ANGLE OTHER ATOMS   (A**2):   437 ; 3.003 ; 2.936       
REMARK   3   SIDE-CHAIN BOND REFINED ATOMS  (A**2):   392 ; 2.664 ; 2.201       
REMARK   3   SIDE-CHAIN BOND OTHER ATOMS    (A**2):   392 ; 2.662 ; 2.202       
REMARK   3   SIDE-CHAIN ANGLE REFINED ATOMS (A**2):  NULL ;  NULL ;  NULL       
REMARK   3   SIDE-CHAIN ANGLE OTHER ATOMS   (A**2):   574 ; 4.138 ; 3.210       
REMARK   3   LONG RANGE B REFINED ATOMS     (A**2):   793 ; 5.200 ;21.993       
REMARK   3   LONG RANGE B OTHER ATOMS       (A**2):   784 ; 5.141 ;21.662       
REMARK   3                                                                      
REMARK   3 ANISOTROPIC THERMAL FACTOR RESTRAINTS.    COUNT   RMS   WEIGHT       
REMARK   3   RIGID-BOND RESTRAINTS          (A**2):  NULL ;  NULL ;  NULL       
REMARK   3   SPHERICITY; FREE ATOMS         (A**2):  NULL ;  NULL ;  NULL       
REMARK   3   SPHERICITY; BONDED ATOMS       (A**2):  NULL ;  NULL ;  NULL       
REMARK   3                                                                      
REMARK   3  NCS RESTRAINTS STATISTICS                                           
REMARK   3   NUMBER OF DIFFERENT NCS GROUPS : NULL                              
REMARK   3                                                                      
REMARK   3  TLS DETAILS                                                         
REMARK   3   NUMBER OF TLS GROUPS  : NULL                                       
REMARK   3                                                                      
REMARK   3  BULK SOLVENT MODELLING.                                             
REMARK   3   METHOD USED : MASK                                                 
REMARK   3   PARAMETERS FOR MASK CALCULATION                                    
REMARK   3   VDW PROBE RADIUS   : 1.20                                          
REMARK   3   ION PROBE RADIUS   : 0.80                                          
REMARK   3   SHRINKAGE RADIUS   : 0.80                                          
REMARK   3                                                                      
REMARK   3  OTHER REFINEMENT REMARKS: HYDROGENS HAVE BEEN ADDED IN THE RIDING   
REMARK   3  POSITIONS                                                           
REMARK   4                                                                      
REMARK   4 8TRE COMPLIES WITH FORMAT V. 3.30, 13-JUL-11                         
REMARK 100                                                                      
REMARK 100 THIS ENTRY HAS BEEN PROCESSED BY RCSB ON 04-SEP-23.                  
REMARK 100 THE DEPOSITION ID IS D_1000276492.                                   
REMARK 200                                                                      
REMARK 200 EXPERIMENTAL DETAILS                                                 
REMARK 200  EXPERIMENT TYPE                : X-RAY DIFFRACTION                  
REMARK 200  DATE OF DATA COLLECTION        : 09-DEC-22                          
REMARK 200  TEMPERATURE           (KELVIN) : 100                                
REMARK 200  PH                             : 8.5                                
REMARK 200  NUMBER OF CRYSTALS USED        : 1                                  
REMARK 200                                                                      
REMARK 200  SYNCHROTRON              (Y/N) : Y                                  
REMARK 200  RADIATION SOURCE               : APS                                
REMARK 200  BEAMLINE                       : 24-ID-C                            
REMARK 200  X-RAY GENERATOR MODEL          : NULL                               
REMARK 200  MONOCHROMATIC OR LAUE    (M/L) : M                                  
REMARK 200  WAVELENGTH OR RANGE        (A) : 0.97918                            
REMARK 200  MONOCHROMATOR                  : NULL                               
REMARK 200  OPTICS                         : NULL                               
REMARK 200                                                                      
REMARK 200  DETECTOR TYPE                  : PIXEL                              
REMARK 200  DETECTOR MANUFACTURER          : DECTRIS EIGER2 X 16M               
REMARK 200  INTENSITY-INTEGRATION SOFTWARE : HKL-3000                           
REMARK 200  DATA SCALING SOFTWARE          : HKL-3000                           
REMARK 200                                                                      
REMARK 200  NUMBER OF UNIQUE REFLECTIONS   : 13611                              
REMARK 200  RESOLUTION RANGE HIGH      (A) : 1.400                              
REMARK 200  RESOLUTION RANGE LOW       (A) : 50.000                             
REMARK 200  REJECTION CRITERIA  (SIGMA(I)) : NULL                               
REMARK 200                                                                      
REMARK 200 OVERALL.                                                             
REMARK 200  COMPLETENESS FOR RANGE     (%) : 97.9                               
REMARK 200  DATA REDUNDANCY                : 12.20                              
REMARK 200  R MERGE                    (I) : 0.12800                            
REMARK 200  R SYM                      (I) : NULL                               
REMARK 200  <I/SIGMA(I)> FOR THE DATA SET  : 7.9000                             
REMARK 200                                                                      
REMARK 200 IN THE HIGHEST RESOLUTION SHELL.                                     
REMARK 200  HIGHEST RESOLUTION SHELL, RANGE HIGH (A) : 1.40                     
REMARK 200  HIGHEST RESOLUTION SHELL, RANGE LOW  (A) : 1.42                     
REMARK 200  COMPLETENESS FOR SHELL     (%) : 78.2                               
REMARK 200  DATA REDUNDANCY IN SHELL       : 4.50                               
REMARK 200  R MERGE FOR SHELL          (I) : 0.72400                            
REMARK 200  R SYM FOR SHELL            (I) : NULL                               
REMARK 200  <I/SIGMA(I)> FOR SHELL         : NULL                               
REMARK 200                                                                      
REMARK 200 DIFFRACTION PROTOCOL: SINGLE WAVELENGTH                              
REMARK 200 METHOD USED TO DETERMINE THE STRUCTURE: MOLECULAR REPLACEMENT        
REMARK 200 SOFTWARE USED: PHASER                                                
REMARK 200 STARTING MODEL: NULL                                                 
REMARK 200                                                                      
REMARK 200 REMARK: NULL                                                         
REMARK 280                                                                      
REMARK 280 CRYSTAL                                                              
REMARK 280 SOLVENT CONTENT, VS   (%): 33.41                                     
REMARK 280 MATTHEWS COEFFICIENT, VM (ANGSTROMS**3/DA): 1.85                     
REMARK 280                                                                      
REMARK 280 CRYSTALLIZATION CONDITIONS: 25% PEG 3350, 0.2 M MGCL2, 0.1 M TRIS    
REMARK 280  PH 8.5, VAPOR DIFFUSION, SITTING DROP, TEMPERATURE 291K             
REMARK 290                                                                      
REMARK 290 CRYSTALLOGRAPHIC SYMMETRY                                            
REMARK 290 SYMMETRY OPERATORS FOR SPACE GROUP: P 21 21 21                       
REMARK 290                                                                      
REMARK 290      SYMOP   SYMMETRY                                                
REMARK 290     NNNMMM   OPERATOR                                                
REMARK 290       1555   X,Y,Z                                                   
REMARK 290       2555   -X+1/2,-Y,Z+1/2                                         
REMARK 290       3555   -X,Y+1/2,-Z+1/2                                         
REMARK 290       4555   X+1/2,-Y+1/2,-Z                                         
REMARK 290                                                                      
REMARK 290     WHERE NNN -> OPERATOR NUMBER                                     
REMARK 290           MMM -> TRANSLATION VECTOR                                  
REMARK 290                                                                      
REMARK 290 CRYSTALLOGRAPHIC SYMMETRY TRANSFORMATIONS                            
REMARK 290 THE FOLLOWING TRANSFORMATIONS OPERATE ON THE ATOM/HETATM             
REMARK 290 RECORDS IN THIS ENTRY TO PRODUCE CRYSTALLOGRAPHICALLY                
REMARK 290 RELATED MOLECULES.                                                   
REMARK 290   SMTRY1   1  1.000000  0.000000  0.000000        0.00000            
REMARK 290   SMTRY2   1  0.000000  1.000000  0.000000        0.00000            
REMARK 290   SMTRY3   1  0.000000  0.000000  1.000000        0.00000            
REMARK 290   SMTRY1   2 -1.000000  0.000000  0.000000       15.17550            
REMARK 290   SMTRY2   2  0.000000 -1.000000  0.000000        0.00000            
REMARK 290   SMTRY3   2  0.000000  0.000000  1.000000       33.04050            
REMARK 290   SMTRY1   3 -1.000000  0.000000  0.000000        0.00000            
REMARK 290   SMTRY2   3  0.000000  1.000000  0.000000       16.74600            
REMARK 290   SMTRY3   3  0.000000  0.000000 -1.000000       33.04050            
REMARK 290   SMTRY1   4  1.000000  0.000000  0.000000       15.17550            
REMARK 290   SMTRY2   4  0.000000 -1.000000  0.000000       16.74600            
REMARK 290   SMTRY3   4  0.000000  0.000000 -1.000000        0.00000            
REMARK 290                                                                      
REMARK 290 REMARK: NULL                                                         
REMARK 300                                                                      
REMARK 300 BIOMOLECULE: 1                                                       
REMARK 300 SEE REMARK 350 FOR THE AUTHOR PROVIDED AND/OR PROGRAM                
REMARK 300 GENERATED ASSEMBLY INFORMATION FOR THE STRUCTURE IN                  
REMARK 300 THIS ENTRY. THE REMARK MAY ALSO PROVIDE INFORMATION ON               
REMARK 300 BURIED SURFACE AREA.                                                 
REMARK 350                                                                      
REMARK 350 COORDINATES FOR A COMPLETE MULTIMER REPRESENTING THE KNOWN           
REMARK 350 BIOLOGICALLY SIGNIFICANT OLIGOMERIZATION STATE OF THE                
REMARK 350 MOLECULE CAN BE GENERATED BY APPLYING BIOMT TRANSFORMATIONS          
REMARK 350 GIVEN BELOW.  BOTH NON-CRYSTALLOGRAPHIC AND                          
REMARK 350 CRYSTALLOGRAPHIC OPERATIONS ARE GIVEN.                               
REMARK 350                                                                      
REMARK 350 BIOMOLECULE: 1                                                       
REMARK 350 AUTHOR DETERMINED BIOLOGICAL UNIT: MONOMERIC                         
REMARK 350 APPLY THE FOLLOWING TO CHAINS: A                                     
REMARK 350   BIOMT1   1  1.000000  0.000000  0.000000        0.00000            
REMARK 350   BIOMT2   1  0.000000  1.000000  0.000000        0.00000            
REMARK 350   BIOMT3   1  0.000000  0.000000  1.000000        0.00000            
REMARK 465                                                                      
REMARK 465 MISSING RESIDUES                                                     
REMARK 465 THE FOLLOWING RESIDUES WERE NOT LOCATED IN THE                       
REMARK 465 EXPERIMENT. (M=MODEL NUMBER; RES=RESIDUE NAME; C=CHAIN               
REMARK 465 IDENTIFIER; SSSEQ=SEQUENCE NUMBER; I=INSERTION CODE.)                
REMARK 465                                                                      
REMARK 465   M RES C SSSEQI                                                     
REMARK 465     GLY A   760                                                      
REMARK 465     ALA A   761                                                      
REMARK 465     GLN A   762                                                      
REMARK 465     ASN A   763                                                      
REMARK 465     THR A   764                                                      
REMARK 465     SER A   839                                                      
REMARK 470                                                                      
REMARK 470 MISSING ATOM                                                         
REMARK 470 THE FOLLOWING RESIDUES HAVE MISSING ATOMS (M=MODEL NUMBER;           
REMARK 470 RES=RESIDUE NAME; C=CHAIN IDENTIFIER; SSEQ=SEQUENCE NUMBER;          
REMARK 470 I=INSERTION CODE):                                                   
REMARK 470   M RES CSSEQI  ATOMS                                                
REMARK 470     GLN A 794    CD   OE1  NE2                                       
REMARK 470     ASN A 838    CG   OD1  ND2                                       
DBREF1 8TRE A  761   839  UNP                  TRIPC-2_HUMAN                    
DBREF2 8TRE A     Q14669-2                          761         839             
SEQADV 8TRE GLY A  760  UNP  Q14669-2            EXPRESSION TAG                 
SEQRES   1 A   80  GLY ALA GLN ASN THR ASP GLY ALA ILE TRP GLN TRP ARG          
SEQRES   2 A   80  ASP ASP ARG GLY LEU TRP HIS PRO TYR ASN ARG ILE ASP          
SEQRES   3 A   80  SER ARG ILE ILE GLU ALA ALA HIS GLN VAL GLY GLU ASP          
SEQRES   4 A   80  GLU ILE SER LEU SER THR LEU GLY ARG VAL TYR THR ILE          
SEQRES   5 A   80  ASP PHE ASN SER MET GLN GLN ILE ASN GLU ASP THR GLY          
SEQRES   6 A   80  THR ALA ARG ALA ILE GLN ARG LYS PRO ASN PRO LEU ALA          
SEQRES   7 A   80  ASN SER                                                      
HET    ATP  A1001      31                                                       
HET    UNX  A1002       1                                                       
HETNAM     ATP ADENOSINE-5'-TRIPHOSPHATE                                        
HETNAM     UNX UNKNOWN ATOM OR ION                                              
FORMUL   2  ATP    C10 H16 N5 O13 P3                                            
FORMUL   3  UNX    X                                                            
FORMUL   4  HOH   *54(H2 O)                                                     
HELIX    1 AA1 ASN A  782  VAL A  795  1                                  14    
SHEET    1 AA1 6 TRP A 778  PRO A 780  0                                        
SHEET    2 AA1 6 ALA A 767  ARG A 772 -1  N  TRP A 771   O  HIS A 779           
SHEET    3 AA1 6 ALA A 826  PRO A 833 -1  O  LYS A 832   N  ILE A 768           
SHEET    4 AA1 6 GLN A 817  ASN A 820 -1  N  GLN A 818   O  ARG A 827           
SHEET    5 AA1 6 ARG A 807  ASP A 812 -1  N  THR A 810   O  ILE A 819           
SHEET    6 AA1 6 GLU A 799  THR A 804 -1  N  LEU A 802   O  TYR A 809           
CRYST1   30.351   33.492   66.081  90.00  90.00  90.00 P 21 21 21    4          
ORIGX1      1.000000  0.000000  0.000000        0.00000                         
ORIGX2      0.000000  1.000000  0.000000        0.00000                         
ORIGX3      0.000000  0.000000  1.000000        0.00000                         
SCALE1      0.032948  0.000000  0.000000        0.00000                         
SCALE2      0.000000  0.029858  0.000000        0.00000                         
SCALE3      0.000000  0.000000  0.015133        0.00000                         
ATOM      1  N   ASP A 765      14.927   1.254   6.667  1.00 41.58           N  
ATOM      2  CA  ASP A 765      13.871   1.050   7.707  1.00 42.23           C  
ATOM      3  C   ASP A 765      14.504   1.186   9.098  1.00 39.83           C  
ATOM      4  O   ASP A 765      14.060   0.471  10.028  1.00 41.77           O  
ATOM      5  CB  ASP A 765      13.170  -0.306   7.539  1.00 44.92           C  
ATOM      6  CG  ASP A 765      12.196  -0.362   6.371  1.00 45.78           C  
ATOM      7  OD1 ASP A 765      11.787   0.720   5.894  1.00 39.52           O  
ATOM      8  OD2 ASP A 765      11.870  -1.493   5.932  1.00 51.05           O  
ATOM      9  N   GLY A 766      15.491   2.078   9.231  1.00 34.76           N  
ATOM     10  CA  GLY A 766      16.271   2.285  10.468  1.00 32.68           C  
ATOM     11  C   GLY A 766      15.565   3.188  11.477  1.00 27.75           C  
ATOM     12  O   GLY A 766      16.078   3.293  12.619  1.00 27.18           O  
ATOM     13  N   ALA A 767      14.398   3.763  11.130  1.00 23.73           N  
ATOM     14  CA  ALA A 767      13.670   4.696  12.019  1.00 21.77           C  
ATOM     15  C   ALA A 767      12.166   4.419  12.039  1.00 19.70           C  
ATOM     16  O   ALA A 767      11.593   4.175  10.986  1.00 23.49           O  
ATOM     17  CB  ALA A 767      13.933   6.116  11.586  1.00 22.37           C  
ATOM     18  N   ILE A 768      11.549   4.716  13.180  1.00 17.29           N  
ATOM     19  CA  ILE A 768      10.076   4.834  13.332  1.00 16.73           C  
ATOM     20  C   ILE A 768       9.766   6.313  13.583  1.00 15.11           C  
ATOM     21  O   ILE A 768      10.115   6.837  14.686  1.00 17.46           O  
ATOM     22  CB  ILE A 768       9.583   3.959  14.494  1.00 20.10           C  
ATOM     23  CG1 ILE A 768       9.984   2.491  14.297  1.00 22.97           C  
ATOM     24  CG2 ILE A 768       8.080   4.123  14.688  1.00 22.05           C  
ATOM     25  CD1 ILE A 768      10.384   1.822  15.575  1.00 24.75           C  
ATOM     26  N   TRP A 769       9.143   6.997  12.633  1.00 14.34           N  
ATOM     27  CA  TRP A 769       8.693   8.392  12.847  1.00 12.88           C  
ATOM     28  C   TRP A 769       7.281   8.391  13.440  1.00 12.69           C  
ATOM     29  O   TRP A 769       6.491   7.495  13.171  1.00 13.57           O  
ATOM     30  CB  TRP A 769       8.806   9.204  11.569  1.00 12.09           C  
ATOM     31  CG  TRP A 769      10.227   9.545  11.241  1.00 12.33           C  
ATOM     32  CD1 TRP A 769      11.134   8.745  10.597  1.00 12.80           C  
ATOM     33  CD2 TRP A 769      10.895  10.779  11.526  1.00 12.56           C  
ATOM     34  NE1 TRP A 769      12.314   9.409  10.450  1.00 13.63           N  
ATOM     35  CE2 TRP A 769      12.213  10.664  11.013  1.00 12.83           C  
ATOM     36  CE3 TRP A 769      10.503  11.983  12.119  1.00 13.18           C  
ATOM     37  CZ2 TRP A 769      13.139  11.714  11.099  1.00 12.97           C  
ATOM     38  CZ3 TRP A 769      11.423  13.005  12.200  1.00 13.42           C  
ATOM     39  CH2 TRP A 769      12.727  12.876  11.707  1.00 14.12           C  
ATOM     40  N   GLN A 770       7.003   9.379  14.285  1.00 12.26           N  
ATOM     41  CA  GLN A 770       5.680   9.555  14.904  1.00 11.95           C  
ATOM     42  C   GLN A 770       5.199  11.003  14.682  1.00 10.72           C  
ATOM     43  O   GLN A 770       6.020  11.893  14.618  1.00 12.55           O  
ATOM     44  CB  GLN A 770       5.721   9.255  16.392  1.00 12.71           C  
ATOM     45  CG  GLN A 770       6.203   7.836  16.729  1.00 14.02           C  
ATOM     46  CD  GLN A 770       6.077   7.618  18.211  1.00 14.76           C  
ATOM     47  OE1 GLN A 770       6.444   8.464  19.017  1.00 16.13           O  
ATOM     48  NE2 GLN A 770       5.413   6.542  18.595  1.00 19.81           N  
ATOM     49  N   TRP A 771       3.885  11.165  14.677  1.00 11.59           N  
ATOM     50  CA  TRP A 771       3.207  12.500  14.661  1.00 12.75           C  
ATOM     51  C   TRP A 771       2.302  12.637  15.884  1.00 12.70           C  
ATOM     52  O   TRP A 771       1.804  11.635  16.440  1.00 12.47           O  
ATOM     53  CB  TRP A 771       2.441  12.697  13.359  1.00 12.29           C  
ATOM     54  CG  TRP A 771       1.417  11.632  13.116  1.00 13.03           C  
ATOM     55  CD1 TRP A 771       1.588  10.447  12.460  1.00 14.42           C  
ATOM     56  CD2 TRP A 771       0.033  11.679  13.483  1.00 13.14           C  
ATOM     57  NE1 TRP A 771       0.410   9.770  12.388  1.00 14.00           N  
ATOM     58  CE2 TRP A 771      -0.559  10.488  13.025  1.00 13.76           C  
ATOM     59  CE3 TRP A 771      -0.771  12.628  14.139  1.00 14.14           C  
ATOM     60  CZ2 TRP A 771      -1.910  10.212  13.195  1.00 14.43           C  
ATOM     61  CZ3 TRP A 771      -2.103  12.343  14.320  1.00 14.03           C  
ATOM     62  CH2 TRP A 771      -2.655  11.141  13.875  1.00 15.49           C  
ATOM     63  N   ARG A 772       2.093  13.877  16.317  1.00 11.41           N  
ATOM     64  CA  ARG A 772       1.366  14.164  17.574  1.00 13.92           C  
ATOM     65  C   ARG A 772      -0.092  14.569  17.278  1.00 12.90           C  
ATOM     66  O   ARG A 772      -0.328  15.526  16.486  1.00 13.18           O  
ATOM     67  CB  ARG A 772       2.125  15.181  18.402  1.00 14.04           C  
ATOM     68  CG  ARG A 772       1.754  15.158  19.877  1.00 17.18           C  
ATOM     69  CD  ARG A 772       2.492  16.205  20.672  1.00 20.32           C  
ATOM     70  NE  ARG A 772       2.427  15.831  22.065  1.00 26.86           N  
ATOM     71  CZ  ARG A 772       2.971  16.515  23.047  1.00 34.50           C  
ATOM     72  NH1 ARG A 772       2.852  16.071  24.290  1.00 36.99           N  
ATOM     73  NH2 ARG A 772       3.636  17.631  22.785  1.00 35.05           N  
ATOM     74  N   ASP A 773      -1.064  13.883  17.884  1.00 13.94           N  
ATOM     75  CA  ASP A 773      -2.485  14.199  17.681  1.00 14.15           C  
ATOM     76  C   ASP A 773      -2.874  15.405  18.545  1.00 14.30           C  
ATOM     77  O   ASP A 773      -2.088  15.871  19.329  1.00 16.25           O  
ATOM     78  CB  ASP A 773      -3.363  12.949  17.850  1.00 16.16           C  
ATOM     79  CG  ASP A 773      -3.507  12.416  19.249  1.00 16.84           C  
ATOM     80  OD1 ASP A 773      -3.248  13.164  20.208  1.00 17.13           O  
ATOM     81  OD2 ASP A 773      -3.894  11.227  19.373  1.00 20.14           O  
ATOM     82  N   ASP A 774      -4.117  15.838  18.411  1.00 16.91           N  
ATOM     83  CA  ASP A 774      -4.633  17.052  19.094  1.00 19.30           C  
ATOM     84  C   ASP A 774      -4.588  16.838  20.595  1.00 20.96           C  
ATOM     85  O   ASP A 774      -4.298  17.815  21.331  1.00 23.95           O  
ATOM     86  CB  ASP A 774      -6.069  17.326  18.647  1.00 21.18           C  
ATOM     87  CG  ASP A 774      -6.161  17.749  17.193  1.00 22.60           C  
ATOM     88  OD1 ASP A 774      -5.126  18.226  16.650  1.00 25.87           O  
ATOM     89  OD2 ASP A 774      -7.261  17.588  16.580  1.00 27.19           O  
ATOM     90  N  AARG A 775      -4.821  15.593  21.041  0.50 21.44           N  
ATOM     91  N  BARG A 775      -4.938  15.626  21.025  0.50 20.95           N  
ATOM     92  CA AARG A 775      -4.911  15.179  22.474  0.50 22.73           C  
ATOM     93  CA BARG A 775      -4.935  15.241  22.451  0.50 21.71           C  
ATOM     94  C  AARG A 775      -3.518  14.850  23.040  0.50 21.23           C  
ATOM     95  C  BARG A 775      -3.528  15.460  23.006  0.50 20.86           C  
ATOM     96  O  AARG A 775      -3.404  14.354  24.196  0.50 23.13           O  
ATOM     97  O  BARG A 775      -3.435  16.100  24.088  0.50 18.83           O  
ATOM     98  CB AARG A 775      -5.824  13.965  22.604  0.50 25.48           C  
ATOM     99  CB BARG A 775      -5.390  13.799  22.649  0.50 23.84           C  
ATOM    100  CG AARG A 775      -5.739  13.306  23.968  0.50 28.60           C  
ATOM    101  CG BARG A 775      -5.042  13.263  24.025  0.50 26.43           C  
ATOM    102  CD AARG A 775      -6.312  11.912  23.987  0.50 30.72           C  
ATOM    103  CD BARG A 775      -6.011  12.192  24.444  0.50 26.76           C  
ATOM    104  NE AARG A 775      -6.077  11.286  25.278  0.50 32.85           N  
ATOM    105  NE BARG A 775      -5.640  11.548  25.685  0.50 30.33           N  
ATOM    106  CZ AARG A 775      -6.553  10.102  25.631  0.50 34.32           C  
ATOM    107  CZ BARG A 775      -6.132  10.381  26.074  0.50 32.06           C  
ATOM    108  NH1AARG A 775      -7.299   9.413  24.782  0.50 36.71           N  
ATOM    109  NH1BARG A 775      -5.751   9.838  27.217  0.50 33.54           N  
ATOM    110  NH2AARG A 775      -6.280   9.605  26.826  0.50 35.69           N  
ATOM    111  NH2BARG A 775      -6.996   9.752  25.298  0.50 33.76           N  
ATOM    112  N   GLY A 776      -2.486  15.066  22.238  1.00 18.98           N  
ATOM    113  CA  GLY A 776      -1.091  15.060  22.683  1.00 17.92           C  
ATOM    114  C   GLY A 776      -0.432  13.690  22.609  1.00 18.15           C  
ATOM    115  O   GLY A 776       0.713  13.551  23.046  1.00 19.49           O  
ATOM    116  N   LEU A 777      -1.101  12.702  22.030  1.00 15.63           N  
ATOM    117  CA  LEU A 777      -0.534  11.331  21.933  1.00 16.02           C  
ATOM    118  C   LEU A 777       0.233  11.156  20.626  1.00 14.91           C  
ATOM    119  O   LEU A 777      -0.058  11.837  19.631  1.00 15.60           O  
ATOM    120  CB  LEU A 777      -1.662  10.316  22.038  1.00 16.81           C  
ATOM    121  CG  LEU A 777      -2.475  10.389  23.334  1.00 19.62           C  
ATOM    122  CD1 LEU A 777      -3.570   9.357  23.301  1.00 19.72           C  
ATOM    123  CD2 LEU A 777      -1.595  10.214  24.562  1.00 20.48           C  
ATOM    124  N   TRP A 778       1.231  10.297  20.659  1.00 14.55           N  
ATOM    125  CA  TRP A 778       2.082  10.018  19.488  1.00 14.06           C  
ATOM    126  C   TRP A 778       1.571   8.820  18.721  1.00 14.02           C  
ATOM    127  O   TRP A 778       1.328   7.760  19.316  1.00 15.77           O  
ATOM    128  CB  TRP A 778       3.517   9.768  19.919  1.00 14.29           C  
ATOM    129  CG  TRP A 778       4.212  10.958  20.503  1.00 14.47           C  
ATOM    130  CD1 TRP A 778       4.440  11.222  21.821  1.00 16.58           C  
ATOM    131  CD2 TRP A 778       4.746  12.072  19.783  1.00 14.61           C  
ATOM    132  NE1 TRP A 778       5.071  12.421  21.968  1.00 19.41           N  
ATOM    133  CE2 TRP A 778       5.269  12.972  20.730  1.00 16.50           C  
ATOM    134  CE3 TRP A 778       4.806  12.387  18.432  1.00 13.76           C  
ATOM    135  CZ2 TRP A 778       5.911  14.141  20.357  1.00 16.85           C  
ATOM    136  CZ3 TRP A 778       5.422  13.549  18.069  1.00 14.08           C  
ATOM    137  CH2 TRP A 778       5.950  14.411  19.019  1.00 15.10           C  
ATOM    138  N   HIS A 779       1.535   8.937  17.413  1.00 12.80           N  
ATOM    139  CA  HIS A 779       1.107   7.858  16.495  1.00 13.88           C  
ATOM    140  C   HIS A 779       2.250   7.538  15.551  1.00 14.83           C  
ATOM    141  O   HIS A 779       2.796   8.424  14.903  1.00 14.16           O  
ATOM    142  CB  HIS A 779      -0.089   8.322  15.684  1.00 14.92           C  
ATOM    143  CG  HIS A 779      -1.269   8.628  16.494  1.00 15.35           C  
ATOM    144  ND1 HIS A 779      -2.233   7.694  16.731  1.00 20.40           N  
ATOM    145  CD2 HIS A 779      -1.600   9.714  17.199  1.00 16.49           C  
ATOM    146  CE1 HIS A 779      -3.167   8.233  17.486  1.00 21.34           C  
ATOM    147  NE2 HIS A 779      -2.811   9.477  17.766  1.00 18.15           N  
ATOM    148  N   PRO A 780       2.612   6.261  15.372  1.00 14.54           N  
ATOM    149  CA  PRO A 780       3.606   5.938  14.352  1.00 15.64           C  
ATOM    150  C   PRO A 780       3.049   6.160  12.949  1.00 17.25           C  
ATOM    151  O   PRO A 780       1.933   5.775  12.676  1.00 17.54           O  
ATOM    152  CB  PRO A 780       3.900   4.444  14.596  1.00 17.22           C  
ATOM    153  CG  PRO A 780       2.728   3.947  15.359  1.00 17.82           C  
ATOM    154  CD  PRO A 780       2.196   5.098  16.187  1.00 17.22           C  
ATOM    155  N   TYR A 781       3.833   6.745  12.059  1.00 15.21           N  
ATOM    156  CA  TYR A 781       3.586   6.698  10.600  1.00 17.59           C  
ATOM    157  C   TYR A 781       3.611   5.220  10.174  1.00 21.69           C  
ATOM    158  O   TYR A 781       4.208   4.466  10.890  1.00 23.03           O  
ATOM    159  CB  TYR A 781       4.634   7.542   9.887  1.00 15.94           C  
ATOM    160  CG  TYR A 781       4.429   9.038   9.967  1.00 14.63           C  
ATOM    161  CD1 TYR A 781       3.514   9.691   9.159  1.00 13.80           C  
ATOM    162  CD2 TYR A 781       5.168   9.799  10.869  1.00 13.06           C  
ATOM    163  CE1 TYR A 781       3.372  11.068   9.197  1.00 13.81           C  
ATOM    164  CE2 TYR A 781       5.046  11.181  10.920  1.00 13.19           C  
ATOM    165  CZ  TYR A 781       4.126  11.814  10.098  1.00 12.47           C  
ATOM    166  OH  TYR A 781       4.015  13.174  10.176  1.00 13.56           O  
ATOM    167  N   ASN A 782       2.969   4.871   9.054  1.00 27.03           N  
ATOM    168  CA  ASN A 782       3.078   3.504   8.458  1.00 30.92           C  
ATOM    169  C   ASN A 782       4.554   3.290   8.022  1.00 30.06           C  
ATOM    170  O   ASN A 782       5.298   4.286   7.935  1.00 28.00           O  
ATOM    171  CB  ASN A 782       2.000   3.296   7.391  1.00 34.53           C  
ATOM    172  CG  ASN A 782       2.176   4.194   6.189  1.00 36.86           C  
ATOM    173  OD1 ASN A 782       3.292   4.387   5.744  1.00 30.05           O  
ATOM    174  ND2 ASN A 782       1.093   4.745   5.664  1.00 37.05           N  
ATOM    175  N  AARG A 783       4.999   2.035   7.831  0.50 26.39           N  
ATOM    176  N  BARG A 783       4.971   2.031   7.811  0.50 27.89           N  
ATOM    177  CA AARG A 783       6.417   1.704   7.510  0.50 24.77           C  
ATOM    178  CA BARG A 783       6.369   1.635   7.482  0.50 27.01           C  
ATOM    179  C  AARG A 783       6.830   2.508   6.267  0.50 20.35           C  
ATOM    180  C  BARG A 783       6.831   2.444   6.259  0.50 21.64           C  
ATOM    181  O  AARG A 783       7.953   3.013   6.244  0.50 19.98           O  
ATOM    182  O  BARG A 783       7.981   2.897   6.252  0.50 21.21           O  
ATOM    183  CB AARG A 783       6.615   0.201   7.262  0.50 24.40           C  
ATOM    184  CB BARG A 783       6.436   0.120   7.227  0.50 28.11           C  
ATOM    185  CG AARG A 783       7.869  -0.145   6.473  0.50 26.59           C  
ATOM    186  CG BARG A 783       7.674  -0.372   6.490  0.50 31.18           C  
ATOM    187  CD AARG A 783       7.734  -1.492   5.775  0.50 28.41           C  
ATOM    188  CD BARG A 783       7.471  -1.803   5.982  0.50 32.24           C  
ATOM    189  NE AARG A 783       8.429  -2.525   6.510  0.50 27.49           N  
ATOM    190  NE BARG A 783       6.055  -2.092   5.761  0.50 33.83           N  
ATOM    191  CZ AARG A 783       8.565  -3.785   6.105  0.50 25.31           C  
ATOM    192  CZ BARG A 783       5.420  -1.958   4.601  0.50 31.53           C  
ATOM    193  NH1AARG A 783       9.226  -4.642   6.858  0.50 26.67           N  
ATOM    194  NH1BARG A 783       6.073  -1.556   3.526  0.50 32.66           N  
ATOM    195  NH2AARG A 783       8.005  -4.190   4.982  0.50 23.93           N  
ATOM    196  NH2BARG A 783       4.130  -2.225   4.517  0.50 35.14           N  
ATOM    197  N   ILE A 784       5.973   2.593   5.254  1.00 21.01           N  
ATOM    198  CA  ILE A 784       6.350   3.279   3.988  1.00 19.77           C  
ATOM    199  C   ILE A 784       6.484   4.779   4.262  1.00 18.06           C  
ATOM    200  O   ILE A 784       7.489   5.364   3.857  1.00 16.48           O  
ATOM    201  CB  ILE A 784       5.396   2.966   2.823  1.00 21.38           C  
ATOM    202  CG1 ILE A 784       5.590   1.535   2.324  1.00 24.93           C  
ATOM    203  CG2 ILE A 784       5.585   3.950   1.679  1.00 23.05           C  
ATOM    204  CD1 ILE A 784       4.514   1.077   1.361  1.00 28.20           C  
ATOM    205  N   ASP A 785       5.565   5.382   5.000  1.00 19.28           N  
ATOM    206  CA  ASP A 785       5.674   6.834   5.288  1.00 18.75           C  
ATOM    207  C   ASP A 785       6.904   7.075   6.199  1.00 16.44           C  
ATOM    208  O   ASP A 785       7.604   8.077   5.963  1.00 15.71           O  
ATOM    209  CB  ASP A 785       4.352   7.388   5.831  1.00 21.31           C  
ATOM    210  CG  ASP A 785       3.284   7.554   4.748  1.00 27.04           C  
ATOM    211  OD1 ASP A 785       3.639   7.568   3.531  1.00 29.00           O  
ATOM    212  OD2 ASP A 785       2.108   7.753   5.116  1.00 28.37           O  
ATOM    213  N   SER A 786       7.187   6.252   7.218  1.00 16.45           N  
ATOM    214  CA  SER A 786       8.434   6.379   8.026  1.00 17.65           C  
ATOM    215  C   SER A 786       9.633   6.307   7.102  1.00 16.35           C  
ATOM    216  O   SER A 786      10.595   7.048   7.290  1.00 17.15           O  
ATOM    217  CB  SER A 786       8.589   5.349   9.150  1.00 20.42           C  
ATOM    218  OG  SER A 786       7.721   5.589  10.218  1.00 22.62           O  
ATOM    219  N   ARG A 787       9.642   5.360   6.146  1.00 16.46           N  
ATOM    220  CA  ARG A 787      10.783   5.151   5.217  1.00 18.30           C  
ATOM    221  C   ARG A 787      10.995   6.411   4.372  1.00 15.46           C  
ATOM    222  O   ARG A 787      12.119   6.841   4.228  1.00 17.28           O  
ATOM    223  CB  ARG A 787      10.499   3.957   4.309  1.00 20.92           C  
ATOM    224  CG  ARG A 787      11.622   3.637   3.339  1.00 23.68           C  
ATOM    225  CD  ARG A 787      11.161   2.534   2.407  1.00 26.26           C  
ATOM    226  NE  ARG A 787      11.026   1.283   3.137  1.00 28.45           N  
ATOM    227  CZ  ARG A 787      10.290   0.244   2.739  1.00 31.02           C  
ATOM    228  NH1 ARG A 787       9.556   0.328   1.644  1.00 33.03           N  
ATOM    229  NH2 ARG A 787      10.266  -0.865   3.463  1.00 34.49           N  
ATOM    230  N   ILE A 788       9.918   7.018   3.900  1.00 16.21           N  
ATOM    231  CA  ILE A 788       9.957   8.231   3.053  1.00 15.15           C  
ATOM    232  C   ILE A 788      10.534   9.369   3.896  1.00 16.29           C  
ATOM    233  O   ILE A 788      11.464  10.040   3.463  1.00 16.76           O  
ATOM    234  CB  ILE A 788       8.554   8.586   2.509  1.00 16.95           C  
ATOM    235  CG1 ILE A 788       8.099   7.583   1.453  1.00 17.27           C  
ATOM    236  CG2 ILE A 788       8.509   9.987   1.959  1.00 17.35           C  
ATOM    237  CD1 ILE A 788       6.655   7.717   1.084  1.00 18.88           C  
ATOM    238  N   ILE A 789      10.022   9.557   5.102  1.00 14.57           N  
ATOM    239  CA  ILE A 789      10.491  10.639   6.002  1.00 14.82           C  
ATOM    240  C   ILE A 789      11.963  10.391   6.325  1.00 12.62           C  
ATOM    241  O   ILE A 789      12.764  11.371   6.267  1.00 14.67           O  
ATOM    242  CB  ILE A 789       9.590  10.747   7.242  1.00 14.51           C  
ATOM    243  CG1 ILE A 789       8.165  11.161   6.893  1.00 14.45           C  
ATOM    244  CG2 ILE A 789      10.194  11.691   8.280  1.00 13.62           C  
ATOM    245  CD1 ILE A 789       7.176  10.983   8.022  1.00 14.99           C  
ATOM    246  N   GLU A 790      12.300   9.175   6.755  1.00 14.72           N  
ATOM    247  CA  GLU A 790      13.672   8.869   7.196  1.00 14.76           C  
ATOM    248  C   GLU A 790      14.661   9.128   6.054  1.00 16.87           C  
ATOM    249  O   GLU A 790      15.734   9.730   6.299  1.00 17.43           O  
ATOM    250  CB  GLU A 790      13.725   7.429   7.682  1.00 15.91           C  
ATOM    251  CG  GLU A 790      15.095   6.981   8.133  1.00 17.45           C  
ATOM    252  CD  GLU A 790      15.738   7.776   9.260  1.00 21.17           C  
ATOM    253  OE1 GLU A 790      15.066   8.627   9.903  1.00 18.37           O  
ATOM    254  OE2 GLU A 790      16.953   7.507   9.526  1.00 24.57           O  
ATOM    255  N   ALA A 791      14.315   8.750   4.833  1.00 17.60           N  
ATOM    256  CA  ALA A 791      15.269   8.845   3.712  1.00 17.95           C  
ATOM    257  C   ALA A 791      15.561  10.305   3.420  1.00 18.50           C  
ATOM    258  O   ALA A 791      16.714  10.668   3.151  1.00 22.21           O  
ATOM    259  CB  ALA A 791      14.742   8.163   2.486  1.00 18.71           C  
ATOM    260  N   ALA A 792      14.560  11.153   3.492  1.00 16.90           N  
ATOM    261  CA  ALA A 792      14.703  12.598   3.273  1.00 16.41           C  
ATOM    262  C   ALA A 792      15.499  13.209   4.433  1.00 17.77           C  
ATOM    263  O   ALA A 792      16.422  14.020   4.190  1.00 18.85           O  
ATOM    264  CB  ALA A 792      13.352  13.234   3.137  1.00 17.46           C  
ATOM    265  N   HIS A 793      15.219  12.785   5.659  1.00 16.83           N  
ATOM    266  CA  HIS A 793      15.922  13.303   6.848  1.00 18.12           C  
ATOM    267  C   HIS A 793      17.411  12.967   6.744  1.00 17.68           C  
ATOM    268  O   HIS A 793      18.251  13.850   7.029  1.00 20.29           O  
ATOM    269  CB  HIS A 793      15.318  12.741   8.125  1.00 19.79           C  
ATOM    270  CG  HIS A 793      15.920  13.355   9.327  1.00 22.90           C  
ATOM    271  ND1 HIS A 793      16.621  12.609  10.243  1.00 25.15           N  
ATOM    272  CD2 HIS A 793      15.968  14.638   9.732  1.00 26.56           C  
ATOM    273  CE1 HIS A 793      17.034  13.401  11.214  1.00 25.79           C  
ATOM    274  NE2 HIS A 793      16.680  14.662  10.907  1.00 24.06           N  
ATOM    275  N  AGLN A 794      17.723  11.741   6.335  0.50 18.73           N  
ATOM    276  N  BGLN A 794      17.728  11.748   6.328  0.50 18.52           N  
ATOM    277  CA AGLN A 794      19.111  11.199   6.315  0.50 20.51           C  
ATOM    278  CA BGLN A 794      19.120  11.225   6.343  0.50 20.16           C  
ATOM    279  C  AGLN A 794      19.982  12.046   5.379  0.50 21.04           C  
ATOM    280  C  BGLN A 794      19.990  12.038   5.373  0.50 20.88           C  
ATOM    281  O  AGLN A 794      21.170  12.229   5.686  0.50 22.72           O  
ATOM    282  O  BGLN A 794      21.189  12.184   5.649  0.50 22.57           O  
ATOM    283  CB AGLN A 794      19.119   9.725   5.909  0.50 22.63           C  
ATOM    284  CB BGLN A 794      19.162   9.735   6.013  0.50 21.84           C  
ATOM    285  CG AGLN A 794      18.944   8.777   7.084  0.50 22.53           C  
ATOM    286  CG BGLN A 794      20.564   9.156   6.093  0.50 21.20           C  
ATOM    287  N   VAL A 795      19.439  12.522   4.259  1.00 21.25           N  
ATOM    288  CA  VAL A 795      20.230  13.320   3.262  1.00 21.51           C  
ATOM    289  C   VAL A 795      20.154  14.820   3.515  1.00 23.40           C  
ATOM    290  O   VAL A 795      20.664  15.579   2.662  1.00 26.40           O  
ATOM    291  CB  VAL A 795      19.788  13.007   1.825  1.00 22.43           C  
ATOM    292  CG1 VAL A 795      19.893  11.538   1.523  1.00 21.24           C  
ATOM    293  CG2 VAL A 795      18.387  13.505   1.521  1.00 21.63           C  
ATOM    294  N   GLY A 796      19.528  15.278   4.589  1.00 23.11           N  
ATOM    295  CA  GLY A 796      19.464  16.716   4.925  1.00 25.52           C  
ATOM    296  C   GLY A 796      18.494  17.520   4.063  1.00 25.86           C  
ATOM    297  O   GLY A 796      18.682  18.762   3.965  1.00 27.80           O  
ATOM    298  N   GLU A 797      17.440  16.894   3.524  1.00 25.04           N  
ATOM    299  CA  GLU A 797      16.301  17.637   2.921  1.00 27.94           C  
ATOM    300  C   GLU A 797      15.691  18.561   3.975  1.00 26.45           C  
ATOM    301  O   GLU A 797      15.549  18.119   5.127  1.00 29.23           O  
ATOM    302  CB  GLU A 797      15.231  16.659   2.450  1.00 32.27           C  
ATOM    303  CG  GLU A 797      15.682  15.781   1.315  1.00 36.65           C  
ATOM    304  CD  GLU A 797      15.105  16.207  -0.011  1.00 43.45           C  
ATOM    305  OE1 GLU A 797      15.518  17.277  -0.505  1.00 45.75           O  
ATOM    306  OE2 GLU A 797      14.210  15.497  -0.516  1.00 51.86           O  
ATOM    307  N   ASP A 798      15.301  19.770   3.604  1.00 25.23           N  
ATOM    308  CA  ASP A 798      14.624  20.705   4.537  1.00 25.28           C  
ATOM    309  C   ASP A 798      13.174  20.243   4.712  1.00 23.98           C  
ATOM    310  O   ASP A 798      12.638  20.390   5.812  1.00 20.97           O  
ATOM    311  CB  ASP A 798      14.707  22.156   4.045  1.00 29.12           C  
ATOM    312  CG  ASP A 798      16.096  22.765   4.163  1.00 37.33           C  
ATOM    313  OD1 ASP A 798      16.861  22.344   5.078  1.00 40.00           O  
ATOM    314  OD2 ASP A 798      16.402  23.663   3.345  1.00 42.62           O  
ATOM    315  N   GLU A 799      12.561  19.747   3.651  1.00 22.27           N  
ATOM    316  CA  GLU A 799      11.143  19.355   3.689  1.00 23.13           C  
ATOM    317  C   GLU A 799      10.858  18.340   2.600  1.00 21.84           C  
ATOM    318  O   GLU A 799      11.587  18.285   1.581  1.00 26.16           O  
ATOM    319  CB  GLU A 799      10.237  20.563   3.532  1.00 28.74           C  
ATOM    320  CG  GLU A 799      10.278  21.201   2.162  1.00 33.49           C  
ATOM    321  CD  GLU A 799       9.271  22.331   2.001  1.00 41.78           C  
ATOM    322  OE1 GLU A 799       9.281  23.246   2.844  1.00 43.58           O  
ATOM    323  OE2 GLU A 799       8.455  22.275   1.048  1.00 49.10           O  
ATOM    324  N  AILE A 800       9.781  17.614   2.785  0.50 21.58           N  
ATOM    325  N  BILE A 800       9.831  17.499   2.822  0.50 21.00           N  
ATOM    326  CA AILE A 800       9.225  16.768   1.715  0.50 20.95           C  
ATOM    327  CA BILE A 800       9.307  16.482   1.848  0.50 19.65           C  
ATOM    328  C  AILE A 800       7.718  16.885   1.770  0.50 19.88           C  
ATOM    329  C  BILE A 800       7.766  16.467   1.910  0.50 19.60           C  
ATOM    330  O  AILE A 800       7.167  17.507   2.701  0.50 17.21           O  
ATOM    331  O  BILE A 800       7.209  16.553   3.051  0.50 15.37           O  
ATOM    332  CB AILE A 800       9.727  15.332   1.856  0.50 21.75           C  
ATOM    333  CB BILE A 800       9.924  15.092   2.119  0.50 21.51           C  
ATOM    334  CG1AILE A 800       9.451  14.781   3.256  0.50 22.74           C  
ATOM    335  CG1BILE A 800       9.861  14.183   0.890  0.50 21.76           C  
ATOM    336  CG2AILE A 800      11.199  15.273   1.503  0.50 21.37           C  
ATOM    337  CG2BILE A 800       9.286  14.439   3.332  0.50 21.50           C  
ATOM    338  CD1AILE A 800       9.081  13.328   3.271  0.50 24.36           C  
ATOM    339  CD1BILE A 800      10.720  14.664  -0.249  0.50 22.80           C  
ATOM    340  N   SER A 801       7.090  16.359   0.742  1.00 18.71           N  
ATOM    341  CA  SER A 801       5.621  16.252   0.645  1.00 21.66           C  
ATOM    342  C   SER A 801       5.261  14.789   0.866  1.00 21.97           C  
ATOM    343  O   SER A 801       5.999  13.914   0.374  1.00 24.80           O  
ATOM    344  CB  SER A 801       5.094  16.764  -0.674  1.00 24.87           C  
ATOM    345  OG  SER A 801       5.330  18.152  -0.827  1.00 35.38           O  
ATOM    346  N   LEU A 802       4.190  14.528   1.600  1.00 19.49           N  
ATOM    347  CA  LEU A 802       3.676  13.182   1.938  1.00 24.35           C  
ATOM    348  C   LEU A 802       2.173  13.206   1.641  1.00 22.97           C  
ATOM    349  O   LEU A 802       1.529  14.154   2.071  1.00 21.72           O  
ATOM    350  CB  LEU A 802       3.971  12.959   3.436  1.00 26.34           C  
ATOM    351  CG  LEU A 802       4.073  11.530   3.939  1.00 29.34           C  
ATOM    352  CD1 LEU A 802       5.297  10.849   3.369  1.00 32.82           C  
ATOM    353  CD2 LEU A 802       4.129  11.491   5.459  1.00 29.15           C  
ATOM    354  N   SER A 803       1.615  12.235   0.900  1.00 23.58           N  
ATOM    355  CA  SER A 803       0.138  12.120   0.794  1.00 26.20           C  
ATOM    356  C   SER A 803      -0.309  10.884   1.557  1.00 26.47           C  
ATOM    357  O   SER A 803       0.213   9.789   1.275  1.00 28.41           O  
ATOM    358  CB  SER A 803      -0.387  12.103  -0.616  1.00 30.71           C  
ATOM    359  OG  SER A 803      -1.815  12.177  -0.583  1.00 34.81           O  
ATOM    360  N   THR A 804      -1.209  11.057   2.510  1.00 28.14           N  
ATOM    361  CA  THR A 804      -1.917   9.946   3.172  1.00 29.87           C  
ATOM    362  C   THR A 804      -3.373  10.367   3.359  1.00 28.65           C  
ATOM    363  O   THR A 804      -3.618  11.588   3.566  1.00 26.10           O  
ATOM    364  CB  THR A 804      -1.176   9.516   4.447  1.00 33.11           C  
ATOM    365  OG1 THR A 804      -1.845   8.401   5.042  1.00 39.64           O  
ATOM    366  CG2 THR A 804      -1.050  10.628   5.461  1.00 35.90           C  
ATOM    367  N   LEU A 805      -4.295   9.414   3.183  1.00 25.52           N  
ATOM    368  CA  LEU A 805      -5.757   9.566   3.407  1.00 25.50           C  
ATOM    369  C   LEU A 805      -6.328  10.652   2.493  1.00 27.39           C  
ATOM    370  O   LEU A 805      -7.427  11.211   2.820  1.00 31.09           O  
ATOM    371  CB  LEU A 805      -6.017   9.890   4.877  1.00 29.45           C  
ATOM    372  CG  LEU A 805      -5.561   8.819   5.862  1.00 31.65           C  
ATOM    373  CD1 LEU A 805      -5.836   9.260   7.297  1.00 33.12           C  
ATOM    374  CD2 LEU A 805      -6.233   7.482   5.581  1.00 35.02           C  
ATOM    375  N   GLY A 806      -5.654  10.935   1.381  1.00 23.46           N  
ATOM    376  CA  GLY A 806      -6.094  11.944   0.412  1.00 25.12           C  
ATOM    377  C   GLY A 806      -5.746  13.360   0.831  1.00 22.30           C  
ATOM    378  O   GLY A 806      -6.181  14.304   0.151  1.00 23.10           O  
ATOM    379  N  AARG A 807      -4.961  13.463   1.905  0.75 23.28           N  
ATOM    380  N  BARG A 807      -4.861  13.558   1.819  0.25 20.45           N  
ATOM    381  CA AARG A 807      -4.502  14.733   2.487  0.75 23.98           C  
ATOM    382  CA BARG A 807      -4.421  14.922   2.255  0.25 19.22           C  
ATOM    383  C  AARG A 807      -3.080  14.945   2.003  0.75 24.09           C  
ATOM    384  C  BARG A 807      -3.016  15.201   1.687  0.25 18.88           C  
ATOM    385  O  AARG A 807      -2.383  13.931   1.727  0.75 28.98           O  
ATOM    386  O  BARG A 807      -2.357  14.225   1.271  0.25 20.57           O  
ATOM    387  CB AARG A 807      -4.550  14.679   4.017  0.75 25.10           C  
ATOM    388  CB BARG A 807      -4.475  15.015   3.787  0.25 18.68           C  
ATOM    389  CG AARG A 807      -5.905  14.266   4.575  0.75 27.37           C  
ATOM    390  CG BARG A 807      -5.741  14.418   4.395  0.25 18.72           C  
ATOM    391  CD AARG A 807      -6.394  15.290   5.568  0.75 29.42           C  
ATOM    392  CD BARG A 807      -5.576  14.112   5.870  0.25 17.88           C  
ATOM    393  NE AARG A 807      -7.590  14.879   6.296  0.75 30.12           N  
ATOM    394  NE BARG A 807      -6.749  13.476   6.443  0.25 17.80           N  
ATOM    395  CZ AARG A 807      -8.273  15.672   7.114  0.75 31.48           C  
ATOM    396  CZ BARG A 807      -6.816  12.980   7.676  0.25 16.70           C  
ATOM    397  NH1AARG A 807      -9.339  15.216   7.756  0.75 33.53           N  
ATOM    398  NH1BARG A 807      -7.939  12.431   8.107  0.25 17.23           N  
ATOM    399  NH2AARG A 807      -7.887  16.924   7.291  0.75 32.80           N  
ATOM    400  NH2BARG A 807      -5.753  13.007   8.459  0.25 16.88           N  
ATOM    401  N  AVAL A 808      -2.691  16.201   1.855  0.70 24.41           N  
ATOM    402  N  BVAL A 808      -2.580  16.470   1.607  0.30 19.95           N  
ATOM    403  CA AVAL A 808      -1.306  16.559   1.467  0.70 25.53           C  
ATOM    404  CA BVAL A 808      -1.158  16.780   1.273  0.30 20.25           C  
ATOM    405  C  AVAL A 808      -0.667  17.197   2.698  0.70 20.21           C  
ATOM    406  C  BVAL A 808      -0.506  17.360   2.529  0.30 18.65           C  
ATOM    407  O  AVAL A 808      -1.276  18.103   3.295  0.70 19.29           O  
ATOM    408  O  BVAL A 808      -0.904  18.463   2.945  0.30 17.54           O  
ATOM    409  CB AVAL A 808      -1.232  17.464   0.223  0.70 29.24           C  
ATOM    410  CB BVAL A 808      -0.981  17.729   0.073  0.30 20.82           C  
ATOM    411  CG1AVAL A 808      -2.055  16.907  -0.925  0.70 31.74           C  
ATOM    412  CG1BVAL A 808       0.494  17.901  -0.263  0.30 20.47           C  
ATOM    413  CG2AVAL A 808      -1.645  18.894   0.515  0.70 30.64           C  
ATOM    414  CG2BVAL A 808      -1.755  17.275  -1.157  0.30 20.79           C  
ATOM    415  N   TYR A 809       0.462  16.641   3.096  1.00 18.44           N  
ATOM    416  CA  TYR A 809       1.268  17.140   4.217  1.00 17.04           C  
ATOM    417  C   TYR A 809       2.630  17.567   3.710  1.00 17.68           C  
ATOM    418  O   TYR A 809       3.221  16.910   2.831  1.00 20.08           O  
ATOM    419  CB  TYR A 809       1.382  16.057   5.271  1.00 16.81           C  
ATOM    420  CG  TYR A 809       0.078  15.709   5.935  1.00 17.63           C  
ATOM    421  CD1 TYR A 809      -0.575  16.608   6.753  1.00 16.72           C  
ATOM    422  CD2 TYR A 809      -0.464  14.438   5.836  1.00 17.77           C  
ATOM    423  CE1 TYR A 809      -1.773  16.305   7.379  1.00 17.04           C  
ATOM    424  CE2 TYR A 809      -1.643  14.098   6.481  1.00 20.24           C  
ATOM    425  CZ  TYR A 809      -2.297  15.032   7.273  1.00 19.48           C  
ATOM    426  OH  TYR A 809      -3.449  14.690   7.936  1.00 20.15           O  
ATOM    427  N   THR A 810       3.143  18.629   4.291  1.00 15.04           N  
ATOM    428  CA  THR A 810       4.556  18.973   4.199  1.00 15.40           C  
ATOM    429  C   THR A 810       5.188  18.482   5.488  1.00 15.22           C  
ATOM    430  O   THR A 810       4.710  18.894   6.558  1.00 16.31           O  
ATOM    431  CB  THR A 810       4.801  20.460   3.992  1.00 18.64           C  
ATOM    432  OG1 THR A 810       4.353  20.863   2.692  1.00 22.78           O  
ATOM    433  CG2 THR A 810       6.273  20.807   4.084  1.00 19.80           C  
ATOM    434  N   ILE A 811       6.244  17.698   5.386  1.00 14.45           N  
ATOM    435  CA  ILE A 811       7.113  17.341   6.539  1.00 15.69           C  
ATOM    436  C   ILE A 811       8.277  18.343   6.539  1.00 15.95           C  
ATOM    437  O   ILE A 811       9.054  18.321   5.614  1.00 17.55           O  
ATOM    438  CB  ILE A 811       7.570  15.867   6.425  1.00 17.54           C  
ATOM    439  CG1 ILE A 811       6.401  14.890   6.215  1.00 19.09           C  
ATOM    440  CG2 ILE A 811       8.439  15.470   7.601  1.00 20.00           C  
ATOM    441  CD1 ILE A 811       5.316  14.976   7.233  1.00 20.53           C  
ATOM    442  N   ASP A 812       8.296  19.254   7.512  1.00 16.48           N  
ATOM    443  CA  ASP A 812       9.267  20.369   7.630  1.00 18.24           C  
ATOM    444  C   ASP A 812      10.276  19.956   8.693  1.00 17.22           C  
ATOM    445  O   ASP A 812       9.941  19.990   9.867  1.00 16.72           O  
ATOM    446  CB  ASP A 812       8.537  21.669   7.968  1.00 20.31           C  
ATOM    447  CG  ASP A 812       9.452  22.826   8.315  1.00 25.57           C  
ATOM    448  OD1 ASP A 812      10.669  22.690   8.116  1.00 28.48           O  
ATOM    449  OD2 ASP A 812       8.933  23.844   8.839  1.00 34.66           O  
ATOM    450  N   PHE A 813      11.488  19.580   8.295  1.00 16.32           N  
ATOM    451  CA  PHE A 813      12.539  19.149   9.248  1.00 17.82           C  
ATOM    452  C   PHE A 813      13.196  20.354   9.951  1.00 17.28           C  
ATOM    453  O   PHE A 813      13.778  20.148  11.037  1.00 20.11           O  
ATOM    454  CB  PHE A 813      13.585  18.304   8.525  1.00 18.28           C  
ATOM    455  CG  PHE A 813      13.036  17.025   7.940  1.00 18.07           C  
ATOM    456  CD1 PHE A 813      12.620  16.006   8.777  1.00 18.26           C  
ATOM    457  CD2 PHE A 813      12.946  16.842   6.569  1.00 20.00           C  
ATOM    458  CE1 PHE A 813      12.133  14.828   8.258  1.00 20.22           C  
ATOM    459  CE2 PHE A 813      12.438  15.662   6.043  1.00 20.65           C  
ATOM    460  CZ  PHE A 813      12.056  14.649   6.898  1.00 18.98           C  
ATOM    461  N   ASN A 814      13.075  21.554   9.393  1.00 17.57           N  
ATOM    462  CA  ASN A 814      13.664  22.757  10.041  1.00 19.67           C  
ATOM    463  C   ASN A 814      12.887  23.056  11.312  1.00 19.66           C  
ATOM    464  O   ASN A 814      13.462  23.579  12.252  1.00 21.18           O  
ATOM    465  CB  ASN A 814      13.705  23.963   9.107  1.00 23.52           C  
ATOM    466  CG  ASN A 814      14.706  23.804   7.988  1.00 29.37           C  
ATOM    467  OD1 ASN A 814      15.657  23.037   8.111  1.00 35.00           O  
ATOM    468  ND2 ASN A 814      14.532  24.578   6.931  1.00 36.23           N  
ATOM    469  N   SER A 815      11.594  22.779  11.338  1.00 18.74           N  
ATOM    470  CA  SER A 815      10.738  23.016  12.525  1.00 18.83           C  
ATOM    471  C   SER A 815      10.291  21.691  13.175  1.00 17.86           C  
ATOM    472  O   SER A 815       9.653  21.735  14.240  1.00 20.67           O  
ATOM    473  CB  SER A 815       9.586  23.889  12.180  1.00 20.40           C  
ATOM    474  OG  SER A 815       8.778  23.261  11.187  1.00 23.94           O  
ATOM    475  N  AMET A 816      10.590  20.550  12.549  0.50 17.60           N  
ATOM    476  N  BMET A 816      10.587  20.561  12.529  0.50 17.72           N  
ATOM    477  CA AMET A 816      10.182  19.208  13.041  0.50 16.02           C  
ATOM    478  CA BMET A 816      10.195  19.204  12.984  0.50 16.31           C  
ATOM    479  C  AMET A 816       8.662  19.168  13.204  0.50 14.32           C  
ATOM    480  C  BMET A 816       8.679  19.156  13.187  0.50 14.51           C  
ATOM    481  O  AMET A 816       8.147  18.846  14.300  0.50 13.75           O  
ATOM    482  O  BMET A 816       8.190  18.812  14.287  0.50 14.34           O  
ATOM    483  CB AMET A 816      10.891  18.849  14.351  0.50 18.09           C  
ATOM    484  CB BMET A 816      10.938  18.797  14.256  0.50 18.24           C  
ATOM    485  CG AMET A 816      12.248  18.223  14.119  0.50 17.77           C  
ATOM    486  CG BMET A 816      11.335  17.345  14.248  0.50 18.44           C  
ATOM    487  SD AMET A 816      12.117  16.596  13.339  0.50 19.21           S  
ATOM    488  SD BMET A 816      12.292  16.851  12.742  0.50 17.92           S  
ATOM    489  CE AMET A 816      13.618  16.611  12.355  0.50 20.83           C  
ATOM    490  CE BMET A 816      13.890  17.549  13.137  0.50 20.38           C  
ATOM    491  N   GLN A 817       7.959  19.470  12.123  1.00 12.73           N  
ATOM    492  CA  GLN A 817       6.500  19.508  12.123  1.00 13.63           C  
ATOM    493  C   GLN A 817       5.975  18.877  10.851  1.00 13.96           C  
ATOM    494  O   GLN A 817       6.641  18.953   9.817  1.00 14.80           O  
ATOM    495  CB  GLN A 817       5.982  20.944  12.165  1.00 15.90           C  
ATOM    496  CG  GLN A 817       6.247  21.627  13.488  1.00 19.11           C  
ATOM    497  CD  GLN A 817       5.886  23.096  13.448  1.00 19.93           C  
ATOM    498  OE1 GLN A 817       6.089  23.797  12.454  1.00 24.46           O  
ATOM    499  NE2 GLN A 817       5.328  23.558  14.540  1.00 27.79           N  
ATOM    500  N   GLN A 818       4.793  18.322  10.945  1.00 12.45           N  
ATOM    501  CA  GLN A 818       3.918  17.934   9.827  1.00 12.24           C  
ATOM    502  C   GLN A 818       2.889  19.040   9.632  1.00 13.51           C  
ATOM    503  O   GLN A 818       2.227  19.415  10.632  1.00 13.81           O  
ATOM    504  CB  GLN A 818       3.201  16.637  10.134  1.00 12.77           C  
ATOM    505  CG  GLN A 818       2.202  16.250   9.056  1.00 13.05           C  
ATOM    506  CD  GLN A 818       1.246  15.209   9.550  1.00 13.26           C  
ATOM    507  OE1 GLN A 818       1.547  14.016   9.509  1.00 13.99           O  
ATOM    508  NE2 GLN A 818       0.061  15.637   9.991  1.00 13.20           N  
ATOM    509  N   ILE A 819       2.798  19.605   8.430  1.00 12.00           N  
ATOM    510  CA  ILE A 819       1.913  20.762   8.143  1.00 12.78           C  
ATOM    511  C   ILE A 819       0.868  20.313   7.130  1.00 13.22           C  
ATOM    512  O   ILE A 819       1.267  19.889   6.040  1.00 14.26           O  
ATOM    513  CB  ILE A 819       2.713  21.943   7.610  1.00 15.54           C  
ATOM    514  CG1 ILE A 819       3.879  22.304   8.544  1.00 15.80           C  
ATOM    515  CG2 ILE A 819       1.794  23.130   7.350  1.00 16.88           C  
ATOM    516  CD1 ILE A 819       4.902  23.204   7.910  1.00 18.01           C  
ATOM    517  N   ASN A 820      -0.405  20.444   7.470  1.00 14.79           N  
ATOM    518  CA  ASN A 820      -1.523  20.273   6.514  1.00 17.96           C  
ATOM    519  C   ASN A 820      -1.580  21.517   5.647  1.00 18.50           C  
ATOM    520  O   ASN A 820      -1.875  22.583   6.162  1.00 19.07           O  
ATOM    521  CB  ASN A 820      -2.830  20.029   7.232  1.00 16.52           C  
ATOM    522  CG  ASN A 820      -3.956  19.759   6.267  1.00 19.41           C  
ATOM    523  OD1 ASN A 820      -4.026  20.412   5.229  1.00 21.38           O  
ATOM    524  ND2 ASN A 820      -4.766  18.775   6.581  1.00 21.22           N  
ATOM    525  N  AGLU A 821      -1.339  21.351   4.347  0.50 23.17           N  
ATOM    526  N  BGLU A 821      -1.257  21.367   4.359  0.50 23.32           N  
ATOM    527  CA AGLU A 821      -1.088  22.484   3.427  0.50 25.52           C  
ATOM    528  CA BGLU A 821      -1.109  22.495   3.402  0.50 25.61           C  
ATOM    529  C  AGLU A 821      -2.413  23.109   2.976  0.50 25.47           C  
ATOM    530  C  BGLU A 821      -2.449  23.244   3.299  0.50 26.33           C  
ATOM    531  O  AGLU A 821      -2.343  24.145   2.311  0.50 25.22           O  
ATOM    532  O  BGLU A 821      -2.453  24.503   3.328  0.50 25.05           O  
ATOM    533  CB AGLU A 821      -0.230  22.014   2.253  0.50 27.21           C  
ATOM    534  CB BGLU A 821      -0.587  21.945   2.068  0.50 27.10           C  
ATOM    535  CG AGLU A 821       1.250  21.906   2.596  0.50 28.91           C  
ATOM    536  CG BGLU A 821       0.657  21.059   2.221  0.50 28.75           C  
ATOM    537  CD AGLU A 821       1.866  23.170   3.172  0.50 31.28           C  
ATOM    538  CD BGLU A 821       1.393  20.662   0.942  0.50 30.30           C  
ATOM    539  OE1AGLU A 821       1.156  24.183   3.251  0.50 33.37           O  
ATOM    540  OE1BGLU A 821       0.842  20.872  -0.161  0.50 34.65           O  
ATOM    541  OE2AGLU A 821       3.057  23.135   3.539  0.50 33.04           O  
ATOM    542  OE2BGLU A 821       2.516  20.137   1.048  0.50 32.42           O  
ATOM    543  N   ASP A 822      -3.551  22.505   3.342  1.00 24.07           N  
ATOM    544  CA  ASP A 822      -4.916  23.055   3.113  1.00 26.33           C  
ATOM    545  C   ASP A 822      -5.399  23.823   4.353  1.00 26.25           C  
ATOM    546  O   ASP A 822      -5.944  24.914   4.168  1.00 31.94           O  
ATOM    547  CB  ASP A 822      -5.850  21.931   2.667  1.00 30.87           C  
ATOM    548  CG  ASP A 822      -5.522  21.446   1.262  1.00 39.26           C  
ATOM    549  OD1 ASP A 822      -5.320  22.317   0.372  1.00 42.80           O  
ATOM    550  OD2 ASP A 822      -5.408  20.213   1.073  1.00 47.40           O  
ATOM    551  N   THR A 823      -5.183  23.326   5.579  1.00 20.33           N  
ATOM    552  CA  THR A 823      -5.806  23.917   6.799  1.00 19.98           C  
ATOM    553  C   THR A 823      -4.798  24.782   7.548  1.00 18.98           C  
ATOM    554  O   THR A 823      -5.223  25.588   8.407  1.00 20.88           O  
ATOM    555  CB  THR A 823      -6.346  22.850   7.754  1.00 19.48           C  
ATOM    556  OG1 THR A 823      -5.214  22.152   8.270  1.00 18.46           O  
ATOM    557  CG2 THR A 823      -7.276  21.872   7.086  1.00 20.03           C  
ATOM    558  N   GLY A 824      -3.503  24.585   7.298  1.00 17.24           N  
ATOM    559  CA  GLY A 824      -2.412  25.278   8.009  1.00 18.25           C  
ATOM    560  C   GLY A 824      -2.131  24.688   9.390  1.00 16.34           C  
ATOM    561  O   GLY A 824      -1.295  25.253  10.142  1.00 17.38           O  
ATOM    562  N   THR A 825      -2.711  23.547   9.731  1.00 16.10           N  
ATOM    563  CA  THR A 825      -2.444  22.882  11.022  1.00 15.82           C  
ATOM    564  C   THR A 825      -1.049  22.248  11.004  1.00 14.09           C  
ATOM    565  O   THR A 825      -0.756  21.414  10.130  1.00 15.22           O  
ATOM    566  CB  THR A 825      -3.524  21.895  11.408  1.00 15.45           C  
ATOM    567  OG1 THR A 825      -4.764  22.594  11.573  1.00 17.13           O  
ATOM    568  CG2 THR A 825      -3.187  21.150  12.685  1.00 16.26           C  
ATOM    569  N   ALA A 826      -0.254  22.614  11.995  1.00 14.66           N  
ATOM    570  CA  ALA A 826       1.100  22.098  12.230  1.00 12.73           C  
ATOM    571  C   ALA A 826       1.095  21.206  13.468  1.00 14.34           C  
ATOM    572  O   ALA A 826       0.541  21.593  14.503  1.00 16.33           O  
ATOM    573  CB  ALA A 826       2.094  23.224  12.398  1.00 15.01           C  
ATOM    574  N  AARG A 827       1.654  19.993  13.326  0.50 13.03           N  
ATOM    575  N  BARG A 827       1.698  20.043  13.396  0.50 12.85           N  
ATOM    576  CA AARG A 827       1.775  18.939  14.380  0.50 12.74           C  
ATOM    577  CA BARG A 827       1.804  19.210  14.603  0.50 12.22           C  
ATOM    578  C  AARG A 827       3.254  18.609  14.622  0.50 12.50           C  
ATOM    579  C  BARG A 827       3.184  18.570  14.649  0.50 12.40           C  
ATOM    580  O  AARG A 827       4.017  18.540  13.644  0.50 13.75           O  
ATOM    581  O  BARG A 827       3.790  18.329  13.592  0.50 13.66           O  
ATOM    582  CB AARG A 827       1.025  17.674  13.935  0.50 13.02           C  
ATOM    583  CB BARG A 827       0.646  18.218  14.621  0.50 12.61           C  
ATOM    584  CG AARG A 827      -0.481  17.856  13.891  0.50 13.11           C  
ATOM    585  CG BARG A 827       0.679  17.227  13.473  0.50 12.14           C  
ATOM    586  CD AARG A 827      -1.244  16.656  13.391  0.50 14.42           C  
ATOM    587  CD BARG A 827      -0.488  16.276  13.543  0.50 13.55           C  
ATOM    588  NE AARG A 827      -2.657  16.989  13.276  0.50 14.41           N  
ATOM    589  NE BARG A 827      -1.751  16.941  13.259  0.50 14.85           N  
ATOM    590  CZ AARG A 827      -3.476  17.161  14.309  0.50 16.89           C  
ATOM    591  CZ BARG A 827      -2.674  17.215  14.159  0.50 15.28           C  
ATOM    592  NH1AARG A 827      -3.023  17.002  15.540  0.50 16.85           N  
ATOM    593  NH1BARG A 827      -2.490  16.892  15.425  0.50 15.42           N  
ATOM    594  NH2AARG A 827      -4.735  17.509  14.102  0.50 17.66           N  
ATOM    595  NH2BARG A 827      -3.788  17.821  13.789  0.50 16.45           N  
ATOM    596  N   ALA A 828       3.643  18.289  15.853  1.00 11.87           N  
ATOM    597  CA  ALA A 828       5.017  17.860  16.090  1.00 11.86           C  
ATOM    598  C   ALA A 828       5.252  16.454  15.510  1.00 11.84           C  
ATOM    599  O   ALA A 828       4.290  15.663  15.455  1.00 13.14           O  
ATOM    600  CB  ALA A 828       5.327  17.852  17.534  1.00 12.40           C  
ATOM    601  N   ILE A 829       6.466  16.218  15.066  1.00 11.90           N  
ATOM    602  CA  ILE A 829       6.917  14.857  14.697  1.00 12.66           C  
ATOM    603  C   ILE A 829       8.153  14.533  15.512  1.00 13.23           C  
ATOM    604  O   ILE A 829       8.835  15.451  16.001  1.00 14.14           O  
ATOM    605  CB  ILE A 829       7.153  14.735  13.171  1.00 13.65           C  
ATOM    606  CG1 ILE A 829       8.370  15.549  12.734  1.00 14.35           C  
ATOM    607  CG2 ILE A 829       5.879  15.053  12.396  1.00 13.99           C  
ATOM    608  CD1 ILE A 829       8.669  15.511  11.268  1.00 14.39           C  
ATOM    609  N   GLN A 830       8.419  13.245  15.680  1.00 12.75           N  
ATOM    610  CA  GLN A 830       9.676  12.815  16.320  1.00 13.04           C  
ATOM    611  C   GLN A 830      10.093  11.467  15.752  1.00 12.30           C  
ATOM    612  O   GLN A 830       9.275  10.757  15.152  1.00 12.78           O  
ATOM    613  CB  GLN A 830       9.558  12.770  17.840  1.00 14.90           C  
ATOM    614  CG  GLN A 830       8.577  11.735  18.345  1.00 14.17           C  
ATOM    615  CD  GLN A 830       8.493  11.695  19.852  1.00 16.58           C  
ATOM    616  OE1 GLN A 830       9.037  12.558  20.544  1.00 19.78           O  
ATOM    617  NE2 GLN A 830       7.806  10.696  20.348  1.00 17.84           N  
ATOM    618  N   ARG A 831      11.364  11.156  15.963  1.00 14.15           N  
ATOM    619  CA  ARG A 831      12.017   9.954  15.405  1.00 14.25           C  
ATOM    620  C   ARG A 831      12.440   9.033  16.547  1.00 14.92           C  
ATOM    621  O   ARG A 831      13.148   9.486  17.433  1.00 16.89           O  
ATOM    622  CB  ARG A 831      13.248  10.390  14.625  1.00 15.74           C  
ATOM    623  CG  ARG A 831      13.934   9.278  13.859  1.00 15.71           C  
ATOM    624  CD  ARG A 831      15.286   9.811  13.400  1.00 18.23           C  
ATOM    625  NE  ARG A 831      15.996   8.842  12.590  1.00 19.19           N  
ATOM    626  CZ  ARG A 831      16.808   7.896  13.059  1.00 21.10           C  
ATOM    627  NH1 ARG A 831      16.982   7.763  14.358  1.00 23.19           N  
ATOM    628  NH2 ARG A 831      17.405   7.055  12.227  1.00 22.47           N  
ATOM    629  N   LYS A 832      12.153   7.748  16.414  1.00 16.13           N  
ATOM    630  CA  LYS A 832      12.627   6.700  17.347  1.00 17.68           C  
ATOM    631  C   LYS A 832      13.501   5.781  16.531  1.00 18.43           C  
ATOM    632  O   LYS A 832      13.202   5.526  15.370  1.00 19.43           O  
ATOM    633  CB  LYS A 832      11.467   5.885  17.892  1.00 20.26           C  
ATOM    634  CG  LYS A 832      10.483   6.648  18.754  1.00 23.34           C  
ATOM    635  CD  LYS A 832       9.214   5.873  19.059  1.00 28.78           C  
ATOM    636  CE  LYS A 832       9.206   5.273  20.447  1.00 33.44           C  
ATOM    637  NZ  LYS A 832       8.557   6.183  21.418  1.00 31.31           N  
ATOM    638  N   PRO A 833      14.646   5.304  17.044  1.00 19.19           N  
ATOM    639  CA  PRO A 833      15.454   4.353  16.288  1.00 20.43           C  
ATOM    640  C   PRO A 833      14.721   3.012  16.235  1.00 20.60           C  
ATOM    641  O   PRO A 833      14.062   2.655  17.200  1.00 23.98           O  
ATOM    642  CB  PRO A 833      16.720   4.270  17.147  1.00 21.68           C  
ATOM    643  CG  PRO A 833      16.206   4.482  18.534  1.00 23.32           C  
ATOM    644  CD  PRO A 833      15.184   5.586  18.380  1.00 21.97           C  
ATOM    645  N   ASN A 834      14.821   2.310  15.111  1.00 20.54           N  
ATOM    646  CA  ASN A 834      14.268   0.943  14.976  1.00 22.21           C  
ATOM    647  C   ASN A 834      15.368  -0.067  15.312  1.00 21.46           C  
ATOM    648  O   ASN A 834      16.361  -0.155  14.584  1.00 25.68           O  
ATOM    649  CB  ASN A 834      13.719   0.743  13.565  1.00 22.43           C  
ATOM    650  CG  ASN A 834      12.918  -0.525  13.432  1.00 24.63           C  
ATOM    651  OD1 ASN A 834      12.920  -1.365  14.325  1.00 23.43           O  
ATOM    652  ND2 ASN A 834      12.183  -0.632  12.335  1.00 27.72           N  
ATOM    653  N   PRO A 835      15.202  -0.857  16.399  1.00 22.48           N  
ATOM    654  CA  PRO A 835      16.190  -1.855  16.807  1.00 24.60           C  
ATOM    655  C   PRO A 835      16.336  -3.041  15.837  1.00 23.80           C  
ATOM    656  O   PRO A 835      17.396  -3.621  15.787  1.00 20.08           O  
ATOM    657  CB  PRO A 835      15.663  -2.341  18.173  1.00 25.36           C  
ATOM    658  CG  PRO A 835      14.205  -2.012  18.198  1.00 26.01           C  
ATOM    659  CD  PRO A 835      14.056  -0.801  17.308  1.00 24.66           C  
ATOM    660  N   LEU A 836      15.304  -3.292  15.028  1.00 22.86           N  
ATOM    661  CA  LEU A 836      15.189  -4.491  14.166  1.00 24.90           C  
ATOM    662  C   LEU A 836      16.327  -4.464  13.153  1.00 25.04           C  
ATOM    663  O   LEU A 836      16.427  -3.493  12.358  1.00 25.74           O  
ATOM    664  CB  LEU A 836      13.825  -4.499  13.459  1.00 27.79           C  
ATOM    665  CG  LEU A 836      13.552  -5.710  12.565  1.00 30.95           C  
ATOM    666  CD1 LEU A 836      13.283  -6.950  13.398  1.00 34.36           C  
ATOM    667  CD2 LEU A 836      12.381  -5.435  11.623  1.00 33.41           C  
ATOM    668  N   ALA A 837      17.098  -5.534  13.114  1.00 25.27           N  
ATOM    669  CA  ALA A 837      18.161  -5.767  12.113  1.00 26.28           C  
ATOM    670  C   ALA A 837      17.515  -6.073  10.749  1.00 31.57           C  
ATOM    671  O   ALA A 837      16.511  -6.823  10.727  1.00 31.24           O  
ATOM    672  CB  ALA A 837      19.040  -6.901  12.580  1.00 25.55           C  
ATOM    673  N   ASN A 838      18.080  -5.536   9.661  1.00 38.65           N  
ATOM    674  CA  ASN A 838      17.754  -5.939   8.262  1.00 42.92           C  
ATOM    675  C   ASN A 838      17.981  -7.451   8.118  1.00 48.14           C  
ATOM    676  O   ASN A 838      18.232  -7.965   7.023  1.00 56.72           O  
ATOM    677  CB  ASN A 838      18.584  -5.171   7.227  1.00 44.37           C  
TER     678      ASN A 838                                                      
HETATM  679  PG  ATP A1001      -9.415  19.269   9.768  1.00 29.64           P  
HETATM  680  O1G ATP A1001     -10.398  18.350  10.436  1.00 37.07           O  
HETATM  681  O2G ATP A1001      -9.781  20.760   9.927  1.00 30.37           O  
HETATM  682  O3G ATP A1001      -9.096  18.907   8.350  1.00 36.28           O  
HETATM  683  PB  ATP A1001      -6.642  19.642  10.868  1.00 19.82           P  
HETATM  684  O1B ATP A1001      -6.374  19.310  12.278  1.00 21.85           O  
HETATM  685  O2B ATP A1001      -6.527  21.004  10.368  1.00 18.99           O  
HETATM  686  O3B ATP A1001      -8.110  19.061  10.638  1.00 24.42           O  
HETATM  687  PA  ATP A1001      -4.827  17.433  10.114  1.00 17.63           P  
HETATM  688  O1A ATP A1001      -3.621  17.852  10.895  1.00 17.76           O  
HETATM  689  O2A ATP A1001      -4.691  16.906   8.750  1.00 18.04           O  
HETATM  690  O3A ATP A1001      -5.813  18.684   9.902  1.00 19.93           O  
HETATM  691  O5' ATP A1001      -5.646  16.416  11.032  1.00 18.91           O  
HETATM  692  C5' ATP A1001      -6.917  15.886  10.594  1.00 19.78           C  
HETATM  693  C4' ATP A1001      -7.167  14.578  11.314  1.00 21.03           C  
HETATM  694  O4' ATP A1001      -6.199  13.608  10.844  1.00 22.38           O  
HETATM  695  C3' ATP A1001      -7.054  14.573  12.843  1.00 24.29           C  
HETATM  696  O3' ATP A1001      -7.906  13.569  13.386  1.00 26.08           O  
HETATM  697  C2' ATP A1001      -5.592  14.181  13.047  1.00 21.58           C  
HETATM  698  O2' ATP A1001      -5.352  13.562  14.291  1.00 25.40           O  
HETATM  699  C1' ATP A1001      -5.388  13.185  11.903  1.00 21.02           C  
HETATM  700  N9  ATP A1001      -4.009  13.128  11.365  1.00 18.38           N  
HETATM  701  C8  ATP A1001      -3.053  14.125  11.316  1.00 16.50           C  
HETATM  702  N7  ATP A1001      -1.936  13.719  10.766  1.00 15.04           N  
HETATM  703  C5  ATP A1001      -2.150  12.392  10.428  1.00 17.09           C  
HETATM  704  C6  ATP A1001      -1.339  11.420   9.831  1.00 16.40           C  
HETATM  705  N6  ATP A1001      -0.077  11.633   9.480  1.00 15.90           N  
HETATM  706  N1  ATP A1001      -1.864  10.171   9.680  1.00 17.36           N  
HETATM  707  C2  ATP A1001      -3.143   9.987  10.040  1.00 17.53           C  
HETATM  708  N3  ATP A1001      -3.996  10.816  10.631  1.00 18.02           N  
HETATM  709  C4  ATP A1001      -3.425  12.025  10.802  1.00 16.39           C  
HETATM  710  UNK UNX A1002       1.277   7.378   7.721  1.00 29.71           X  
HETATM  711  O   HOH A1101      11.422  -2.808  15.335  1.00 45.18           O  
HETATM  712  O   HOH A1102      22.535  16.225   1.126  1.00 33.27           O  
HETATM  713  O   HOH A1103      10.366  14.699  20.510  1.00 32.08           O  
HETATM  714  O   HOH A1104      -5.894  14.918  16.354  1.00 33.16           O  
HETATM  715  O   HOH A1105      18.992  20.102   1.831  1.00 44.29           O  
HETATM  716  O   HOH A1106       2.422   8.150   1.335  1.00 36.93           O  
HETATM  717  O   HOH A1107      12.698   2.573  19.389  1.00 32.95           O  
HETATM  718  O   HOH A1108      17.568  -1.168  12.219  1.00 36.36           O  
HETATM  719  O   HOH A1109      17.952   5.224   8.778  1.00 40.40           O  
HETATM  720  O   HOH A1110       9.142  17.209  17.988  1.00 29.82           O  
HETATM  721  O   HOH A1111      16.062  -8.957  12.315  1.00 24.71           O  
HETATM  722  O   HOH A1112       5.894  11.321  -0.435  1.00 35.30           O  
HETATM  723  O   HOH A1113      -1.014  18.382  10.294  1.00 15.40           O  
HETATM  724  O   HOH A1114      -6.539  11.211  15.009  1.00 36.11           O  
HETATM  725  O   HOH A1115      -5.991  10.059  20.674  1.00 34.00           O  
HETATM  726  O   HOH A1116      -0.284   6.976  11.601  1.00 27.20           O  
HETATM  727  O   HOH A1117       4.526  21.599  16.289  1.00 35.20           O  
HETATM  728  O   HOH A1118      10.397   2.286   7.678  1.00 32.37           O  
HETATM  729  O   HOH A1119       8.413  19.780  16.875  1.00 28.95           O  
HETATM  730  O   HOH A1120      -4.322  18.383   2.829  1.00 31.93           O  
HETATM  731  O   HOH A1121      17.927  10.188  10.025  1.00 36.15           O  
HETATM  732  O   HOH A1122      -1.856   5.038  16.062  1.00 23.44           O  
HETATM  733  O  AHOH A1123      -0.293  17.976  19.348  0.50 17.00           O  
HETATM  734  O  BHOH A1123      -0.624  18.263  18.301  0.50 20.18           O  
HETATM  735  O   HOH A1124       5.842   3.896  17.875  1.00 30.59           O  
HETATM  736  O   HOH A1125       9.279  12.208  23.316  1.00 41.00           O  
HETATM  737  O   HOH A1126      -7.332  18.535   5.054  1.00 34.43           O  
HETATM  738  O   HOH A1127       6.513   8.103  21.880  1.00 24.53           O  
HETATM  739  O   HOH A1128      20.894  19.757   5.482  1.00 37.32           O  
HETATM  740  O   HOH A1129       3.282  10.281  -0.388  1.00 34.87           O  
HETATM  741  O   HOH A1130      14.562   5.310   4.483  1.00 24.00           O  
HETATM  742  O   HOH A1131      -4.900  27.540   4.794  1.00 46.57           O  
HETATM  743  O   HOH A1132      -3.408   9.767  -0.025  1.00 26.91           O  
HETATM  744  O   HOH A1133      16.935  16.666   7.219  1.00 36.69           O  
HETATM  745  O   HOH A1134      -1.875  19.379  20.895  1.00 25.05           O  
HETATM  746  O   HOH A1135      12.040   9.791   0.595  1.00 29.42           O  
HETATM  747  O   HOH A1136      -7.557  26.697   9.807  1.00 36.11           O  
HETATM  748  O   HOH A1137       1.934  19.230  18.055  1.00 17.38           O  
HETATM  749  O   HOH A1138      16.006   9.235  16.727  1.00 26.34           O  
HETATM  750  O   HOH A1139       2.443  12.122  25.037  1.00 39.09           O  
HETATM  751  O   HOH A1140       3.630   0.725   5.106  1.00 36.96           O  
HETATM  752  O   HOH A1141       8.546  15.918  -1.857  1.00 38.85           O  
HETATM  753  O   HOH A1142      18.333   8.187   2.583  1.00 35.76           O  
HETATM  754  O  AHOH A1143      13.077   4.169   8.358  0.50 19.15           O  
HETATM  755  O  BHOH A1143      11.866   4.039   8.149  0.50 25.26           O  
HETATM  756  O   HOH A1144       3.540  19.434  20.331  1.00 24.41           O  
HETATM  757  O   HOH A1145      -6.840  19.450  21.840  1.00 33.65           O  
HETATM  758  O   HOH A1146      -9.035   8.595   3.150  1.00 37.38           O  
HETATM  759  O   HOH A1147      -4.441   6.798   1.540  1.00 34.65           O  
HETATM  760  O   HOH A1148      -6.593  13.686  19.069  1.00 31.03           O  
HETATM  761  O   HOH A1149       0.222  18.522  22.536  1.00 34.10           O  
HETATM  762  O   HOH A1150      14.471  11.500  -0.198  1.00 41.61           O  
HETATM  763  O   HOH A1151       6.497  21.315  17.568  1.00 43.32           O  
HETATM  764  O   HOH A1152      -8.259  17.298  22.349  1.00 33.31           O  
HETATM  765  O   HOH A1153      -2.414   6.555  12.873  1.00 41.61           O  
HETATM  766  O   HOH A1154      -7.522   6.694   2.022  1.00 36.98           O  
CONECT  679  680  681  682  686                                                 
CONECT  680  679                                                                
CONECT  681  679                                                                
CONECT  682  679                                                                
CONECT  683  684  685  686  690                                                 
CONECT  684  683                                                                
CONECT  685  683                                                                
CONECT  686  679  683                                                           
CONECT  687  688  689  690  691                                                 
CONECT  688  687                                                                
CONECT  689  687                                                                
CONECT  690  683  687                                                           
CONECT  691  687  692                                                           
CONECT  692  691  693                                                           
CONECT  693  692  694  695                                                      
CONECT  694  693  699                                                           
CONECT  695  693  696  697                                                      
CONECT  696  695                                                                
CONECT  697  695  698  699                                                      
CONECT  698  697                                                                
CONECT  699  694  697  700                                                      
CONECT  700  699  701  709                                                      
CONECT  701  700  702                                                           
CONECT  702  701  703                                                           
CONECT  703  702  704  709                                                      
CONECT  704  703  705  706                                                      
CONECT  705  704                                                                
CONECT  706  704  707                                                           
CONECT  707  706  708                                                           
CONECT  708  707  709                                                           
CONECT  709  700  703  708                                                      
MASTER      255    0    2    1    6    0    0    6  681    1   31    7          
END                                                                             
`;

const pdb8TRE_atp = `\
REMARK 200 Generated with haddock3-webapp hetGrep method                        
HET    ATP  A1001      31                                                       
HETNAM     ATP ADENOSINE-5'-TRIPHOSPHATE                                        
HETATM  679  PG  ATP A1001      -9.415  19.269   9.768  1.00 29.64           P  
HETATM  680  O1G ATP A1001     -10.398  18.350  10.436  1.00 37.07           O  
HETATM  681  O2G ATP A1001      -9.781  20.760   9.927  1.00 30.37           O  
HETATM  682  O3G ATP A1001      -9.096  18.907   8.350  1.00 36.28           O  
HETATM  683  PB  ATP A1001      -6.642  19.642  10.868  1.00 19.82           P  
HETATM  684  O1B ATP A1001      -6.374  19.310  12.278  1.00 21.85           O  
HETATM  685  O2B ATP A1001      -6.527  21.004  10.368  1.00 18.99           O  
HETATM  686  O3B ATP A1001      -8.110  19.061  10.638  1.00 24.42           O  
HETATM  687  PA  ATP A1001      -4.827  17.433  10.114  1.00 17.63           P  
HETATM  688  O1A ATP A1001      -3.621  17.852  10.895  1.00 17.76           O  
HETATM  689  O2A ATP A1001      -4.691  16.906   8.750  1.00 18.04           O  
HETATM  690  O3A ATP A1001      -5.813  18.684   9.902  1.00 19.93           O  
HETATM  691  O5' ATP A1001      -5.646  16.416  11.032  1.00 18.91           O  
HETATM  692  C5' ATP A1001      -6.917  15.886  10.594  1.00 19.78           C  
HETATM  693  C4' ATP A1001      -7.167  14.578  11.314  1.00 21.03           C  
HETATM  694  O4' ATP A1001      -6.199  13.608  10.844  1.00 22.38           O  
HETATM  695  C3' ATP A1001      -7.054  14.573  12.843  1.00 24.29           C  
HETATM  696  O3' ATP A1001      -7.906  13.569  13.386  1.00 26.08           O  
HETATM  697  C2' ATP A1001      -5.592  14.181  13.047  1.00 21.58           C  
HETATM  698  O2' ATP A1001      -5.352  13.562  14.291  1.00 25.40           O  
HETATM  699  C1' ATP A1001      -5.388  13.185  11.903  1.00 21.02           C  
HETATM  700  N9  ATP A1001      -4.009  13.128  11.365  1.00 18.38           N  
HETATM  701  C8  ATP A1001      -3.053  14.125  11.316  1.00 16.50           C  
HETATM  702  N7  ATP A1001      -1.936  13.719  10.766  1.00 15.04           N  
HETATM  703  C5  ATP A1001      -2.150  12.392  10.428  1.00 17.09           C  
HETATM  704  C6  ATP A1001      -1.339  11.420   9.831  1.00 16.40           C  
HETATM  705  N6  ATP A1001      -0.077  11.633   9.480  1.00 15.90           N  
HETATM  706  N1  ATP A1001      -1.864  10.171   9.680  1.00 17.36           N  
HETATM  707  C2  ATP A1001      -3.143   9.987  10.040  1.00 17.53           C  
HETATM  708  N3  ATP A1001      -3.996  10.816  10.631  1.00 18.02           N  
HETATM  709  C4  ATP A1001      -3.425  12.025  10.802  1.00 16.39           C  
CONECT  679  680  681  682  686                                                 
CONECT  680  679                                                                
CONECT  681  679                                                                
CONECT  682  679                                                                
CONECT  683  684  685  686  690                                                 
CONECT  684  683                                                                
CONECT  685  683                                                                
CONECT  686  679  683                                                           
CONECT  687  688  689  690  691                                                 
CONECT  688  687                                                                
CONECT  689  687                                                                
CONECT  690  683  687                                                           
CONECT  691  687  692                                                           
CONECT  692  691  693                                                           
CONECT  693  692  694  695                                                      
CONECT  694  693  699                                                           
CONECT  695  693  696  697                                                      
CONECT  696  695                                                                
CONECT  697  695  698  699                                                      
CONECT  698  697                                                                
CONECT  699  694  697  700                                                      
CONECT  700  699  701  709                                                      
CONECT  701  700  702                                                           
CONECT  702  701  703                                                           
CONECT  703  702  704  709                                                      
CONECT  704  703  705  706                                                      
CONECT  705  704                                                                
CONECT  706  704  707                                                           
CONECT  707  706  708                                                           
CONECT  708  707  709                                                           
CONECT  709  700  703  708                                                      
END
`;

describe("hetGrep()", () => {
  test("should return pdb file with only ATP", () => {
    const result = hetGrep(pdb8TRE_orig, "ATP", "A", 1001);

    expect(result).toBe(pdb8TRE_atp);
  });
});
