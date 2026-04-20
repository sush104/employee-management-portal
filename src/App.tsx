import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/Dashboard'

function App() {
  const [manager, setManager] = useState<string | null>(null)

  if (!manager) {
    return <LoginForm onLogin={(email) => setManager(email)} />
  }

  return <Dashboard manager={manager} onLogout={() => setManager(null)} />
}

export default App
