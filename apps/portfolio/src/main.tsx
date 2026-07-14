import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { I18nProvider } from "@portfolio/i18n";
import "@portfolio/ui/styles.css";
import "./styles.css";
import { router } from "./app/router";

const root = document.getElementById("root");
if (!root) throw new Error("Application root was not found.");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" closeButton />
    </I18nProvider>
  </React.StrictMode>,
);
