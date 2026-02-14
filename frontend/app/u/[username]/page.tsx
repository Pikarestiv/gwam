// Server component — required for static export with dynamic routes
// generateStaticParams must return at least one entry for Next.js static export
export function generateStaticParams() {
  return [{ username: "_" }];
}

import SendPageClient from "./SendPageClient";

export default function Page() {
  return <SendPageClient />;
}
