import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <a href="#main-content" className="skip-link">Aller au contenu principal</a>
    <App />
  </>
);
