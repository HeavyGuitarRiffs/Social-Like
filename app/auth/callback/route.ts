export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  const origin = requestUrl.origin;

  if (error) {
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', error_description || 'Authentication failed');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
     cookies: {
  async get(name) {
    const store = await cookies();
    return store.get(name)?.value;
  },
  async set(name, value, options) {
    const store = await cookies();
    store.set({ name, value, ...options, httpOnly: false });
  },
  async remove(name, options) {
    const store = await cookies();
    store.set({ name, value: '', ...options, httpOnly: false });
  },
}
    }
  );

  const { data: { session }, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session?.user) {
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', 'Session creation failed');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(`${origin}/dashboard/connect`);
}