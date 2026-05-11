import { Outlet, Link, useLocation, useParams } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useState, Fragment } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteTeacherModal } from "@/components/InviteTeacherModal";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const { user, generateInviteLink } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [dynamicLabels, setDynamicLabels] = useState({});
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isTeacher = user?.role === "teacher";
  const pathnames = location.pathname.split("/").filter((x) => x);

  function handleInvite() {
    setInviteModalOpen(true);
  }

  const crumbs = (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const crumbsArray = [];
    let currentPath = "";

    // 1. Root Portal Crumb
    if (segments.length > 0) {
      const portal = segments[0];
      currentPath += `/${portal}`;
      const isDashboard = segments.length === 2 && segments[1] === "dashboard";
      crumbsArray.push({
        label: portal === "teacher" ? "Teacher Portal" : "Student Portal",
        href: `${currentPath}/dashboard`,
        isCurrent: isDashboard,
      });
    }

    // 2. Iterate through remaining segments
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      if (segment === "dashboard") continue;

      currentPath += `/${segment}`;

      // Feature mappings
      let label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      if (segment === "classes") label = "My Classes";
      else if (segment === "records") label = "Records";
      else if (segment === "take-attendance") label = "Attendance";
      else if (segment === "face-enrollment") label = "Face ID";
      else if (segment === "labels") label = "Global Labels";
      else if (segment === "new") label = "Create New";

      // Use dynamic labels for IDs or specific segments
      if (dynamicLabels[i]) {
        label = dynamicLabels[i];
      }

      let href = currentPath;
      if (segment === "records" && i > 1) {
        const parentPath = segments.slice(0, i).join("/");
        href = `/${parentPath}?tab=records`;
      }

      crumbsArray.push({
        label,
        href,
        isCurrent: i === segments.length - 1,
      });
    }

    return crumbsArray;
  })();

  return (
    <SidebarProvider>
      <AppSidebar onInvite={handleInvite} />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/60 px-6 backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 h-8 w-8 rounded-lg transition-all hover:bg-accent/40 active:scale-95" />
            <Separator orientation="vertical" className="h-8 bg-border/50" />
            <Breadcrumb>
              <BreadcrumbList className="gap-2 sm:gap-3">
                {crumbs.map((crumb, idx) => (
                  <Fragment key={idx}>
                    {idx > 0 && (
                      <BreadcrumbSeparator className="opacity-30">
                        <span className="text-[10px] font-light text-muted-foreground">
                          /
                        </span>
                      </BreadcrumbSeparator>
                    )}
                    <BreadcrumbItem>
                      {crumb.isCurrent ? (
                        <BreadcrumbPage className="text-[13px] font-bold tracking-tight text-foreground">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            to={crumb.href}
                            className="text-[13px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
                          >
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {isTeacher && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInvite}
                className="h-9 gap-2 rounded-xl border-dashed border-primary/10 px-4 text-xs font-bold transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-95"
              >
                <UserPlus className="h-3.5 w-3.5 opacity-60" />
                <span className="hidden md:inline">Invite Teacher</span>
                <span className="md:hidden">Invite</span>
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 px-6  max-w-[1440px] mx-auto w-full">
          <Outlet context={{ setDynamicLabels }} />
        </main>
      </SidebarInset>

      <InviteTeacherModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </SidebarProvider>
  );
}
