import { FaTimes, FaPhone, FaUser, FaClock, FaComment } from 'react-icons/fa';
import ModalPortal from '../common/ModalPortal';
import Button from '../common/Button';

const ViewResponsesModal = ({ isOpen, onClose, responses = [] }) => {
    if (!isOpen) return null;

    // Filter only accepted responses or show all with status badge
    // Usually org wants to see who accepted first
    const sortedResponses = [...responses].sort((a, b) => {
        if (a.status === 'ACCEPTED' && b.status !== 'ACCEPTED') return -1;
        if (a.status !== 'ACCEPTED' && b.status === 'ACCEPTED') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const getStatusBadge = (status) => {
        const styles = {
            ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Donor Responses</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {responses.filter(r => r.status === 'ACCEPTED').length} accepted, {responses.length} total
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto grow">
                        {sortedResponses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No responses yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedResponses.map((response) => (
                                    <div
                                        key={response.id}
                                        className={`p-4 rounded-lg border ${response.status === 'ACCEPTED'
                                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-gray-400" />
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {response.donor.name}
                                                </span>
                                                {getStatusBadge(response.status)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(response.createdAt).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-3">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <FaPhone className="text-gray-400" />
                                                <a href={`tel:${response.donor.phone}`} className="hover:underline">
                                                    {response.donor.phone || 'No phone'}
                                                </a>
                                            </div>

                                            {response.donor.email && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <span className="text-gray-400">@</span>
                                                    <span>{response.donor.email}</span>
                                                </div>
                                            )}

                                            {response.estimatedArrival && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 sm:col-span-2">
                                                    <FaClock className="text-gray-400" />
                                                    <span>
                                                        Estimated Arrival: {new Date(response.estimatedArrival).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            {response.notes && (
                                                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300 sm:col-span-2">
                                                    <FaComment className="text-gray-400 mt-1" />
                                                    <span className="italic">"{response.notes}"</span>
                                                </div>
                                            )}

                                            {response.donor.donorProfile?.bloodGroup && (
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                                                        {response.donor.donorProfile.bloodGroup.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-end shrink-0">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default ViewResponsesModal;
