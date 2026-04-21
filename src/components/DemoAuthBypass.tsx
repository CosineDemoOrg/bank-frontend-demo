"use client";

import { useEffect } from "react";
import { UserType, User } from "@/types";

const DEMO_USER: User = {
  name: "Demo User",
  email: "demo@example.com",
  username: "demo",
  type: UserType.CLIENT,
  password: "",
};

// Seed synchronously at module init so the root layout's useEffect finds a user
// on first render and doesn't redirect to /auth.
if (typeof window !== "undefined") {
  try {
    if (!window.localStorage.getItem("user")) {
      window.localStorage.setItem("user", JSON.stringify(DEMO_USER));
    }
  } catch {
    // ignore — private mode etc.
  }
}

export default function DemoAuthBypass() {
  useEffect(() => {
    // Defensive: if something cleared it between module init and mount, re-seed.
    try {
      if (!window.localStorage.getItem("user")) {
        window.localStorage.setItem("user", JSON.stringify(DEMO_USER));
      }
    } catch {
      // ignore
    }
  }, []);
  return null;
}
