import { NavLink, useLocation } from "react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  LogOut,
  ChevronUp,
  Sun,
  Moon,
  Laptop,
  Palette,
  User,
  X,
  ScanFace,
  Check,
  LayoutDashboard,
  UserCheck,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const teacherNavItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "My Classes", url: "/teacher/classes", icon: BookOpen },
  {
    title: "Quick Mark",
    url: "/teacher/take-attendance",
    icon: UserCheck,
  },
  { title: "Records", url: "/teacher/records", icon: ClipboardList },
  { title: "Face ID", url: "/teacher/face-enrollment", icon: ScanFace },
];

const studentNavItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: Laptop },
  { title: "My Classes", url: "/student/classes", icon: BookOpen },
  { title: "Records", url: "/student/records", icon: ClipboardList },
  { title: "Face ID", url: "/student/face-enrollment", icon: ScanFace },
];

export function AppSidebar({ onInvite }) {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const location = useLocation();
  const [showInviteBox, setShowInviteBox] = useState(true);

  const isTeacher = user?.role === "teacher";
  const portalUrl = isTeacher ? "/teacher/dashboard" : "/student/dashboard";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-background/50 backdrop-blur-xl"
    >
      <SidebarHeader className="h-16 px-6 flex items-center justify-between">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent"
            >
              <NavLink to={portalUrl} className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-foreground text-background font-bold shadow-sm transition-transform hover:scale-105 active:scale-95">
                  S
                </div>
                <div className="flex flex-col gap-0 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="text-[15px] font-bold tracking-tight">
                    Snaptic
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50">
                    {isTeacher ? "Teacher" : "Student"}
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative h-11 rounded-xl px-4 transition-all duration-300",
                        isActive
                          ? "bg-primary/5 text-primary font-bold"
                          : "hover:bg-accent/40 text-muted-foreground/80 hover:text-foreground",
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon
                          className={cn(
                            "size-4.5 transition-transform",
                            isActive && "scale-110",
                          )}
                        />
                        <span className="text-sm tracking-tight">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isTeacher && showInviteBox && (
          <SidebarGroup className="mt-auto px-4 pb-4 group-data-[collapsible=icon]:hidden">
            <div className="relative overflow-hidden rounded-[24px] border border-primary/5 bg-primary/3 p-6 transition-all hover:bg-primary/5">
              <button
                onClick={() => setShowInviteBox(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground/30 transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>

              <div className="mb-5 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <UserPlus className="size-5" />
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                  Invite Teachers
                </h4>
                <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed font-medium">
                  Help fellow teachers automate their attendance tracking.
                </p>
              </div>

              <Button
                size="sm"
                onClick={onInvite}
                className="w-full h-10 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Invite Now
              </Button>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t bg-muted/20 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 rounded-xl px-3 transition-colors hover:bg-accent/60 active:bg-accent/80"
                >
                  <div className="flex flex-1 items-center gap-3 overflow-hidden">
                    <div className="relative shrink-0">
                      <Avatar size="default">
                        {user?.avatar && <AvatarImage src={user.avatar} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {user?.faceEnrolled && (
                        <div className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm">
                          <Check className="size-2 stroke-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden text-left leading-none group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-sm font-bold tracking-tight text-foreground">
                        {user?.name || user?.email?.split("@")[0]}
                      </span>
                      <span className="truncate text-[10px] font-medium text-muted-foreground/70 mt-0.5">
                        {user?.email}
                      </span>
                    </div>
                    <ChevronUp className="size-3.5 shrink-0 text-muted-foreground/40 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={12}
                className="w-[220px] rounded-2xl p-1.5 shadow-xl border-primary/5"
              >
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg gap-3 px-3 py-2.5">
                      <Palette className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">Appearance</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        sideOffset={8}
                        className="rounded-2xl p-1.5 shadow-xl border-primary/5 min-w-[140px]"
                      >
                        <DropdownMenuItem
                          onClick={() => setTheme("light")}
                          className="rounded-lg gap-3 px-3 py-2"
                        >
                          <Sun className="size-4 text-orange-500" />
                          <span className="font-medium text-sm">Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("dark")}
                          className="rounded-lg gap-3 px-3 py-2"
                        >
                          <Moon className="size-4 text-indigo-400" />
                          <span className="font-medium text-sm">Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("system")}
                          className="rounded-lg gap-3 px-3 py-2"
                        >
                          <Laptop className="size-4 text-muted-foreground" />
                          <span className="font-medium text-sm">System</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5">
                    <NavLink
                      to={isTeacher ? "/teacher/profile" : "/student/profile"}
                      className="flex w-full items-center gap-3"
                    >
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">Settings</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-lg gap-3 px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    <span className="font-semibold text-sm">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
