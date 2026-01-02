import { useState } from 'react';
import Navbar from '../../components/feature/Navbar';
import { supabase } from '../../lib/supabase';

export default function AddItemPage() {
  const [partType, setPartType] = useState<'dash_kit' | 'wiring_harness' | 'headlight'>('dash_kit');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [stockNumber, setStockNumber] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `car-parts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !model || !year || !stockNumber || !imageFile) {
      alert('Please fill in all fields and upload an image');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(30);
      const imageUrl = await uploadImage(imageFile);
      
      setUploadProgress(60);
      const { error } = await supabase.from('car_parts').insert([
        {
          part_type: partType,
          car_brand: brand,
          car_model: model,
          car_year: parseInt(year),
          stock_number: stockNumber,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      setUploadProgress(100);
      alert('Part added successfully!');
      setBrand('');
      setModel('');
      setYear('');
      setStockNumber('');
      setImageFile(null);
      setImagePreview('');
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Add error:', error);
      if (error.code === '23505') {
        alert('This stock number already exists. Please use a unique stock number.');
      } else {
        alert('Failed to add part. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Add New Item</h1>
            <p className="text-lg text-gray-600">Add dash kits, wiring harnesses, or headlights</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Part Type</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPartType('dash_kit')}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    partType === 'dash_kit'
                      ? 'border-amber-500 bg-white shadow-md'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-dashboard-3-line text-white text-2xl"></i>
                  </div>
                  <div className="font-semibold text-gray-900">Dash Kit</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPartType('wiring_harness')}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    partType === 'wiring_harness'
                      ? 'border-orange-500 bg-white shadow-md'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-plug-line text-white text-2xl"></i>
                  </div>
                  <div className="font-semibold text-gray-900">Wiring Harness</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPartType('headlight')}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    partType === 'headlight'
                      ? 'border-yellow-500 bg-white shadow-md'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-lightbulb-line text-white text-2xl"></i>
                  </div>
                  <div className="font-semibold text-gray-900">Headlight</div>
                </button>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Vehicle Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Car Brand *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Toyota"
                    required
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Car Model *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., Camry"
                    required
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Year *</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2020"
                  required
                  min="1900"
                  max="2100"
                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Part Details</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Stock Number *</label>
                <input
                  type="text"
                  value={stockNumber}
                  onChange={(e) => setStockNumber(e.target.value)}
                  placeholder="e.g., DK-TOY-CAM-2020-001"
                  required
                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Part Image *</label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full px-4 py-8 bg-white border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-500 transition-colors cursor-pointer"
                    >
                      <div className="text-center">
                        <i className="ri-upload-cloud-2-line text-4xl text-amber-500 mb-2"></i>
                        <p className="text-sm font-semibold text-gray-900">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading && uploadProgress > 0 && (
              <div className="mb-6">
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Part to Inventory'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
