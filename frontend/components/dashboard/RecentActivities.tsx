import { formatDistanceToNow } from 'date-fns';

interface Activity {
  _id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    'batch_created': '📚',
    'course_created': '📖',
    'month_created': '📅',
    'institution_created': '🏫',
    'student_added': '👤',
    'payment_received': '💰',
    'user_created': '👥',
    'system_started': '🚀',
  };
  return iconMap[type] || '📄';
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activities
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Activities will appear here when you start using the system
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activities
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })} by {activity.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}