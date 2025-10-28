"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function Footer() {
  const pathname = usePathname()
  

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="border-t bg-[#1E1E1E]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 GDG DevFest. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Built with Next.js and Tailwind CSS
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#3C77C3]">
            <Link href="/speakers">
              <Button variant="ghost" size="sm">
                Speakers
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
