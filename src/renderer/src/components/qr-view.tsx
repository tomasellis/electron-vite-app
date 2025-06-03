import { ReactElement } from 'react'

interface QRViewProps {
    qrCode: string
}

export default function QRView({ qrCode }: QRViewProps): ReactElement {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#1a2330] text-white">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <img src={qrCode} alt="QR Code" width={256} height={256} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Scan QR Code</h2>
            <p className="mt-2 text-gray-400">Open WhatsApp on your phone and scan this QR code</p>
        </div>
    )
} 