import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="container grid min-h-[calc(100vh-260px)] place-items-center py-10">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <Suspense fallback={<p className="mt-6 text-sm text-[var(--muted-foreground)]">Loading secure form...</p>}>
          <AdminLoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
