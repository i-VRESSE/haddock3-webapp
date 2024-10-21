import { useInPortalMode } from "~/portal";

function PortalFooter() {
  // Copied from frontend/src/Components/Footer.tsx
  // TODO add PoweredBy component on certain page
  const currentYear = new Date().getFullYear();
  const firstYear = 2008;
  return (
    <footer className="bottom-0 left-0 right-0 bg-slate-200 text-white p-2">
      <div className="text-center text-xs flex-col space-y-1 container mx-auto flex justify-center items-center">
        <div>
          <p className=" text-gray-400">
            {firstYear}-{currentYear} &copy; Computational Structural Biology
            group (Utrecht University). All rights reserved.
          </p>
        </div>
        <div className="flex items-center">
          <a href="/conditions" className="text-blue-500 hover:underline">
            Terms and Conditions
          </a>
          <div className="h-4 bg-gray-600 w-px mx-4"></div>
          <a href="/privacy" className="text-blue-500 hover:underline">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const inPortalMode = useInPortalMode();
  if (inPortalMode) {
    return <PortalFooter />;
  }

  return (
    <footer className="bg-primary p-1 text-center text-primary-foreground">
      <p className="text-sm">
        This work is co-funded by the Horizon 2020 projects EOSC-hub and EGI-ACE
        (grant numbers 777536 and 101017567), BioExcel (grant numbers 823830 and
        675728) and by a computing grant from NWO-ENW (project number 2019.053).
      </p>
      <p className="text-sm">
        2008-2023 © Computational Structural Biology group. All rights
        reserved.
      </p>
    </footer>
  );
}
