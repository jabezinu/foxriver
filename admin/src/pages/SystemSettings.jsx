import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiCog, HiRefresh, HiCash } from 'react-icons/hi';
import { getApiUrl } from '../config/api.config';

export default function SystemSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [processingSalaries, setProcessingSalaries] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/admin/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if response is HTML (backend not running)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not running or API endpoint not found');
            }

            const data = await response.json();

            if (data.success && data.settings) {
                setSettings(data.settings);
            } else if (data.success && data.data) {
                setSettings(data.data);
            } else {
                toast.error('Failed to fetch system settings');
                console.error('API Response:', data);
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
            toast.error(error.message || 'Failed to fetch system settings. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const toggleTasks = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tasksDisabled: !settings?.tasksDisabled
                })
            });

            const data = await response.json();

            if (data.success) {
                // The backend returns either data.settings or data.data
                setSettings(data.settings || data.data);
                toast.success(`Tasks ${!settings?.tasksDisabled ? 'disabled' : 'enabled'} successfully`);
            } else {
                toast.error('Failed to update task status');
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Failed to update task status');
        } finally {
            setUpdating(false);
        }
    };

    const toggleFrontend = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    frontendDisabled: !settings?.frontendDisabled
                })
            });

            // Check if response is HTML (backend not running)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not running or API endpoint not found');
            }

            const data = await response.json();

            if (data.success && data.settings) {
                setSettings(data.settings);
                toast.success(`Frontend ${!settings?.frontendDisabled ? 'disabled' : 'enabled'} successfully`);
            } else if (data.success && data.data) {
                setSettings(data.data);
                toast.success(`Frontend ${!settings?.frontendDisabled ? 'disabled' : 'enabled'} successfully`);
            } else {
                toast.error('Failed to update frontend status');
                console.error('API Response:', data);
            }
        } catch (error) {
            console.error('Error updating frontend status:', error);
            toast.error(error.message || 'Failed to update frontend status. Please ensure the backend server is running.');
        } finally {
            setUpdating(false);
        }
    };



    const processSalaries = async () => {
        if (!confirm('Are you sure you want to process monthly salaries for all eligible users? This will credit their income wallets.')) {
            return;
        }

        setProcessingSalaries(true);
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/admin/salaries/process`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`${data.message}\nTotal Paid: ${data.totalPaid} ETB`);
            } else {
                toast.error(data.message || 'Failed to process salaries');
            }
        } catch (error) {
            console.error('Error processing salaries:', error);
            toast.error('Failed to process salaries');
        } finally {
            setProcessingSalaries(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                Loading System Settings...
            </div>
        );
    }

    // Show error state if settings couldn't be loaded
    if (!settings) {
        return (
            <div className="animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-sm text-gray-500">Manage system-wide configuration and controls.</p>
                    </div>
                    <button
                        onClick={fetchSettings}
                        className="admin-btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-wider w-full md:w-auto justify-center"
                    >
                        <HiRefresh />
                        Retry
                    </button>
                </div>

                <div className="admin-card">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiCog className="text-2xl text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend Server Not Available</h3>
                        <p className="text-gray-600 mb-6">
                            Unable to connect to the backend server. Please ensure the backend is running on port 5000.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                            <p className="text-sm font-semibold text-gray-700 mb-2">To fix this issue:</p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Navigate to the backend directory</li>
                                <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">npm start</code></li>
                                <li>Ensure MongoDB is running</li>
                                <li>Refresh this page</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-sm text-gray-500">Manage system-wide configuration and controls.</p>
                </div>
                <button
                    onClick={fetchSettings}
                    className="admin-btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-wider w-full md:w-auto justify-center"
                >
                    <HiRefresh />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salary Processing */}
                <div className="admin-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Salary Processing</h3>
                        <HiCash className="text-2xl text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 mb-3">
                                <span className="font-bold">Automatic Processing:</span> The system automatically processes salaries daily at 00:01 AM (Ethiopian Time). Users who meet the salary requirements will receive their monthly payment automatically.
                            </p>
                            <p className="text-xs text-blue-600">
                                ✓ Runs daily to check eligibility<br />
                                ✓ Prevents duplicate payments per month<br />
                                ✓ Credits income wallet automatically
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                                You can manually trigger salary processing for all eligible users. This is useful for testing or if you need to process salaries immediately.
                            </p>

                            <button
                                onClick={processSalaries}
                                disabled={processingSalaries}
                                className={`
                                    w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider
                                    flex items-center justify-center gap-2
                                    ${processingSalaries
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                                    }
                                    transition-all
                                `}
                            >
                                {processingSalaries ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <HiCash className="text-lg" />
                                        Process All Salaries Now
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-3 rounded-lg text-sm bg-yellow-50 text-yellow-700 border border-yellow-100">
                            <p className="font-semibold">⚠️ Important Notes</p>
                            <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                                <li>Users are only paid once per month</li>
                                <li>Only users meeting salary requirements are paid</li>
                                <li>Payment is credited to income wallet</li>
                                <li>All transactions are logged in the database</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Frontend Control */}
                <div className="admin-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Frontend Control</h3>
                        <HiCog className="text-2xl text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                                Control the visibility of the user-facing frontend. When disabled, users will see a blank white page instead of the application.
                            </p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">User Frontend</p>
                                    <p className="text-xs text-gray-500">
                                        Current Status: <span className={`font-bold ${settings?.frontendDisabled ? 'text-red-600' : 'text-green-600'}`}>
                                            {settings?.frontendDisabled ? 'DISABLED' : 'ENABLED'}
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={toggleFrontend}
                                    disabled={updating}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                        ${settings?.frontendDisabled ? 'bg-red-600' : 'bg-green-600'}
                                        ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span
                                        className={`
                                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                            ${settings?.frontendDisabled ? 'translate-x-6' : 'translate-x-1'}
                                        `}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className={`p-3 rounded-lg text-sm ${settings?.frontendDisabled ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            <p className="font-semibold">
                                {settings?.frontendDisabled ? '⚠️ Frontend is DISABLED' : '✅ Frontend is ENABLED'}
                            </p>
                            <p className="text-xs mt-1">
                                {settings?.frontendDisabled
                                    ? 'Users cannot access the application. They will see a white page.'
                                    : 'Users can access the application normally.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Task Control */}
                <div className="admin-card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Task Control</h3>
                        <HiCog className="text-2xl text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-3">
                                Control the availability of tasks for all users. When disabled, users will not see any tasks and cannot earn for the day.
                            </p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">Daily Tasks</p>
                                    <p className="text-xs text-gray-500">
                                        Current Status: <span className={`font-bold ${settings?.tasksDisabled ? 'text-red-600' : 'text-green-600'}`}>
                                            {settings?.tasksDisabled ? 'DISABLED' : 'ENABLED'}
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={toggleTasks}
                                    disabled={updating}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                        ${settings?.tasksDisabled ? 'bg-red-600' : 'bg-green-600'}
                                        ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <span
                                        className={`
                                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                            ${settings?.tasksDisabled ? 'translate-x-6' : 'translate-x-1'}
                                        `}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className={`p-3 rounded-lg text-sm ${settings?.tasksDisabled ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            <p className="font-semibold">
                                {settings?.tasksDisabled ? '⚠️ Tasks are DISABLED' : '✅ Tasks are ENABLED'}
                            </p>
                            <p className="text-xs mt-1">
                                {settings?.tasksDisabled
                                    ? 'Users cannot see or complete any tasks today.'
                                    : 'Users can see and complete tasks normally (except on Sundays).'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Information */}
                <div className="admin-card">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">System Information</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Commission Rate A</span>
                            <span className="font-semibold text-gray-800">{settings?.commissionPercentA}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Commission Rate B</span>
                            <span className="font-semibold text-gray-800">{settings?.commissionPercentB}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Commission Rate C</span>
                            <span className="font-semibold text-gray-800">{settings?.commissionPercentC}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Video Payment Amount</span>
                            <span className="font-semibold text-gray-800">{settings?.videoPaymentAmount} ETB</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Videos Per Day</span>
                            <span className="font-semibold text-gray-800">{settings?.videosPerDay}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600">Last Updated</span>
                            <span className="font-semibold text-gray-800">
                                {new Date(settings?.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
