import Layout from "./layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CalculatorStorageProvider } from "./app/calculator/context/CalculatorStorageProvider";

import Home from "./app/home/page";
import SemesterAverageApp from "./app/calculator/page";

function App() {
  return (
    <CalculatorStorageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/calc/:template-id" element={<SemesterAverageApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CalculatorStorageProvider>
  );
}

export default App;
