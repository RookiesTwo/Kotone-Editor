const EXTERNAL_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl || baseUrl === "/") {
    return "/";
  }

  return `/${baseUrl.replace(/^\/+|\/+$/g, "")}/`;
}

export function resolveAssetSrc(src: string, baseUrl = import.meta.env.BASE_URL): string {
  if (!src || EXTERNAL_URL_PATTERN.test(src) || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("#")) {
    return src;
  }

  if (!src.startsWith("/")) {
    return src;
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (normalizedBaseUrl === "/") {
    return src;
  }

  if (src === normalizedBaseUrl.slice(0, -1) || src.startsWith(normalizedBaseUrl)) {
    return src;
  }

  return `${normalizedBaseUrl}${src.replace(/^\/+/, "")}`;
}
