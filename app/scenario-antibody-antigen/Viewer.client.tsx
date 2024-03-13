import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Stage, type StructureComponent } from "ngl";

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
