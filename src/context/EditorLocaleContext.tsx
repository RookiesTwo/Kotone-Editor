import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_EDITOR_LOCALE,
  editorMessages,
  EDITOR_LOCALE_STORAGE_KEY,
  isEditorLocale,
  type EditorLocale,
} from "../i18n/editor-locale";

interface EditorLocaleContextValue {
  locale: EditorLocale;
  setLocale: (locale: EditorLocale) => void;
  messages: (typeof editorMessages)[EditorLocale];
}

const EditorLocaleContext = createContext<EditorLocaleContextValue | null>(null);

function loadStoredEditorLocale(): EditorLocale {
  try {
    const stored = localStorage.getItem(EDITOR_LOCALE_STORAGE_KEY);
    return isEditorLocale(stored) ? stored : DEFAULT_EDITOR_LOCALE;
  } catch {
    return DEFAULT_EDITOR_LOCALE;
  }
}

export function EditorLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<EditorLocale>(() => loadStoredEditorLocale());

  useEffect(() => {
    try {
      localStorage.setItem(EDITOR_LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore locale persistence errors.
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: editorMessages[locale],
    }),
    [locale],
  );

  return <EditorLocaleContext.Provider value={value}>{children}</EditorLocaleContext.Provider>;
}

export function useEditorLocale() {
  const context = useContext(EditorLocaleContext);
  if (!context) {
    throw new Error("useEditorLocale must be used inside EditorLocaleProvider");
  }

  return context;
}
