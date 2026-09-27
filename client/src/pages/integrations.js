import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { Mail, MessageSquare, Bot, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/integrations');
      setIntegrations(res.data.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOAuth = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data.redirectUrl) {
        // Complete OAuth simulation callback
        await api.get(res.data.redirectUrl);
        fetchIntegrations();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const providerIcons = {
    gmail: Mail,
    slack: MessageSquare,
    discord: Bot,
    'google-sheets': FileSpreadsheet
  };

  const providerTitles = {
    gmail: 'Gmail Integration',
    slack: 'Slack Messaging',
    discord: 'Discord Bot Dispatch',
    'google-sheets': 'Google Sheets Storage'
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" /> Third-Party OAuth Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect external services. Credentials are encrypted at rest with application-level key (AES-256).
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Checking credentials health...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {integrations.map((item) => {
                const Icon = providerIcons[item.provider] || KeyRound;
                const title = providerTitles[item.provider] || item.provider;

                return (
                  <div
                    key={item.provider}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          item.isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {item.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Allows Agentflow AI to securely interact with {item.provider} services.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>AES-256 Encrypted</span>
                      </div>

                      <button
                        onClick={() => handleConnectOAuth(item.provider)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                          item.isConnected
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                        }`}
                      >
                        {item.isConnected ? 'Reconnect OAuth' : 'Connect OAuth'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
