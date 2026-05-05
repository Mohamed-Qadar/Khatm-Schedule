import { useState } from 'react'
import { HatimModule } from './components/HatimModule'
import { HomeScreen } from './components/HomeScreen'
import { OkumaModule } from './components/OkumaModule'
import './App.css'

type Screen = 'home' | 'hatim' | 'okuma'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'hatim') {
    return <HatimModule onBack={() => setScreen('home')} />
  }

  if (screen === 'okuma') {
    return <OkumaModule onBack={() => setScreen('home')} />
  }

  return <HomeScreen onSelect={setScreen} />
}

export default App
