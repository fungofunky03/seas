import { supabase } from "@/lib/supabase";

export type ValidationSummary = {
  total: number;
  roleCounts: Record<string, number>;
  volumeCounts: Record<string, number>;
  bottleneckCounts: Record<string, number>;
  demoInterest: {
    total: number;
    lastStepCounts: Record<string, number>;
    mostClickedStepCounts: Record<string, number>;
  };
  updatedAt: number | string;
};

export const EMPTY_SUMMARY: ValidationSummary = {
  total: 0,
  roleCounts: {},
  volumeCounts: {},
  bottleneckCounts: {},
  demoInterest: { total: 0, lastStepCounts: {}, mostClickedStepCounts: {} },
  updatedAt: Date.now(),
};

export async function getValidationSummary() {
  const { data, error } = await supabase.rpc("get_validation_summary");
  if (error) throw error;
  return data as ValidationSummary;
}
