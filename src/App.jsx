import Layout from "./layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CalculatorStorageProvider } from "./app/calculator/context/CalculatorStorageProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Home from "./app/home/page";
import SemesterAverageApp from "./app/calculator/page";
import PageManager from "./components/layouts/PageManager";

function App() {
  return (
    <CalculatorStorageProvider>
      <BrowserRouter>
        <PageManager />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/calc/:template-id" element={<SemesterAverageApp />} />
          </Route>
        </Routes>
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </CalculatorStorageProvider>
  );
}

export default App;
