import { Link } from "@remix-run/react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

interface Scenario {
  url: string;
  title: string;
  description: string;
}

const scenarios: Scenario[] = [
  {
    url: "/scenarios/antibody-antigen",
    title: "Antibody Antigen",
    description: "Based on HADDOCK3 Antibody Antigen tutorial",
  },
  {
    url: "/scenarios/protein-protein",
    title: "Protein Protein",
    description: "Based on HADDOCK2.4 Protein Protein docking tutorial",
  },
  {
    url: "/scenarios/protein-dna",
    title: "Protein DNA",
    description: "Based on HADDOCK2.4 Protein DNA docking tutorial",
  },
  {
    url: "/scenarios/protein-ligand",
    title: "Protein Ligand",
    description: "Based on HADDOCK2.4 Protein Small Molecule docking tutorial",
  },
  // should be preprocesed like in tutorial
  // TODO add protein-shape see https://www.bonvinlab.org/education/HADDOCK24/shape-small-molecule
];

function ScenarioCard({ url, title, description }: Scenario) {
  return (
    <Card className="w-96 rounded-2xl shadow-lg hover:shadow-xl">
      <Link to={url}>
        <CardHeader>
          <h2 className="text-2xl">{title}</h2>
        </CardHeader>
        <CardContent>{description}</CardContent>
      </Link>
    </Card>
  );
}

export default function ScenariosIndex() {
  return (
    <main>
      <h1 className="text-3xl">Scenarios</h1>
      <div className="flex flex-wrap justify-start gap-4 p-24">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.url} {...scenario} />
        ))}
      </div>
    </main>
  );
}
