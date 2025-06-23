'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LogOut, Menu, MessageCircle, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Dropdown components (simplified version)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const DropdownMenuContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50',
      className
    )}
  >
    {children}
  </div>
);

const DropdownMenuItem = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn('px-4 py-2 text-sm flex items-center', className)}
  >
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn('h-px my-1', className)} />
);

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Navigation items
  const navigation = [
    { name: 'Browse Reports', href: '/reports' },
    ...(user
      ? [
          { name: 'Submit Report', href: '/report' },
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Inbox', href: '/inbox', icon: MessageCircle },
        ]
      : []),
  ];

  if (loading) {
    return (
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gray-800 animate-pulse" />
            <span className="font-bold text-transparent bg-gray-800 rounded animate-pulse">
              LostFormed
            </span>
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60   bg-amber-100"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex ">
          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-10 w-10 flex items-center justify-center  backdrop-blur-sm">
                <Image
                  src="/LOGO-removebg-preview.png"
                  alt="LostFormed Logo"
                  width={36}
                  height={36}
                  className="filter brightness-125 contrast-110"
                />
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-6 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center transition-colors hover:text-foreground/80 focus-ring rounded-sm px-2 py-1',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              {isOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="pr-0 bg-background">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-900/50 border border-gray-800">
                <Image
                  src="/LOGO-removebg-preview.png"
                  alt="LostFormed Logo"
                  width={36}
                  height={36}
                  className="filter brightness-125 contrast-110"
                />
              </div>
            </Link>

            {/* Mobile Navigation Links */}
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center transition-colors hover:text-foreground/80 focus-ring rounded-sm px-2 py-1',
                        pathname === item.href
                          ? 'text-foreground font-medium'
                          : 'text-foreground/60'
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Auth links */}
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigation.length * 0.1 }}
                  >
                    <button
                      onClick={() => logout()}
                      className="flex items-center w-full text-left transition-colors hover:text-foreground/80 focus-ring rounded-sm px-2 py-1 text-foreground/60"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navigation.length * 0.1 }}
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center transition-colors hover:text-foreground/80 focus-ring rounded-sm px-2 py-1 text-foreground/60"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navigation.length + 1) * 0.1 }}
                    >
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center transition-colors hover:text-foreground/80 focus-ring rounded-sm px-2 py-1 text-foreground/60"
                      >
                        Register
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Right Side - Logo (Mobile) and User Actions */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Logo */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-900/50 border border-gray-800">
                <Image
                  src="/LOGO-removebg-preview.png"
                  alt="LostFormed Logo"
                  width={28}
                  height={28}
                  className="filter brightness-125 contrast-110"
                />
              </div>
              <span className="font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                LostFormed
              </span>
            </Link>
          </div>

          {/* User Actions */}
          <nav className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0 bg-background border border-border"
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-foreground" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border border-border shadow-xl">
                  <DropdownMenuItem className="focus:bg-accent cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="focus:bg-accent cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link href="/login">
                  <Button variant="outline" className="border-border">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
