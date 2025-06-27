import { Phone } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t text-muted-foreground text-sm">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Phone className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">LostFormed</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting people with their lost phones through smart matching
              and secure communication.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/reports"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Submit Report
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/inbox"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Helping reunite phones with their owners since 2024</p>
              <p>Built with ❤️ for the community</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 LostFormed. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
