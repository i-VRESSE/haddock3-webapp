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
    </>
  );
}
