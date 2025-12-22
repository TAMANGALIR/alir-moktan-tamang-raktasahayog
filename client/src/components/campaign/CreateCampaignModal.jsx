import { useState, useEffect } from 'react';
import ModalPortal from '../common/ModalPortal';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import Input from '../common/Input';
import Button from '../common/Button';
import MapLocationPicker from './MapLocationPicker';
import apiClient from '../../services/api.service';
import toast from 'react-hot-toast';

const CreateCampaignModal = ({ isOpen, onClose, onCampaignCreated, initialData = null }) => {
    const [loading, setLoading] = useState(false);

    // Initialize form with initialData if present, otherwise default
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        startTime: initialData?.startTime || '',
        endTime: initialData?.endTime || '',
        location: initialData?.location || '',
        latitude: initialData?.latitude || null,
        longitude: initialData?.longitude || null
    });

    const [permitFile, setPermitFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(initialData?.bannerUrl || null);

    // Update form when initialData changes (e.g., when opening modal for different item)
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                date: new Date(initialData.date).toISOString().split('T')[0],
                startTime: initialData.startTime,
                endTime: initialData.endTime,
                location: initialData.location,
                latitude: initialData.latitude || null,
                longitude: initialData.longitude || null
            });
            setBannerPreview(initialData.bannerUrl || null);
        } else {
            // Reset if switching to create mode
            setFormData({
                title: '', description: '', date: '', startTime: '', endTime: '', location: '',
                latitude: null, longitude: null
            });
            setBannerPreview(null);
        }
        setPermitFile(null);
        setBannerFile(null);
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationChange = (lat, lng) => {
        setFormData({ ...formData, latitude: lat, longitude: lng });
    };

    const handleLocationNameChange = (name) => {
        setFormData({ ...formData, location: name });
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Banner image must be less than 5MB');
                return;
            }
            setBannerFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        if (permitFile) {
            data.append('permit', permitFile);
        }
        if (bannerFile) {
            data.append('banner', bannerFile);
        }

        try {
            if (initialData) {
                // Update Mode
                await apiClient.put(`/campaigns/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Campaign updated successfully');
            } else {
                // Create Mode — redirect to payment page
                const response = await apiClient.post('/campaigns', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Campaign created! Redirecting to payment...');
                onCampaignCreated();
                onClose();
                // Navigate to payment page with the new campaign ID
                window.location.href = `/payment/${response.data.id}`;
                return;
            }
            onCampaignCreated();
            onClose();
        } catch (error) {
            console.error('Failed to save campaign', error);
            toast.error(error.response?.data?.error || 'Failed to save campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl transform transition-all my-8">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {initialData ? 'Edit Campaign' : 'Create Donation Campaign'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Campaign Details</h4>

                            <Input
                                label="Campaign Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Community Blood Drive"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                    placeholder="Details about the event..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    type="date"
                                    label="Date"
                                    name="date"
                                    value={formData.date}
                                    onChange={(e) => {
                                        const today = new Date().toISOString().split('T')[0];
                                        if (e.target.value < today) {
                                            toast.error("Campaign date cannot be in the past.");
                                            return;
                                        }
                                        handleChange(e);
                                    }}
                                    icon={FaCalendarAlt}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                <Input
                                    type="time"
                                    label="Start Time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    icon={FaClock}
                                    required
                                />
                                <Input
                                    type="time"
                                    label="End Time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    icon={FaClock}
                                    required
                                />
                            </div>
                        </div>

                        {/* Location Selection */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">
                                <FaMapMarkerAlt className="inline mr-2" />
                                Campaign Location
                            </h4>
                            <MapLocationPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                locationName={formData.location}
                                onLocationChange={handleLocationChange}
                                onLocationNameChange={handleLocationNameChange}
                            />
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Documents & Media</h4>

                            {/* Government Permit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Government Permission Letter {initialData ? '(Optional to update)' : '(Required)'}
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setPermitFile(e.target.files[0])}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required={!initialData}
                                />
                                {initialData?.governmentPermitUrl && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current: <a href={initialData.governmentPermitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View existing permit</a>
                                    </p>
                                )}
                            </div>

                            {/* Campaign Banner */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FaImage className="inline mr-2" />
                                    Campaign Banner/Poster (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Recommended: 1200x630px, Max 5MB (JPG, PNG)
                                </p>

                                {/* Banner Preview */}
                                {bannerPreview && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                                            <img
                                                src={bannerPreview}
                                                alt="Banner preview"
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" loading={loading}>
                                {initialData ? 'Update Campaign' : 'Create Campaign'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default CreateCampaignModal;
