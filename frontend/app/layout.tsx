import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Engineering Manager",
  description: "AI-powered HR and Team Lead assistant for project and team analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
              <h1 className="text-2xl font-bold mb-6">AI EM</h1>
              <nav className="space-y-2">
                <Link href="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-700">Dashboard</Link>
                <Link href="/projects" className="block py-2 px-3 rounded hover:bg-gray-700">Projects</Link>
                <Link href="/team-analysis" className="block py-2 px-3 rounded hover:bg-gray-700">Team Analysis</Link>
                <Link href="/courses" className="block py-2 px-3 rounded hover:bg-gray-700">Courses</Link>
                <Link href="/assign-learning" className="block py-2 px-3 rounded hover:bg-gray-700">Assign Learning</Link>
                <Link href="/performance" className="block py-2 px-3 rounded hover:bg-gray-700">Performance</Link>
                <Link href="/learning-paths" className="block py-2 px-3 rounded hover:bg-gray-700">Learning Paths</Link>
                <Link href="/reports" className="block py-2 px-3 rounded hover:bg-gray-700">Reports</Link>
              </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}