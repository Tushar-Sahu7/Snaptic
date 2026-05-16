import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Users,
  ScanFace,
  Calendar as CalendarIcon,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlareHover from "@/components/ui/GlareHover";

const MotionCard = motion(Card);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function Features() {
  const [activeStudent, setActiveStudent] = useState(0);
  const students = [
    {
      name: "Aditi Sharma",
      status: "Present",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Rahul Verma",
      status: "Present",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Sneha Kapur",
      status: "Present",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      name: "Arjun Singh",
      status: "Present",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      name: "Priya Das",
      status: "Present",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStudent((prev) => (prev + 1) % students.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [students.length]);

  return (
    <section className="bg-gray-50 py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
        <div className="relative">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">
              Features
            </h2>
            <h3 className="dark:text-white mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Built for speed.{" "}
              <span className="text-primary">Designed for accuracy.</span>
            </h3>
            <p className="text-muted-foreground text-balance text-lg">
              Snaptic replaces manual roll calls with advanced Face AI,
              providing a fast, reliable, and transparent way to manage your
              classroom.
            </p>
          </div>
          <motion.div
            className="relative z-10 grid grid-cols-6 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Card 1: Face AI Accuracy */}
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative col-span-full flex overflow-hidden lg:col-span-2 group"
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.15}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={800}
                borderRadius="inherit"
              >
                <CardContent className="relative m-auto size-fit pt-6">
                  <div className="relative flex h-24 w-56 items-center">
                    <svg
                      className="text-muted absolute inset-0 size-full"
                      viewBox="0 0 254 104"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="mx-auto block w-fit text-5xl font-semibold">
                      99.8%
                    </span>
                  </div>
                  <div className="relative z-10 mt-6 space-y-2 text-center">
                    <h2 className="text-lg font-medium transition dark:text-white">
                      Face AI Accuracy
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Advanced Face AI technology that identifies students and
                      keeps your records 100% accurate.
                    </p>
                  </div>
                </CardContent>
              </GlareHover>
            </MotionCard>

            {/* Card 2: Face ID */}
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 group"
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.15}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={800}
                borderRadius="inherit"
              >
                <CardContent className="pt-6">
                  <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                    <ScanFace
                      className="m-auto size-12 text-primary"
                      strokeWidth={1}
                    />
                  </div>
                  <div className="relative z-10 mt-6 space-y-2 text-center">
                    <h2 className="group-hover:text-secondary-950 text-lg font-medium transition dark:text-white">
                      Face ID
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Simple one-time student registration. Secure Face AI that
                      prevents fake attendance and ensures complete honesty.
                    </p>
                  </div>
                </CardContent>
              </GlareHover>
            </MotionCard>

            {/* Card 3: Ultra Fast Scanning */}
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 group"
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.15}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={800}
                borderRadius="inherit"
              >
                <CardContent className="pt-6">
                  <div className="pt-6 lg:px-6">
                    <div className="relative flex h-24 items-center justify-center pt-6">
                      <span className="text-5xl font-semibold tracking-tighter transition dark:text-white">
                        &lt; 2 sec
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-14 space-y-2 text-center">
                    <h2 className="text-lg font-medium transition dark:text-white">
                      Ultra Fast Scanning
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Mark attendance in less than 2 seconds per student. Scan
                      an entire class of 60+ students in under 2 minutes.
                    </p>
                  </div>
                </CardContent>
              </GlareHover>
            </MotionCard>

            {/* Card 4: Smart Weekly Scheduling */}
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative col-span-full overflow-hidden lg:col-span-3 group"
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.1}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={800}
                borderRadius="inherit"
              >
                <CardContent className="grid pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                      <CalendarIcon
                        className="m-auto size-6 text-primary"
                        strokeWidth={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <h2 className="group-hover:text-secondary-950 text-lg font-medium text-zinc-800 transition dark:text-white">
                        Smart Weekly Scheduling
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Enter your class schedule once. Snaptic automatically
                        loads the correct student list at the right time.
                      </p>
                    </div>
                  </div>
                  <div className="relative -mb-6 -mr-6 mt-auto h-fit border-l border-t border-zinc-200 dark:border-zinc-800 sm:ml-6 rounded-tl-xl">
                    <Calendar
                      mode="single"
                      className="pointer-events-none translate-x-4 translate-y-4 scale-105 border-none shadow-none grayscale opacity-40"
                      classNames={{
                        nav: "hidden",
                        month_caption: "hidden",
                      }}
                    />
                  </div>
                </CardContent>
              </GlareHover>
            </MotionCard>

            {/* Card 5: Attendance Dashboard */}
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative col-span-full overflow-hidden lg:col-span-3 group"
            >
              <GlareHover
                glareColor="#ffffff"
                glareOpacity={0.1}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={800}
                borderRadius="inherit"
              >
                <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                      <Users className="m-auto size-6" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium transition dark:text-white">
                        Attendance Dashboard
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Watch your attendance list fill up in real-time during
                        the scan. Quickly see who is present and missing for
                        every single session.
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-6 sm:-my-6 sm:-mr-6">
                    <div className="relative flex h-full flex-col justify-center space-y-3 py-6 px-4">
                      {students.map((student, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg border p-2 transition-all duration-500 ${
                            i === activeStudent
                              ? "border-primary bg-primary/5 scale-105"
                              : "border-transparent opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="text-[10px] font-bold">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">
                              {student.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2
                              className={`size-3 ${i <= activeStudent ? "text-green-500" : "text-muted"}`}
                            />
                            <span
                              className={`text-[10px] ${i <= activeStudent ? "text-green-600 font-bold" : "text-muted-foreground"}`}
                            >
                              {i <= activeStudent ? "Present" : "Waiting"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </GlareHover>
            </MotionCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
