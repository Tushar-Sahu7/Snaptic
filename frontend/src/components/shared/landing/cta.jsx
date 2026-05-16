"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="size-4" />
            </motion.div>
            <span className="text-xs font-bold tracking-wider uppercase">Ready to upgrade?</span>
          </motion.div>

          <TextEffect
            preset="blur"
            className="text-4xl md:text-6xl font-bold tracking-tight mb-8"
          >
            Transform Your Classroom with Snaptic
          </TextEffect>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join the future of education management. Secure, lightning-fast facial recognition attendance that lets you focus on what matters most—teaching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="xl" className="w-full sm:w-auto rounded-2xl group text-lg px-8 py-7 shadow-2xl shadow-primary/20">
              <Link to="/register">
                Start Taking Attendance
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full sm:w-auto rounded-2xl text-lg px-8 py-7">
              <Link to="#features" onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Features
              </Link>
            </Button>
          </motion.div>

        </div>
      </div>

      {/* Subtle Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
