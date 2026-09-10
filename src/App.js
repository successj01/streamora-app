import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Main pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Live from "./pages/Live";
import Categories from "./pages/Categories";
import Search from "./pages/Search";

// Stream
import StreamPage from "./pages/stream/StreamPage";

// Authentication
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Profile
import Profile from "./pages/profile/Profile";
import UserProfile from "./pages/profile/UserProfile";
import Settings from "./pages/profile/Settings";

// Creator
import CreateProfile from "./components/creator/CreateProfile";
import CreatorProfile from "./components/creator/CreatorProfile";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";
import MyStreams from "./pages/dashboard/MyStreams";
import Analytics from "./pages/dashboard/Analytics";
import CreateStream from "./pages/dashboard/CreateStream";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main application */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/live" element={<Live />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/search" element={<Search />} />

          <Route
            path="/stream/:id"
            element={<StreamPage />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/profile/:username"
            element={<UserProfile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/creator"
            element={<CreatorProfile />}
          />

          <Route
            path="/creator/create"
            element={<CreateProfile />}
          />
        </Route>

        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />
        </Route>

        {/* Creator dashboard */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/dashboard/streams"
            element={<MyStreams />}
          />

          <Route
            path="/dashboard/analytics"
            element={<Analytics />}
          />

          <Route
            path="/dashboard/create-stream"
            element={<CreateStream />}
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-[#0f0f10] px-4 text-white">
              <div className="text-center">
                <h1 className="text-7xl font-bold text-red-500">
                  404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold">
                  Page Not Found
                </h2>

                <p className="mt-2 text-gray-400">
                  The page you are looking for does not exist.
                </p>

                <a
                  href="/"
                  className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
                >
                  Back to Streamora
                </a>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;