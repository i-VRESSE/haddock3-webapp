import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Stage, type StructureComponent } from "ngl";

/*
import "molstar/lib/mol-plugin-ui/skin/light.scss";

import pdb1 from "./4G6K_fv.pdb?url";

      const trajectory =
        await window.molstar.builders.structure.parseTrajectory(data, "pdb");
      const model = await window.molstar.builders.structure.createModel(trajectory);
      const structure = await window.molstar.builders.structure.createStructure(model);

      // add 3D representation of the paratope selection with type=cartoon, colortheme=uniform, value=red, sizetheme=uniform
      const paratropeResidues = [31, 32, 33, 34, 35, 52, 54, 55, 56, 100, 101, 102, 103, 104, 105, 106, 1031, 1032, 1049, 1050, 1053, 1091, 1092, 1093, 1094, 1096];
      const rs = MolScriptBuilder.struct.atomProperty.macromolecular.label_seq_id
      const expr = MolScriptBuilder.struct.generator.atomGroups({
        'residue-test': MolScriptBuilder.core.logic.or(
            paratropeResidues.map(r => MolScriptBuilder.core.rel.eq([rs(), r]))
        ),
      })
      const paratopeComponent = await window.molstar.builders.structure.tryCreateComponentFromExpression(
          structure, expr, 'paratope'
      )
      if (paratopeComponent) {
        await window.molstar.builders.structure.representation.addRepresentation(
            paratopeComponent, { type: 'cartoon', color: 'uniform', colorParams: { value: 0xFF0000 }, size: 'uniform' }
            )
      }
      await window.molstar.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default"
      );

*/

export function Viewer({ antibodyFile }: { antibodyFile: File | undefined }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const [antibodyResidues, setAntibodyResidues] = useState<string[]>([]);
  const [paratropeResidues, setParatropeResidues] = useState<string[]>([]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    // Create Stage object
    stage.current = new Stage(viewportRef.current);
    let backgroundColor = "white";
    if (document?.documentElement?.classList.contains("dark")) {
      backgroundColor = "black";
    } else if (document?.documentElement?.classList.contains("light")) {
      backgroundColor = "white";
    } else if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
      backgroundColor = "black";
    }
    stage.current.setParameters({ backgroundColor });

    return () => {
      if (stage.current) {
        stage.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (stage.current === null || antibodyFile === undefined) {
      return;
    }

    stage.current.loadFile(antibodyFile, { ext: "pdb" }).then((o) => {
      if (o === undefined) {
        console.error("Could not load file");
        return;
      }
      o.addRepresentation("cartoon", { sele: "protein", color: "blue" });
      o.addRepresentation("ball+stick", { sele: "ligand" });

      o.autoView();

      const sc = o as StructureComponent;
      setAntibodyResidues(
        Array.from(
          new Set(
            Array.from(sc.structure.residueStore.resno).map((resno) =>
              resno.toString()
            ).filter((resno) => resno !== "0")
          )
        )
      );
      setParatropeResidues([])
    });

    return () => {
      if (stage.current && antibodyFile) {
        const comps = stage.current.getComponentsByName(antibodyFile.name);
        comps.dispose();
      }
    };
  }, [antibodyFile]);

  function paratropeOnChange(event: ChangeEvent<HTMLSelectElement>): void {
    event.preventDefault();

    const selection: string[] = Array.from(
      event.currentTarget.selectedOptions).map(option => option.value);
    setParatropeResidues(selection)
  }

  useEffect(() => {
    if (stage.current === null || antibodyFile === undefined) {
      return;
    }

    const comp = stage.current.getComponentsByName(antibodyFile?.name).first as StructureComponent
    const sele = paratropeResidues.map(r => `[${r}]`).join(" ")
    console.log({sele})
    if (sele === "") {
      return
    }
    comp.addRepresentation("ball+stick", { sele, color: "yellow", labelType: "res" });
  }, [paratropeResidues])

  return (
    <div>
      <div ref={viewportRef} className="h-[800px] w-[800px]"></div>
      <label>
        Paratrope residues
        <select multiple className="w-40 bg-inherit text-inherit"
          onChange={paratropeOnChange}
        >
          {antibodyResidues.map((residue) => (
            <option key={residue} value={residue}>
              {residue}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
