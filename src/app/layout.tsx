import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabSchedule — Laboratory Management",
  description: "Manage and view laboratory schedules, bookings, and availability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
