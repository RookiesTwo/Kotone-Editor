# Editable Showcase Design

## Summary

Build a pure frontend project for GitHub Pages using Vite and React. The project includes a high-impact scroll-driven showcase page and a companion editor page that lets the user reconfigure nearly all content without changing code.

The output should work as both:

- a polished example site suitable for an AI project practice submission
- a reusable editable framework for future character-themed landing pages

## Goals

- Create a visually strong, minimal landing page inspired by the pacing and atmosphere of the GTA 6 website
- Keep the content model generic so the same project can be reused for other characters or themes
- Support a split workflow of display and editing through separate routes
- Store edits in `localStorage`
- Support JSON import and export for backup, migration, and submission demos
- Let the user add, remove, hide, reorder, and edit every section from the editor page
- Ship a high-quality default example theme plus a generic framework structure
- Deploy cleanly to GitHub Pages as a static frontend-only project

## Non-Goals

- No backend, database, authentication, or CMS
- No drag-and-drop low-code builder
- No heavy animation engine or complex 3D effects
- No requirement for the user to edit source code for normal content changes

## Stack

- Vite
- React
- TypeScript
- React Router for `/` and `/editor`
- Plain CSS with CSS variables and transitions for theme and motion

TypeScript is the preferred implementation choice for this project because the app is configuration-driven and benefits from explicit data contracts across the renderer, editor, storage, and import/export flows.

At the same time, the stack choice is only a guide. Implementation quality, clarity, stability, and the ability to finish the project well are more important than rigid adherence to any one technology preference. If a small part of the app is simpler or more reliable with a lighter approach, that tradeoff is acceptable as long as the overall architecture stays clean.

## Product Structure

The app has two main routes:

- `/`: the public showcase page
- `/editor`: the configuration page with live preview

The showcase page is fully driven by a single configuration object, `siteConfig`.

The editor page reads and updates that same configuration object. All persistence, import, export, preview, and rendering behavior should flow through this shared data model.

## Experience Overview

### Showcase Page

The showcase page should feel like a scroll-driven visual landing page rather than a normal long article.

Core characteristics:

- strong hero imagery
- minimal copy
- oversized typography
- deep base tones with bold accent colors
- large spacing and poster-like composition
- section-by-section visual transitions while scrolling

The page is composed of configurable full-screen or near-full-screen sections. As the active section changes, the page should smoothly transition the visible background, text emphasis, overlays, and foreground imagery.

### Editor Page

The editor page should prioritize usability over decoration.

Layout:

- left panel for controls
- right panel for live preview

The preview should stay close to the real showcase output so edits feel immediately meaningful.

## Data Model

Use one root object:

```ts
type SiteConfig = {
  global: GlobalConfig
  sections: SectionConfig[]
}
```

TypeScript should define the internal application model, but runtime validation is still required for imported JSON and restored persisted data.

### Global Config

`global` should cover site-wide settings such as:

- site title
- site subtitle
- theme accent colors
- background base colors
- font style preset
- external links
- optional nav or footer visibility
- motion intensity or transition preset

### Section Config

Each item in `sections` represents one screen or major visual block.

Each section should support:

- stable `id`
- `type`, such as `hero`, `profile`, `gallery`, `quote`, or `custom`
- `visible`
- `title`
- `description`
- `tags`
- `image`
- optional secondary image or decorative asset
- background color or gradient
- overlay strength
- alignment preset
- layout density or height preset
- optional button label and link
- per-section transition style metadata

The editor must allow the user to:

- add sections
- delete sections
- reorder sections
- toggle visibility
- switch section type
- edit all supported fields

## Section Types

The framework should include default support for these section types:

- `hero`: main opening screen with dominant image and oversized heading
- `profile`: short character or theme introduction block
- `gallery`: visual section with one or more artwork items
- `quote`: minimal statement or highlight block
- `custom`: flexible text-image section for future reuse

The system should be designed so a new section type can be added later without rewriting the app structure.

## Asset Sources

Image fields should accept both:

