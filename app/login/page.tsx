import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center text-gold-400 text-2xl shadow-soft">✦</div>
          <div>
            <p className="font-extrabold text-lg leading-tight">Studio Manager</p>
            <p className="text-xs text-ink/50">Dance &amp; Art · Sharjah</p>
          </div>
        </div>

        <div className="bg-white rounded-4xl p-8 shadow-soft">
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-ink/50 mt-1 mb-6">Sign in to manage your studio.</p>

          {error && (
            <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600 font-medium">
              {error}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label className="text-xs text-ink/50 font-semibold">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="admin@studio.ae"
                className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200"
              />
            </div>
            <div>
              <label className="text-xs text-ink/50 font-semibold">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ink text-white rounded-full py-3 text-sm font-semibold hover:bg-black transition shadow-soft"
            >
              Sign in
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-ink/40 mt-6">
          Staff access only. Create users in your Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
