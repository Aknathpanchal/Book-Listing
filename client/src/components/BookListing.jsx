import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, Book, AlertCircle, X, BookOpen, User, Calendar } from 'lucide-react';

const BookListing = () => {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const observer = useRef();
  const ITEMS_PER_PAGE = 10;

  // API URL - replace with your backend URL when deployed
  const API_URL = 'https://book-listing-sigma.vercel.app/books';

  const lastBookElementRef = React.useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch books on component mount and page change
  useEffect(() => {
    if (page === 1) {
      setBooks([]); // Clear existing books when resetting to page 1
    }
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const data = await response.json();
      
      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      setBooks(prevBooks => {
        const newBooks = data.filter(newBook => 
          !prevBooks.some(existingBook => existingBook._id === newBook._id)
        );
        return [...prevBooks, ...newBooks];
      });
    } catch (err) {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim() || !description.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, description }),
      });

      if (!response.ok) throw new Error('Failed to add book');

      const newBook = await response.json();
      setBooks(prevBooks => [newBook, ...prevBooks]);
      setTitle('');
      setAuthor('');
      setDescription('');
      setError('');
    } catch (err) {
      setError('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const confirmDelete = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${selectedBook._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete book');
      
      setBooks(prevBooks => prevBooks.filter(book => book._id !== selectedBook._id));
      setShowDeleteModal(false);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Book className="mr-2" /> Book Listing
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Add Book Form */}
          <div className="w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <PlusCircle className="mr-2 text-blue-600" />
                Add New Book
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter book title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter author name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter book description"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 p-4 rounded-lg flex items-center">
                    <AlertCircle className="text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Book
                  </div>
                </button>
              </form>
            </div>
          </div>

          {/* Book List */}
          <div className="w-2/3">
            <div className="space-y-4">
              {books.length === 0 && !loading ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <img
                    src="/api/placeholder/200/200"
                    alt="No books available"
                    className="mx-auto mb-4 rounded-lg"
                  />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Books Available</h3>
                  <p className="text-gray-500">Start by adding your first book!</p>
                </div>
              ) : (
                books.map((book, index) => (
                  <div
                    key={book._id}
                    ref={index === books.length - 1 ? lastBookElementRef : null}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-1">
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                {book.title}
                              </h3>
                              <button
                                onClick={() => confirmDelete(book)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg group"
                              >
                                <Trash2 className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {book.author}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(book.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {book.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 transform transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <AlertCircle className="text-red-500 mr-2" />
                  Delete Book
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookListing;
