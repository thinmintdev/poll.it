'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  size?: number
  showHeader?: boolean
}

export default function QRCodeDisplay({ url, size = 200, showHeader = true }: QRCodeDisplayProps) {
  if (!showHeader) {
    return (
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
    )
  }

  return (
    <div className="bg-primary/10 rounded-lg p-6 text-center border border-highlight/20">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center justify-center">
        <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        Scan to Share
      </h3>
      <div className="flex justify-center mb-4">
        <div className="bg-primary p-4 rounded-lg shadow-lg border border-highlight/30">
          <QRCodeSVG
            value={url}
            size={size}
            level="M"
            includeMargin={true}
            fgColor="#EDF2F6"
            bgColor="#3D3B40"
          />
        </div>
      </div>
      <p className="text-sm text-secondary">
        Scan this QR code with your phone to easily access and share this poll
      </p>
    </div>
  )
}
