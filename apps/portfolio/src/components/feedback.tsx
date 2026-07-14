import { Button, PageState, Skeleton } from "@portfolio/ui";
import { useI18n } from "@portfolio/i18n";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { localizedPath } from "@/lib/locale";

export function InitialLoading() {
  return (
    <div className="min-h-screen bg-background px-5 py-24" aria-busy="true">
      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 max-w-3xl" />
        <Skeleton className="h-6 max-w-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <PageState
      icon={<AlertTriangle aria-hidden className="h-5 w-5" />}
      title={title}
      description={description}
    />
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { lang, t } = useI18n();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-24">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.24em] text-signal">
          {notFound ? "404" : t("error.connection")}
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight">
          {notFound ? t("nf.title") : t("error.unavailable.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {notFound ? t("nf.body") : t("error.unavailable.body")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {!notFound ? (
            <Button type="button" onClick={() => window.location.reload()}>
              <RefreshCw aria-hidden className="h-4 w-4" />
              {t("error.retry")}
            </Button>
          ) : null}
          <Link
            to={localizedPath("/", lang)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-signal/50 hover:text-signal"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {t("cta.backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
