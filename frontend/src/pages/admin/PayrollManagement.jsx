import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    FileText,
    Download,
    Search,
    Filter,
    Plus,
    Trash2,
    Edit,
    CheckCircle,
    X,
    TrendingUp,
    Users,
    Calendar,
    ArrowRight
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const PayrollManagement = () => {
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingPayslip, setEditingPayslip] = useState(null);
    const [formData, setFormData] = useState({
        employee: '',
        month: 'January',
        year: new Date().getFullYear(),
        basicSalary: 0,
        hra: 0,
        allowances: 0,
        deductions: 0,
        status: 'Pending',
        paymentDate: ''
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [payslipData, employeeData] = await Promise.all([
                adminService.getPayslips(),
                adminService.getEmployees()
            ]);
            setPayslips(payslipData);
            setEmployees(employeeData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeChange = (employeeId) => {
        const selectedEmp = employees.find(emp => emp._id === employeeId);
        if (selectedEmp) {
            // Auto-fill salary details if available, otherwise use defaults
            setFormData({
                ...formData,
                employee: employeeId,
                basicSalary: Number(selectedEmp.salary?.basic) || Number(selectedEmp.basicSalary) || 25000,
                hra: Number(selectedEmp.salary?.hra) || Number(selectedEmp.hra) || 5000,
                allowances: Number(selectedEmp.salary?.allowances) || Number(selectedEmp.allowances) || 2000,
                deductions: Number(selectedEmp.salary?.deductions) || Number(selectedEmp.deductions) || 0
            });
        } else {
            setFormData({ ...formData, employee: employeeId });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPayslip) {
                await adminService.updatePayslip(editingPayslip._id, formData);
                toast.success('Payslip updated successfully');
            } else {
                await adminService.createPayslip(formData);
                toast.success('Payslip generated successfully');
            }
            setShowModal(false);
            setEditingPayslip(null);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payslip?')) return;
        try {
            await adminService.deletePayslip(id);
            toast.success('Payslip deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete payslip');
        }
    };

    const filteredPayslips = payslips.filter(p => {
        const name = `${p.employee?.firstName} ${p.employee?.lastName}`.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
            p.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = p.year === parseInt(filterYear);
        const matchesMonth = filterMonth === 'All' || p.month === filterMonth;
        return matchesSearch && matchesYear && matchesMonth;
    });

    const stats = {
        totalPaid: payslips.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netSalary, 0),
        pendingCount: payslips.filter(p => p.status === 'Pending').length,
        totalExpenses: payslips.reduce((sum, p) => sum + p.netSalary, 0),
        avgSalary: payslips.length > 0 ? (payslips.reduce((sum, p) => sum + p.netSalary, 0) / payslips.length) : 0
    };

    return (
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                        <p className="text-gray-600 mt-1">Generate and manage employee compensation records</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingPayslip(null);
                            setFormData({
                                employee: '',
                                month: months[new Date().getMonth()],
                                year: new Date().getFullYear(),
                                basicSalary: 0,
                                hra: 0,
                                allowances: 0,
                                deductions: 0,
                                status: 'Pending',
                                paymentDate: ''
                            });
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Payslip
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Payroll Expenses', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: DollarSign, color: 'blue' },
                        { label: 'Pending Payments', value: stats.pendingCount, icon: FileText, color: 'orange' },
                        { label: 'Total Paid Amount', value: `₹${stats.totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'green' },
                        { label: 'Avg. Employee Salary', value: `₹${Math.round(stats.avgSalary).toLocaleString()}`, icon: TrendingUp, color: 'purple' }
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
                            className="flex-1 md:w-40 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option value="All">All Months</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            className="flex-1 md:w-32 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Salary</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-4 text-gray-500 font-medium">Loading payroll records...</p>
                                        </td>
                                    </tr>
                                ) : filteredPayslips.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-xl font-bold">No records found</p>
                                            <p className="mt-1">Try adjusting your filters or search terms</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayslips.map((payslip) => (
                                        <tr key={payslip._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {payslip.employee?.firstName?.[0]}{payslip.employee?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{payslip.employee?.firstName} {payslip.employee?.lastName}</p>
                                                        <p className="text-sm text-gray-500 font-medium tracking-tight">ID: {payslip.employee?.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {payslip.month} {payslip.year}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                ₹{payslip.netSalary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${payslip.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                    payslip.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {payslip.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPayslip(payslip);
                                                            setFormData({
                                                                employee: payslip.employee._id,
                                                                month: payslip.month,
                                                                year: payslip.year,
                                                                basicSalary: payslip.basicSalary,
                                                                hra: payslip.hra,
                                                                allowances: payslip.allowances,
                                                                deductions: payslip.deductions,
                                                                status: payslip.status,
                                                                paymentDate: payslip.paymentDate?.split('T')[0] || ''
                                                            });
                                                            setShowModal(true);
                                                        }}
                                                        className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(payslip._id)}
                                                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingPayslip ? 'Edit Payslip' : 'Generate New Payslip'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-2 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Select Employee</label>
                                        <select
                                            required
                                            disabled={!!editingPayslip}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.employee}
                                            onChange={(e) => handleEmployeeChange(e.target.value)}
                                        >
                                            <option value="">Choose an employee</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Month & Year</label>
                                        <div className="flex gap-2">
                                            <select
                                                required
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={formData.month}
                                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                            >
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                required
                                                className="w-24 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            >
                                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    {[
                                        { label: 'Basic Salary', key: 'basicSalary' },
                                        { label: 'HRA', key: 'hra' },
                                        { label: 'Allowances', key: 'allowances' },
                                        { label: 'Deductions', key: 'deductions' }
                                    ].map(field => (
                                        <div key={field.key} className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">{field.label}</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={formData[field.key] || 0}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Payment Status</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                            <option value="Processing">Processing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Payment Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={formData.paymentDate}
                                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {editingPayslip ? 'Save Changes' : 'Generate Payslip'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default PayrollManagement;
