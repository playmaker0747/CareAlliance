import { useState, useEffect } from 'react'
import { MapPin, Navigation, ExternalLink, Search, Crosshair, Filter } from 'lucide-react'
import { useLocation } from '../context/LocationContext'
import { searchNearbyFacilities, type NearbyFacility } from '../lib/nearbySearch'

const CATEGORIES = [
  { id: 'all', label: 'All Nearby', query: ['hospital', 'clinic', 'pharmacy'] },
  { id: 'emergency', label: 'Emergency', query: ['hospital'] },
  { id: 'general', label: 'Gen. Outpatient', query: ['clinic', 'hospital'] },
  { id: 'pediatrics', label: 'Pediatrics', query: ['clinic', 'hospital'] },
  { id: 'antenatal', label: 'Antenatal', query: ['clinic', 'hospital'] },
  { id: 'pharmacy', label: 'Pharmacy', query: ['pharmacy'] },
];

export default function Explorer() {
  const { location, requestLocation, isLoading: locLoading } = useLocation();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      handleSearch();
    }
  }, [location, activeCategory]);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      const targetTypes = cat?.query || ['hospital', 'clinic', 'pharmacy'];

      const results = await searchNearbyFacilities(location.latitude, location.longitude, 12000);
      
      let filtered = results.filter(f => targetTypes.includes(f.type));
      
      // Naive text matching for specialized clinics since OSM "healthcare:speciality" tags are rare
      if (activeCategory === 'pediatrics') {
         const peds = filtered.filter(f => f.name.toLowerCase().includes('pediatric') || f.name.toLowerCase().includes('child') || f.name.toLowerCase().includes('children'));
         if (peds.length > 0) filtered = peds;
      }
      if (activeCategory === 'antenatal') {
         const matters = filtered.filter(f => f.name.toLowerCase().match(/mater|women|antenatal/));
         if (matters.length > 0) filtered = matters;
      }

      setFacilities(filtered.slice(0, 20)); // Cap to top 20
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      <div className="bg-white px-4 pt-4 pb-3 sticky top-[64px] z-30 border-b border-slate-100/50 backdrop-blur-md bg-white/80">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          Facility Explorer
        </h1>
        
        <div className="mt-4 flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 snap-x">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-1'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1">
        {!location && !locLoading ? (
          <div className="bg-white p-8 mt-10 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Crosshair className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Location Required</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-[250px] mx-auto">Enable location services to discover health facilities right around you.</p>
            <button onClick={requestLocation} className="btn-primary w-full shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700">
              Find My Location
            </button>
          </div>
        ) : loading || locLoading ? (
          <div className="mt-20 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium tracking-wide animate-pulse">Searching nearby...</p>
          </div>
        ) : facilities.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-1">
               Showing {facilities.length} {activeCategory === 'all' ? 'facilities' : 'results'}
             </p>
             {facilities.map(facility => (
               <div key={facility.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-indigo-200 transition-colors">
                 <div className="flex justify-between items-start gap-3">
                   <div>
                     <h3 className="font-bold text-slate-900 leading-tight text-lg group-hover:text-indigo-700 transition-colors">{facility.name}</h3>
                     <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">{facility.type}</p>
                   </div>
                   <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">
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
                   className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 py-3 rounded-xl font-semibold text-sm transition-colors border border-slate-200 active:scale-95"
                 >
                   <Navigation className="w-4 h-4" />
                   Directions
                   <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                 </a>
               </div>
             ))}
          </div>
        ) : (
          <div className="bg-white p-8 mt-10 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 mb-2">No results found</h3>
            <p className="text-slate-500 text-sm">Try selecting a different category or widening your search area.</p>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
