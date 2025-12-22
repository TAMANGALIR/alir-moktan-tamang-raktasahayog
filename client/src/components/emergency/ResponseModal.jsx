import { useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import Button from '../common/Button';

const ResponseModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [note, setNote] = useState('');
    const [eta, setEta] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate estimated arrival date object if eta is provided (in minutes)
        let estimatedArrival = null;
        if (eta) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + parseInt(eta));
            estimatedArrival = now.toISOString();
        }

        onConfirm({ note, estimatedArrival });
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Acceptance</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Estimated Arrival (Minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                                placeholder="e.g. 15"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Message to Hospital (Optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="I'm leaving now..."
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex items-center gap-2" disabled={loading}>
                                <FaPaperPlane className="text-sm" />
                                {loading ? 'Sending...' : 'Confirm & Send'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default ResponseModal;
