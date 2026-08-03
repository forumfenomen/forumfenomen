import { getPlusAccessState } from "@/lib/plus/plus-access";

import PlusPageClient from "./plus-page-client";

export const dynamic = "force-dynamic";

export default async function PlusPage() {
  const access = await getPlusAccessState();

  return (
    <PlusPageClient
      hasPlusAccess={access.hasAccess}
    />
  );
}