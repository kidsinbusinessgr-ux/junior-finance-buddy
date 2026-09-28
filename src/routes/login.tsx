import { createFileRoute, Link } from "@tanstack/react-router";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Brightly" }, { name: "description", content: "Access your Brightly family space." }, { property: "og:title", content: "Login — Brightly" }, { property: "og:description", content: "Access your Brightly family space." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: LoginPage,
});

function LoginPage() { return <main className="min-h-screen bg-[oklch(0.975_0.011_292)] px-6 pt-5"><div className="mx-auto max-w-[1440px]"><BrightlyNav tone="light" /></div><section className="mx-auto flex max-w-md flex-col px-1 py-24"><p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground">Welcome back</p><h1 className="mt-4 text-5xl font-black">Sign in to Brightly</h1><label className="mt-10 text-sm font-bold" htmlFor="email">Email address</label><input id="email" type="email" className="mt-2 h-12 rounded-md border bg-card px-4" placeholder="you@example.com" /><label className="mt-6 text-sm font-bold" htmlFor="password">Password</label><input id="password" type="password" className="mt-2 h-12 rounded-md border bg-card px-4" placeholder="••••••••" /><Button className="mt-8 h-12 rounded-full bg-primary text-primary-foreground">Sign in</Button><p className="mt-7 text-sm text-muted-foreground">New to Brightly? <Link className="font-bold text-foreground underline" to="/signup">Create an account</Link></p></section></main>; }