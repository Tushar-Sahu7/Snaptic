import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import validator from "validator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Link } from "react-router";
import { 
  User, Lock, Save, KeyRound, BookOpen, 
  Users, Calendar, Fingerprint, Copy, 
  Check, ShieldCheck, Mail, Verified,
  Eye, EyeOff
} from "lucide-react";
import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopyId() {
    if (!user?._id) return;
    await navigator.clipboard.writeText(user._id);
    setCopied(true);
    toast.success("ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    if (!profileName.trim()) return;

    setUpdatingProfile(true);
    try {
      await updateProfile(profileName.trim());
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (!validator.isStrongPassword(passwords.newPassword)) {
      setPasswordError("Password must be at least 8 chars, with uppercase, lowercase, number & symbol");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-10">
      {/* Teacher Identity Hero Card */}
      <Card className="rounded-3xl border shadow-md bg-card overflow-hidden">
        <CardContent className="relative pt-8 px-6 sm:px-10 pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
            <div className="relative inline-block shrink-0">
              <Avatar className={`size-24 sm:size-32 border-2 border-background shadow-xl ${user?.faceEnrolled ? "ring-2 ring-emerald-500 ring-offset-4 ring-offset-background" : "ring-1 ring-border"}`}>
                {user?.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
                <AvatarFallback className="text-3xl font-black bg-primary/5 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user?.faceEnrolled && (
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-emerald-500 rounded-full border-[3px] border-background shadow-sm text-white">
                  <Check className="size-4 sm:size-5" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left pt-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight">{user?.name}</h1>
                {user?.faceEnrolled && (
                  <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-3">
                    <Verified className="size-3" />
                    Verified {user?.role === "teacher" ? "Teacher" : "Student"}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 text-muted-foreground text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
                <button 
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group"
                >
                  <Fingerprint className="size-4" />
                  ID: {user?._id?.slice(-8)}...
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 transition-transform" />}
                </button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Activity Metrics Grouped */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                {user?.role === "teacher" ? "Total Classes" : "Enrolled Classes"}
              </p>
              <div className="flex items-center gap-2 text-2xl font-bold">
                < BookOpen className="size-5 text-primary/60" />
                {user?.classCount || 0}
              </div>
            </div>
            {user?.role === "teacher" && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">Students Managed</p>
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Users className="size-5 text-primary/60" />
                  {user?.studentCount || 0}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operational Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Personal Details Card */}
        <Card className="rounded-2xl border shadow-sm h-full">
          <CardHeader className="pb-3 px-6 sm:px-8">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <User className="size-5" />
            </div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your display name and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <Separator className="mb-6 opacity-60" />
            <FieldGroup className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <Field>
                  <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">Register Email (Static)</FieldLabel>
                  <InputGroup className="h-12 bg-muted/30 border-transparent">
                    <InputGroupAddon align="inline-start">
                      <Mail data-icon="inline-start" />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={user?.email || ""}
                      disabled
                      className="cursor-not-allowed font-semibold"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">Full Display Name</FieldLabel>
                  <InputGroup className="h-12 bg-secondary/20 border-none transition-all">
                    <InputGroupAddon align="inline-start">
                      <User data-icon="inline-start" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your professional name"
                      required
                      className="font-medium"
                    />
                  </InputGroup>
                </Field>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/10 transition-colors" disabled={updatingProfile || profileName === user?.name}>
                    <Save data-icon="inline-start" />
                    {updatingProfile ? "Saving..." : "Update Details"}
                  </Button>
                </div>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card className="rounded-2xl border shadow-sm h-full">
          <CardHeader className="pb-3 px-6 sm:px-8">
            <div className="size-10 rounded-xl bg-neutral-500/10 flex items-center justify-center mb-2 font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Protect your {user?.role === "teacher" ? "teacher" : "student"} portal with a regular password rotation.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
             <Separator className="mb-6 opacity-60" />
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <FieldGroup className="space-y-5">
                <Field>
                  <FieldLabel htmlFor="currentPassword">Current Security Password</FieldLabel>
                  <InputGroup className="h-11 bg-secondary/10 border-none">
                    <InputGroupAddon align="inline-start">
                      <Lock data-icon="inline-start" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 p-0"
                        onClick={() => setShowPasswords(p => ({...p, current: !p.current}))}
                      >
                        {showPasswords.current ? <EyeOff data-icon="inline-end" /> : <Eye data-icon="inline-end" />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <InputGroup className="h-11 bg-secondary/10 border-none">
                      <InputGroupInput
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        required
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 p-0"
                          onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}
                        >
                          {showPasswords.new ? <EyeOff data-icon="inline-end" /> : <Eye data-icon="inline-end" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <InputGroup className="h-11 bg-secondary/10 border-none">
                      <InputGroupInput
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        required
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 p-0"
                          onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}
                        >
                          {showPasswords.confirm ? <EyeOff data-icon="inline-end" /> : <Eye data-icon="inline-end" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
              </FieldGroup>

                <div className="pt-2 space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-semibold flex items-center gap-2">
                       <ShieldCheck className="size-3.5" />
                       {passwordError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    variant="secondary"
                    className="w-full h-12 rounded-xl text-md font-bold bg-muted hover:bg-muted/80 transition-colors border-none"
                    disabled={changingPassword || !passwords.currentPassword || !passwords.newPassword}
                  >
                    <KeyRound className="size-4 mr-2" />
                    {changingPassword ? "Processing..." : "Secure Update"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        <AuthFaceEnrollmentCard />
        </div>
    </div>
  );
}
