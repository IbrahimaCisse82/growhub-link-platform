import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? "fr";

  const setLang = (lng: "fr" | "en") => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="w-9 h-9 rounded-[9px] bg-card border border-border flex items-center justify-center text-foreground/70 hover:bg-secondary hover:text-foreground transition-all flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("language.label")}
      >
        <Languages className="w-[15px] h-[15px]" />
        <span className="sr-only">{current.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setLang("fr")} className="cursor-pointer gap-2">
          <span className={current === "fr" ? "font-bold text-primary" : ""}>🇫🇷 {t("language.fr")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer gap-2">
          <span className={current === "en" ? "font-bold text-primary" : ""}>🇬🇧 {t("language.en")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
