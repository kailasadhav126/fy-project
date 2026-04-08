import { Route, Switch } from 'wouter'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Hotels from './pages/Hotels'
import MedicalServices from './pages/MedicalServices'
import Parking from './pages/Parking'
import Users from './pages/Users'
import Bookings from './pages/Bookings'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={Users} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/hotels" component={Hotels} />
        <Route path="/medical-services" component={MedicalServices} />
        <Route path="/parking" component={Parking} />
        <Route component={Dashboard} />
      </Switch>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

