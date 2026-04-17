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
    <div>

      {/* Teacher Identity Hero Card */}
      <Card>
        <CardContent>
          <div>
            <div>
              <Avatar>
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback>
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user?.faceEnrolled && (
                <div>
                  <Check />
                </div>
              )}
            </div>
            <div>
              <div>
                <h1>{user?.name}</h1>
                {user?.faceEnrolled && (
                  <Badge variant="secondary">
                    <Verified />
                    Verified {user?.role === "teacher" ? "Teacher" : "Student"}
                  </Badge>
                )}
              </div>
              <div>
                <span>
                  <Mail />
                  {user?.email}
                </span>
                <span>
                  <Calendar />
                  Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
                <button 
                  onClick={handleCopyId}
                >
                  <Fingerprint />
                  ID: {user?._id?.slice(-8)}...
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
          </div>

          <Separator />


          {/* Activity Metrics Grouped */}
          <div>
            <div>
              <p>
                {user?.role === "teacher" ? "Total Classes" : "Enrolled Classes"}
              </p>
              <div>
                < BookOpen />
                {user?.classCount || 0}
              </div>
            </div>
            {user?.role === "teacher" && (
              <div>
                <p>Students Managed</p>
                <div>
                  <Users />
                  {user?.studentCount || 0}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Operational Forms */}
      <div>
        {/* Personal Details Card */}
        <Card>
          <CardHeader>
            <div>
              <User />
            </div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your display name and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator />
            <FieldGroup>
              <form onSubmit={handleProfileUpdate}>

                <Field>
                  <FieldLabel>Register Email (Static)</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={user?.email || ""}
                      disabled
                    />
                  </InputGroup>
                </Field>


                <Field>
                  <FieldLabel htmlFor="name">Full Display Name</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <User />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your professional name"
                      required
                    />
                  </InputGroup>
                </Field>


                <div>
                  <Button type="submit" disabled={updatingProfile || profileName === user?.name}>
                    <Save />
                    {updatingProfile ? "Saving..." : "Update Details"}
                  </Button>
                </div>

              </form>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        {/* Account Security Card */}
        <Card>
          <CardHeader>
            <div>
              <ShieldCheck />
            </div>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Protect your {user?.role === "teacher" ? "teacher" : "student"} portal with a regular password rotation.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Separator />
            <form onSubmit={handlePasswordChange}>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Current Security Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Lock />
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
                        onClick={() => setShowPasswords(p => ({...p, current: !p.current}))}
                      >
                        {showPasswords.current ? <EyeOff /> : <Eye />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>


                <div>
                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <InputGroup>
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
                          onClick={() => setShowPasswords(p => ({...p, new: !p.new}))}
                        >
                          {showPasswords.new ? <EyeOff /> : <Eye />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>


                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <InputGroup>
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
                          onClick={() => setShowPasswords(p => ({...p, confirm: !p.confirm}))}
                        >
                          {showPasswords.confirm ? <EyeOff /> : <Eye />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
              </FieldGroup>


                <div>
                  {passwordError && (
                    <div>
                       <ShieldCheck />
                       {passwordError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    variant="secondary"
                    disabled={changingPassword || !passwords.currentPassword || !passwords.newPassword}
                  >
                    <KeyRound />
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
