"use client";

import AdminLayout from "@/components/AdminLayout";
import { ReactNode } from "react";

export default function AdminPageLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
