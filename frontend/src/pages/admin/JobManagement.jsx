import { useState, useEffect } from 'react'
import {
    Briefcase,
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    MapPin,
    Clock,
    DollarSign,
    Filter,
    X
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { TableSkeleton } from '../../components/ui/Skeleton'
import ConfirmModal from '../../components/ui/ConfirmModal'

const JobManagement = () => {
    const [activeTab, setActiveTab] = useState('jobs') // 'jobs' or 'applications'
    const [jobs, setJobs] = useState([])
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    // Modals
    const [showJobModal, setShowJobModal] = useState(false)
    const [showAppModal, setShowAppModal] = useState(false)
    const [selectedJob, setSelectedJob] = useState(null)
    const [selectedApp, setSelectedApp] = useState(null)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null })

    // Job Form State
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        experience: '',
        description: '',
        salary: '',
        status: 'Open',
        requirements: '',
        responsibilities: ''
    })

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'jobs') {
                const data = await adminService.getAdminJobs()
                setJobs(data)
            } else {
                const data = await adminService.getJobApplications()
                setApplications(data)
            }
        } catch (error) {
            console.error(`Error loading ${activeTab}:`, error)
            toast.error(`Failed to load ${activeTab}`)
        } finally {
            setLoading(false)
        }
    }

    // --- JOB ACTIONS ---
    const handleOpenJobModal = (job = null) => {
        if (job) {
            setSelectedJob(job)
            setFormData({
                title: job.title,
                department: job.department,
                location: job.location,
                type: job.type,
                experience: job.experience,
                description: job.description,
                salary: job.salary || '',
                status: job.status,
                requirements: job.requirements ? job.requirements.join('\n') : '',
                responsibilities: job.responsibilities ? job.responsibilities.join('\n') : ''
            })
        } else {
            setSelectedJob(null)
            setFormData({
                title: '',
                department: '',
                location: '',
                type: 'Full-time',
                experience: '',
                description: '',
                salary: '',
                status: 'Open',
                requirements: '',
                responsibilities: ''
            })
        }
        setShowJobModal(true)
    }

    const handleJobSubmit = async (e) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
                responsibilities: formData.responsibilities.split('\n').filter(r => r.trim() !== '')
            }

            if (selectedJob) {
                await adminService.updateJob(selectedJob._id, payload)
                toast.success('Job updated successfully')
            } else {
                await adminService.createJob(payload)
                toast.success('Job posted successfully')
            }
            setShowJobModal(false)
            fetchData()
        } catch (error) {
            toast.error('Failed to save job.')
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteJob = async () => {
        const id = confirmModal.id
        setConfirmModal({ isOpen: false, id: null })
        setActionLoading(true)
        try {
            await adminService.deleteJob(id)
            toast.success('Job deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete job')
            console.error(error)
        } finally {
            setActionLoading(false)
        }
    }

    // --- APPLICATION ACTIONS ---
    const handleUpdateAppStatus = async (id, status) => {
        setActionLoading(true)
        try {
            await adminService.updateJobApplicationStatus(id, { status })
            toast.success(`Application marked as ${status}`)
            fetchData()
            if (selectedApp) setSelectedApp({ ...selectedApp, status })
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setActionLoading(false)
        }
    }

    // --- FILTERS ---
    const filteredData = activeTab === 'jobs'
        ? jobs.filter(j =>
            (filterStatus === 'all' || j.status === filterStatus) &&
            ((j.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (j.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
        )
        : applications.filter(a =>
            (filterStatus === 'all' || a.status === filterStatus) &&
            ((a.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (a.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
        )

    const stats = {
        totalJobs: jobs.length,
        openJobs: jobs.filter(j => j.status === 'Open').length,
        totalApps: applications.length,
        pendingApps: applications.filter(a => a.status === 'Pending').length
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': case 'Shortlisted': case 'Hired': return 'bg-green-100 text-green-800'
            case 'Pending': case 'Reviewing': return 'bg-yellow-100 text-yellow-800'
            case 'Closed': case 'Rejected': return 'bg-red-100 text-red-800'
            case 'On Hold': return 'bg-gray-100 text-gray-800'
            default: return 'bg-blue-100 text-blue-800'
        }
    }

    return (
        <>
        <AdminLayout>
            <div className="p-1 md:p-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Career & Recruitment</h1>
                        <p className="text-gray-600 mt-1">Manage job postings and applications</p>
                    </div>
                    {activeTab === 'jobs' && (
                        <button
                            onClick={() => handleOpenJobModal()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Post New Job
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => { setActiveTab('jobs'); setSearchTerm(''); setFilterStatus('all') }}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Job Postings</div>
                    </button>
                    <button
                        onClick={() => { setActiveTab('applications'); setSearchTerm(''); setFilterStatus('all') }}
                        className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Applications</div>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Postings', value: stats.totalJobs, color: 'blue', icon: Briefcase },
                        { label: 'Active Postings', value: stats.openJobs, color: 'green', icon: CheckCircle },
                        { label: 'Total Applications', value: stats.totalApps, color: 'purple', icon: Users },
                        { label: 'Pending Reviews', value: stats.pendingApps, color: 'yellow', icon: Clock },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            {activeTab === 'jobs' ? (
                                <>
                                    <option value="Open">Open</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Closed">Closed</option>
                                </>
                            ) : (
                                <>
                                    <option value="Pending">Pending</option>
                                    <option value="Reviewing">Reviewing</option>
                                    <option value="Shortlisted">Shortlisted</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Hired">Hired</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Dynamic Table Content */}
                {loading ? (
                    <div className="bg-white border rounded-xl p-6 shadow-sm"><TableSkeleton rows={4} columns={5} /></div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white border rounded-xl p-12 text-center text-gray-500 shadow-sm">
                        {activeTab === 'jobs' ? <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" /> : <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />}
                        No data found for the given criteria.
                    </div>
                ) : (
                    <div className="bg-white shadow-sm border rounded-xl overflow-hidden hidden md:block">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {activeTab === 'jobs' ? (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Applied</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exp.</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                        {activeTab === 'jobs' ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                                    <div className="text-sm text-gray-500 flex items-center mt-0.5">
                                                        <MapPin className="w-3 h-3 mr-1" />{item.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.department}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleOpenJobModal(item)} className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => setConfirmModal({ isOpen: true, id: item._id })} className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{item.firstName} {item.lastName}</div>
                                                    <div className="text-sm text-gray-500">{item.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.job?.title || 'General / Unknown'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{item.experience}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setSelectedApp(item); setShowAppModal(true); }} className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {item.status !== 'Shortlisted' && item.status !== 'Hired' && (
                                                            <button
                                                                onClick={() => handleUpdateAppStatus(item._id, 'Shortlisted')}
                                                                disabled={actionLoading}
                                                                className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 text-xs font-medium"
                                                            >
                                                                Shortlist
                                                            </button>
                                                        )}
                                                        {item.status !== 'Hired' && (
                                                            <button
                                                                onClick={() => handleUpdateAppStatus(item._id, 'Hired')}
                                                                disabled={actionLoading}
                                                                className="bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 text-xs font-medium"
                                                            >
                                                                Hire
                                                            </button>
                                                        )}
                                                        {item.status !== 'Rejected' && (
                                                            <button
                                                                onClick={() => handleUpdateAppStatus(item._id, 'Rejected')}
                                                                disabled={actionLoading}
                                                                className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 text-xs font-medium"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* JOB MODAL */}
                {showJobModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold">{selectedJob ? 'Edit Job Posting' : 'Create New Job'}</h2>
                                <button onClick={() => setShowJobModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium mb-1">Job Title</label><input required className="w-full border rounded-lg p-2.5" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                                    <div><label className="block text-sm font-medium mb-1">Department</label><input required className="w-full border rounded-lg p-2.5" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                                    <div><label className="block text-sm font-medium mb-1">Location</label><input required className="w-full border rounded-lg p-2.5" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Remote (India)" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Experience</label><input required className="w-full border rounded-lg p-2.5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g. 2-4 years" /></div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Job Type</label>
                                        <select className="w-full border rounded-lg p-2.5" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option><option value="Full-time Remote">Full-time Remote</option>
                                        </select>
                                    </div>
                                    <div><label className="block text-sm font-medium mb-1">Salary Range</label><input className="w-full border rounded-lg p-2.5" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. $50k - $80k (Optional)" /></div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Job Description</label>
                                    <textarea required className="w-full border rounded-lg p-2.5 min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Requirements (One per line)</label>
                                    <textarea required className="w-full border rounded-lg p-2.5 min-h-[100px]" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="ReactJS&#10;NodeJS..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Responsibilities (One per line)</label>
                                    <textarea required className="w-full border rounded-lg p-2.5 min-h-[100px]" value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select className="w-full border rounded-lg p-2.5" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Open">Open</option><option value="On Hold">On Hold</option><option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div className="border-t pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{actionLoading ? 'Saving...' : 'Save Job'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* APPLICATION DETAIL MODAL */}
                {showAppModal && selectedApp && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold">Application Details</h2>
                                <button onClick={() => setShowAppModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 space-y-6">

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedApp.firstName} {selectedApp.lastName}</h3>
                                        <p className="text-gray-500 mt-1">{selectedApp.email} • {selectedApp.phone}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg">
                                    <div><span className="text-gray-500 block mb-1">Applied For</span><span className="font-medium">{selectedApp.job?.title || 'Unknown Job'}</span></div>
                                    <div><span className="text-gray-500 block mb-1">Experience</span><span className="font-medium">{selectedApp.experience}</span></div>
                                    <div><span className="text-gray-500 block mb-1">Location</span><span className="font-medium">{selectedApp.location || 'N/A'}</span></div>
                                    <div><span className="text-gray-500 block mb-1">Notice Period</span><span className="font-medium">{selectedApp.noticePeriod || 'N/A'}</span></div>
                                    {selectedApp.currentRole && <div className="col-span-2"><span className="text-gray-500 block mb-1">Current Role</span><span className="font-medium">{selectedApp.currentRole}</span></div>}
                                </div>

                                {(selectedApp.linkedinProfile || selectedApp.portfolio || selectedApp.resumeUrl) && (
                                    <div className="flex gap-4">
                                        {selectedApp.linkedinProfile && <a href={selectedApp.linkedinProfile} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-sm"><FileText className="w-4 h-4 mr-1" /> LinkedIn Profile</a>}
                                        {selectedApp.portfolio && <a href={selectedApp.portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-sm"><FileText className="w-4 h-4 mr-1" /> Portfolio URL</a>}
                                        {selectedApp.resumeUrl && <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}${selectedApp.resumeUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center font-medium bg-indigo-50 px-3 py-1.5 rounded-md"><FileText className="w-4 h-4 mr-2" /> View Attached Resume</a>}
                                    </div>
                                )}

                                {selectedApp.coverLetter && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Cover Letter</h4>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap bg-white border p-4 rounded-lg">{selectedApp.coverLetter}</p>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <h4 className="mb-3 font-semibold text-gray-900">Update Action</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pending', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateAppStatus(selectedApp._id, status)}
                                                disabled={actionLoading || selectedApp.status === status}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${selectedApp.status === status ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                                            >
                                                Mark as {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
        <ConfirmModal
            isOpen={confirmModal.isOpen}
            title="Delete Job Posting"
            message="Are you sure you want to delete this job posting? This may affect existing applications."
            confirmText="Delete"
            onConfirm={handleDeleteJob}
            onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        />
        </>
    )
}

export default JobManagement
