import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ClientePage from './pages/ClientePage.jsx'
import ConfirmacaoPage from './pages/ConfirmacaoPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LojaPage from './pages/LojaPage.jsx'

const Contido = ({ children }) => <main className="container">{children}</main>

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<ClientePage />} />
      <Route path="/loja" element={<Contido><LojaPage /></Contido>} />
      <Route path="/confirmacao" element={<Contido><ConfirmacaoPage /></Contido>} />
      <Route path="/admin/login" element={<Contido><LoginPage /></Contido>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Contido><AdminPage /></Contido>
          </ProtectedRoute>
        }
      />
    </Routes>
  </>
)

export default App
