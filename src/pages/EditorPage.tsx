import { useRef, useState, type ChangeEvent } from "react";
import { ShowcaseCanvas } from "../components/ShowcaseCanvas";
import { useEditorLocale } from "../context/EditorLocaleContext";
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

  const { locale, setLocale, messages } = useEditorLocale();

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [newSectionType, setNewSectionType] = useState<SectionType>("hero");
  const [newTag, setNewTag] = useState("");
  const selectedSection = config.sections.find((section) => section.id === selectedSectionId) ?? config.sections[0];

  function addTag() {
    if (!selectedSection || !newTag.trim()) {
      return;
    }

    updateSection(selectedSection.id, {
      tags: [...selectedSection.tags, newTag.trim()],
    });
    setNewTag("");
  }

  function removeTag(tag: string) {
    if (!selectedSection) {
      return;
    }

    updateSection(selectedSection.id, {
      tags: selectedSection.tags.filter((item) => item !== tag),
    });
  }

  function moveTag(index: number, direction: -1 | 1) {
    if (!selectedSection) {
      return;
    }

    const target = index + direction;
    if (target < 0 || target >= selectedSection.tags.length) {
      return;
    }

    const nextTags = [...selectedSection.tags];
    const [moved] = nextTags.splice(index, 1);
    nextTags.splice(target, 0, moved);
    updateSection(selectedSection.id, { tags: nextTags });
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      replaceConfig(parseImportedConfig(text));
    } catch {
      window.alert(messages.alerts.importFailed);
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
          <div className="editor-panel__row">
            <h1>{messages.header.title}</h1>
            <div className="editor-inline-actions">
              <button type="button" onClick={() => setLocale("zh-CN")} aria-pressed={locale === "zh-CN"}>
                {messages.header.switchToChinese}
              </button>
              <button type="button" onClick={() => setLocale("en")} aria-pressed={locale === "en"}>
                {messages.header.switchToEnglish}
              </button>
            </div>
          </div>
          <p>{messages.header.description}</p>
        </section>

        <section className="editor-panel">
          <h2>{messages.global.title}</h2>
          <label>
            <span>{messages.global.siteTitle}</span>
            <input value={config.global.siteTitle} onChange={(event) => updateGlobal({ siteTitle: event.target.value })} />
          </label>
          <label>
            <span>{messages.global.subtitle}</span>
            <textarea value={config.global.siteSubtitle} onChange={(event) => updateGlobal({ siteSubtitle: event.target.value })} />
          </label>
          <label>
            <span>{messages.global.accent}</span>
            <input value={config.global.accent} onChange={(event) => updateGlobal({ accent: event.target.value })} />
          </label>
          <label>
            <span>{messages.global.accentSoft}</span>
            <input value={config.global.accentSoft} onChange={(event) => updateGlobal({ accentSoft: event.target.value })} />
          </label>
        </section>

        <section className="editor-panel">
          <div className="editor-panel__row">
            <h2>{messages.sections.title}</h2>
            <select value={newSectionType} onChange={(event) => setNewSectionType(event.target.value as SectionType)}>
              {sectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => addSection(newSectionType)}>
              {messages.sections.addSection}
            </button>
          </div>

          <ul className="editor-section-list">
            {config.sections.map((section, index) => (
              <li key={section.id} className={section.id === selectedSection?.id ? "is-selected" : ""}>
                <button type="button" onClick={() => setSelectedSectionId(section.id)}>
                  <strong>{section.title || messages.sections.untitledSection}</strong>
                  <span>{section.type}</span>
                </button>
                <div className="editor-inline-actions">
                  <button type="button" onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                    {messages.sections.up}
                  </button>
                  <button type="button" onClick={() => moveSection(section.id, 1)} disabled={index === config.sections.length - 1}>
                    {messages.sections.down}
                  </button>
                  <button type="button" onClick={() => deleteSection(section.id)} disabled={config.sections.length === 1}>
                    {messages.sections.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {selectedSection ? (
          <section className="editor-panel">
            <h2>{messages.selectedSection.title}</h2>
            <label>
              <span>{messages.selectedSection.type}</span>
              <select value={selectedSection.type} onChange={(event) => updateSection(selectedSection.id, { type: event.target.value as SectionType })}>
                {sectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{messages.selectedSection.visible}</span>
              <input
                type="checkbox"
                checked={selectedSection.visible}
                onChange={(event) => updateSection(selectedSection.id, { visible: event.target.checked })}
              />
            </label>
            <label>
              <span>{messages.selectedSection.titleField}</span>
              <input value={selectedSection.title} onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })} />
            </label>
            <label>
              <span>{messages.selectedSection.description}</span>
              <textarea
                value={selectedSection.description}
                onChange={(event) => updateSection(selectedSection.id, { description: event.target.value })}
              />
            </label>
            <label>
              <span>{messages.selectedSection.quote}</span>
              <textarea value={selectedSection.quote} onChange={(event) => updateSection(selectedSection.id, { quote: event.target.value })} />
            </label>
            <label>
              <span>{messages.selectedSection.imageSrc}</span>
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
              <span>{messages.selectedSection.background}</span>
              <input value={selectedSection.background} onChange={(event) => updateSection(selectedSection.id, { background: event.target.value })} />
            </label>
            <label>
              <span>{messages.selectedSection.accent}</span>
              <input value={selectedSection.backgroundAccent} onChange={(event) => updateSection(selectedSection.id, { backgroundAccent: event.target.value })} />
            </label>
            <label>
              <span>Image frame width</span>
              <input
                type="range"
                min="24"
                max="100"
                value={selectedSection.imageFrameWidth}
                onChange={(event) => updateSection(selectedSection.id, { imageFrameWidth: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>Image frame height</span>
              <input
                type="range"
                min="24"
                max="100"
                value={selectedSection.imageFrameHeight}
                onChange={(event) => updateSection(selectedSection.id, { imageFrameHeight: Number(event.target.value) })}
              />
            </label>
            <label>
              <span>Image scale</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={selectedSection.imageScale}
                onChange={(event) => updateSection(selectedSection.id, { imageScale: Number(event.target.value) })}
              />
            </label>
            {selectedSection.type === "hero" ? (
              <label>
                <span>Overlay opacity</span>
                <input
                  type="range"
                  min="0"
                  max="0.75"
                  step="0.01"
                  value={selectedSection.overlayOpacity}
                  onChange={(event) => updateSection(selectedSection.id, { overlayOpacity: Number(event.target.value) })}
                />
              </label>
            ) : null}
            <label>
              <span>{messages.selectedSection.buttonLabel}</span>
              <input value={selectedSection.buttonLabel} onChange={(event) => updateSection(selectedSection.id, { buttonLabel: event.target.value })} />
            </label>
            <label>
              <span>{messages.selectedSection.buttonHref}</span>
              <input value={selectedSection.buttonHref} onChange={(event) => updateSection(selectedSection.id, { buttonHref: event.target.value })} />
            </label>
            <div className="editor-panel editor-panel--tags">
              <h3>Tags</h3>
              <div className="editor-inline-actions">
                <input value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="Add tag" />
                <button type="button" onClick={addTag}>
                  Add tag
                </button>
              </div>
              <ul className="editor-tag-list">
                {selectedSection.tags.map((tag, index) => (
                  <li key={`${tag}-${index}`}>
                    <span>{tag}</span>
                    <div className="editor-inline-actions">
                      <button type="button" onClick={() => moveTag(index, -1)} disabled={index === 0}>
                        Up
                      </button>
                      <button type="button" onClick={() => moveTag(index, 1)} disabled={index === selectedSection.tags.length - 1}>
                        Down
                      </button>
                      <button type="button" onClick={() => removeTag(tag)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="editor-panel">
          <h2>{messages.data.title}</h2>
          <div className="editor-inline-actions">
            <button type="button" onClick={handleExport}>
              {messages.data.exportJson}
            </button>
            <button type="button" onClick={() => importInputRef.current?.click()}>
              {messages.data.importJson}
            </button>
            <button type="button" onClick={resetConfig}>
              {messages.data.resetDemo}
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
