export default function About() {
  const oldColors = {
    primary: "#4177C1",
    secondary: "#EC5E59",
    accent: "#EEF51C",
    neutral: "#535C61",
    "base-100": "#F2F3F9",
    info: "#86DBEE",
    success: "#23D76B",
    warning: "#EAAC10",
    error: "#E63D67",
  };
  return (
    <>
      <p className="prose">
        This work is co-funded by the Horizon 2020 projects EOSC-hub and EGI-ACE
        (grant numbers 777536 and 101017567), BioExcel (grant numbers 823830 and
        675728) and by a computing grant from NWO-ENW (project number 2019.053).
      </p>
      {/* TODO remove once proper colors have been added to rest of site */}
      <h1>Colors</h1>
      <div>
        New
        <div className="bg-primary text-primary-foreground">
          bg-primary text-primary-foreground
        </div>
        <div className="bg-secondary text-secondary-foreground">
          bg-secondary text-secondary-foreground
        </div>
        <div className="bg-muted text-muted-foreground">
          bg-muted text-muted-foreground
        </div>
        <div className="bg-accent text-accent-foreground">
          bg-accent text-accent-foreground
        </div>
        <div className="bg-destructive text-destructive-foreground">
          bg-destructive text-destructive-foreground
        </div>
        <div className="bg-card text-card-foreground">
          bg-card text-card-foreground
        </div>
        <div className="bg-popover text-popover-foreground">
          bg-popover text-popover-foreground
        </div>
        <div className="bg-background text-foreground">
          bg-background text-foreground
        </div>
      </div>
      <div>
        Old
        {Object.entries(oldColors).map(([key, value]) => (
          <div
            key={key}
            style={{ backgroundColor: value }}
          >{`bg-${key} text-${key}-foreground`}</div>
        ))}
      </div>
    </>
  );
}
