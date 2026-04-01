import { useEffect, useState } from 'react';
import type { Book } from '../types/Book';

const API = 'https://localhost:7139/api/books';

const emptyBook: Omit<Book, 'bookId'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<Omit<Book, 'bookId'>>(emptyBook);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAllBooks = async () => {
    // Fetch all books without pagination for admin view
    const res = await fetch(`${API}?pageNum=1&pageSize=1000`);
    const data = await res.json();
    setBooks(data.books);
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'pageCount' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleAdd = () => {
    setForm(emptyBook);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (book: Book) => {
    const { bookId, ...rest } = book;
    setForm(rest);
    setEditingId(bookId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    fetchAllBooks();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      await fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: editingId, ...form }),
      });
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyBook);
    fetchAllBooks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyBook);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin — Manage Books</h1>
        <button className="btn btn-success" onClick={handleAdd}>
          + Add Book
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <strong>{editingId !== null ? 'Edit Book' : 'Add New Book'}</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {(
                  [
                    ['title', 'Title', 'text'],
                    ['author', 'Author', 'text'],
                    ['publisher', 'Publisher', 'text'],
                    ['isbn', 'ISBN', 'text'],
                    ['classification', 'Classification', 'text'],
                    ['category', 'Category', 'text'],
                    ['pageCount', 'Page Count', 'number'],
                    ['price', 'Price', 'number'],
                  ] as [keyof typeof emptyBook, string, string][]
                ).map(([field, label, type]) => (
                  <div className="col-md-3" key={field}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      type={type}
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      step={field === 'price' ? '0.01' : undefined}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId !== null ? 'Save Changes' : 'Add Book'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Pages</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.bookId}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.isbn}</td>
                <td>{book.category}</td>
                <td>{book.pageCount}</td>
                <td>${book.price.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(book.bookId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBooks;
