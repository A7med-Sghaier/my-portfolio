import { useRouteLoaderData } from "react-router";
import type { RootLoaderData } from "./loaders";

export function usePortfolioData(): RootLoaderData {
  const data = useRouteLoaderData<RootLoaderData>("portfolio-root");
  if (!data) throw new Error("Portfolio content is unavailable.");
  return data;
}
