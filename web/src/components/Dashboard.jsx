import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentChallenges,
  joinChallenge,
  leaderboard,
  deposit,
  withdraw,
  getProfile
} from '../api/api';

/**
 * Single-file User Dashboard
 * Top tabs: Overview | Challenges | Leaderboard | Wallet | Profile
 *
 * Expects:
 * - JWT stored in localStorage 'gs_token'
 * - User object in localStorage 'gs_user' (or getProfile() will fetch)
 * - API base URL already configured in src/api/api.js
 */

export default function DashboardSingle() {
  const navigate = useNavigate();

  // Auth + user
  const token = localStorage.getItem('gs_token');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gs_user')) || null;
    } catch {
      return null;
    }
  });

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('gs_theme') || 'light');

  // Tabs
  const tabs = ['Overview', 'Challenges', 'Leaderboard', 'Wallet', 'Profile'];
  const [activeTab, setActiveTab] = useState('Overview');

  // Data
  const [challenges, setChallenges] = useState([]);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  // Wallet
  const [amount, setAmount] = useState(500);
  const [balance, setBalance] = useState(() => (user && user.wallet) || 0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('gs_theme', theme);
  }, [theme]);

  // Initial data fetch
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [chs, profile] = await Promise.all([
          getCurrentChallenges().catch(() => []),
          getProfile().catch(() => null)
        ]);
        setChallenges(chs || []);
        if (profile) {
          setUser(profile);
          localStorage.setItem('gs_user', JSON.stringify(profile));
          localStorage.setItem('gs_user_id', profile.id || profile._id || '');
          setBalance(profile.wallet ?? 0);
        }
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When selected challenge changes, fetch leaderboard
  useEffect(() => {
    if (!selectedChallengeId) {
      setLeaderboardList([]);
      return;
    }
    let cancelled = false;
    async function loadLb() {
      try {
        setLoading(true);
        const list = await leaderboard(selectedChallengeId);
        if (!cancelled) setLeaderboardList(list || []);
      } catch (err) {
        console.error('Leaderboard error', err);
        setMsg('Could not load leaderboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadLb();
    return () => {
      cancelled = true;
    };
  }, [selectedChallengeId]);

  // Handlers
  async function handleJoin(challengeId) {
    setMsg(null);
    try {
      setLoading(true);
      await joinChallenge(challengeId);
      setMsg('Joined challenge successfully');
      // refresh challenges/prizepool
      const chs = await getCurrentChallenges();
      setChallenges(chs || []);
    } catch (err) {
      console.error('Join error', err);
      setMsg(err?.response?.data?.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    setMsg(null);
    try {
      setLoading(true);
      const res = await deposit({ userId: localStorage.getItem('gs_user_id'), amount });
      setBalance(res.balance);
      setMsg('Deposit successful');
    } catch (err) {
      console.error('Deposit error', err);
      setMsg('Deposit failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    setMsg(null);
    try {
      setLoading(true);
      const res = await withdraw({ userId: localStorage.getItem('gs_user_id'), amount });
      setBalance(res.balance);
      setMsg('Withdraw successful (prototype)');
    } catch (err) {
      console.error('Withdraw error', err);
      setMsg(err?.response?.data?.message || 'Withdraw failed');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_user_id');
    navigate('/');
  }

  // Small presentational subcomponents (kept inline for single-file)
  const TabBar = () => (
    <div className="flex gap-2 border-b mb-4">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={`px-4 py-2 -mb-px ${activeTab === t ? 'border-b-4 border-blue-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
        >
          {t}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => setTheme((s) => (s === 'light' ? 'dark' : 'light'))}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded"
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button onClick={logout} className="text-sm text-red-500">Logout</button>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-3">Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <div className="text-sm text-gray-500">Name</div>
          <div className="text-lg font-bold">{user?.name || '—'}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <div className="text-sm text-gray-500">Wallet</div>
          <div className="text-lg font-bold">${balance ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <div className="text-sm text-gray-500">Referral Code</div>
          <div className="text-lg font-bold">{user?.referralCode || '—'}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Active Challenges</h4>
        {challenges.length === 0 ? <div>No active challenges.</div> : (
          <ul>
            {challenges.map((c) => (
              <li key={c._id} className="py-2 border-b flex justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-500">Type: {c.challengeType}</div>
                </div>
                <div className="text-right">
                  <div>Entry: ${c.entryFee}</div>
                  <div>Pool: ${c.prizePool}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const ChallengesTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-3">Challenges</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => (
          <div key={c._id} className="bg-white dark:bg-gray-900 p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{c.title}</div>
                <div className="text-sm text-gray-500">Type: {c.challengeType}</div>
                <div className="text-sm text-gray-500">Dates: {new Date(c.weekStart).toLocaleDateString()} - {new Date(c.weekEnd).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">${c.entryFee}</div>
                <div className="text-sm text-gray-500">Pool ${c.prizePool}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleJoin(c._id)} className="px-3 py-1 bg-green-600 text-white rounded">Join</button>
              <button onClick={() => { setSelectedChallengeId(c._id); setActiveTab('Leaderboard'); }} className="px-3 py-1 bg-blue-600 text-white rounded">View leaderboard</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-3">Leaderboard</h3>
      <div className="mb-4">
        <select
          value={selectedChallengeId || ''}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select a challenge</option>
          {challenges.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        {loading ? <div>Loading...</div> : (
          leaderboardList.length === 0 ? <div>No leaderboard data yet.</div> : (
            leaderboardList.map((u, i) => (
              <div key={u._id} className="flex justify-between py-2 border-b">
                <div>{i+1}. {u.name}</div>
                <div className="font-semibold">{u.points}</div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );

  const WalletTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-3">Wallet</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <div className="text-sm text-gray-500">Balance</div>
          <div className="text-2xl font-bold mb-3">${balance}</div>
          <div>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="p-2 border rounded w-full mb-3" />
            <div className="flex gap-2">
              <button onClick={handleDeposit} className="bg-blue-600 text-white px-3 py-1 rounded">Deposit</button>
              <button onClick={handleWithdraw} className="bg-red-600 text-white px-3 py-1 rounded">Withdraw</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <div className="font-semibold mb-2">Referral</div>
          <div className="mb-2">Your code: <span className="font-mono">{user?.referralCode || '—'}</span></div>
          <div className="text-sm text-gray-500">Refer friends and earn rewards when they verify.</div>
        </div>
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div>
      <h3 className="text-xl font-semibold mb-3">Profile</h3>
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow max-w-md">
        <div className="mb-2"><strong>Name:</strong> {user?.name}</div>
        <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
        <div className="mb-2"><strong>Referral Code:</strong> <span className="font-mono">{user?.referralCode}</span></div>
        <div><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="app-container">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">GoalStake</h1>
              <div className="text-sm text-gray-500">Predict. Play. Win weekly.</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Logged in as</div>
              <div className="font-semibold">{user?.name || '—'}</div>
            </div>
          </div>

          <TabBar />
        </header>

        <main>
          {msg && <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded">{msg}</div>}
          {loading && <div className="mb-4 text-sm text-gray-500">Working...</div>}

          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Challenges' && <ChallengesTab />}
          {activeTab === 'Leaderboard' && <LeaderboardTab />}
          {activeTab === 'Wallet' && <WalletTab />}
          {activeTab === 'Profile' && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}