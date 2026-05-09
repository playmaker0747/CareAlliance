import { Outlet, Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import Disclaimer from './Disclaimer'

export default function BaseLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 w-full z-40">
        <Disclaimer />
        <div className="flex px-4 py-4 items-center justify-between max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary-50 p-2 rounded-xl group-hover:bg-primary-100 transition-colors">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">CarePath</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col">
        <Outlet />
      </main>
      
      <footer className="w-full bg-white border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-md mx-auto px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CarePath</p>
          <div className="flex gap-4 justify-center mt-2">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/explore" className="hover:text-primary-600 transition-colors">Find Care</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
