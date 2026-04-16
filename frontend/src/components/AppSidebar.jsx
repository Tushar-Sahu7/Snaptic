import { NavLink, useLocation } from "react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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
  Copy,
  ScanFace,
  Check,
  LayoutDashboard,
  UserCheck,
} from "lucide-react";
import { InviteTeacherModal } from "@/components/InviteTeacherModal";
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

const teacherNavItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "My Classes", url: "/teacher/classes", icon: BookOpen },
  {
    title: "Take Attendance",
    url: "/teacher/take-attendance",
    icon: UserCheck,
  },
  { title: "Face ID", url: "/teacher/face-enrollment", icon: ScanFace },
];

const studentNavItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: Laptop },
  { title: "My Classes", url: "/student/classes", icon: BookOpen },
  { title: "Face ID", url: "/student/face-enrollment", icon: ScanFace },
];

export function AppSidebar() {
  const { user, logout, generateInviteLink } = useAuth();
  const { setTheme } = useTheme();
  const location = useLocation();
  const [showInviteBox, setShowInviteBox] = useState(true);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [currentInviteLink, setCurrentInviteLink] = useState("");

  const isTeacher = user?.role === "teacher";
  const portalUrl = isTeacher ? "/teacher/dashboard" : "/student/dashboard";
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  async function handleInvite() {
    try {
      setGeneratingInvite(true);
      const link = await generateInviteLink();
      setCurrentInviteLink(link);
      setInviteModalOpen(true);
    } catch (err) {
      toast.error("Failed to generate invite link");
    } finally {
      setGeneratingInvite(false);
    }
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={portalUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">S</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Snaptic</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isTeacher ? "Teacher Portal" : "Student Portal"}
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {isTeacher && showInviteBox && (
          <div className="relative mx-3 my-2 rounded-xl border bg-card p-4 shadow-sm group-data-[collapsible=icon]:hidden">
            <button
              onClick={() => setShowInviteBox(false)}
              className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:bg-accent hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
            <div className="mb-3 space-y-1 pr-6">
              <h4 className="text-sm font-semibold leading-none tracking-tight">
                Expand the network
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Invite teachers to Snaptic to manage their classes and take
                attendance.
              </p>
            </div>
            <Button
              size="sm"
              className="w-full text-xs font-semibold h-8"
              onClick={handleInvite}
              disabled={generatingInvite}
            >
              {generatingInvite ? (
                "Generating..."
              ) : (
                <>
                  <Copy data-icon="inline-start" className="size-3.5 mr-1" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="relative inline-block shrink-0">
                    <Avatar
                      className={`size-8 rounded-lg ${user?.faceEnrolled ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-sidebar" : ""}`}
                    >
                      {user?.avatar && (
                        <AvatarImage
                          src={user.avatar}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {user?.faceEnrolled && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full border-2 border-sidebar text-white shadow-sm">
                        <Check className="size-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent sideOffset={8} className="w-36">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          <Laptop className="mr-2 h-4 w-4" />
                          <span>System</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink
                      to={isTeacher ? "/teacher/profile" : "/student/profile"}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <InviteTeacherModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        inviteLink={currentInviteLink}
      />
      <SidebarRail />
    </Sidebar>
  );
}
