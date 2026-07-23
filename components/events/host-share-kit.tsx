'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import {
  Copy,
  Share2,
  Check,
  Sparkles,
  QrCode as QrIcon
} from 'lucide-react';

interface HostShareKitProps {
  eventId: string;
  joinCode?: string;
  eventName: string;
  hostName?: string;
}

export function HostShareKit({ eventId, joinCode, eventName, hostName }: HostShareKitProps) {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // Prefer public event URL, or invite URL if joinCode available
    const url = joinCode ? `${origin}/invite/${joinCode}` : `${origin}/events/${eventId}`;
    setShareUrl(url);

    // Generate local QR code data URL
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1A1A1A',
        light: '#FFFFFF'
      }
    })
      .then((dataUri) => setQrUrl(dataUri))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [eventId, joinCode]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Event link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: `Scan QR code or open link to join ${eventName} on PhotoShare AI!`,
          url: shareUrl
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${eventName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code image downloaded!');
  };

  const handlePrintQR = () => {
    if (!qrUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print QR card.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Table Card - ${eventName}</title>
          <style>
            @page { size: A5 portrait; margin: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 40px;
              text-align: center;
              background: #FFFDF8;
              color: #1A1A1A;
            }
            .card {
              border: 3px solid #FB8500;
              border-radius: 32px;
              padding: 40px 30px;
              max-width: 420px;
              background: white;
              box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            }
            .logo { font-size: 20px; font-weight: 800; color: #FB8500; margin-bottom: 12px; }
            .title { font-size: 26px; font-weight: 800; margin-bottom: 8px; color: #1A1A1A; }
            .subtitle { font-size: 14px; color: #525252; margin-bottom: 24px; }
            .qr-box { background: #FFF8F2; padding: 20px; border-radius: 24px; display: inline-block; margin-bottom: 20px; border: 1px solid rgba(255,170,80,0.3); }
            .qr-box img { width: 220px; height: 220px; display: block; }
            .instruction { font-size: 14px; font-weight: 700; color: #FB8500; margin-bottom: 6px; }
            .url { font-size: 11px; font-family: monospace; color: #8A8A8A; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">📸 PhotoShare AI</div>
            <div class="title">${eventName}</div>
            <div class="subtitle">Hosted by ${hostName || 'Event Host'}</div>
            <div class="qr-box">
              <img src="${qrUrl}" alt="Event QR" />
            </div>
            <div class="instruction">Scan QR Code to Upload & Find Your Photos!</div>
            <div class="url">${shareUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPoster = () => {
    if (!qrUrl) return;

    // Create offscreen canvas for A4 Event Poster (1240 x 1754 px)
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1754);
    bgGrad.addColorStop(0, '#FFF6EC');
    bgGrad.addColorStop(0.3, '#FFFDF8');
    bgGrad.addColorStop(1, '#FFF8F2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1240, 1754);

    // Decorative Border Frame
    ctx.strokeStyle = 'rgba(255, 170, 80, 0.4)';
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, 1160, 1674);

    // Header Logo Badge
    ctx.fillStyle = '#FB8500';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 PHOTOSHARE AI', 620, 140);

    // Event Title
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(eventName, 620, 260);

    // Host & Date Subtitle
    ctx.fillStyle = '#525252';
    ctx.font = '30px sans-serif';
    ctx.fillText(`Hosted by ${hostName || 'Event Host'} • Scan to Share Memories`, 620, 330);

    // Load QR Image onto Canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // White QR Container Card
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(251, 133, 0, 0.15)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.beginPath();
      ctx.roundRect(270, 420, 700, 700, 40);
      ctx.fill();
      ctx.shadowColor = 'transparent'; // reset shadow

      // Draw QR Image
      ctx.drawImage(img, 320, 470, 600, 600);

      // "How It Works" Section
      ctx.fillStyle = '#FB8500';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('HOW TO FIND YOUR PHOTOS:', 620, 1220);

      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('1. Open Camera & Scan QR Code above', 620, 1300);
      ctx.fillText('2. Take 1 Selfie (Private AI Verification)', 620, 1360);
      ctx.fillText('3. Instantly Get Only Your Photos 🔒', 620, 1420);

      // URL Footer
      ctx.fillStyle = '#8A8A8A';
      ctx.font = '24px monospace';
      ctx.fillText(shareUrl, 620, 1620);

      // Export as PNG
      const dataUri = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUri;
      a.download = `POSTER_${eventName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('A4 Printable Poster downloaded!');
    };
    img.src = qrUrl;
  };

  return (
    <div className="bg-white border-2 border-[rgba(255,170,80,0.25)] rounded-[28px] p-6 shadow-xl space-y-6 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(255,170,80,0.15)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-md">
            <QrIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-sm">Event Share Kit</h3>
            <span className="text-[11px] text-[#525252]">Instant QR & link sharing for guests</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={12} /> Active QR
        </span>
      </div>

      {/* QR Code Container */}
      <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.3)] rounded-2xl p-5 flex flex-col items-center justify-center space-y-3 shadow-inner">
        {qrUrl ? (
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Event QR Code" className="w-48 h-48 rounded-lg object-contain" />
          </div>
        ) : (
          <div className="w-48 h-48 rounded-xl bg-zinc-100 animate-pulse flex items-center justify-center text-xs text-zinc-400">
            Generating QR...
          </div>
        )}
        <p className="text-[11px] font-medium text-[#525252] text-center max-w-[260px]">
          &quot;Guests simply scan this QR code to join and upload photos.&quot;
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopyLink}
          className="btn-secondary-luxury !h-11 !px-4 !text-xs flex items-center justify-center gap-2"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          onClick={handleNativeShare}
          className="btn-primary-luxury !h-11 !px-4 !text-xs flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          <span>Share Link</span>
        </button>
      </div>
    </div>
  );
}
