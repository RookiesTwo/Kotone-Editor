import { useRef, useState, type ChangeEvent } from "react";
import { ShowcaseCanvas } from "../components/ShowcaseCanvas";
import { useSiteConfig } from "../context/SiteConfigContext";
import { parseImportedConfig, serializeConfig } from "../lib/persistence";
import type { SectionType } from "../types/site-config";

const sectionTypes: SectionType[] = ["hero", "profile", "gallery", "quote", "custom"];

export function EditorPage() {
  const {
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
  } = useSiteConfig();

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [newSectionType, setNewSectionType] = useState<SectionType>("hero");
  const selectedSection = config.sections.find((section) => section.id === selectedSectionId) ?? config.sections[0];

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      replaceConfig(parseImportedConfig(text));
    } catch {
      window.alert("Import failed. Please choose a valid JSON config file.");
    } finally {
      event.target.value = "";
    }
  }

  function handleExport() {
    const blob = new Blob([serializeConfig(config)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "editable-showcase-config.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="editor-layout">
      <aside className="editor-sidebar">
        <section className="editor-panel">
          <h1>Editor</h1>
          <p>Adjust the showcase and watch the preview update in real time.</p>
        </section>

        <section className="editor-panel">
          <h2>Global</h2>
          <label>
            <span>Site title</span>
            <input value={config.global.siteTitle} onChange={(event) => updateGlobal({ siteTitle: event.target.value })} />
          </label>
          <label>
            <span>Subtitle</span>
            <textarea value={config.global.siteSubtitle} onChange={(event) => updateGlobal({ siteSubtitle: event.target.value })} />
          </label>
          <label>
            <span>Accent</span>
            <input value={config.global.accent} onChange={(event) => updateGlobal({ accent: event.target.value })} />
          </label>
          <label>
            <span>Accent soft</span>
            <input value={config.global.accentSoft} onChange={(event) => updateGlobal({ accentSoft: event.target.value })} />
          </label>
        </section>

        <section className="editor-panel">
          <div className="editor-panel__row">
            <h2>Sections</h2>
            <select value={newSectionType} onChange={(event) => setNewSectionType(event.target.value as SectionType)}>
              {sectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => addSection(newSectionType)}>
              Add section
            </button>
          </div>

          <ul className="editor-section-list">
            {config.sections.map((section, index) => (
              <li key={section.id} className={section.id === selectedSection?.id ? "is-selected" : ""}>
                <button type="button" onClick={() => setSelectedSectionId(section.id)}>
                  <strong>{section.title || "Untitled section"}</strong>
                  <span>{section.type}</span>
                </button>
                <div className="editor-inline-actions">
                  <button type="button" onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                    Up
                  </button>
                  <button type="button" onClick={() => moveSection(section.id, 1)} disabled={index === config.sections.length - 1}>
                    Down
                  </button>
                  <button type="button" onClick={() => deleteSection(section.id)} disabled={config.sections.length === 1}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {selectedSection ? (
          <section className="editor-panel">
            <h2>Selected section</h2>
            <label>
              <span>Type</span>
              <select value={selectedSection.type} onChange={(event) => updateSection(selectedSection.id, { type: event.target.value as SectionType })}>
                {sectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Visible</span>
              <input
                type="checkbox"
                checked={selectedSection.visible}
                onChange={(event) => updateSection(selectedSection.id, { visible: event.target.checked })}
              />
            </label>
            <label>
              <span>Title</span>
              <input value={selectedSection.title} onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })} />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={selectedSection.description}
                onChange={(event) => updateSection(selectedSection.id, { description: event.target.value })}
              />
            </label>
            <label>
              <span>Quote</span>
              <textarea value={selectedSection.quote} onChange={(event) => updateSection(selectedSection.id, { quote: event.target.value })} />
            </label>
            <label>
              <span>Image src</span>
              <input
                value={selectedSection.image?.src ?? ""}
                onChange={(event) =>
                  updateSection(selectedSection.id, {
                    image: event.target.value
                      ? {
                          src: event.target.value,
                          alt: selectedSection.image?.alt || selectedSection.title || "Section image",
                          kind: event.target.value.startsWith("http") ? "remote" : "local",
                        }
                      : null,
                  })
                }
              />
            </label>
            <label>
              <span>Background</span>
              <input value={selectedSection.background} onChange={(event) => updateSection(selectedSection.id, { background: event.target.value })} />
            </label>
            <label>
              <span>Accent</span>
              <input value={selectedSection.backgroundAccent} onChange={(event) => updateSection(selectedSection.id, { backgroundAccent: event.target.value })} />
            </label>
            <label>
              <span>Button label</span>
              <input value={selectedSection.buttonLabel} onChange={(event) => updateSection(selectedSection.id, { buttonLabel: event.target.value })} />
            </label>
            <label>
              <span>Button href</span>
              <input value={selectedSection.buttonHref} onChange={(event) => updateSection(selectedSection.id, { buttonHref: event.target.value })} />
            </label>
          </section>
        ) : null}

        <section className="editor-panel">
          <h2>Data</h2>
          <div className="editor-inline-actions">
            <button type="button" onClick={handleExport}>
              Export JSON
            </button>
            <button type="button" onClick={() => importInputRef.current?.click()}>
              Import JSON
            </button>
            <button type="button" onClick={resetConfig}>
              Reset Demo
            </button>
          </div>
          <input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </section>
      </aside>

      <section className="editor-preview">
        <ShowcaseCanvas config={config} embedded />
      </section>
    </main>
  );
}
