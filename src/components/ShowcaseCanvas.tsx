import { useEffect, useRef, useState } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import type { SectionConfig, SiteConfig } from "../types/site-config";

export function ShowcaseCanvas({
  config,
  embedded = false,
  editableSectionId,
  onImageOffsetChange,
}: {
  config: SiteConfig;
  embedded?: boolean;
  editableSectionId?: string;
  onImageOffsetChange?: (id: string, offsetX: number, offsetY: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const visibleSections = config.sections.filter((section) => section.visible);
  const { from, to, progress } = useActiveSection(visibleSections.map((s) => s.id));
  const fromSection = visibleSections.find((s) => s.id === from) ?? visibleSections[0];
  const toSection = visibleSections.find((s) => s.id === to) ?? visibleSections[0];
  const activeSection = fromSection;

  const prevFrom = useRef(from);
  const [skipFade, setSkipFade] = useState(false);

  useEffect(() => {
    if (prevFrom.current !== from) {
      prevFrom.current = from;
      setSkipFade(true);
      const id = requestAnimationFrame(() => setSkipFade(false));
      return () => cancelAnimationFrame(id);
    }
  }, [from]);

  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

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
        {section.image && section.imageDisplayMode === "inline" ? (
          <figure
            className={`section-image-frame${editableSectionId === section.id ? " is-draggable" : ""}`}
            style={{
              width: `${section.imageFrameWidth}%`,
              minHeight: `${section.imageFrameHeight}vh`,
            }}
            onPointerDown={(event) => {
              if (!embedded || editableSectionId !== section.id || !onImageOffsetChange) {
                return;
              }

              event.currentTarget.setPointerCapture(event.pointerId);
              setDragState({
                id: section.id,
                startX: event.clientX,
                startY: event.clientY,
                originX: section.imageOffsetX,
                originY: section.imageOffsetY,
              });
            }}
            onPointerMove={(event) => {
              if (!dragState || dragState.id !== section.id || !onImageOffsetChange) {
                return;
              }

              const deltaX = ((event.clientX - dragState.startX) / Math.max(event.currentTarget.clientWidth, 1)) * 100;
              const deltaY = ((event.clientY - dragState.startY) / Math.max(event.currentTarget.clientHeight, 1)) * 100;
              onImageOffsetChange(
                section.id,
                Math.max(-100, Math.min(100, dragState.originX + deltaX)),
                Math.max(-100, Math.min(100, dragState.originY + deltaY)),
              );
            }}
            onPointerUp={() => setDragState(null)}
            onPointerCancel={() => setDragState(null)}
          >
            <img
              src={section.image.src}
              alt={section.image.alt}
              style={{
                transform: `translate(${section.imageOffsetX}%, ${section.imageOffsetY}%) scale(${section.imageScale})`,
              }}
            />
          </figure>
        ) : null}
      </div>
    );
  }

  function backdropFor(section: SectionConfig) {
    return {
      background: `radial-gradient(circle at 20% 20%, color-mix(in srgb, ${section.backgroundAccent} 28%, transparent) 0%, transparent 30%),
        radial-gradient(circle at 80% 15%, color-mix(in srgb, ${config.global.accentSoft} 22%, transparent) 0%, transparent 24%),
        linear-gradient(180deg, rgba(255, 255, 255, ${section.overlayOpacity * 0.16}) 0%, transparent 38%)`,
    };
  }

  function backgroundFor(section: SectionConfig) {
    if (section.imageDisplayMode !== "background" || !section.image) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(120deg, rgba(7, 5, 14, ${section.overlayOpacity + 0.18}) 0%, rgba(7, 5, 14, ${section.overlayOpacity + 0.34}) 50%, rgba(7, 5, 14, ${section.overlayOpacity + 0.5}) 100%), url(${section.image.src})`,
      backgroundPosition: `${50 + section.imageOffsetX * 0.2}% ${50 + section.imageOffsetY * 0.2}%`,
      backgroundSize: `${section.imageScale * 100}%`,
    };
  }

  const fromBg = backgroundFor(fromSection);
  const toBg = backgroundFor(toSection);
  const fromBackdrop = backdropFor(fromSection);
  const toBackdrop = backdropFor(toSection);

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
      <div
        className="showcase-shell-bg-to"
        aria-hidden="true"
        style={{
          background: toSection.background,
          opacity: fromSection.id === toSection.id ? 0 : progress,
        }}
      />
      <div
        className="showcase-backdrop"
        aria-hidden="true"
        style={{
          ...fromBackdrop,
          opacity: fromSection.id === toSection.id ? 0.95 : 1 - progress,
        }}
      />
      <div
        className="showcase-backdrop"
        aria-hidden="true"
        style={{
          ...toBackdrop,
          opacity: fromSection.id === toSection.id ? 0 : progress,
        }}
      />
      <div
        data-testid="showcase-active-background"
        className={`showcase-active-background ${
          embedded ? "showcase-active-background--embedded" : "showcase-active-background--page"
        }${skipFade ? " showcase-active-background--no-fade" : ""}`}
        style={{
          ...fromBg,
          opacity: fromSection.id === toSection.id ? 0.88 : 1 - progress,
        }}
      />
      <div
        data-testid="showcase-active-background-to"
        className={`showcase-active-background ${
          embedded ? "showcase-active-background--embedded" : "showcase-active-background--page"
        }${skipFade ? " showcase-active-background--no-fade" : ""}`}
        style={{
          ...toBg,
          opacity: fromSection.id === toSection.id ? 0 : progress,
        }}
      />

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
        {visibleSections.map((section, idx) => {
          const fromIdx = visibleSections.findIndex((s) => s.id === from);
          const isSingle = from === to && from === section.id;
          const isFrom = from === section.id && !isSingle;
          const isTo = to === section.id && !isSingle;

          const sectionProgress = isSingle
            ? 1
            : isFrom
              ? 1 - progress
              : isTo
                ? progress
                : idx < fromIdx
                  ? 0
                  : 0;

          const sectionTranslateY = (1 - sectionProgress) * 24;
          const sectionScale = 0.94 + sectionProgress * 0.06;
          const sectionOpacity = 0.38 + sectionProgress * 0.62;

          const sectionStyle = {
            opacity: sectionOpacity,
            transform: `translateY(${sectionTranslateY}px) scale(${sectionScale})`,
          };

          return (
            <section
              key={section.id}
              data-section-id={section.id}
              className={`showcase-section showcase-section--${section.align} showcase-section--${section.density} showcase-section--${section.transitionStyle}`}
            >
              <div className="showcase-section__inner">
                <div className="showcase-section__meta" style={sectionStyle}>
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
