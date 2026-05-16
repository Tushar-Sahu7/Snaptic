"use client";

import React from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Shader Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ShaderAnimation />
      </div>

      <HeroHeader />

      <main className="relative z-10 overflow-hidden">
        <section>
          <div className="relative pt-24 md:pt-36">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    to="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      AI based Attendance
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>

                  <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold tracking-tight">
                    Modern Solutions for{" "}
                    <span className="text-primary">Attendance Tracking</span>
                  </h1>
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                    Experience the future of facial recognition attendance.
                    Secure, fast, and highly customizable for any teachers.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[14px] border p-0.5"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-5 text-base shadow-xl"
                    >
                      <Link to="/register">
                        <span className="text-nowrap">
                          Start Taking Attendance
                        </span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5"
                  >
                    <Link to="#features">
                      <span className="text-nowrap">View Features</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              className="relative mt-8 px-2 sm:mt-12 md:mt-20"
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative mx-auto max-w-6xl">
                <div
                  aria-hidden
                  className="bg-linear-to-b from-transparent to-background absolute inset-0 z-10 from-35%"
                />
                <div className="ring-background dark:inset-shadow-white/20 bg-background/80 backdrop-blur-sm relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-2xl shadow-zinc-950/15 ring-1">
                  <img
                    className="bg-background relative rounded-2xl shadow-inner w-full h-auto object-contain"
                    src="/landing/dashboard_dark.png"
                    alt="Snaptic AI-Powered Attendance Dashboard Interface"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </div>
  );
}

const menuItems = [
  { name: "Features", href: "#link" },
  { name: "Solution", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav data-state={menuState && "active"} className="w-full px-2 group">
        <div
          className={cn(
            "mx-auto mt-4 max-w-6xl px-6 transition-all duration-300 lg:px-12 py-3",
            isScrolled
              ? "bg-background/80 max-w-4xl rounded-2xl border backdrop-blur-xl lg:px-8"
              : "bg-transparent",
          )}
        >
          <div className="relative flex items-center justify-between gap-6 lg:gap-0">
            <div className="flex w-full justify-between lg:w-auto">
              <Logo />

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 lg:hidden"
              >
                {menuState ? (
                  <X className="size-6" />
                ) : (
                  <Menu className="size-6" />
                )}
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      className="text-muted-foreground hover:text-primary block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                "flex items-center gap-4",
                menuState ? "flex" : "hidden lg:flex",
              )}
            >
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
