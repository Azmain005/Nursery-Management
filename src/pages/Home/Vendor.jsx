// src/pages/Home/Vendor.jsx
import { collection, doc, getDocs, runTransaction } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../Auth/firebase.init";
import HeroImage from "../../assets/leaf.png";
import LoaderPlant from "../../components/Loader/LoaderPlant";
import { useCart } from "../../providers/CartProvider";

const Vendor = () => {
  const { addToCart } = useCart();
  const plantsPerPage = 12;

  const [allPlants, setAllPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Fetch inventory including stock
  useEffect(() => {
    async function fetchPlants() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "inventory"));
        const data = snap.docs.map((d) => {
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
        console.error("Error fetching plants:", err);
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
    return allPlants.filter((p) => p.name.toLowerCase().includes(term));
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
  const handleAddToCart = async (plant) => {
    try {
      // add to cart (via context)
      await addToCart(plant);

      // atomically decrement stock in Firestore
      const invRef = doc(db, "inventory", plant.id);
      await runTransaction(db, async (tx) => {
        const invSnap = await tx.get(invRef);
        const curr = invSnap.data().stock;
        if (curr <= 0) {
          throw new Error("Out of stock");
        }
        tx.update(invRef, { stock: curr - 0 });
      });

      // update local UI immediately
      setAllPlants((ps) =>
        ps.map((p) => (p.id === plant.id ? { ...p, stock: p.stock - 1 } : p))
      );

      alert(`Added "${plant.name}" to cart.`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Couldn't add to cart.");
    }
  };

  // page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#faf6e9]">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="bg-[#607b64] text-white p-12 flex flex-col justify-center min-h-[500px]">
            <h1 className="text-5xl font-bold mb-4 tracking-wide">
              WELCOME TO PLANTY
            </h1>
            <p className="text-xl mb-6">Plants for every occasion</p>
            <div className="w-24 h-0.5 bg-[#fefaef] mb-8"></div>
            <p className="text-base leading-relaxed opacity-90 max-w-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div className="bg-[#faf6e9] flex justify-center items-center min-h-[500px]">
            <img
              src={HeroImage}
              alt="Featured plant"
              className="h-full max-h-[450px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#2c5c2c]">Top Products</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-3 justify-center max-w-xl mx-auto"
          >
            <input
              type="text"
              placeholder="Search plant by name…"
              className="flex-1 py-3 px-5 bg-[#fefaef] border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#607b64] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className="btn bg-[#02542d] text-white px-6 py-3 rounded-full hover:bg-[#04471f] transition-colors duration-300 shadow-md"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center my-16">
            <LoaderPlant />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {currentPlants.map((p) => (
              <div
                key={p.id}
                className="border border-gray-100 p-5 rounded-2xl shadow-md bg-[#fefaef] flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4 overflow-hidden rounded-xl">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#2c5c2c] mb-2">
                  {p.name}
                </h3>
                <p className="text-lg font-bold text-[#607b64] mb-2">
                  ${p.price}
                </p>

                {/* In stock / Out of stock label */}
                <div className="flex items-center mb-4">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      p.stock > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <p
                    className={`text-sm ${
                      p.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {p.stock > 0 ? "In stock" : "Out of stock"}
                  </p>
                </div>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={p.stock <= 0}
                  className={`mt-auto py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                    p.stock > 0
                      ? "bg-[#607b64] hover:bg-[#4a6450]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {p.stock > 0 ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            ))}
            {filteredPlants.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-xl">No plants found.</p>
                <p className="text-gray-400 mt-2">
                  Try a different search term.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md border border-[#607b64] text-[#607b64] hover:bg-[#f0f7f0] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(currentPage - page) <= 1)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    page === currentPage
                      ? "bg-[#607b64] text-white font-medium"
                      : "border border-[#607b64] text-[#607b64] hover:bg-[#f0f7f0]"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md border border-[#607b64] text-[#607b64] hover:bg-[#f0f7f0] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Vendor;
