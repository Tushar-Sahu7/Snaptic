import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import validator from "validator";

export default function RegisterForm({ className, ...props }) {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteToken = searchParams.get("invite");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!validator.isStrongPassword(password)) {
      setFormError("Use a strong password (min 8 characters, with uppercase, lowercase, number & special character)");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(name, email, password, inviteToken);
      toast.success("Account created successfully");
      navigate(
        user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard",
        { replace: true },
      );
    } catch (err) {
      setFormError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="ring-0 shadow-none md:border md:ring-1">
        <CardHeader>
          {inviteToken && (
            <div className="mb-2 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm dark:border-green-700 dark:bg-green-950/30">
              <p className="font-medium text-green-700 dark:text-green-400">
                🎉 You've been invited as a Teacher
              </p>
              <p className="mt-0.5 text-green-600/80 text-xs dark:text-green-500/80">
                Sign up to start managing classes and taking attendance
              </p>
            </div>
          )}
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reg-email">Email</FieldLabel>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reg-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      className="hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="icon"
                      type="button"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Field>
                <Button
                  type="submit"
                  className="shadow hover:shadow-none"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Sign Up"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Log in</Link>
                </FieldDescription>
                {!inviteToken && <FieldDescription className="text-center">
                  Are you a teacher? Contact your department to get a registration link.
                </FieldDescription>}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
