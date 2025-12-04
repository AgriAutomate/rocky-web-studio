import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-700">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

