import { BrowserRouter } from 'react-router-dom'
import { AppInner } from './components/AppInner'

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}