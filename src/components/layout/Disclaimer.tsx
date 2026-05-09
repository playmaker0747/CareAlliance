import { AlertCircle } from 'lucide-react'

export default function Disclaimer() {
  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-3 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <p className="text-sm text-slate-800 leading-snug">
        <strong className="font-semibold text-warning-700">Medical Disclaimer:</strong> This tool provides guidance only and does not replace a licensed medical professional. If you are experiencing a life-threatening emergency, call emergency services.
      </p>
    </div>
  )
}
