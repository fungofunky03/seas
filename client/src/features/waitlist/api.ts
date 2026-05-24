import { supabase } from "@/lib/supabase";
import type { InsertWaitlist } from "@shared/schema";

export async function getWaitlistCount() {
  const { data, error } = await supabase.rpc("get_waitlist_count");
  if (error) throw error;
  return { count: typeof data === "number" ? data : Number(data ?? 0) };
}

export async function submitWaitlist(data: InsertWaitlist) {
  const { error } = await supabase.from("waitlist").insert({
    name: data.name,
    email: data.email,
    company: data.company,
    role: data.role,
    install_volume: data.installVolume,
    bottleneck: data.bottleneck,
    demo_last_step: data.demoLastStep,
    demo_most_clicked_step: data.demoMostClickedStep,
    demo_step_clicks: data.demoStepClicks,
  });

  if (error) throw error;
  return { ok: true };
}
