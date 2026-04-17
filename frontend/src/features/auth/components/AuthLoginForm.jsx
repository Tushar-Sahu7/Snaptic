import { useState } from "react";

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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import validator from "validator";

export default function LoginForm({ ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!validator.isEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success("Login successful");
      navigate(
        user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard",
        { replace: true },
      );
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      if (
        message.toLowerCase().includes("user") ||
        message.toLowerCase().includes("email")
      ) {
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
      <Card className="bg-transparent ring-0 md:bg-card md:ring-1 md:ring-foreground/10">
        <CardHeader className="px-1 md:px-4">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-1 md:px-4">
          <form id="login-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email"
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() =>
                      toast.info("Contact your department for reset.")
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <InputGroup>
                  <InputGroupInput
                    id="password"
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

        <CardFooter className="flex-col gap-2 border-t-0 bg-transparent px-1 md:border-t md:bg-muted/50 md:px-4">
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            disabled={submitting}
          >
            {submitting && <Spinner data-icon="inline-start" />}
            Login
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-foreground underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Are you a teacher? Contact your department for a link.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
