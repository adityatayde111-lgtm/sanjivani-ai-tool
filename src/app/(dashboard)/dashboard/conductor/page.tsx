import ConductorPageClient from "./ConductorPageClient";

export const metadata = {
  title: "Conductor — Sanjivani Ai Tool",
  description: "Sanjivani Conductor CLI-agent fleet: runners, task queue and councils, live.",
};

export default function ConductorPage() {
  return <ConductorPageClient />;
}