- remote image URLs
- local static asset paths suitable for GitHub Pages deployment

If an image is missing or invalid, the UI should degrade gracefully with a placeholder treatment or by hiding the broken visual element.

## Scroll and Transition Behavior

The showcase page should use section activation as the main state driver.

Preferred interaction model:

- detect which section is active during scroll
- apply active and inactive visual states through React state and CSS classes
- use CSS transitions for opacity, transform, color, and overlay changes

The intended effect is a controlled page-to-page feeling:

- the background shifts between sections
- images ease in or out with slight transform changes
- headings and subheadings enter with layered motion
- overlays and decorative shapes adjust opacity or position

Boundaries:

- no heavy 3D scenes
- no large third-party animation dependency unless truly needed
- prioritize reliability on static hosting and acceptable mobile performance

## Editor Workflow

The editor should expose four main control groups:

### Global Settings

- title
- subtitle
- theme palette
- font preset
- external links
- optional visibility toggles for shared layout elements

### Section Management

- create a new section
- delete a section
- reorder sections
- show or hide sections
- change section type

### Current Section Settings

- text content
- tags
- buttons and links
- images
- background and overlay settings
- alignment and density presets
- transition-related settings

### Data Actions

- save to `localStorage`
- reset to bundled example config
- export JSON
- import JSON

The editor may autosave, or provide a manual save action with clear feedback. In either case, refreshes should preserve the latest valid saved state.

## Persistence and Import/Export

Persistence strategy:

- on first load, use the bundled example config
- if saved data exists in `localStorage`, prefer it
- allow reset back to the bundled example config

Import/export behavior:

- export the full `siteConfig` as JSON
- import should validate shape before replacing current config
- invalid JSON or invalid config shape should show a clear failure state and leave current data untouched

## Default Example Content

Ship the framework with:

- a reusable generic content structure
- one high-quality example theme that demonstrates the intended visual standard

The example should be visually complete enough to present in a report or demo without additional setup.

## Error Handling

Use defensive fallback behavior instead of fragile hard failures.

Expected rules:

- missing saved data falls back to default config
- malformed imported JSON does not overwrite current config
- empty text fields should not break layout
- empty links should suppress button rendering
- missing images should show a safe fallback treatment
- unknown section types should fail closed with a basic placeholder or be skipped safely

## Responsive Behavior

The project must support desktop and mobile.

Desktop priorities:

- cinematic visual composition
- stronger section transitions
- wide layout spacing

Mobile priorities:

- preserve the same theme and hierarchy
- reduce motion intensity where needed
- avoid text overflow and broken stacking
- keep editor usable on narrow screens even if less spacious than desktop

## Deployment

The project is intended for GitHub Pages.

Deployment requirements:

- static build output only
- base path configuration must be compatible with GitHub Pages
- local asset paths must work after deployment
- both `/` and `/editor` access patterns should be considered during routing setup for static hosting

## Validation Requirements

Before considering implementation complete, verify:

- local dev server runs correctly
- production build succeeds
- showcase route renders correctly
- editor route renders correctly
- `localStorage` save and reload behavior works
- JSON export works
- JSON import works with valid files
- invalid JSON import is handled safely
- section add, delete, reorder, and visibility controls work
- desktop and mobile layouts remain usable
- scroll-driven transitions do not cause obvious layout breakage or severe jank

## Recommended Architecture

Keep the code organized around a few focused responsibilities:

- app shell and routing
- shared config schema and default example data
- storage and import/export utilities
- showcase renderer and section components
- editor UI and config form controls
- theme and transition styling

The key architectural rule is that the showcase should render from config, not from hardcoded page content.

## Rationale for Chosen Approach

This design intentionally avoids both extremes:

- not a throwaway static page with fixed content
- not an overbuilt visual editor that consumes the whole project scope

The chosen approach is a balanced editable framework:

- polished enough for presentation
- generic enough for reuse
- simple enough to finish as a pure frontend project
- strong enough to explain clearly in a practice report about AI-agent-driven development and GitHub Pages deployment
