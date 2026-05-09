import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import { determineGuidance, type IntakeData } from '../lib/guidanceEngine'
import { useLocation as useGlobalLocation } from '../context/LocationContext'
import { supabase } from '../lib/supabase'

const AGES = ['infant', 'child', 'teenager', 'adult', 'older adult'];
const SYMPTOMS = ['fever', 'cough', 'vomiting', 'diarrhea', 'headache', 'breathing problem', 'abdominal pain', 'skin rash', 'weakness', 'injury'];
const DURATIONS = ['today', '1-2 days', '3+ days'];
const SEVERITIES = ['mild', 'moderate', 'severe'];
const RED_FLAGS = [
  { id: 'breathing', label: 'Difficulty breathing' },
  { id: 'chest_pain', label: 'Chest pain' },
  { id: 'seizure', label: 'Seizure' },
  { id: 'unconscious', label: 'Unconsciousness' },
  { id: 'bleeding', label: 'Heavy bleeding' },
  { id: 'dehydration', label: 'Severe dehydration' },
  { id: 'confusion', label: 'Confusion' },
  { id: 'persistent_vomiting', label: 'Persistent vomiting' },
  { id: 'infant_fever', label: 'Infant with very high fever' }
];

export default function SymptomFlow() {
  const navigate = useNavigate();
  const { location } = useGlobalLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>({
    ageGroup: null,
    primarySymptom: null,
    duration: null,
    severity: null,
    redFlags: []
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => {
    if (step === 1) navigate('/');
    else setStep(s => s - 1);
  };

  const finishFlow = async (finalData: IntakeData = data) => {
    const recommendation = determineGuidance(finalData);
    
    // Telemetry: Silently store real user session
    supabase.from('symptom_sessions').insert([{
       age_group: finalData.ageGroup,
       primary_symptom: finalData.primarySymptom,
       duration: finalData.duration,
       severity: finalData.severity,
       red_flags: finalData.redFlags,
       recommendation: recommendation,
       latitude: location?.latitude || null,
       longitude: location?.longitude || null
    }]).then(({ error }) => {
       if (error) console.error("Telemetry error:", error.message);
    });

    navigate('/result', { state: { session: finalData, recommendation } });
  };

  const toggleRedFlag = (flagId: string) => {
    setData(prev => ({
      ...prev,
      redFlags: prev.redFlags.includes(flagId) 
        ? prev.redFlags.filter(f => f !== flagId)
        : [...prev.redFlags, flagId]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent md:p-4">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-4 bg-white md:rounded-t-2xl md:shadow-sm">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary-500' : 'bg-slate-100'}`} />
            ))}
          </div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 mt-2 uppercase">
            Step {step} of 5
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white p-6 md:rounded-b-2xl md:shadow-sm flex flex-col">
        {step === 1 && (
          <SelectionStep 
            title="What is the age group?" 
            options={AGES} 
            selected={data.ageGroup} 
            onSelect={(val) => { setData(p => ({...p, ageGroup: val})); handleNext(); }} 
          />
        )}
        {step === 2 && (
          <SelectionStep 
            title="What is the primary symptom?" 
            options={SYMPTOMS} 
            selected={data.primarySymptom} 
            onSelect={(val) => { setData(p => ({...p, primarySymptom: val})); handleNext(); }} 
          />
        )}
        {step === 3 && (
          <SelectionStep 
            title="How long have you had this symptom?" 
            options={DURATIONS} 
            selected={data.duration} 
            onSelect={(val) => { setData(p => ({...p, duration: val})); handleNext(); }} 
          />
        )}
        {step === 4 && (
          <SelectionStep 
            title="How severe is the symptom?" 
            options={SEVERITIES} 
            selected={data.severity} 
            onSelect={(val) => { setData(p => ({...p, severity: val})); handleNext(); }} 
          />
        )}
        {step === 5 && (
          <div className="flex flex-col h-full animation-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Are any of these red flags present?</h2>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-6">
              {RED_FLAGS.map(flag => {
                const isActive = data.redFlags.includes(flag.id);
                return (
                  <button 
                    key={flag.id}
                    onClick={() => toggleRedFlag(flag.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      isActive ? 'bg-red-50 border-red-200 text-red-900 ring-2 ring-red-500' : 'bg-white border-slate-200 text-slate-700 hover:border-red-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isActive ? 'bg-red-500 border-red-500 ring-offset-1' : 'border-slate-300'}`}>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium">{flag.label}</span>
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={() => finishFlow()}
              className={`mt-auto py-4 px-6 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                data.redFlags.length > 0 ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30'
              }`}
            >
              See Recommendation
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SelectionStep({ title, options, selected, onSelect }: { title: string, options: string[], selected: string | null, onSelect: (val: string) => void }) {
  return (
    <div className="flex flex-col h-full animation-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{title}</h2>
      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`p-4 rounded-xl border text-left font-medium capitalize transition-all ${
              selected === opt 
              ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500 ring-offset-1' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-primary-200 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
