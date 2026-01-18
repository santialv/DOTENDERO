import * as Sentry from "@sentry/nextjs";

type ErrorSeverity = "fatal" | "error" | "warning" | "info" | "debug";

interface ErrorContext {
    location?: string;
    userId?: string;
    metadata?: Record<string, any>;
    severity?: ErrorSeverity;
}

/**
 * Reporta un error a Sentry con contexto enriquecido.
 * Úsalo en catch blocks de APIs o errores controlados de UI.
 */
export function reportError(error: any, context: ErrorContext = {}) {
    console.error("Reportando error a Sentry:", error);

    Sentry.withScope((scope) => {
        if (context.location) {
            scope.setTag("location", context.location);
        }

        if (context.userId) {
            scope.setUser({ id: context.userId });
        }

        if (context.severity) {
            scope.setLevel(context.severity);
        }

        if (context.metadata) {
            scope.setContext("additional_info", context.metadata);
        }

        Sentry.captureException(error);
    });
}
