import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import { supabase, CarPart } from '../../lib/supabase';
import ImageModal from '../dashboard/components/ImageModal';

export default function SearchPage() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<CarPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      let query = supabase.from('car_parts').select('*');

      if (brand) {
        query = query.ilike('car_brand', `%${brand}%`);
      }
      if (model) {
        query = query.ilike('car_model', `%${model}%`);
      }
      if (year) {
        query = query.eq('car_year', parseInt(year));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search parts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dashKits = results.filter(r => r.part_type === 'dash_kit');
  const wiringHarnesses = results.filter(r => r.part_type === 'wiring_harness');
  const headlights = results.filter(r => r.part_type === 'headlight');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Search Car Parts</h1>
            <p className="text-lg text-gray-600">Search dash kits, wiring harnesses, and headlights</p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <form onSubmit={handleSearch} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Car Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Toyota"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Car Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., Camry"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2020"
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Parts'}
              </button>
            </form>
          </div>

          {searched && (
            <div>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-search-line text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {dashKits.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <i className="ri-dashboard-3-line text-white text-xl"></i>
                        </div>
                        Dash Kits ({dashKits.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashKits.map((part) => (
                          <div key={part.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            <div 
                              className="w-full h-56 bg-gray-100 cursor-pointer group relative"
                              onClick={() => setExpandedImage(part.image_url)}
                            >
                              <img
                                src={part.image_url}
                                alt={`${part.car_brand} ${part.car_model} Dash Kit`}
                                className="w-full h-full object-cover object-top"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i className="ri-zoom-in-line text-2xl text-gray-900"></i>
                                </div>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {part.car_brand} {part.car_model}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">Year: {part.car_year}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full whitespace-nowrap">
                                  Stock: {part.stock_number}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {wiringHarnesses.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <i className="ri-plug-line text-white text-xl"></i>
                        </div>
                        Wiring Harnesses ({wiringHarnesses.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wiringHarnesses.map((part) => (
                          <div key={part.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            <div 
                              className="w-full h-56 bg-gray-100 cursor-pointer group relative"
                              onClick={() => setExpandedImage(part.image_url)}
                            >
                              <img
                                src={part.image_url}
                                alt={`${part.car_brand} ${part.car_model} Wiring Harness`}
                                className="w-full h-full object-cover object-top"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i className="ri-zoom-in-line text-2xl text-gray-900"></i>
                                </div>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {part.car_brand} {part.car_model}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">Year: {part.car_year}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full whitespace-nowrap">
                                  Stock: {part.stock_number}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {headlights.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <i className="ri-lightbulb-line text-white text-xl"></i>
                        </div>
                        Headlights ({headlights.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {headlights.map((part) => (
                          <div key={part.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            <div 
                              className="w-full h-56 bg-gray-100 cursor-pointer group relative"
                              onClick={() => setExpandedImage(part.image_url)}
                            >
                              <img
                                src={part.image_url}
                                alt={`${part.car_brand} ${part.car_model} Headlight`}
                                className="w-full h-full object-cover object-top"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i className="ri-zoom-in-line text-2xl text-gray-900"></i>
                                </div>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {part.car_brand} {part.car_model}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">Year: {part.car_year}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full whitespace-nowrap">
                                  Stock: {part.stock_number}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {expandedImage && (
        <ImageModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
