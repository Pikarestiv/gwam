// Server component — required for static export with dynamic routes
export function generateStaticParams() {
  return [{ code: "_" }];
}

import RoomPageClient from "./RoomPageClient";

export default function Page() {
  return <RoomPageClient />;
}
