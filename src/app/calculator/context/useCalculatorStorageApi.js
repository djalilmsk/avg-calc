import { useContext } from "react";
import { CalculatorStorageContext } from "./storageContextValue";

export function useCalculatorStorageApi() {
  const context = useContext(CalculatorStorageContext);
  if (!context) {
    throw new Error(
      "useCalculatorStorageApi must be used inside <CalculatorStorageProvider />"
    );
  }
  return context;
}
