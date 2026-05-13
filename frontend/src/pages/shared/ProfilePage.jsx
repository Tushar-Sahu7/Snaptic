import { useState, useMemo, useEffect } from "react";
import { useAuth, useUpdateProfile, useChangePassword } from "@/features/auth/hooks/useAuth";
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
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { 
  User, Lock, Save, KeyRound, BookOpen, 
  Users, Calendar, Fingerprint, Copy, 
  Check, ShieldCheck, Mail, Verified,
  Eye, EyeOff, AlertCircle
} from "lucide-react";
import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";
import ProfileSkeleton from "@/components/shared/ProfileSkeleton";

export default function ProfilePage() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <ProfileSkeleton />;

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Profile State
  const [profileName, setProfileName] = useState("");

  // Sync profile name when user data loads
  useEffect(() => {
    if (user?.name && !profileName) setProfileName(user.name);
  }, [user?.name]);

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

    try {
      await updateProfileMutation.mutateAsync({ name: profileName.trim() });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
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

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setPasswordError(msg);
      toast.error(msg);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  const joinedDate = useMemo(() => {
    if (!user?.joinedAt) return "N/A";
    try {
      const date = new Date(user.joinedAt);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch (e) {
      return "N/A";
    }
  }, [user?.joinedAt]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      {/* Teacher Identity Hero Card */}
      <Card className="rounded-3xl overflow-hidden border-none shadow-xl bg-linear-to-br from-card to-muted/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-105" size="2xl">
                {user?.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
                <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user?.faceEnrolled && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-background">
                  <Check className="w-4 h-4 stroke-[3px]" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight">{user?.name}</h1>
                  {user?.faceEnrolled && (
                    <Badge variant="secondary" className="px-3 py-1 rounded-full gap-1.5 font-bold uppercase text-[10px] tracking-widest bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                      <Verified className="w-3 h-3" />
                      Verified {user?.role}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 pt-1 text-muted-foreground font-medium">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {joinedDate}
                  </span>
                  <button 
                    onClick={handleCopyId}
                    className="flex items-center gap-2 hover:text-primary transition-colors group"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span className="font-mono text-xs opacity-70 group-hover:opacity-100">
                      ID: {user?._id?.slice(-8).toUpperCase()}...
                    </span>
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="px-5 py-3 rounded-2xl bg-background/50 backdrop-blur shadow-sm border flex flex-col items-center md:items-start min-w-[120px]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {user?.role === "teacher" ? "Total Classes" : "Enrollments"}
                  </p>
                  <div className="flex items-center gap-2 text-2xl font-black">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {user?.classCount || 0}
                  </div>
                </div>
                {user?.role === "teacher" && (
                  <div className="px-5 py-3 rounded-2xl bg-background/50 backdrop-blur shadow-sm border flex flex-col items-center md:items-start min-w-[120px]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Students</p>
                    <div className="flex items-center gap-2 text-2xl font-black">
                      <Users className="w-5 h-5 text-primary" />
                      {user?.studentCount || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your professional identity and public profile.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Registration Email</FieldLabel>
                  <InputGroup className="bg-muted/50 border-none rounded-2xl overflow-hidden">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={user?.email || ""}
                      disabled
                      className="bg-transparent border-none h-14 font-medium"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Display Name</FieldLabel>
                  <InputGroup className="bg-muted/20 hover:bg-muted/30 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all rounded-2xl overflow-hidden border">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your professional name"
                      required
                      className="bg-transparent border-none h-14 font-bold"
                    />
                  </InputGroup>
                </Field>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                    disabled={updateProfileMutation.isPending || profileName === user?.name}
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Identity
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mb-4">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Regular password rotation is recommended for biometric systems.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Current Password</FieldLabel>
                  <InputGroup className="bg-muted/20 rounded-2xl overflow-hidden border">
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      required
                      className="bg-transparent border-none h-14"
                    />
                    <InputGroupAddon align="inline-end" className="pr-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-background"
                        onClick={() => setShowPasswords(p => ({...p, current: !p.current}))}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <div className="grid grid-cols-1 gap-6">
                  <Field>
                    <FieldLabel htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">New Password</FieldLabel>
                    <InputGroup className="bg-muted/20 rounded-2xl overflow-hidden border">
                      <InputGroupInput
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        required
                        className="bg-transparent border-none h-14 pl-6"
                        placeholder="••••••••"
                      />
                      <InputGroupAddon align="inline-end" className="pr-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-background"
                          onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Confirm New Password</FieldLabel>
                    <InputGroup className="bg-muted/20 rounded-2xl overflow-hidden border">
                      <InputGroupInput
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        required
                        className="bg-transparent border-none h-14 pl-6"
                        placeholder="••••••••"
                      />
                      <InputGroupAddon align="inline-end" className="pr-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-background"
                          onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>

                <div className="space-y-4 pt-2">
                  {passwordError && (
                    <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-3 border border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {passwordError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    variant="secondary"
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 bg-muted hover:bg-muted/80 text-foreground border shadow-sm"
                    disabled={changePasswordMutation.isPending || !passwords.currentPassword || !passwords.newPassword}
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Update Security Key
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <AuthFaceEnrollmentCard />
      </div>
    </div>
  );
}
