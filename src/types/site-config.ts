export type SectionType = "hero" | "profile" | "gallery" | "quote" | "custom";
export type FontPreset = "display" | "modern" | "editorial";
export type MotionPreset = "soft" | "medium" | "bold";
export type AlignMode = "start" | "center" | "end";
export type DensityMode = "compact" | "full" | "tall";
export type TransitionStyle = "fade" | "lift" | "glow";
export type ImageKind = "remote" | "local";

export interface ImageAsset {
  src: string;
  alt: string;
  kind: ImageKind;
}

export interface GlobalLink {
  label: string;
  href: string;
}

export interface GlobalConfig {
  siteTitle: string;
  siteSubtitle: string;
  accent: string;
  accentSoft: string;
  backgroundStart: string;
  backgroundEnd: string;
  fontPreset: FontPreset;
  motionPreset: MotionPreset;
  showNav: boolean;
  showFooter: boolean;
  links: GlobalLink[];
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  visible: boolean;
  title: string;
  description: string;
  quote: string;
  tags: string[];
  image: ImageAsset | null;
  secondaryImage: ImageAsset | null;
  galleryItems: ImageAsset[];
  background: string;
  backgroundAccent: string;
  overlayOpacity: number;
  align: AlignMode;
  density: DensityMode;
  buttonLabel: string;
  buttonHref: string;
  transitionStyle: TransitionStyle;
  imageDisplayMode: "inline" | "background";
  imageFrameWidth: number;
  imageFrameHeight: number;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
}

export interface SiteConfig {
  global: GlobalConfig;
  sections: SectionConfig[];
}
