import { Routes, Route } from 'react-router-dom'
import BaseLayout from './components/layout/BaseLayout'

import Home from './pages/Home'
import SymptomFlow from './pages/SymptomFlow'
import ResultScreen from './pages/ResultScreen'
import Explorer from './pages/Explorer'

function App() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<SymptomFlow />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/explore" element={<Explorer />} />
      </Route>
    </Routes>
  )
}

export default App
