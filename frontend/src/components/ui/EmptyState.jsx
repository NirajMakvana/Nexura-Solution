import { Inbox } from 'lucide-react'

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = '', action = null }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>}
            {action && action}
        </div>
    )
}

export default EmptyState
