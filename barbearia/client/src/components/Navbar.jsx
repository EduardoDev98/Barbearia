import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const NOME = import.meta.env.VITE_NOME_BARBEARIA || 'Barbearia'

const Navbar = () => {
  const { isAuth, username, logout } = useAuth()
  const { qtdTotal } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">💈 {NOME}</Link>
      <div className="navbar-links">
        <Link to="/">Agendar</Link>
        <Link to="/loja" className="nav-loja">
          Loja{qtdTotal > 0 && <span className="nav-cart-badge">{qtdTotal}</span>}
        </Link>
        {isAuth ? (
          <>
            <Link to="/admin">Painel</Link>
            <span className="navbar-user">👤 {username}</span>
            <button className="btn-link" onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <Link to="/admin/login">Admin</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
