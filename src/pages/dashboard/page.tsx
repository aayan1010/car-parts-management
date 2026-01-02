import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import { supabase, CarPart } from '../../lib/supabase';
import EditPartModal from './components/EditPartModal';
import ImageModal from './components/ImageModal';

export default function DashboardPage() {
  const [parts, setParts] = useState<CarPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dash_kit' | 'wiring_harness' | 'headlight'>('all');
  const [editingPart, setEditingPart] = useState<CarPart | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('car_parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, stockNumber: string) => {
    if (!confirm(`Are you sure you want to delete part with stock number ${stockNumber}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('car_parts').delete().eq('id', id);

      if (error) throw error;

      alert('Part deleted successfully!');
      setParts(parts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete part. Please try again.');
    }
  };

  const handleUpdatePart = (updatedPart: CarPart) => {
    setParts(parts.map(p => p.id === updatedPart.id ? updatedPart : p));
    setEditingPart(null);
  };

  const filteredParts = filter === 'all' 
    ? parts 
    : parts.filter(p => p.part_type === filter);

  const dashKitsCount = parts.filter(p => p.part_type === 'dash_kit').length;
  const wiringHarnessesCount = parts.filter(p => p.part_type === 'wiring_harness').length;
  const headlightsCount = parts.filter(p => p.part_type === 'headlight').length;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Inventory Dashboard</h1>
            <p className="text-lg text-gray-600">Manage and view all your car parts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <i className="ri-box-3-line text-white text-2xl"></i>
                </div>
                <span className="text-3xl font-bold text-gray-900">{parts.length}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Parts</h3>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <i className="ri-dashboard-3-line text-white text-2xl"></i>
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashKitsCount}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Dash Kits</h3>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <i className="ri-plug-line text-white text-2xl"></i>
                </div>
                <span className="text-3xl font-bold text-gray-900">{wiringHarnessesCount}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Wiring Harnesses</h3>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <i className="ri-lightbulb-line text-white text-2xl"></i>
                </div>
                <span className="text-3xl font-bold text-gray-900">{headlightsCount}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Headlights</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Parts
            </button>
            <button
              onClick={() => setFilter('dash_kit')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'dash_kit'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dash Kits
            </button>
            <button
              onClick={() => setFilter('wiring_harness')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'wiring_harness'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Wiring Harnesses
            </button>
            <button
              onClick={() => setFilter('headlight')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'headlight'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Headlights
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading inventory...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Parts Found</h3>
              <p className="text-gray-600">Start by adding some parts to your inventory</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParts.map((part) => (
                <div key={part.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                  <div 
                    className="w-full h-56 bg-gray-100 relative cursor-pointer group"
                    onClick={() => setExpandedImage(part.image_url)}
                  >
                    <img
                      src={part.image_url}
                      alt={`${part.car_brand} ${part.car_model}`}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="ri-zoom-in-line text-2xl text-gray-900"></i>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                        part.part_type === 'dash_kit'
                          ? 'bg-amber-500 text-white'
                          : part.part_type === 'wiring_harness'
                          ? 'bg-orange-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {part.part_type === 'dash_kit' ? 'Dash Kit' : part.part_type === 'wiring_harness' ? 'Wiring Harness' : 'Headlight'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {part.car_brand} {part.car_model}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Year: {part.car_year}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                        Stock: {part.stock_number}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPart(part)}
                        className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                      >
                        <i className="ri-edit-line"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(part.id, part.stock_number)}
                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                      >
                        <i className="ri-delete-bin-line"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingPart && (
        <EditPartModal
          part={editingPart}
          onClose={() => setEditingPart(null)}
          onUpdate={handleUpdatePart}
        />
      )}

      {expandedImage && (
        <ImageModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
