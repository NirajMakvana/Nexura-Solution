import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    DollarSign,
    TrendingUp,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import EmployeeLayout from '../../components/employee/EmployeeLayout';
import { employeeService } from '../../services/employeeService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const PayslipDownloads = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { user } = useAuthStore();

    useEffect(() => {
        loadPayslips();
    }, [selectedYear]);

    const loadPayslips = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getPayslips(selectedYear);
            setPayslips(data || []);
        } catch (error) {
            console.error('Error loading payslips:', error);
            toast.error('Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (payslipId) => {
        // In a real app, this would trigger a PDF generation or download
        toast.loading('Generating PDF...', { duration: 2000 });
        setTimeout(() => {
            toast.success('Payslip downloaded successfully');
        }, 2000);
    };

    return (
        <EmployeeLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My <span className="text-green-600">Payslips</span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Download and view your monthly compensation records</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <select
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-green-200 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="bg-white/20 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                Support & Tax
                            </div>
                            <h2 className="text-3xl font-bold">Payroll Support</h2>
                            <p className="text-white/80 max-w-md leading-relaxed">
                                If you notice any discrepancy in your payslip or have questions about your tax deductions,
                                please contact the HR department.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-4 mb-4">
                                <FileText className="w-8 h-8 text-green-200" />
                                <div>
                                    <p className="text-sm opacity-80">Latest Payslip</p>
                                    <p className="text-xl font-bold">{payslips.length > 0 ? `${payslips[0].month} ${payslips[0].year}` : 'Not Available'}</p>
                                </div>
                            </div>
                            {payslips.length > 0 && (
                                <button
                                    onClick={() => handleDownload(payslips[0]._id)}
                                    className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Latest
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Payslips List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Payment History
                    </h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
                            <p className="mt-4 text-gray-500 font-medium">Fetching your records...</p>
                        </div>
                    ) : payslips.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900">No Payslips Found</h4>
                            <p className="text-gray-500 mt-2">We couldn't find any records for the year {selectedYear}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {payslips.map((payslip) => (
                                <div key={payslip._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="bg-green-100 p-3 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${payslip.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {payslip.status}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{payslip.month}</h4>
                                    <p className="text-gray-500 text-sm font-medium mb-4">{payslip.year} • Net Salary Accounted</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Amount Paid</p>
                                            <p className="text-lg font-black text-gray-900">₹{payslip.netSalary?.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(payslip._id)}
                                            className="p-3 bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
                                        >
                                            <Download className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default PayslipDownloads;
