import { Link } from 'react-router-dom'
import { Stethoscope, MapPin, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="p-4 flex flex-col gap-6 mt-4">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Symptoms</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Answer a few questions to get guidance on the level of care you might need right now.
        </p>
        <Link to="/intake" className="btn-primary w-full">
          Start Symptom Check
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Find Nearby Care</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Skip the check and search directly for nearby hospitals, clinics, or pharmacies.
        </p>
        <Link to="/explore" className="btn-secondary w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50">
          Find Care Nearby
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
