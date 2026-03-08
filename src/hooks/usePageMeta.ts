import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
}

const BASE_TITLE = "GrowHub — Plateforme Startup";

export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    document.title = `${title} | ${BASE_TITLE}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${title} | ${BASE_TITLE}`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute("content", description);
  }, [title, description]);
}
