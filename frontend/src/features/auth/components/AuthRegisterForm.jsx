import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import validator from "validator";

export default function RegisterForm({ ...props }) {
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
    <div {...props}>
      <Card variant="adaptive">
        <CardHeader>
          {inviteToken && (
            <Badge variant="secondary" className="col-span-full self-start">
              🎉 You&apos;re invited as a Teacher
            </Badge>
          )}
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            {inviteToken
              ? "Create your account to start managing classes."
              : "Enter your details to get started with Snaptic"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="register-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.name}>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <InputGroup>
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
                  <InputGroupAddon>
                    <User />
                  </InputGroupAddon>
                </InputGroup>
                {fieldErrors.name && (
                  <FieldDescription>{fieldErrors.name}</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="reg-email">Email address</FieldLabel>
                <InputGroup>
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
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                </InputGroup>
                {fieldErrors.email && (
                  <FieldDescription>{fieldErrors.email}</FieldDescription>
                )}
              </Field>

              <Field data-invalid={!!fieldErrors.password}>
                <FieldLabel htmlFor="reg-password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    aria-invalid={!!fieldErrors.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: null,
                        }));
                      }
                    }}
                    required
                  />
                  <InputGroupAddon>
                    <Lock />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye /> : <EyeOff />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldErrors.password && (
                  <FieldDescription>{fieldErrors.password}</FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            form="register-form"
            className="w-full"
            disabled={submitting}
          >
            {submitting && <Spinner data-icon="inline-start" />}
            Sign up
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
          {!inviteToken && (
            <p className="text-center text-xs text-muted-foreground">
              Are you a teacher? Contact your department for a link.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
