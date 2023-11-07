import { Route, Routes } from 'react-router-dom'

import { Code } from '../pages/Code'
import { Commits } from '../pages/Commits'
import { Discussions } from '../pages/Discussions'
import { Home } from '../pages/Home'
import { Issues } from '../pages/Issues'
import { Marketplace } from '../pages/Marketplace'
import { Packages } from '../pages/Packages'
import { PullRequests } from '../pages/PullRequests'
import { Repositories } from '../pages/Repositories'
import { Topics } from '../pages/Topics'
import { Users } from '../pages/Users'
import { Wikis } from '../pages/Wikis'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/code" element={<Code />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/issues" element={<Issues />} />
      <Route path="/pullrequests" element={<PullRequests />} />
      <Route path="/discussions" element={<Discussions />} />
      <Route path="/users" element={<Users />} />
      <Route path="/commits" element={<Commits />} />
      <Route path="/registrypackages" element={<Packages />} />
      <Route path="/wikis" element={<Wikis />} />
      <Route path="/topics" element={<Topics />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  )
}
