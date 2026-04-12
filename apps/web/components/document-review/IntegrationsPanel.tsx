'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import {
  AwsS3Icon, CloudflareR2Icon, GcsIcon, MinioIcon,
  GoogleDriveIcon, GmailIcon, SlackIcon,
  GoogleSheetsIcon, NotionIcon, AirtableIcon,
  SftpIcon, WebhookIcon,
} from './IntegrationIcons';

interface S3File {
  key: string;
  fileName: string;
  size: number;
  lastModified: string | null;
  alreadyImported: boolean;
}

interface IntegrationsData {
  s3: { connected: boolean; name?: string; bucket?: string; endpoint?: string; lastSyncAt?: string };
  slack?: { connected: boolean; channel?: string };
  availableIntegrations: { id: string; name: string; description: string; status: 'active' | 'coming_soon' }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type S3Provider = 'aws' | 'cloudflare_r2' | 'gcs' | 'minio' | 'custom';

const S3_PROVIDERS: { id: S3Provider; name: string; icon: ReactNode; description: string }[] = [
  { id: 'aws', name: 'Amazon S3', icon: <AwsS3Icon size={32} />, description: 'AWS Simple Storage Service' },
  { id: 'cloudflare_r2', name: 'Cloudflare R2', icon: <CloudflareR2Icon size={32} />, description: 'S3-compatible object storage by Cloudflare' },
  { id: 'gcs', name: 'Google Cloud Storage', icon: <GcsIcon size={32} />, description: 'GCS with HMAC credentials' },
  { id: 'minio', name: 'MinIO', icon: <MinioIcon size={32} />, description: 'Self-hosted S3-compatible storage' },
  { id: 'custom', name: 'Other S3-Compatible', icon: <WebhookIcon size={24} />, description: 'Any S3-compatible endpoint' },
];

const PROVIDER_DEFAULTS: Record<S3Provider, { endpoint: string; region: string; endpointHelp: string }> = {
  aws:            { endpoint: '', region: 'us-east-1', endpointHelp: 'e.g. https://s3.us-east-1.amazonaws.com' },
  cloudflare_r2:  { endpoint: '', region: 'auto', endpointHelp: 'https://<account-id>.r2.cloudflarestorage.com' },
  gcs:            { endpoint: 'https://storage.googleapis.com', region: 'auto', endpointHelp: 'https://storage.googleapis.com' },
  minio:          { endpoint: '', region: 'us-east-1', endpointHelp: 'e.g. http://localhost:9000' },
  custom:         { endpoint: '', region: 'auto', endpointHelp: 'Your S3-compatible endpoint URL' },
};

const INTEGRATION_CATALOG: {
  id: string; name: string; icon: ReactNode; description: string;
  status: 'active' | 'coming_soon'; category: 'storage' | 'notifications' | 'export' | 'ingest';
  helpUrl?: string;
}[] = [
  { id: 's3',           name: 'Amazon S3 / Cloudflare R2 / GCS', icon: <AwsS3Icon size={32} />,  description: 'Import documents from your S3-compatible bucket',            status: 'active',      category: 'storage',       helpUrl: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html' },
  { id: 'google_drive', name: 'Google Drive',                    icon: <GoogleDriveIcon />,       description: 'Import PDFs and statements from Google Drive folders',       status: 'coming_soon', category: 'storage',       helpUrl: 'https://developers.google.com/drive/api/guides/about-sdk' },
  { id: 'slack',        name: 'Slack',                           icon: <SlackIcon size={32} />,   description: 'Get notified when documents are processed or need review',   status: 'active',      category: 'notifications', helpUrl: 'https://api.slack.com/incoming-webhooks' },
  { id: 'gmail',        name: 'Gmail / Email',                   icon: <GmailIcon />,             description: 'Auto-import fund statements forwarded to a dedicated email', status: 'coming_soon', category: 'ingest',        helpUrl: 'https://developers.google.com/gmail/api/guides' },
  { id: 'sheets',       name: 'Google Sheets',                   icon: <GoogleSheetsIcon />,      description: 'Export extracted portfolio data to spreadsheets',            status: 'coming_soon', category: 'export',        helpUrl: 'https://developers.google.com/sheets/api/guides/concepts' },
  { id: 'notion',       name: 'Notion',                          icon: <NotionIcon />,            description: 'Push processed documents and data to Notion databases',      status: 'coming_soon', category: 'export',        helpUrl: 'https://developers.notion.com/docs/getting-started' },
  { id: 'airtable',     name: 'Airtable',                        icon: <AirtableIcon />,          description: 'Sync extracted fields and holdings to Airtable bases',       status: 'coming_soon', category: 'export',        helpUrl: 'https://airtable.com/developers/web/api/introduction' },
  { id: 'sftp',         name: 'SFTP / FTP',                      icon: <SftpIcon />,              description: 'Import documents from a secure file server',                 status: 'coming_soon', category: 'storage' },
  { id: 'api_webhook',  name: 'API / Webhook',                   icon: <WebhookIcon />,           description: 'Push documents programmatically via REST API',               status: 'active',      category: 'ingest' },
];

export function IntegrationsPanel({ open, onClose, onImported }: Props) {
  const [integrations, setIntegrations] = useState<IntegrationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 's3_provider' | 's3_connect' | 's3_browse' | 'slack_connect'>('overview');

  // S3 state
  const [s3Provider, setS3Provider] = useState<S3Provider>('aws');
  const [s3Form, setS3Form] = useState({ name: '', bucket: '', endpoint: '', region: 'us-east-1', accessKey: '', secretKey: '' });
  const [connecting, setConnecting] = useState(false);
  const [s3Files, setS3Files] = useState<S3File[]>([]);
  const [s3Loading, setS3Loading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [s3Prefix, setS3Prefix] = useState('');

  // Slack state
  const [slackForm, setSlackForm] = useState({ webhookUrl: '', channel: '' });
  const [slackConnecting, setSlackConnecting] = useState(false);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<IntegrationsData>('/documents/integrations');
      setIntegrations(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    loadIntegrations();
    setView('overview');
    setResult(null);
  }, [open]);

  const handleS3Connect = async () => {
    if (!s3Form.bucket || !s3Form.accessKey || !s3Form.secretKey) {
      setResult('Error: Bucket, access key, and secret key are required');
      return;
    }
    const effectiveEndpoint =
      s3Provider === 'aws'
        ? `https://s3.${s3Form.region}.amazonaws.com`
        : s3Form.endpoint;
    if (s3Provider !== 'aws' && !effectiveEndpoint) {
      setResult('Error: Endpoint URL is required for non-AWS providers');
      return;
    }
    setConnecting(true);
    setResult(null);
    try {
      await apiFetch('/documents/integrations/s3/connect', {
        method: 'POST',
        body: JSON.stringify({ ...s3Form, endpoint: effectiveEndpoint, name: s3Form.name || `${s3Provider} - ${s3Form.bucket}` }),
      });
      setResult('Connected successfully!');
      await loadIntegrations();
      setView('overview');
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleS3Disconnect = async () => {
    try {
      await apiFetch('/documents/integrations/s3/disconnect', { method: 'POST' });
      await loadIntegrations();
      setResult('Disconnected');
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    }
  };

  const handleSlackConnect = async () => {
    if (!slackForm.webhookUrl) {
      setResult('Error: Webhook URL is required');
      return;
    }
    setSlackConnecting(true);
    setResult(null);
    try {
      await apiFetch('/documents/integrations/slack/connect', {
        method: 'POST',
        body: JSON.stringify(slackForm),
      });
      setResult('Slack connected! A test message was sent to your channel.');
      await loadIntegrations();
      setView('overview');
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setSlackConnecting(false);
    }
  };

  const handleSlackDisconnect = async () => {
    try {
      await apiFetch('/documents/integrations/slack/disconnect', { method: 'POST' });
      await loadIntegrations();
      setResult('Slack disconnected');
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    }
  };

  const browseS3 = async (prefix = '') => {
    setS3Loading(true);
    setResult(null);
    try {
      const files = await apiFetch<S3File[]>(`/documents/integrations/s3/files?prefix=${encodeURIComponent(prefix)}`);
      setS3Files(files);
      setS3Prefix(prefix);
      setSelected(new Set());
      setView('s3_browse');
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setS3Loading(false);
    }
  };

  const importSelected = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await apiFetch<{ imported: number; skipped: number }>('/documents/integrations/s3/import-batch', {
        method: 'POST',
        body: JSON.stringify({ s3Keys: Array.from(selected) }),
      });
      setResult(`Imported ${res.imported} document${res.imported !== 1 ? 's' : ''}${res.skipped > 0 ? ` (${res.skipped} already existed)` : ''}`);
      setSelected(new Set());
      onImported();
      await browseS3(s3Prefix);
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const selectProvider = (p: S3Provider) => {
    setS3Provider(p);
    const defaults = PROVIDER_DEFAULTS[p];
    setS3Form((prev) => ({ ...prev, endpoint: defaults.endpoint, region: defaults.region }));
    setView('s3_connect');
    setResult(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-[500px] h-full bg-background border-l border-border flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Integrations</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
          </div>
        ) : view === 'overview' ? (
          <OverviewTab
            integrations={integrations}
            result={result}
            onOpenS3Provider={() => { setView('s3_provider'); setResult(null); }}
            onBrowseS3={() => browseS3('')}
            onDisconnectS3={handleS3Disconnect}
            onOpenSlackConnect={() => { setView('slack_connect'); setResult(null); }}
            onDisconnectSlack={handleSlackDisconnect}
          />
        ) : view === 's3_provider' ? (
          <S3ProviderPicker
            onSelect={selectProvider}
            onBack={() => { setView('overview'); setResult(null); }}
          />
        ) : view === 's3_connect' ? (
          <ConnectS3Tab
            provider={s3Provider}
            form={s3Form}
            onChange={setS3Form}
            onConnect={handleS3Connect}
            onBack={() => { setView('s3_provider'); setResult(null); }}
            connecting={connecting}
            result={result}
          />
        ) : view === 'slack_connect' ? (
          <ConnectSlackTab
            form={slackForm}
            onChange={setSlackForm}
            onConnect={handleSlackConnect}
            onBack={() => { setView('overview'); setResult(null); }}
            connecting={slackConnecting}
            result={result}
          />
        ) : (
          <BrowseS3Tab
            files={s3Files}
            loading={s3Loading}
            selected={selected}
            importing={importing}
            result={result}
            bucketName={integrations?.s3.bucket ?? 'bucket'}
            prefix={s3Prefix}
            onBack={() => { setView('overview'); setResult(null); }}
            onRefresh={() => browseS3(s3Prefix)}
            onSelectAll={() => {
              const importable = s3Files.filter((f) => !f.alreadyImported).map((f) => f.key);
              setSelected(new Set(importable));
            }}
            onToggle={(key) => {
              setSelected((prev) => {
                const next = new Set(prev);
                next.has(key) ? next.delete(key) : next.add(key);
                return next;
              });
            }}
            onImport={importSelected}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────────── Overview Tab ──────────────────── */

function OverviewTab({
  integrations, result,
  onOpenS3Provider, onBrowseS3, onDisconnectS3,
  onOpenSlackConnect, onDisconnectSlack,
}: {
  integrations: IntegrationsData | null; result: string | null;
  onOpenS3Provider: () => void; onBrowseS3: () => void; onDisconnectS3: () => void;
  onOpenSlackConnect: () => void; onDisconnectSlack: () => void;
}) {
  const s3 = integrations?.s3;
  const slack = integrations?.slack;
  const categories = [
    { key: 'storage', label: 'Document Sources' },
    { key: 'ingest', label: 'Ingest' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'export', label: 'Export & Sync' },
  ];

  return (
    <div className="flex-1 overflow-auto p-5 space-y-5">
      <p className="text-xs text-muted-foreground">
        Connect your services to import documents, get notifications, and export extracted data.
        Each connection is scoped to your organization.
      </p>

      {result && <ResultBanner message={result} />}

      {categories.map((cat) => {
        const items = INTEGRATION_CATALOG.filter((i) => i.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{cat.label}</h3>
            <div className="space-y-2">
              {items.map((intg) => {
                if (intg.id === 's3') {
                  return (
                    <IntegrationCard key={intg.id} icon={intg.icon} name={intg.name} description={intg.description} helpUrl={intg.helpUrl}>
                      {s3?.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">Connected</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{s3.name} ({s3.bucket})</span>
                          </div>
                          <div className="flex gap-2">
                            <SmallBtn onClick={onBrowseS3} variant="primary">Browse & Import</SmallBtn>
                            <SmallBtn onClick={onOpenS3Provider}>Edit</SmallBtn>
                            <SmallBtn onClick={onDisconnectS3} variant="danger">Disconnect</SmallBtn>
                          </div>
                        </div>
                      ) : (
                        <SmallBtn onClick={onOpenS3Provider} variant="primary">+ Connect Bucket</SmallBtn>
                      )}
                    </IntegrationCard>
                  );
                }

                if (intg.id === 'slack') {
                  return (
                    <IntegrationCard key={intg.id} icon={intg.icon} name={intg.name} description={intg.description} helpUrl={intg.helpUrl}>
                      {slack?.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">Connected</span>
                            {slack.channel && <span className="text-[10px] text-muted-foreground font-mono">#{slack.channel}</span>}
                          </div>
                          <div className="flex gap-2">
                            <SmallBtn onClick={onOpenSlackConnect}>Edit</SmallBtn>
                            <SmallBtn onClick={onDisconnectSlack} variant="danger">Disconnect</SmallBtn>
                          </div>
                        </div>
                      ) : (
                        <SmallBtn onClick={onOpenSlackConnect} variant="primary">+ Connect Slack</SmallBtn>
                      )}
                    </IntegrationCard>
                  );
                }

                if (intg.id === 'api_webhook') {
                  return (
                    <IntegrationCard key={intg.id} icon={intg.icon} name={intg.name} description={intg.description} status="active">
                      <div className="text-[10px] font-mono text-muted-foreground bg-muted/50 p-2 rounded leading-relaxed">
                        POST /api/documents/upload<br />
                        Authorization: Bearer &lt;token&gt;<br />
                        Body: multipart/form-data (file)
                      </div>
                    </IntegrationCard>
                  );
                }

                return (
                  <IntegrationCard
                    key={intg.id}
                    icon={intg.icon}
                    name={intg.name}
                    description={intg.description}
                    status="coming_soon"
                    helpUrl={intg.helpUrl}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────── S3 Provider Picker ──────────────────── */

function S3ProviderPicker({ onSelect, onBack }: { onSelect: (p: S3Provider) => void; onBack: () => void }) {
  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
        <h3 className="text-sm font-semibold text-foreground">Choose your storage provider</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Select your cloud storage provider. Portscope uses the S3-compatible API to list and download documents from your bucket.
      </p>
      <div className="space-y-2">
        {S3_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all text-left group"
          >
            <div className="shrink-0">{p.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{p.description}</div>
            </div>
            <span className="text-muted-foreground group-hover:text-primary transition-colors text-sm">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────── Connect S3 Tab ──────────────────── */

function ConnectS3Tab({
  provider, form, onChange, onConnect, onBack, connecting, result,
}: {
  provider: S3Provider;
  form: { name: string; bucket: string; endpoint: string; region: string; accessKey: string; secretKey: string };
  onChange: (f: typeof form) => void;
  onConnect: () => void; onBack: () => void; connecting: boolean; result: string | null;
}) {
  const providerInfo = S3_PROVIDERS.find((p) => p.id === provider)!;
  const defaults = PROVIDER_DEFAULTS[provider];
  const update = (key: string, val: string) => onChange({ ...form, [key]: val });

  const regionOptions = provider === 'aws'
    ? ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1']
    : null;

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
        <div className="shrink-0">{providerInfo.icon}</div>
        <h3 className="text-sm font-semibold text-foreground">Connect {providerInfo.name}</h3>
      </div>

      {provider === 'aws' && (
        <HelpBox>
          <strong>AWS S3 Setup:</strong> Go to IAM Console → Users → Security Credentials → Create Access Key.
          Use an IAM user with <code>s3:ListBucket</code> and <code>s3:GetObject</code> permissions.
          <br />Endpoint format: <code>https://s3.&lt;region&gt;.amazonaws.com</code>
        </HelpBox>
      )}
      {provider === 'cloudflare_r2' && (
        <HelpBox>
          <strong>Cloudflare R2 Setup:</strong> Dashboard → R2 → Manage API Tokens → Create API Token.
          Choose "Object Read & Write" and select your bucket.
          <br />Endpoint format: <code>https://&lt;account-id&gt;.r2.cloudflarestorage.com</code>
        </HelpBox>
      )}
      {provider === 'gcs' && (
        <HelpBox>
          <strong>Google Cloud Storage:</strong> Cloud Console → Settings → Interoperability → Create HMAC Key for a service account.
          <br />Endpoint: <code>https://storage.googleapis.com</code> · Region: <code>auto</code>
        </HelpBox>
      )}
      {provider === 'minio' && (
        <HelpBox>
          <strong>MinIO:</strong> Use your MinIO server URL as the endpoint.
          Default credentials are often <code>minioadmin</code>/<code>minioadmin</code>.
        </HelpBox>
      )}

      {result && <ResultBanner message={result} />}

      <div className="space-y-3">
        <Field label="Connection Name" placeholder={`e.g. ${providerInfo.name} Fund Docs`} value={form.name} onChange={(v) => update('name', v)} />
        <Field label="Bucket Name *" placeholder="e.g. my-fund-documents" value={form.bucket} onChange={(v) => update('bucket', v)} />
        {provider !== 'aws' && (
          <Field label="Endpoint URL *" placeholder={defaults.endpointHelp} value={form.endpoint} onChange={(v) => update('endpoint', v)} />
        )}
        {provider === 'aws' && (
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">Endpoint URL</label>
            <p className="text-[10px] text-muted-foreground/60 font-mono bg-card/50 border border-border rounded-md px-2 py-1.5">
              Auto: https://s3.{form.region}.amazonaws.com
            </p>
          </div>
        )}

        {regionOptions ? (
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">Region *</label>
            <select
              value={form.region}
              onChange={(e) => update('region', e.target.value)}
              className="w-full text-xs font-mono h-8 px-2 rounded-md border border-border bg-card text-foreground outline-none focus:ring-1 focus:ring-primary/50"
            >
              {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ) : (
          <Field label="Region" placeholder={defaults.region} value={form.region} onChange={(v) => update('region', v)} />
        )}

        <Field label="Access Key ID *" placeholder={provider === 'aws' ? 'AKIA...' : 'Your access key'} value={form.accessKey} onChange={(v) => update('accessKey', v)} />
        <Field label="Secret Access Key *" placeholder="Your secret key" value={form.secretKey} onChange={(v) => update('secretKey', v)} type="password" />
      </div>

      <button
        onClick={onConnect}
        disabled={connecting}
        className="w-full text-xs py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {connecting ? 'Testing connection...' : 'Test & Connect'}
      </button>

      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        Credentials are stored securely and scoped to your organization.
        Portscope only reads files from your bucket -- it never modifies or deletes anything.
      </p>
    </div>
  );
}

/* ──────────────────── Connect Slack Tab ──────────────────── */

function ConnectSlackTab({
  form, onChange, onConnect, onBack, connecting, result,
}: {
  form: { webhookUrl: string; channel: string };
  onChange: (f: typeof form) => void;
  onConnect: () => void; onBack: () => void; connecting: boolean; result: string | null;
}) {
  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
        <SlackIcon size={24} />
        <h3 className="text-sm font-semibold text-foreground">Connect Slack</h3>
      </div>

      <HelpBox>
        <strong>How to get your Webhook URL:</strong>
        <ol className="list-decimal ml-3 mt-1 space-y-0.5">
          <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" className="text-primary hover:underline">api.slack.com/apps</a> and create an app (or use existing)</li>
          <li>Enable <strong>Incoming Webhooks</strong> under Features</li>
          <li>Click "Add New Webhook to Workspace" and select a channel</li>
          <li>Copy the webhook URL (starts with <code>https://hooks.slack.com/services/...</code>)</li>
        </ol>
      </HelpBox>

      {result && <ResultBanner message={result} />}

      <div className="space-y-3">
        <Field
          label="Webhook URL *"
          placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXX..."
          value={form.webhookUrl}
          onChange={(v) => onChange({ ...form, webhookUrl: v })}
        />
        <Field
          label="Channel Name (optional)"
          placeholder="e.g. #portscope-alerts"
          value={form.channel}
          onChange={(v) => onChange({ ...form, channel: v })}
        />
      </div>

      <p className="text-xs text-muted-foreground">Portscope will send notifications when:</p>
      <ul className="text-xs text-muted-foreground space-y-1 ml-3">
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Documents finish processing</li>
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Documents are flagged for review</li>
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Documents are approved</li>
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Extraction errors occur</li>
      </ul>

      <button
        onClick={onConnect}
        disabled={connecting}
        className="w-full text-xs py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {connecting ? 'Sending test message...' : 'Test & Connect'}
      </button>
    </div>
  );
}

/* ──────────────────── Browse S3 Tab ──────────────────── */

function BrowseS3Tab({
  files, loading, selected, importing, result, bucketName, prefix,
  onBack, onRefresh, onSelectAll, onToggle, onImport,
}: {
  files: S3File[]; loading: boolean; selected: Set<string>; importing: boolean;
  result: string | null; bucketName: string; prefix: string;
  onBack: () => void; onRefresh: () => void; onSelectAll: () => void;
  onToggle: (key: string) => void; onImport: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
          <span className="text-xs text-muted-foreground">|</span>
          <span className="text-xs font-mono text-foreground">{bucketName}</span>
          {prefix && <span className="text-xs text-muted-foreground">/ {prefix}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSelectAll} className="text-[10px] text-primary hover:underline">Select all</button>
          <button onClick={onRefresh} className="text-[10px] text-muted-foreground hover:text-foreground">↻</button>
        </div>
      </div>

      {result && (
        <div className={`px-5 py-2 text-xs border-b shrink-0 ${result.startsWith('Error') ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
          {result}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-muted-foreground animate-pulse">Browsing bucket...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <p className="text-sm text-muted-foreground">No documents found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Upload PDFs to your bucket to import them</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {files.map((file) => (
              <label key={file.key} className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer ${file.alreadyImported ? 'opacity-50' : ''}`}>
                <input type="checkbox" checked={selected.has(file.key)} onChange={() => onToggle(file.key)} disabled={file.alreadyImported} className="rounded border-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.fileName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(file.size)}
                    {file.lastModified && ` · ${new Date(file.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </p>
                </div>
                {file.alreadyImported && <span className="text-[10px] font-mono text-emerald-500">Imported</span>}
              </label>
            ))}
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="px-5 py-3 border-t border-border bg-card shrink-0">
          <button onClick={onImport} disabled={importing} className="w-full text-xs py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {importing ? 'Importing...' : `Import ${selected.size} document${selected.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Shared Components ──────────────────── */

function IntegrationCard({ icon, name, description, status, helpUrl, children }: {
  icon: ReactNode; name: string; description: string; status?: 'active' | 'coming_soon'; helpUrl?: string; children?: ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg p-3.5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-medium text-foreground">{name}</h4>
            {status === 'coming_soon' && (
              <span className="text-[9px] font-mono bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded">Coming soon</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
          {helpUrl && !children && status === 'coming_soon' && (
            <a href={helpUrl} target="_blank" rel="noopener" className="text-[10px] text-primary/70 hover:text-primary hover:underline mt-1 inline-block">
              Developer docs →
            </a>
          )}
          {children && <div className="mt-2.5">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function SmallBtn({ children, onClick, variant = 'default' }: { children: ReactNode; onClick: () => void; variant?: 'default' | 'primary' | 'danger' }) {
  const base = 'text-xs px-3 py-1.5 rounded-md transition-colors border';
  const styles = {
    default: 'text-muted-foreground hover:text-foreground border-border hover:bg-muted',
    primary: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
    danger: 'text-destructive border-destructive/20 hover:bg-destructive/5',
  };
  return <button onClick={onClick} className={`${base} ${styles[variant]}`}>{children}</button>;
}

function Field({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-xs font-mono h-8 px-2 rounded-md border border-border bg-card text-foreground outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

function HelpBox({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-md p-3 leading-relaxed [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono [&_strong]:text-foreground [&_strong]:font-medium">
      {children}
    </div>
  );
}

function ResultBanner({ message }: { message: string }) {
  const isError = message.startsWith('Error');
  return (
    <div className={`px-3 py-2 text-xs rounded-md border ${isError ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
      {message}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
