import { useState, useEffect } from 'react';
import { supabase, CarPart } from '../../../lib/supabase';

interface EditPartModalProps {
  part: CarPart;
  onClose: () => void;
  onUpdate: (updatedPart: CarPart) => void;
}

export default function EditPartModal({ part, onClose, onUpdate }: EditPartModalProps) {
  const [partType, setPartType] = useState<'dash_kit' | 'wiring_harness' | 'headlight'>(part.part_type);
  const [brand, setBrand] = useState(part.car_brand);
  const [model, setModel] = useState(part.car_model);
  const [year, setYear] = useState(part.car_year.toString());
  const [stockNumber, setStockNumber] = useState(part.stock_number);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(part.image_url);
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
    
    if (!brand || !model || !year || !stockNumber) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let imageUrl = part.image_url;
      
      if (imageFile) {
        setUploadProgress(30);
        imageUrl = await uploadImage(imageFile);
      }
      
      setUploadProgress(60);
      const { data, error } = await supabase
        .from('car_parts')
        .update({
          part_type: partType,
          car_brand: brand,
          car_model: model,
          car_year: parseInt(year),
          stock_number: stockNumber,
          image_url: imageUrl,
        })
        .eq('id', part.id)
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      alert('Part updated successfully!');
      onUpdate(data);
    } catch (error: any) {
      console.error('Update error:', error);
      if (error.code === '23505') {
        alert('This stock number already exists. Please use a unique stock number.');
      } else {
        alert('Failed to update part. Please try again.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Part</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Part Type</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPartType('dash_kit')}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  partType === 'dash_kit'
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-amber-300'
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
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-orange-300'
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
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-yellow-300'
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Part Image</label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="flex items-center justify-center w-full px-4 py-8 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors cursor-pointer"
                  >
                    <div className="text-center">
                      <i className="ri-upload-cloud-2-line text-4xl text-amber-500 mb-2"></i>
                      <p className="text-sm font-semibold text-gray-900">Click to change image</p>
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
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(part.image_url);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    )}
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
              <p className="text-xs text-gray-600 mt-2 text-center">Updating... {uploadProgress}%</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
