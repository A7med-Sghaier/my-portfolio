import { useI18n } from "@portfolio/i18n";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { localizedPath } from "@/lib/locale";
import { Seo } from "@/lib/seo";

export function NotFoundPage() {
  const { t, lang } = useI18n();
  const location = useLocation();
  return (
    <div className="relative isolate mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <Seo
        title={t("nf.title")}
        description={t("nf.body")}
        path={location.pathname}
        locale={lang}
        noIndex
      />
      <PageBackdrop motif="neural" />
      <motion.span
        className="font-mono text-sm text-signal"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      >
        404
      </motion.span>
      <motion.h1
        className="mt-3 font-display tracking-tight"
        style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 500 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0, 0, 1] }}
      >
        {t("nf.title")}
      </motion.h1>
      <motion.p
        className="mt-3 text-muted-foreground"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.2, 0, 0, 1] }}
      >
        {t("nf.body")}
      </motion.p>
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24, ease: [0.2, 0, 0, 1] }}
      >
        <Link
          to={localizedPath("/", lang)}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
        >
          {t("cta.backHome")}
        </Link>
      </motion.div>
    </div>
  );
}
