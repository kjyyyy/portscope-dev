'use client';

/* eslint-disable @next/next/no-img-element */

interface IconProps {
  size?: number;
}

export function AwsS3Icon({ size = 28 }: IconProps) {
  return <img src="/integrations/amazon-s3.png" alt="Amazon S3" width={size} height={size} className="rounded object-contain" />;
}

export function CloudflareR2Icon({ size = 28 }: IconProps) {
  return <img src="/integrations/cloudflare.png" alt="Cloudflare R2" width={size * 1.8} height={size} className="object-contain" />;
}

export function GcsIcon({ size = 28 }: IconProps) {
  return <img src="/integrations/google-cloud-storage.png" alt="Google Cloud Storage" width={size} height={size} className="rounded object-contain" />;
}

export function MinioIcon({ size = 28 }: IconProps) {
  return <img src="/integrations/minio.png" alt="MinIO" width={size} height={size} className="rounded object-contain" />;
}

export function SlackIcon({ size = 28 }: IconProps) {
  return <img src="/integrations/slack.png" alt="Slack" width={size * 1.6} height={size} className="object-contain" />;
}

export function GoogleDriveIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.3 25.7L11.5 17h17l-5.2 8.7H6.3z" fill="#0066DA" />
      <path d="M20.5 7L28.5 17h-17L3.5 7h17z" fill="#00AC47" />
      <path d="M11.5 7L20.5 25.7" stroke="none" />
      <path d="M3.5 7h17l8 10H11.5L3.5 7z" fill="#00AC47" />
      <path d="M6.3 25.7L11.5 17h17l-5.2 8.7H6.3z" fill="#0066DA" />
      <path d="M20.5 7l8 10-5.2 8.7L11.5 17 20.5 7z" fill="#FFBA00" />
    </svg>
  );
}

export function GmailIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="7" width="24" height="18" rx="3" fill="#EA4335" />
      <path d="M4 10l12 8 12-8" stroke="white" strokeWidth="2" fill="none" />
      <rect x="4" y="7" width="24" height="18" rx="3" fill="none" stroke="#C5221F" strokeWidth="0.5" />
      <rect x="5" y="12" width="7" height="12" fill="white" />
      <rect x="20" y="12" width="7" height="12" fill="white" />
    </svg>
  );
}

export function GoogleSheetsIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="20" height="24" rx="2" fill="#0F9D58" />
      <path d="M18 4l8 8h-8V4z" fill="#006633" />
      <rect x="9" y="14" width="14" height="11" rx="1" fill="white" />
      <line x1="14.5" y1="14" x2="14.5" y2="25" stroke="#0F9D58" strokeWidth="0.7" />
      <line x1="9" y1="18" x2="23" y2="18" stroke="#0F9D58" strokeWidth="0.7" />
      <line x1="9" y1="22" x2="23" y2="22" stroke="#0F9D58" strokeWidth="0.7" />
    </svg>
  );
}

export function NotionIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      <path d="M8.5 6.5h10l5 4v15h-15v-19z" fill="white" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11.5 12h9M11.5 16h9M11.5 20h5" stroke="#000" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function AirtableIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#FCB400" />
      <path d="M5 11l11-4 11 4v2l-11 4-11-4v-2z" fill="white" opacity="0.95" />
      <path d="M5 17l11 4 11-4" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M5 21l11 4 11-4" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

export function SftpIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#1A1A2E" />
      <rect x="6" y="7" width="20" height="13" rx="2" fill="#16213E" stroke="#3A86FF" strokeWidth="1" />
      <text x="16" y="17" textAnchor="middle" fill="#3A86FF" fontSize="7" fontFamily="monospace" fontWeight="bold">&gt;_</text>
      <rect x="10" y="23" width="12" height="2" rx="1" fill="#3A86FF" opacity="0.5" />
    </svg>
  );
}

export function WebhookIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#1E293B" />
      <circle cx="10" cy="16" r="3.5" fill="none" stroke="#818CF8" strokeWidth="1.5" />
      <circle cx="22" cy="16" r="3.5" fill="none" stroke="#818CF8" strokeWidth="1.5" />
      <path d="M13.5 16h5" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="2 1.5" />
      <circle cx="16" cy="9" r="2" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.5" />
      <circle cx="16" cy="23" r="2" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
