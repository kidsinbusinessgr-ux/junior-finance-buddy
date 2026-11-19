import { createFileRoute, redirect } from "@tanstack/react-router";

// The old English demo dashboard (made-up spending in £ and an AI coach anyone
// could call) was retired on 2026-11-19. Parents use /parent-dashboard.
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/parent-dashboard" });
  },
});
