import React from 'react'
import Header from './components/Header'
import Layout from './components/Layout'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import CandidatesByJob from './pages/CandidatesByJob'
import CandidateById from './pages/CandidateById'
import CandidatesPage from './pages/Candidates'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path='jobs' element={<Jobs />}/>
          <Route path='/jobs/:id' element={<JobDetails />}/>
          <Route path='/jobs/:id/candidates' element={<CandidatesByJob />} />
          <Route path='/candidates/:id' element={<CandidateById />}/>
          <Route path='candidates' element={<CandidatesPage />} />
        </Route>
      </Routes>
      
    </div>
  )
}

export default App
