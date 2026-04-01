import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';
import { useCart } from '../context/CartContext';
import API_URL from '../API/BooksAPI';

function BookList() {
  // ── Book list state ────────────────────────────────────────────────────────
  const [books, setBooks] = useState<Book[]>([]);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalNumBooks, setTotalNumBooks] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ── Category filter state ──────────────────────────────────────────────────
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // '' = all

  // ── Toast notification state ───────────────────────────────────────────────
  // NEW BOOTSTRAP FEATURE #2: Toast — never used in class before.
  const [toastTitle, setToastTitle] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Cart context provides addToCart and summary values
  const { addToCart, cartCount, cartTotal } = useCart();

  const totalPages = Math.ceil(totalNumBooks / pageSize);

  // ── Fetch categories once on mount ────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/books/categories`)
      .then((res) => res.json())
      .then((data: string[]) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // ── Fetch books whenever page, size, sort, or category changes ─────────────
  useEffect(() => {
    const categoryParam = selectedCategory
      ? `&category=${encodeURIComponent(selectedCategory)}`
      : '';

    fetch(
      `${API_URL}/api/books?pageNum=${pageNum}&pageSize=${pageSize}&sortOrder=${sortOrder}${categoryParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books);
        setTotalNumBooks(data.totalNumBooks);
      })
      .catch((err) => console.error('Error fetching books:', err));
  }, [pageNum, pageSize, sortOrder, selectedCategory]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPageNum(1); // reset to first page when page size changes
  }

  function toggleSort() {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPageNum(1);
  }

  // When a category is selected, reset to page 1 so results are correct
  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setPageNum(1);
  }

  // Add a book to cart and show a brief toast notification
  function handleAddToCart(book: Book) {
    addToCart(book);
    setToastTitle(book.title);
    setShowToast(true);
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Bootstrap Grid: two columns — narrow sidebar for categories, wide main area
    <div className="row">

      {/* ── LEFT COLUMN: Category filter sidebar ── */}
      <div className="col-md-2">
        <h6 className="fw-bold mb-2">Category</h6>
        <ul className="list-unstyled">
          {/* "All" option clears the filter */}
          <li>
            <button
              className={`btn btn-link p-0 text-decoration-none ${selectedCategory === '' ? 'fw-bold text-primary' : 'text-secondary'}`}
              onClick={() => handleCategoryChange('')}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={`btn btn-link p-0 text-decoration-none ${selectedCategory === cat ? 'fw-bold text-primary' : 'text-secondary'}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── RIGHT COLUMN: Cart summary + controls + book table + pagination ── */}
      <div className="col-md-10">

        {/* Cart summary — shows a quick overview above the book list */}
        {cartCount > 0 && (
          <div className="alert alert-info d-flex justify-content-between align-items-center py-2 mb-3">
            <span>
              <strong>Cart:</strong> {cartCount} item{cartCount !== 1 ? 's' : ''}
            </span>
            <span className="fw-bold">Total: ${cartTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Page-size selector and sort toggle */}
        <div className="d-flex align-items-center mb-3 gap-3">
          <label className="mb-0">Results per page:</label>
          <select
            className="form-select w-auto"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {/* Book table */}
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th
                onClick={toggleSort}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Title {sortOrder === 'asc' ? '▲' : '▼'}
              </th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
              <th>Classification</th>
              <th>Category</th>
              <th>Pages</th>
              <th>Price</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.bookId}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.isbn}</td>
                <td>{book.classification}</td>
                <td>{book.category}</td>
                <td>{book.pageCount}</td>
                <td>${book.price.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAddToCart(book)}
                  >
                    + Cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPageNum((p) => p - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li
                key={p}
                className={`page-item ${p === pageNum ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setPageNum(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setPageNum((p) => p + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* ── Bootstrap Toast notification (bottom-right corner) ──
          Appears briefly when a book is added to the cart.
          NEW BOOTSTRAP FEATURE #2: Toast */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          className={`toast ${showToast ? 'show' : ''}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="toast-header">
            <strong className="me-auto">Added to Cart</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowToast(false)}
            />
          </div>
          <div className="toast-body">
            <em>{toastTitle}</em> was added to your cart.
          </div>
        </div>
      </div>

    </div>
  );
}

export default BookList;
