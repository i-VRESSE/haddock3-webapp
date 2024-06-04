import { Banner } from "./Banner";
import { Navbar } from "./Navbar";
import { Portalheader } from "./PortalHeader";
import { useInPortalMode } from "~/portal";

export const Header = () => {
  const inPortalMode = useInPortalMode();
  if (inPortalMode) {
    return <Portalheader />;
  }

  return <Standaloneheader />;
};

function Standaloneheader() {
  return (
    <header>
      <Banner />
      <Navbar />
    </header>
  );
}
