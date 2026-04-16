import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import validator from "validator";

export default function LoginForm({ className, ...props }) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-transparent border-none shadow-none ring-0 sm:bg-card sm:border-border sm:shadow-sm sm:ring-1">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1.5 p-6 px-0 pt-0 text-center sm:px-6 sm:pt-6">
            <CardTitle className="text-xl font-bold tracking-tight md:text-2xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Login to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-6 px-1 pt-0 sm:px-6">
            <FieldGroup className="gap-6">
              <Field className="space-y-1.5" data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <InputGroup className="bg-background h-10 overflow-hidden [&_input]:autofill:rounded-md [&_input]:autofill:p-1 [&_input]:autofill:m-1">
                  <InputGroupAddon align="inline-start">
                    <Mail data-icon="inline-start" />
                  </InputGroupAddon>
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Contact your department for reset.")
                    }
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <InputGroup className="bg-background h-10 overflow-hidden [&_input]:autofill:rounded-md [&_input]:autofill:p-1 [&_input]:autofill:m-1">
                  <InputGroupAddon align="inline-start">
                    <Lock data-icon="inline-start" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
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
                Login
              </Button>

              <p className="text-center text-xs text-muted-foreground md:text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
