import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login, loginWithGoogle, clearError, register } from "../slices/authSlice";
import { ArrowUpRight } from "lucide-react";
import CaloviaLogo from "../components/Layout/CaloviaLogo";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const registerSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  full_name: Yup.string().max(100, "Name is too long"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-2 text-gray-400">or continue with email</span>
      </div>
    </div>
  );
}

function GoogleSignInButton({ onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
    >
      <GoogleIcon />
      {loading ? "Signing in…" : "Continue with Google"}
    </button>
  );
}

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState(
    location.pathname === "/register" ? "register" : "login"
  );

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  useEffect(() => {
    dispatch(clearError());
    if (token) {
      navigate("/");
    }
  }, [token, dispatch, navigate]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    dispatch(clearError());
    navigate(newMode === "login" ? "/login" : "/register", { replace: true });
  };

  const handleGoogleSignIn = () => {
    dispatch(clearError());
    dispatch(loginWithGoogle());
  };

  const handleLoginSubmit = (values) => {
    dispatch(clearError());
    dispatch(login(values));
  };

  const handleRegisterSubmit = (values) => {
    dispatch(clearError());
    const payload = { email: values.email, password: values.password };
    if (values.full_name?.trim()) payload.full_name = values.full_name.trim();
    dispatch(register(payload));
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <CaloviaLogo
            to="/"
            showText={false}
            imageClassName="h-[120px] w-[120px]"
            className="justify-center"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Calovia</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track meals, steps, and calories
        </p>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              isLogin
                ? "bg-[#24a17b] text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              !isLogin
                ? "bg-[#24a17b] text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create account
          </button>
        </div>

        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          disabled={loading}
          loading={loading}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
            {error}
          </p>
        )}

        <AuthDivider />

        {isLogin ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <Field
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b] ${
                      errors.email && touched.email
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Field
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b] ${
                      errors.password && touched.password
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#24a17b] hover:bg-[#1e8a6a] text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? "Signing in…" : "Sign in with email"}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ email: "", full_name: "", password: "" }}
            validationSchema={registerSchema}
            onSubmit={handleRegisterSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <Field
                    id="reg-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b] ${
                      errors.email && touched.email
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full name{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <Field
                    id="full_name"
                    type="text"
                    name="full_name"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b]"
                  />
                  <ErrorMessage
                    name="full_name"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Field
                    id="reg-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b] ${
                      errors.password && touched.password
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#24a17b] hover:bg-[#1e8a6a] text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating account…" : "Create account with email"}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Form>
            )}
          </Formik>
        )}

        <p className="text-center text-xs text-gray-400 mt-5">
          Google or email · No credit card required
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-500 text-center">
        Or try without an account →{" "}
        <Link
          to="/"
          className="text-[#24a17b] font-medium underline underline-offset-2"
        >
          analyze a meal
        </Link>
      </p>
    </div>
  );
}
