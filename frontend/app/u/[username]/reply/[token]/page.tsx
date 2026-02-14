// Server component — required for static export with dynamic routes
export function generateStaticParams() {
  return [{ username: "_", token: "_" }];
}

import ReplyPageClient from "./ReplyPageClient";

export default function Page() {
  return <ReplyPageClient />;
}
