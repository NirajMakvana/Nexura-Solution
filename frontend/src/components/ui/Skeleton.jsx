import React from 'react'

export const SkeletonBox = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
)

export const SkeletonText = ({ lines = 1, className = '', lastLineShort = false }) => (
    <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
            <div
                key={i}
                className={`animate-pulse bg-gray-200 rounded h-4 ${className} ${lastLineShort && i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            ></div>
        ))}
    </div>
)

export const SkeletonAvatar = ({ className = 'w-12 h-12' }) => (
    <div className={`animate-pulse bg-gray-200 rounded-full ${className}`}></div>
)

export const TableSkeleton = ({ columns = 5, rows = 5 }) => (
    <div className="w-full bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {[...Array(columns)].map((_, i) => (
                            <th key={i} className="px-6 py-4 text-left">
                                <div className="animate-pulse bg-gray-200 rounded h-3 w-20"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[...Array(rows)].map((_, r) => (
                        <tr key={r}>
                            {[...Array(columns)].map((_, c) => (
                                <td key={c} className="px-6 py-4">
                                    {c === 0 ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-pulse bg-gray-200 rounded-full h-10 w-10"></div>
                                            <div className="space-y-2">
                                                <div className="animate-pulse bg-gray-200 rounded h-3 w-24"></div>
                                                <div className="animate-pulse bg-gray-200 rounded h-2 w-16"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`animate-pulse bg-gray-200 rounded h-3 ${c === columns - 1 ? 'w-16' : 'w-24'}`}></div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)

export const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
                <SkeletonAvatar className="w-12 h-12" />
                <div>
                    <SkeletonBox className="h-4 w-24 mb-2" />
                    <SkeletonBox className="h-3 w-16" />
                </div>
            </div>
            <SkeletonBox className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-3 mb-4 mt-6">
            <SkeletonBox className="h-3 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-3 w-2/3" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
        </div>
    </div>
)
