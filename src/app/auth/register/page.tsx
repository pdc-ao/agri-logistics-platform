'use client';

import RegisterForm from '@/components/forms/register-form';

export default function RegisterPage() {
  const handleRegister = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Registration failed");
        return;
      }

      const data = await res.json();
      console.log("Registered:", data);
      // Optionally redirect to login
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Registration error:", err);
      alert("Unexpected error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <RegisterForm onSubmit={handleRegister} />
      </div>
    </div>
  );
}
