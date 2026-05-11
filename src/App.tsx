import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { EditorLocaleProvider } from "./context/EditorLocaleContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { EditorPage } from "./pages/EditorPage";
import { ShowcasePage } from "./pages/ShowcasePage";

const router = createHashRouter([
  { path: "/", element: <ShowcasePage /> },
  { path: "/editor", element: <EditorPage /> },
]);

export default function App() {
  return (
    <EditorLocaleProvider>
      <SiteConfigProvider>
        <RouterProvider router={router} />
      </SiteConfigProvider>
    </EditorLocaleProvider>
  );
}
