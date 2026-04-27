import Layout from "./layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CalculatorStorageProvider } from "./app/calculator/context/CalculatorStorageProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Home from "./app/home/page";
import SemesterAverageApp from "./app/calculator/page";
import DocsPage from "./app/docs/page";
import PageManager from "./components/layouts/PageManager";

const VERCEL_INSIGHTS_HOSTS = new Set([
  "calc.djalilmsk.dev",
  "cookedcalc.djalilmsk.dev",
]);

function shouldRenderVercelInsights() {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  return (
    VERCEL_INSIGHTS_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")
  );
}

function App() {
  const renderVercelInsights = shouldRenderVercelInsights();

  return (
    <CalculatorStorageProvider>
      <BrowserRouter>
        <PageManager />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/calc/:template-id" element={<SemesterAverageApp />} />
          </Route>
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
        {renderVercelInsights && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </BrowserRouter>
    </CalculatorStorageProvider>
  );
}

export default App;
