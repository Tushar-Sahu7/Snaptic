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
  { title: "Manage Labels", url: "/teacher/labels", icon: Palette },
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
                <div>
                  <span>S</span>
                </div>
                <div>
                  <span>Snaptic</span>
                  <span>{isTeacher ? "Teacher Portal" : "Student Portal"}</span>
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
          <div>
            <button onClick={() => setShowInviteBox(false)}>
              <X />
            </button>
            <div>
              <h4>Expand the network</h4>
              <p>
                Invite teachers to Snaptic to manage their classes and take
                attendance.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={generatingInvite}
            >
              {generatingInvite ? (
                "Generating..."
              ) : (
                <>
                  <Copy data-icon="inline-start" />
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
                <SidebarMenuButton size="lg">
                  <div>
                    <Avatar>
                      {user?.avatar && <AvatarImage src={user.avatar} />}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {user?.faceEnrolled && (
                      <div>
                        <Check />
                      </div>
                    )}
                  </div>
                  <div>
                    <span>{user?.email}</span>
                  </div>
                  <ChevronUp />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Palette />
                      <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent sideOffset={8}>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          <Sun />
                          <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          <Moon />
                          <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          <Laptop />
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
                      <User />
                      <span>View Profile</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut />
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
