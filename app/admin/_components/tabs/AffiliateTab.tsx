'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';

interface WalletRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  totalEarned: number;
}

interface WithdrawalRow {
  id: string;
  amount: number;
  paid: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
}

interface Stats {
  totalEarned: number;
  totalBalance: number;
  totalReferrals: number;
  pendingWithdrawals: number;
}

export function AffiliateTab() {
  const [stats, setStats] = useState<Stats>({ totalEarned: 0, totalBalance: 0, totalReferrals: 0, pendingWithdrawals: 0 });
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/affiliate');
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setWallets(json.wallets);
        setWithdrawals(json.pendingWithdrawals);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkPaid = async (txId: string) => {
    setMarking(txId);
    try {
      const res = await fetch('/api/admin/affiliate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      });
      const json = await res.json();
      if (json.success) {
        setWithdrawals(prev => prev.filter(w => w.id !== txId));
        setStats(prev => ({ ...prev, pendingWithdrawals: prev.pendingWithdrawals - 1 }));
      }
    } catch {
      // ignore
    } finally {
      setMarking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-teal" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng hoa hồng đã phát</p>
          <p className="text-2xl font-bold text-gold">{formatPrice(stats.totalEarned)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng số dư hiện tại</p>
          <p className="text-2xl font-bold text-teal">{formatPrice(stats.totalBalance)}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tổng referrals</p>
          <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Chờ thanh toán</p>
          <p className="text-2xl font-bold text-red-400">{stats.pendingWithdrawals}</p>
        </div>
      </div>

      {/* Pending Withdrawals */}
      {withdrawals.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <h3 className="text-lg font-bold text-white">Yêu cầu rút tiền ({withdrawals.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Người dùng</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Số tiền</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Ngày yêu cầu</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-white/[0.06]/50 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="text-sm text-white">{w.userName}</div>
                      <div className="text-xs text-gray-500">{w.userEmail}</div>
                    </td>
                    <td className="p-4 text-sm text-gold font-semibold">{formatPrice(w.amount)}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(w.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleMarkPaid(w.id)}
                        disabled={marking === w.id}
                        className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {marking === w.id ? 'Đang xử lý...' : 'Đánh dấu đã trả'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wallets List */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold text-white">Ví Affiliate ({wallets.length})</h3>
        </div>
        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Chưa có ví affiliate nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Người dùng</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Số dư</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase">Tổng kiếm được</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map(w => (
                  <tr key={w.id} className="border-b border-white/[0.06]/50 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="text-sm text-white">{w.userName}</div>
                      <div className="text-xs text-gray-500">{w.userEmail}</div>
                    </td>
                    <td className="p-4 text-sm text-teal font-semibold">{formatPrice(w.balance)}</td>
                    <td className="p-4 text-sm text-gold font-semibold">{formatPrice(w.totalEarned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
