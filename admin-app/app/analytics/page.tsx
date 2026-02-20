"use client";

import { BarChart3, ExternalLink } from "lucide-react";

export default function AnalyticsPage() {
  const umamiShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-blue-500" />
          Analytics & Traffic
        </h1>

        {umamiShareUrl && (
          <a
            href={umamiShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Open in Umami <ExternalLink size={14} />
          </a>
        )}
      </div>

      {umamiShareUrl ? (
        <div className="card flex-1 p-0 overflow-hidden border border-slate-700/50">
          <iframe
            src={umamiShareUrl}
            frameBorder="0"
            className="w-full h-full min-h-[600px] bg-white rounded-xl"
            title="Umami Analytics Dashboard"
          ></iframe>
        </div>
      ) : (
        <div className="card h-64 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-700">
          <BarChart3 size={48} className="text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">
            Analytics Not Configured
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            To view detailed traffic and events, set the{" "}
            <code className="bg-slate-800 px-2 py-1 rounded text-pink-400 font-mono text-sm">
              NEXT_PUBLIC_UMAMI_SHARE_URL
            </code>{" "}
            environment variable to your Umami public share link.
          </p>
        </div>
      )}
    </div>
  );
}
