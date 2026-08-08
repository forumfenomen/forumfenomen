import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type CreateTopicLayoutProps = {
  children: ReactNode;
};

export default async function CreateTopicLayout({
  children,
}: CreateTopicLayoutProps) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !userId) {
    redirect("/giris");
  }

  return children;
}