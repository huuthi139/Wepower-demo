import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/guards';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/affiliate
 * Admin overview: wallets list, pending withdrawals, totals
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [
    { data: wallets },
    { data: pendingWithdrawals },
    { count: totalReferrals },
  ] = await Promise.all([
    supabase
      .from('affiliate_wallets')
      .select('id, user_id, balance, total_earned, created_at, users!affiliate_wallets_user_id_fkey(name, email)')
      .order('total_earned', { ascending: false })
      .limit(100),
    supabase
      .from('affiliate_transactions')
      .select('id, wallet_id, amount, description, paid, created_at, affiliate_wallets!affiliate_transactions_wallet_id_fkey(user_id, users!affiliate_wallets_user_id_fkey(name, email))')
      .eq('type', 'withdrawal')
      .eq('paid', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true }),
  ]);

  // Calculate totals
  const totalEarned = (wallets || []).reduce((sum, w) => sum + (Number(w.total_earned) || 0), 0);
  const totalBalance = (wallets || []).reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

  return NextResponse.json({
    success: true,
    stats: {
      totalEarned,
      totalBalance,
      totalReferrals: totalReferrals || 0,
      pendingWithdrawals: (pendingWithdrawals || []).length,
    },
    wallets: (wallets || []).map((w: Record<string, unknown>) => ({
      id: w.id,
      userId: w.user_id,
      userName: (w.users as Record<string, unknown>)?.name || '',
      userEmail: (w.users as Record<string, unknown>)?.email || '',
      balance: w.balance,
      totalEarned: w.total_earned,
    })),
    pendingWithdrawals: (pendingWithdrawals || []).map((tx: Record<string, unknown>) => {
      const wallet = tx.affiliate_wallets as Record<string, unknown> | null;
      const user = wallet?.users as Record<string, unknown> | null;
      return {
        id: tx.id,
        amount: tx.amount,
        paid: tx.paid,
        createdAt: tx.created_at,
        userName: user?.name || '',
        userEmail: user?.email || '',
      };
    }),
  });
}

/**
 * PATCH /api/admin/affiliate
 * Mark withdrawal as paid
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { transactionId } = await request.json();
  if (!transactionId) {
    return NextResponse.json({ success: false, error: 'Missing transactionId' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('affiliate_transactions')
    .update({ paid: true })
    .eq('id', transactionId)
    .eq('type', 'withdrawal');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
