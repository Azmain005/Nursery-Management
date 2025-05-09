// src/pages/Home/Vendor.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../providers/CartProvider';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import LoaderPlant from '../../components/Loader/LoaderPlant';
import { db } from '../../Auth/firebase.init';
import HeroImage from '../../assets/leaf.png';

const Vendor = () => {
  const { addToCart } = useCart();
  const plantsPerPage = 12;

  const [allPlants, setAllPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // 1) Fetch inventory including stock
  useEffect(() => {
    async function fetchPlants() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'inventory'));
        const data = snap.docs.map(d => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            stock: Number(docData.stock) || 0,
          };
        });
        setAllPlants(data);
        setTotalPages(Math.ceil(data.length / plantsPerPage));
      } catch (err) {
        console.error('Error fetching plants:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlants();
  }, []);

  // live search filter
  const filteredPlants = useMemo(() => {
    if (!searchTerm.trim()) return allPlants;
    const term = searchTerm.trim().toLowerCase();
    return allPlants.filter(p => p.name.toLowerCase().includes(term));
  }, [allPlants, searchTerm]);

  // recalc pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredPlants.length / plantsPerPage));
  }, [filteredPlants]);

  // slice out the current page
  const currentPlants = useMemo(() => {
    const start = (currentPage - 1) * plantsPerPage;
    return filteredPlants.slice(start, start + plantsPerPage);
  }, [filteredPlants, currentPage]);

  // 2) Add to cart + decrement stock via transaction
  const handleAddToCart = async plant => {
    try {
      // add to cart (via context)
      await addToCart(plant);

      // atomically decrement stock in Firestore
      const invRef = doc(db, 'inventory', plant.id);
      await runTransaction(db, async tx => {
        const invSnap = await tx.get(invRef);
        const curr = invSnap.data().stock;
        if (curr <= 0) {
          throw new Error('Out of stock');
        }
        tx.update(invRef, { stock: curr - 0});
      });

      // update local UI immediately
      setAllPlants(ps =>
        ps.map(p => (p.id === plant.id ? { ...p, stock: p.stock - 1 } : p))
      );

      alert(`Added “${plant.name}” to cart.`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Couldn't add to cart.");
    }
  };

  // page navigation
  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-0 py-8">
        <div className="bg-[#607b64] text-white p-6 flex flex-col justify-center h-80">
          <h1 className="text-3xl font-bold mb-2">WELCOME TO PLANTY</h1>
          <p className="text-lg mb-2">Plants for every occasion</p>
          <p className="text-base leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="bg-[#faf6e9] p-6 flex justify-center items-center h-80 rounded-lg">
          <img
            src={HeroImage}
            alt="Featured plant"
            className="max-w-full h-full object-cover rounded-lg"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="text-center mt-8">
          <h2 className="text-3xl font-semibold">Top Products</h2>
        </div>

        {/* Search Bar */}
        <div className="p-6">
          <form
            onSubmit={e => e.preventDefault()}
            className="mb-6 flex gap-2 justify-center"
          >
            <input
              type="text"
              placeholder="Search plant by name…"
              className="flex-1 input bg-[#faf6e9] outline-none max-w-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="button" className="btn bg-[#02542d] text-white px-6">
              Search
            </button>
          </form>

          {/* Products Grid */}
          {loading ? (
            <LoaderPlant />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {currentPlants.map(p => (
                <div
                  key={p.id}
                  className="border p-4 rounded-lg shadow-md bg-white flex flex-col"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="text-lg font-semibold text-[#2c5c2c]">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">৳{p.price}</p>

                  {/* In stock / Out of stock label */}
                  <p
                    className={`text-sm mb-4 ${
                      p.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {p.stock > 0 ? 'In stock' : 'Out of stock'}
                  </p>

                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock <= 0}
                    className={`mt-auto btn text-white ${
                      p.stock > 0
                        ? 'bg-[#607b64] hover:bg-[#4a6450]'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {p.stock > 0 ? 'Add to cart' : 'Out of stock'}
                  </button>
                </div>
              ))}
              {filteredPlants.length === 0 && (
                <p className="col-span-full text-center text-gray-500">
                  No plants found.
                </p>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(currentPage - page) <= 1)
              .map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md ${
                    page === currentPage
                      ? 'bg-[#607b64] text-white'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Vendor;
