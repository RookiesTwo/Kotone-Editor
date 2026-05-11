import { ShowcaseCanvas } from "../components/ShowcaseCanvas";
import { useSiteConfig } from "../context/SiteConfigContext";

export function ShowcasePage() {
  const { config } = useSiteConfig();
  return <ShowcaseCanvas config={config} />;
}
