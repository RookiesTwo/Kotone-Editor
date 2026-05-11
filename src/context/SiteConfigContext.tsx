import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createDefaultSiteConfig } from "../data/default-config";
import { createSection, normalizeSiteConfig } from "../lib/config-utils";
import { clearStoredConfig, loadStoredConfig, saveStoredConfig } from "../lib/persistence";
import type { GlobalConfig, SectionConfig, SectionType, SiteConfig } from "../types/site-config";

interface SiteConfigContextValue {
  config: SiteConfig;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
  updateGlobal: (patch: Partial<GlobalConfig>) => void;
  updateSection: (id: string, patch: Partial<SectionConfig>) => void;
  addSection: (type: SectionType) => void;
  deleteSection: (id: string) => void;
  moveSection: (id: string, direction: -1 | 1) => void;
  replaceConfig: (next: SiteConfig) => void;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const fallback = createDefaultSiteConfig();
  const [config, setConfig] = useState<SiteConfig>(() => loadStoredConfig(fallback));
  const [selectedSectionId, setSelectedSectionId] = useState(config.sections[0]?.id ?? "");

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  useEffect(() => {
    if (!config.sections.find((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(config.sections[0]?.id ?? "");
    }
  }, [config, selectedSectionId]);

  function updateGlobal(patch: Partial<GlobalConfig>) {
    setConfig((current) => ({ ...current, global: { ...current.global, ...patch } }));
  }

  function updateSection(id: string, patch: Partial<SectionConfig>) {
    setConfig((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    }));
  }

  function addSection(type: SectionType) {
    const next = createSection(type);
    setConfig((current) => ({ ...current, sections: [...current.sections, next] }));
    setSelectedSectionId(next.id);
  }

  function deleteSection(id: string) {
    setConfig((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== id),
    }));
  }

  function moveSection(id: string, direction: -1 | 1) {
    setConfig((current) => {
      const index = current.sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.sections.length) {
        return current;
      }

      const nextSections = [...current.sections];
      const [moved] = nextSections.splice(index, 1);
      nextSections.splice(target, 0, moved);
      return { ...current, sections: nextSections };
    });
  }

  function replaceConfig(next: SiteConfig) {
    setConfig(normalizeSiteConfig(next));
  }

  function resetConfig() {
    clearStoredConfig();
    const next = createDefaultSiteConfig();
    setConfig(next);
    setSelectedSectionId(next.sections[0]?.id ?? "");
  }

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        selectedSectionId,
        setSelectedSectionId,
        updateGlobal,
        updateSection,
        addSection,
        deleteSection,
        moveSection,
        replaceConfig,
        resetConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used inside SiteConfigProvider");
  }

  return context;
}
