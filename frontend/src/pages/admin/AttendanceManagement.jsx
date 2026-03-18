import { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    Users,
    Search,
    Download,
    MapPin,
    CheckCircle,
    XCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const AttendanceManagement = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, [selectedDate, selectedEmployee]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                date: selectedDate,
                employee: selectedEmployee === 'all' ? undefined : selectedEmployee
            };
            const [attendanceData, employeeData] = await Promise.all([
                adminService.getAttendance(params),
                adminService.getEmployees()
            ]);
            setAttendance(attendanceData || []);
            setEmployees(employeeData || []);
        } catch (error) {
            console.error('Error loading attendance:', error);
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Absent': return 'bg-red-100 text-red-700';
            case 'Late': return 'bg-yellow-100 text-yellow-700';
            case 'Half Day': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredAttendance = attendance.filter(a => {
        const name = `${a.employee?.firstName} ${a.employee?.lastName}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) ||
            a.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                        <p className="text-gray-600 mt-1">Monitor employee clock-in times and daily presence</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Export Day
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Present Today', value: attendance.filter(a => a.status === 'Present').length, icon: CheckCircle, color: 'green' },
                        { label: 'Late Arrivals', value: attendance.filter(a => a.status === 'Late').length, icon: Clock, color: 'yellow' },
                        { label: 'Early Leavers', value: attendance.filter(a => a.clockOut && a.totalHours < 8).length, icon: XCircle, color: 'red' },
                        { label: 'Total Logs', value: attendance.length, icon: Users, color: 'blue' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            className="flex-1 md:w-64 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock In</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Out</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-4 text-gray-500 font-medium">Loading attendance records...</p>
                                        </td>
                                    </tr>
                                ) : filteredAttendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-xl font-bold">No records found</p>
                                            <p className="mt-1">Try adjusting your filters or search terms</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendance.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {record.employee?.firstName?.[0]}{record.employee?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{record.employee?.firstName} {record.employee?.lastName}</p>
                                                        <p className="text-sm text-gray-500 font-medium tracking-tight">ID: {record.employee?.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                    {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-medium text-xs">
                                                    {record.totalHours ? `${record.totalHours}h` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                                    <MapPin className="w-4 h-4 opacity-50" />
                                                    {record.location || 'Office'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AttendanceManagement;
