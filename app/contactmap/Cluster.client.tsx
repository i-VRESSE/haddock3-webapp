import { PlotlyPlot } from "~/components/PlotlyPlot";
import type { ContactMapCluster } from "./contactmap.server";

export function Cluster({cluster}: {cluster: ContactMapCluster}) {
    return (
        <div>
        <div>
          {/* TODO make plots same size as in their source html file */}
          <PlotlyPlot data={cluster.chordchart.data} layout={cluster.chordchart.layout} />
          <PlotlyPlot data={cluster.heatmap.data} layout={cluster.heatmap.layout} />
        </div>
        <div className="flex flex-row gap-4">
          <span>Download:</span>
          <a className="hover:underline" href={cluster.contacts}>Contacts</a>
          <a className="hover:underline" href={cluster.heavyatoms_interchain_contacts}>
            Heavy Atoms Interchain Contacts
          </a>
          <a className="hover:underline" href={cluster.interchain_contacts}>Interchain Contacts</a>
        </div>
      </div>
    )
}