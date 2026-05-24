import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWaitlistCount, submitWaitlist } from "@/features/waitlist/api";
import type { DemoEngagement } from "@/features/waitlist/types";
import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function WaitlistSection({ demoEngagement }: { demoEngagement: DemoEngagement }) {
  return (
    <section id="waitlist" className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              Join the installer waitlist
            </div>
            <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
              Get in while the workflow is still being shaped.
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              We're working with a small validation group of working dealers, crew leads, and
              electricians. Tell us what you run today and where the workflow breaks — we'll
              reach out when your slot opens.
            </p>
            <WaitlistCount />
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Free during early validation",
                "Founder reply when your workflow is a fit",
                "Your bottleneck shapes what we build first",
              ].map((line, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-7">
            <WaitlistForm demoEngagement={demoEngagement} />
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitlistCount() {
  const countQuery = useQuery({
    queryKey: ["waitlist", "count"],
    queryFn: getWaitlistCount,
    retry: false,
  });

  const count = countQuery.data?.count;
  if (!count || count < 3) {
    return (
      <div className="mt-6 border border-border bg-card p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Validation slots are intentionally limited.</span>{" "}
        We are looking for installers who can describe the real job flow, not just sign up for
        another tool.
      </div>
    );
  }

  return (
    <div
      className="mt-6 border border-primary/30 bg-primary/10 p-4 text-sm"
      data-testid="status-waitlist-count"
    >
      <span className="font-semibold">{count} installers have joined the validation list.</span>{" "}
      Add your bottleneck so we can prioritize the right first workflows.
    </div>
  );
}

function WaitlistForm({ demoEngagement }: { demoEngagement: DemoEngagement }) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: undefined as unknown as InsertWaitlist["role"],
      installVolume: undefined as unknown as InsertWaitlist["installVolume"],
      bottleneck: "",
      demoLastStep: "",
      demoMostClickedStep: "",
      demoStepClicks: {},
    },
  });

  const mutation = useMutation({
    mutationFn: submitWaitlist,
    onSuccess: () => setSubmitted(true),
    onError: () => {
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div
        className="relative border border-primary/40 bg-card p-8"
        role="status"
        data-testid="status-waitlist-success"
      >
        <div className="absolute -left-px top-0 h-10 w-1 bg-primary" aria-hidden="true" />
        <div className="mb-6 border-b border-border pb-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            2-minute founder intake
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The bottleneck field matters most. If SEAS can solve it, Jay will follow up directly.
          </p>
        </div>
        <CheckCircle2 className="h-7 w-7 text-primary" strokeWidth={2.25} />
        <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-tight">
          You're on the installer waitlist.
        </h3>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          I'll reach out when the early validation group opens. If you mentioned a bottleneck,
          expect a real reply — not a drip campaign.
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          — Jay · SEAS
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          mutation.mutate({
            ...data,
            ...demoEngagement,
          })
        )}
        className="relative border border-border bg-card p-6 md:p-8"
        data-testid="form-waitlist"
        noValidate
      >
        <div className="absolute -left-px top-0 h-10 w-1 bg-primary" aria-hidden="true" />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Work email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="jane@yourcompany.com"
                    autoComplete="email"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Company
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Hartwell Lighting Co."
                    autoComplete="organization"
                    className="rounded-none border-foreground/15 bg-background"
                    data-testid="input-company"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Role
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className="rounded-none border-foreground/15 bg-background"
                      data-testid="select-role"
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Dealer/Owner">Dealer / Owner</SelectItem>
                    <SelectItem value="Crew Lead">Crew Lead</SelectItem>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5">
          <FormField
            control={form.control}
            name="installVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Install volume
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className="rounded-none border-foreground/15 bg-background"
                      data-testid="select-install-volume"
                    >
                      <SelectValue placeholder="How many installs per month?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-10/month">0–10 / month</SelectItem>
                    <SelectItem value="11-25/month">11–25 / month</SelectItem>
                    <SelectItem value="26-50/month">26–50 / month</SelectItem>
                    <SelectItem value="50+/month">50+ / month</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-5">
          <FormField
            control={form.control}
            name="bottleneck"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Biggest bottleneck
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Where does your workflow break today? Quoting, scheduling, crew handoff, service callbacks, rebooking…"
                    className="resize-none rounded-none border-foreground/15 bg-background"
                    data-testid="input-bottleneck"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="animated-cta mt-7 h-12 w-full rounded-none bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-8"
          data-testid="button-submit-waitlist"
        >
          {mutation.isPending ? "Sending…" : "Join the validation group"}
          {!mutation.isPending && <ArrowRight className="cta-arrow ml-2 h-4 w-4" />}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          We'll only use this to talk to you about SEAS. No spam, no third-party lists.
        </p>
      </form>
    </Form>
  );
}
