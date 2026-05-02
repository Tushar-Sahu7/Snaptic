import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [rememberMe, setRememberMe] = useState(false);
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
      const user = await login({ email, password, rememberMe });
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
      <Card variant="adaptive">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
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

              <Field orientation="horizontal" className="items-center">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <FieldLabel htmlFor="rememberMe" className="font-normal">
                  Remember me
                </FieldLabel>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
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
        </CardFooter>
      </Card>
    </div>
  );
}
