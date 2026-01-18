
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://d6051467a8de91e93f067932661119fa@o4510729067102208.ingest.de.sentry.io/4510729071099984",
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,

    // Configuración de Session Replay (Video del error)
    replaysSessionSampleRate: 0.1, // Graba el 10% de todas las sesiones
    replaysOnErrorSampleRate: 1.0, // Graba el 100% de las sesiones con errores

    integrations: [
        Sentry.replayIntegration(),
    ],

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
});
