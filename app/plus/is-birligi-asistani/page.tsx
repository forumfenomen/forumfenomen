import { requirePlusAccess } from "@/lib/plus/plus-access";

import AssistantPageClient from "./assistant-page-client";

export const dynamic = "force-dynamic";

export default async function CollaborationAssistantPage() {
  await requirePlusAccess();

  return <AssistantPageClient />;
}