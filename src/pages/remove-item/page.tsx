import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import { supabase, CarPart } from '../../lib/supabase';
import EditPartModal from '../dashboard/components/EditPartModal';
import ImageModal from '../dashboard/components/ImageModal';

export default function RemoveItemPage() {
  const [parts, setParts] = useState<CarPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredParts = parts.filter(part =>
    part.car_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.stock_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Remove Items</h1>
            <p className="text-lg text-gray-600">Delete parts from inventory</p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by brand, model, or stock number..."
                className="w-full px-6 py-4 pr-12 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-xl"></i>
              </div>
            </div>
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
              <p className="text-gray-600">Try adjusting your search</p>
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
                          : 'bg-orange-500 text-white'
                      }`}>
                        {part.part_type === 'dash_kit' ? 'Dash Kit' : 'Wiring Harness'}
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
