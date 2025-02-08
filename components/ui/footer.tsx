import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          Unauthorized access is strictly prohibited
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/ashlessscythe/vacay"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
