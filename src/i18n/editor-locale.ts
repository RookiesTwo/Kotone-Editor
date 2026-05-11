export type EditorLocale = "zh-CN" | "en";

export const EDITOR_LOCALE_STORAGE_KEY = "editable-showcase.editor-locale";
export const DEFAULT_EDITOR_LOCALE: EditorLocale = "zh-CN";

export function isEditorLocale(value: unknown): value is EditorLocale {
  return value === "zh-CN" || value === "en";
}

export const editorMessages = {
  "zh-CN": {
    header: {
      title: "编辑器",
      description: "调整展示页并实时查看预览。",
      switchToChinese: "中文",
      switchToEnglish: "EN",
    },
    global: {
      title: "全局",
      siteTitle: "站点标题",
      subtitle: "副标题",
      accent: "强调色",
      accentSoft: "柔和强调色",
    },
    sections: {
      title: "区块",
      addSection: "新增区块",
      untitledSection: "未命名区块",
      up: "上移",
      down: "下移",
      delete: "删除",
    },
    selectedSection: {
      title: "当前区块",
      type: "类型",
      visible: "显示",
      titleField: "标题",
      description: "描述",
      quote: "引用",
      imageSrc: "图片地址",
      background: "背景",
      accent: "强调色",
      buttonLabel: "按钮文案",
      buttonHref: "按钮链接",
    },
    data: {
      title: "数据",
      exportJson: "导出 JSON",
      importJson: "导入 JSON",
      resetDemo: "重置示例",
    },
    alerts: {
      importFailed: "导入失败，请选择有效的 JSON 配置文件。",
    },
  },
  en: {
    header: {
      title: "Editor",
      description: "Adjust the showcase and watch the preview update in real time.",
      switchToChinese: "中文",
      switchToEnglish: "EN",
    },
    global: {
      title: "Global",
      siteTitle: "Site title",
      subtitle: "Subtitle",
      accent: "Accent",
      accentSoft: "Accent soft",
    },
    sections: {
      title: "Sections",
      addSection: "Add section",
      untitledSection: "Untitled section",
      up: "Up",
      down: "Down",
      delete: "Delete",
    },
    selectedSection: {
      title: "Selected section",
      type: "Type",
      visible: "Visible",
      titleField: "Title",
      description: "Description",
      quote: "Quote",
      imageSrc: "Image src",
      background: "Background",
      accent: "Accent",
      buttonLabel: "Button label",
      buttonHref: "Button href",
    },
    data: {
      title: "Data",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      resetDemo: "Reset Demo",
    },
    alerts: {
      importFailed: "Import failed. Please choose a valid JSON config file.",
    },
  },
} as const;
