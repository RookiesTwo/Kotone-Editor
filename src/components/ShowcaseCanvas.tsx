import { useRef } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import type { SectionConfig, SiteConfig } from "../types/site-config";

function renderSectionBody(section: SectionConfig) {
  if (section.type === "quote") {
    return <blockquote className="section-quote">{section.quote}</blockquote>;
  }

  if (section.type === "gallery") {
    return (
      <div className="gallery-grid">
        {section.galleryItems.map((item) => (
          <article key={item.src} className="gallery-card">
            <img src={item.src} alt={item.alt} />
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="section-copy">
      {section.description ? <p>{section.description}</p> : null}
      {section.image ? (
        <figure className="section-image-frame">
          <img src={section.image.src} alt={section.image.alt} />
        </figure>
      ) : null}
    </div>
  );
}

export function ShowcaseCanvas({ config, embedded = false }: { config: SiteConfig; embedded?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const visibleSections = config.sections.filter((section) => section.visible);
  const activeId = useActiveSection(
    visibleSections.map((section) => section.id),
    embedded ? scrollerRef : undefined,
  );

  const activeSection = visibleSections.find((section) => section.id === activeId) ?? visibleSections[0];

  return (
    <div
      ref={scrollerRef}
      className={`showcase-shell${embedded ? " showcase-shell--embedded" : ""}`}
      style={{
        background: activeSection?.background ?? config.global.backgroundStart,
        ["--accent" as string]: activeSection?.backgroundAccent ?? config.global.accent,
        ["--accent-soft" as string]: config.global.accentSoft,
        ["--overlay-opacity" as string]: String(activeSection?.overlayOpacity ?? 0.24),
      }}
    >
      <div className="showcase-backdrop" aria-hidden="true" />

      {config.global.showNav ? (
        <header className="showcase-nav">
          <span className="showcase-nav__brand">{config.global.siteTitle}</span>
          <nav className="showcase-nav__links">
            {config.global.links.map((link) => (
              <a key={`${link.label}-${link.href}`} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {link.label}
              </a>
            ))}
          </nav>
        </header>
      ) : null}

      <div className="showcase-sections">
        {visibleSections.map((section) => {
          const isActive = section.id === activeSection?.id;

          return (
            <section
              key={section.id}
              data-section-id={section.id}
              className={`showcase-section showcase-section--${section.align} showcase-section--${section.density} ${
                isActive ? "is-active" : "is-idle"
              } showcase-section--${section.transitionStyle}`}
            >
              <div className="showcase-section__inner">
                <div className="showcase-section__meta">
                  {section.tags.length > 0 ? (
                    <ul className="tag-row">
                      {section.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.title ? <h2>{section.title}</h2> : null}
                  {renderSectionBody(section)}

                  {section.buttonLabel && section.buttonHref ? (
                    <a className="showcase-button" href={section.buttonHref}>
                      {section.buttonLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {config.global.showFooter ? <footer className="showcase-footer">Built as a pure frontend editable showcase.</footer> : null}
    </div>
  );
}
