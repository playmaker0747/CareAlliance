import { useEffect, useState } from 'react'
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom'
import { MapPin, Navigation, ExternalLink, AlertTriangle, Clock, Activity, Search } from 'lucide-react'
import { useLocation as useGlobalLocation } from '../context/LocationContext'
import { searchNearbyFacilities, type NearbyFacility } from '../lib/nearbySearch'
import { type Recommendation } from '../lib/guidanceEngine'

export default function ResultScreen() {
  const routerLoc = useRouterLocation();
  const navigate = useNavigate();
  const state = routerLoc.state as { recommendation?: Recommendation } | undefined;
  
  const { location, requestLocation, isLoading: isLocLoading } = useGlobalLocation();
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const recommendation = state?.recommendation || 'visit a clinic today';

  // Return to home if no valid recommendation session exists
  useEffect(() => {
    if (!state?.recommendation) {
      navigate('/');
    }
  }, [state, navigate]);

  useEffect(() => {
    if (location) {
       fetchFacilities();
    }
  }, [location]);

  const fetchFacilities = async () => {
    if (!location) return;
    setIsSearching(true);
    try {
       const targetTypes = recommendation === 'seek urgent care now' 
          ? ['hospital'] 
          : ['clinic', 'hospital', 'pharmacy'];

       const results = await searchNearbyFacilities(location.latitude, location.longitude);
       // Prioritize hospitals if urgent care, but ultimately show based on targeting
       const filtered = results.filter(f => targetTypes.includes(f.type)).slice(0, 5);
       setFacilities(filtered.length > 0 ? filtered : results.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }

  const getRecommendationUI = () => {
    if (recommendation === 'seek urgent care now') {
      return {
        colors: 'bg-red-50 border-red-200 text-red-900',
        icon: <AlertTriangle className="w-12 h-12 text-red-600 mb-4 mx-auto drop-shadow-md" />,
        title: 'Seek Urgent Care Now',
        desc: 'Based on your answers, you have symptoms that require immediate medical attention. Please go to the nearest emergency department or call emergency services.'
      }
    }
    if (recommendation === 'monitor and arrange medical review if symptoms continue') {
      return {
        colors: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: <Clock className="w-12 h-12 text-emerald-600 mb-4 mx-auto drop-shadow-md" />,
        title: 'Monitor Symptoms',
        desc: 'Your symptoms appear mild. Rest, stay hydrated, and monitor your condition. If symptoms worsen or do not improve, consult a healthcare provider.'
      }
    }
    // Default
    return {
      colors: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <Activity className="w-12 h-12 text-amber-600 mb-4 mx-auto drop-shadow-md" />,
      title: 'Visit a Clinic Today',
      desc: 'You should have your symptoms evaluated by a healthcare professional today. Please visit a nearby clinic or urgent care center.'
    }
  }

  const ui = getRecommendationUI();

  return (
    <div className="p-4 flex flex-col gap-6 animation-fade-in pb-12 mt-2 md:mt-6">
      <div className={`p-8 rounded-2xl border text-center ${ui.colors} shadow-sm relative overflow-hidden`}>
        {/* Decorative corner shape */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>
        
        {ui.icon}
        <h1 className="text-2xl font-black mb-3 tracking-tight">{ui.title}</h1>
        <p className="font-medium opacity-90 leading-relaxed text-[15px]">{ui.desc}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Nearby Facilities</h2>
        
        {!location && !isLocLoading ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 mb-2">Location Required</h3>
            <p className="text-slate-500 text-sm mb-6">We need your location to find care options near you.</p>
            <button onClick={requestLocation} className="btn-primary w-full">
              Share Current Location
            </button>
          </div>
        ) : isLocLoading || isSearching ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium tracking-wide">Scanning area...</p>
          </div>
        ) : facilities.length > 0 ? (
          <div className="flex flex-col gap-4">
             {facilities.map(facility => (
               <div key={facility.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary-200 transition-colors">
                 <div className="flex justify-between items-start gap-3">
                   <div>
                     <h3 className="font-bold text-slate-900 leading-tight text-lg group-hover:text-primary-700 transition-colors">{facility.name}</h3>
                     <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">{facility.type}</p>
                   </div>
                   <div className="bg-slate-50 text-slate-700 border border-slate-100 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                     {(facility.distance / 1000).toFixed(1)} km
                   </div>
                 </div>
                 
                 <div className="text-slate-600 text-sm flex items-start gap-2.5 mt-1">
                   <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                   <span className="leading-snug">{facility.address}</span>
                 </div>
                 
                 <a 
                   href={facility.navigationUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 py-3 rounded-xl font-semibold text-sm transition-colors border border-slate-200 active:scale-95"
                 >
                   <Navigation className="w-4 h-4" />
                   Get Directions
                   <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                 </a>
               </div>
             ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 mb-2">No facilities found</h3>
            <p className="text-slate-500 text-sm">We couldn't find any relevant facilities strictly within your immediate area.</p>
          </div>
        )}
      </div>
    </div>
  )
}
