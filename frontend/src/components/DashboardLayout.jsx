import { Outlet, Link, useLocation, useParams } from "react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteTeacherModal } from "@/components/InviteTeacherModal";

export default function DashboardLayout() {
  const { user, generateInviteLink } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [dynamicLabel, setDynamicLabel] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [currentInviteLink, setCurrentInviteLink] = useState("");
  
  const isTeacher = user?.role === "teacher";
  const pathnames = location.pathname.split("/").filter((x) => x);

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

  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Dashboard", href: isTeacher ? "/teacher/dashboard" : "/student/dashboard" }];
    
    // Check if we are ON the dashboard
    if (pathnames[pathnames.length - 1] === "dashboard") {
      crumbs[0].isCurrent = true;
      return crumbs;
    }

    // Handle high-level categories
    if (pathnames.includes("take-attendance")) {
      crumbs.push({ label: "Take Attendance", isCurrent: true });
    } else if (pathnames.includes("classes")) {
      if (id) {
        if (pathnames.includes("attendance")) {
          crumbs.push({ label: "Take Attendance", href: "/teacher/take-attendance" });
          crumbs.push({ label: dynamicLabel || "Class", isCurrent: true });
        } else {
          crumbs.push({ label: isTeacher ? "My Classes" : "Enrolled Classes", href: isTeacher ? "/teacher/classes" : "/student/classes" });
          crumbs.push({ label: dynamicLabel || "Class Detail", isCurrent: true });
        }
      } else {
        crumbs.push({ label: isTeacher ? "My Classes" : "Enrolled Classes", isCurrent: true });
      }
    } else if (pathnames.includes("profile")) {
      crumbs.push({ label: "Profile Settings", isCurrent: true });
    } else if (pathnames.includes("face-enrollment")) {
      crumbs.push({ label: "Face ID", isCurrent: true });
    } else if (pathnames.includes("summary")) {
      crumbs.push({ label: "Session Summary", isCurrent: true });
    }

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 transition-all">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <SidebarTrigger className="-ml-1" />
              </BreadcrumbItem>
              
              {crumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    {crumb.isCurrent ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            {isTeacher && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 text-xs font-semibold px-3"
                onClick={handleInvite}
                disabled={generatingInvite}
              >
                <UserPlus className="size-3.5" />
                {generatingInvite ? "Generating..." : "Invite"}
              </Button>
            )}
          </div>
        </header>
        <div className="flex-1 p-0 sm:p-4 md:p-6">
          <Outlet context={{ setDynamicLabel }} />
        </div>
      </SidebarInset>

      <InviteTeacherModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
        inviteLink={currentInviteLink} 
      />
    </SidebarProvider>
  );
}
