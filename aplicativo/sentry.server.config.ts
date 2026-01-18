
import { init } from "@sentry/nextjs";

init({
    dsn: "https://d6051467a8de91e93f067932661119fa@o4510729067102208.ingest.de.sentry.io/4510729071099984",
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
});
