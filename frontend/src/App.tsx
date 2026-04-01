import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CartProvider, useCart } from './context/CartContext';
import BookList from './components/BookList';
import CartOffcanvas from './components/CartOffcanvas';
import AdminBooks from './components/AdminBooks';

// Inner component so it can access the cart context for the badge count
function AppContent() {
  const { cartCount } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="container mt-4">
      {/* Header row: title on left, cart button on right */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <h1 className="mb-0">
            <Link to="/" className="text-decoration-none text-dark">
              Online Bookstore
            </Link>
          </h1>
        </div>
        <div className="col-auto d-flex gap-2 align-items-center">
          <Link to="/adminbooks" className="btn btn-outline-secondary">
            Admin
          </Link>
          {/* Cart button — clicking it opens the Offcanvas cart panel.
              The Offcanvas is NEW BOOTSTRAP FEATURE #1 (see CartOffcanvas.tsx).
              The Toast notification on add is NEW BOOTSTRAP FEATURE #2 (see BookList.tsx). */}
          <button
            className="btn btn-outline-primary position-relative"
            onClick={() => setShowCart(true)}
          >
            Cart
            {/* Bootstrap Badge shows live item count on the button */}
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Main book list */}
              <BookList />
              {/* Cart offcanvas panel — slides in from the right */}
              <CartOffcanvas show={showCart} onClose={() => setShowCart(false)} />
            </>
          }
        />
        <Route path="/adminbooks" element={<AdminBooks />} />
      </Routes>
    </div>
  );
}

// Wrap everything in CartProvider so cart state is available app-wide.
// This is what makes the cart persist across the whole session.
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
