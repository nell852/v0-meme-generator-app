import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Users, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Create Amazing Memes
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Design, edit, and share hilarious memes with the world. No design skills needed.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/editor">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline">
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-4 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold mb-16">Why MemeForge?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-lg border border-border bg-card p-8 hover:shadow-lg transition-shadow">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Create memes in seconds with our intuitive editor</p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-border bg-card p-8 hover:shadow-lg transition-shadow">
              <Users className="h-8 w-8 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">Share with millions and see what others create</p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-border bg-card p-8 hover:shadow-lg transition-shadow">
              <Sparkles className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
              <p className="text-muted-foreground">Export high-quality PNG/JPG with pro effects</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Become a Meme Legend?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators making the internet a funnier place, one meme at a time.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Get Started Now</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
