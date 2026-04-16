import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!validator.isEmail(email))
      errors.email = "Please enter a valid email address";

    if (!validator.isStrongPassword(password)) {
      errors.password =
        "Use a strong password (min 8 chars, uppercase, lowercase, numbers & special characters)";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      const message = err.response?.data?.message || "Registration failed";
      // Intelligent fallback for field mapping
      if (message.toLowerCase().includes("email")) {
        setFieldErrors({ email: message });
      } else {
        setFieldErrors({ password: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-transparent border-none shadow-none ring-0 sm:bg-card sm:border-border sm:shadow-sm sm:ring-1">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1.5 p-6 px-0 pt-0 text-center sm:px-6 sm:pt-6">
            {inviteToken && (
              <div className="mb-4 rounded-xl border border-primary/10 bg-accent/5 p-4 text-left">
                <p className="text-sm font-bold text-primary">
                  🎉 You're invited as a Teacher
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your account to start managing classes.
                </p>
              </div>
            )}
            <CardTitle className="text-xl font-bold tracking-tight md:text-2xl">
              Create an account
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Enter your details to get started with Snaptic
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-6 px-1 pt-0 sm:px-6">
            <FieldGroup className="gap-6">
              <Field className="space-y-1.5" data-invalid={!!fieldErrors.name}>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <InputGroup className="bg-background h-10 overflow-hidden [&_input]:autofill:rounded-md [&_input]:autofill:p-1 [&_input]:autofill:m-1">
                  <InputGroupAddon align="inline-start">
                    <User data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    aria-invalid={!!fieldErrors.name}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: null }));
                      }
                    }}
                    required
                  />
                </InputGroup>
                {fieldErrors.name && (
                  <FieldDescription className="text-xs">
                    {fieldErrors.name}
                  </FieldDescription>
                )}
              </Field>
              <Field className="space-y-1.5" data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="reg-email">Email address</FieldLabel>
                <InputGroup className="bg-background h-10 overflow-hidden [&_input]:autofill:rounded-md [&_input]:autofill:p-1 [&_input]:autofill:m-1">
                  <InputGroupAddon align="inline-start">
                    <Mail data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    aria-invalid={!!fieldErrors.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: null }));
                      }
                    }}
                    required
                  />
                </InputGroup>
                {fieldErrors.email && (
                  <FieldDescription className="text-xs">
                    {fieldErrors.email}
                  </FieldDescription>
                )}
              </Field>
              <Field
                className="space-y-1.5"
                data-invalid={!!fieldErrors.password}
              >
                <FieldLabel htmlFor="reg-password">Password</FieldLabel>
                <InputGroup className="bg-background h-10 overflow-hidden [&_input]:autofill:rounded-md [&_input]:autofill:p-1 [&_input]:autofill:m-1">
                  <InputGroupAddon align="inline-start">
                    <Lock data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    aria-invalid={!!fieldErrors.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: null }));
                      }
                    }}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <Eye data-icon="inline-start" />
                      ) : (
                        <EyeOff data-icon="inline-start" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldErrors.password && (
                  <FieldDescription className="text-xs">
                    {fieldErrors.password}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold shadow-sm active:scale-95 transition-all h-10"
                disabled={submitting}
              >
                {submitting && <Spinner data-icon="inline-start" />}
                Sign up
              </Button>

              <p className="text-center text-xs text-muted-foreground md:text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>

              {!inviteToken && (
                <p className="text-center text-xs text-muted-foreground italic">
                  Are you a teacher? Contact your department for a link.
                </p>
              )}
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
