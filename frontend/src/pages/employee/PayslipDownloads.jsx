import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Loader2,
    CheckCircle,
    Clock,
    IndianRupee
} from 'lucide-react';
import EmployeeLayout from '../../components/employee/EmployeeLayout';
import { employeeService } from '../../services/employeeService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const PayslipDownloads = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const { user } = useAuthStore();
    const employeeName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Employee';
    const employeeId = user?.employeeId || user?._id?.slice(-6)?.toUpperCase() || 'N/A';

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

    const handleDownload = (payslip) => {
        const element = document.getElementById('payslip-pdf-template');
        if (!element) return;

        // Populate hidden template with payslip data
        document.getElementById('pdf-emp-name').textContent = employeeName;
        document.getElementById('pdf-emp-id').textContent = employeeId;
        document.getElementById('pdf-period').textContent = `${payslip.month} ${payslip.year}`;
        document.getElementById('pdf-status').textContent = payslip.status;
        document.getElementById('pdf-basic').textContent = `₹${(payslip.basicSalary || 0).toLocaleString()}`;
        document.getElementById('pdf-hra').textContent = `₹${(payslip.hra || 0).toLocaleString()}`;
        document.getElementById('pdf-allowances').textContent = `₹${(payslip.allowances || 0).toLocaleString()}`;
        document.getElementById('pdf-deductions').textContent = `₹${(payslip.deductions || 0).toLocaleString()}`;
        document.getElementById('pdf-net').textContent = `₹${(payslip.netSalary || 0).toLocaleString()}`;
        document.getElementById('pdf-payment-date').textContent = payslip.paymentDate
            ? new Date(payslip.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
            : '—';

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Payslip_${employeeName.replace(' ', '_')}_${payslip.month}_${payslip.year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        toast.loading('Generating PDF...', { id: 'payslip-pdf' });
        html2pdf().set(opt).from(element).save()
            .then(() => {
                toast.dismiss('payslip-pdf');
                toast.success('Payslip downloaded successfully');
            })
            .catch(() => {
                toast.dismiss('payslip-pdf');
                toast.error('Failed to generate PDF');
            });
    };

    const totalPaid = payslips.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const latestPayslip = payslips[0] || null;

    return (
        <EmployeeLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
                        <p className="text-sm text-gray-500 mt-0.5">View and download your monthly compensation records</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent bg-white"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Payslips</p>
                            <p className="text-xl font-bold text-gray-900">{payslips.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Paid ({selectedYear})</p>
                            <p className="text-xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Latest Period</p>
                            <p className="text-xl font-bold text-gray-900">
                                {latestPayslip ? `${latestPayslip.month.slice(0, 3)} ${latestPayslip.year}` : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payslips List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">Payment History</h2>
                        <span className="text-xs text-gray-400">{payslips.length} record{payslips.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deductions</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <Loader2 className="w-7 h-7 animate-spin text-green-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Loading payslips...</p>
                                        </td>
                                    </tr>
                                ) : payslips.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No records available for {selectedYear}
                                        </td>
                                    </tr>
                                ) : (
                                    payslips.map((payslip) => (
                                        <tr key={payslip._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{payslip.month} {payslip.year}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{(payslip.basicSalary || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">−₹{(payslip.deductions || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{(payslip.netSalary || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                                    payslip.status === 'Paid'
                                                        ? 'bg-green-100 text-green-700'
                                                        : payslip.status === 'Processing'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {payslip.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {payslip.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedPayslip(payslip)}
                                                        className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 text-sm"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(payslip)}
                                                        className="bg-teal-50 text-teal-600 py-2 px-3 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1 text-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        PDF
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

                {/* Payslip Detail Modal */}
                {selectedPayslip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Payslip Details</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{selectedPayslip.month} {selectedPayslip.year}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Breakdown */}
                            <div className="p-6 space-y-3">
                                {[
                                    { label: 'Basic Salary', value: selectedPayslip.basicSalary, color: 'text-gray-900' },
                                    { label: 'HRA', value: selectedPayslip.hra, color: 'text-gray-900' },
                                    { label: 'Allowances', value: selectedPayslip.allowances, color: 'text-gray-900' },
                                    { label: 'Deductions', value: selectedPayslip.deductions, color: 'text-red-600', minus: true },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className={`font-medium ${item.color}`}>
                                            {item.minus ? '−' : '+'} ₹{(item.value || 0).toLocaleString()}
                                        </span>
                                    </div>
                                ))}

                                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">Net Salary</span>
                                    <span className="text-lg font-bold text-green-600">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                    <span>Status</span>
                                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                                        selectedPayslip.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>{selectedPayslip.status}</span>
                                </div>
                                {selectedPayslip.paymentDate && (
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Payment Date</span>
                                        <span>{new Date(selectedPayslip.paymentDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-6 flex gap-3">
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDownload(selectedPayslip)}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* HR Note */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-lg mt-0.5">
                        <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-green-800">Payroll Support</p>
                        <p className="text-xs text-green-700 mt-0.5">
                            For any discrepancy in your payslip or questions about tax deductions, please contact the HR department.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div id="payslip-pdf-template" style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', fontFamily: 'Arial, sans-serif', background: '#fff', padding: '40px' }}>
                {/* Company Header */}
                <div style={{ borderBottom: '3px solid #16a34a', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', margin: 0 }}>NEXURA</h1>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>nexura.com | hr@nexura.com</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>PAYSLIP</h2>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>Period: <span id="pdf-period" style={{ fontWeight: '600', color: '#111827' }}></span></p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>Payment Date: <span id="pdf-payment-date" style={{ fontWeight: '600', color: '#111827' }}></span></p>
                    </div>
                </div>

                {/* Employee Info */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Name</p>
                        <p id="pdf-emp-name" style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee ID</p>
                        <p id="pdf-emp-id" style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                        <p id="pdf-status" style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a', margin: 0 }}></p>
                    </div>
                </div>

                {/* Salary Breakdown Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                    <thead>
                        <tr style={{ background: '#16a34a' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', color: '#fff', fontSize: '12px', fontWeight: '600' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>Basic Salary</td>
                            <td id="pdf-basic" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#111827' }}></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>House Rent Allowance (HRA)</td>
                            <td id="pdf-hra" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#111827' }}></td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>Other Allowances</td>
                            <td id="pdf-allowances" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#111827' }}></td>
                        </tr>
                    </tbody>
                    <thead>
                        <tr style={{ background: '#dc2626' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#fff', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deductions</th>
                            <th style={{ padding: '10px 16px', textAlign: 'right', color: '#fff', fontSize: '12px', fontWeight: '600' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff5f5' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>Total Deductions</td>
                            <td id="pdf-deductions" style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#dc2626' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Net Salary */}
                <div style={{ background: '#16a34a', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>NET SALARY</p>
                    <p id="pdf-net" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}></p>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>This is a computer-generated payslip and does not require a signature.</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Generated on {new Date().toLocaleDateString('en-IN')}</p>
                </div>
            </div>
        </EmployeeLayout>
    );
};

export default PayslipDownloads;
