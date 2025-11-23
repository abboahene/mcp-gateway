import Link from "next/link"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          MCP Gateway <br className="hidden sm:inline" />
          Aggregate multiple MCP servers into a single endpoint.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          One configuration to rule them all. Connect GitHub, Slack, Postgres, and more to Claude Desktop and VS Code with a single gateway.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/docs" rel="noreferrer">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
        >
          <Button variant="outline" size="lg">
            GitHub
          </Button>
        </Link>
      </div>
    </section>
  )
}
