import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              FT
            </div>
            <span className="font-semibold text-lg">FamilyTasks</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/api/health"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Status
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block rounded-full px-4 py-1 bg-primary/10 text-primary text-sm font-medium mb-4">
            Production-Ready Family Task Manager
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Organize Your Household,<br />Empower Your Family
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A complete task scheduler with smart assignments, recurring chores, points rewards, and calendar integration — built for modern families.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Get Started Free
            </button>
            <Link
              href="#features"
              className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything Your Family Needs</h2>
          <p className="text-lg text-muted-foreground">Production-ready features from day one</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature Cards */}
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built With Modern Tech</h2>
            <p className="text-lg text-muted-foreground">Production-grade architecture, ready to scale</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {techStack.map((tech, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border">
                <div className="font-semibold mb-1">{tech.name}</div>
                <div className="text-sm text-muted-foreground">{tech.purpose}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-semibold mb-4">FamilyTasks</div>
              <p className="text-sm text-muted-foreground">
                A modern, production-ready family task scheduler with multi-tenant support,
                gamification, and smart automation.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-4">Features</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Task Management</li>
                <li>Recurring Schedules</li>
                <li>Points & Rewards</li>
                <li>Calendar Integration</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Resources</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/api/health" className="hover:text-foreground">Health Status</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t pt-8">
            © 2026 FamilyTasks. Built with Next.js 15, Postgres, and Better Auth.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📋",
    title: "Smart Task Management",
    description: "Create, assign, and track household chores with priorities, categories, and subtasks."
  },
  {
    icon: "🔄",
    title: "Recurring Schedules",
    description: "Set daily, weekly, or monthly recurring tasks that auto-generate based on RRULE patterns."
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Multi-User Households",
    description: "Invite family members with role-based permissions (parent/admin and children)."
  },
  {
    icon: "⭐",
    title: "Points & Rewards",
    description: "Gamify chores with a points system. Kids earn rewards, parents approve completions."
  },
  {
    icon: "📅",
    title: "Calendar Integration",
    description: "Visual calendar views (month/week/day) with Google Calendar sync capability."
  },
  {
    icon: "🎯",
    title: "Smart Assignments",
    description: "Assign tasks to specific members or allow rotation and voluntary claiming."
  },
  {
    icon: "🔔",
    title: "Notifications",
    description: "Push notifications for assignments, reminders, and completions across all devices."
  },
  {
    icon: "📊",
    title: "Activity Dashboard",
    description: "Track completion rates, points leaderboards, and household activity feeds."
  },
  {
    icon: "🌙",
    title: "Dark Mode + PWA",
    description: "Beautiful dark mode with system sync, installable as a progressive web app."
  }
];

const techStack = [
  { name: "Next.js 15", purpose: "Full-stack framework" },
  { name: "Postgres", purpose: "Production database" },
  { name: "Better Auth", purpose: "Authentication" },
  { name: "Drizzle ORM", purpose: "Type-safe queries" },
  { name: "Tailwind v4", purpose: "Modern styling" },
  { name: "React Query", purpose: "Data fetching" },
  { name: "Zod", purpose: "Validation" },
  { name: "Docker", purpose: "Containerization" }
];
