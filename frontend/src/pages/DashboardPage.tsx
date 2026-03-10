import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import MetricsCard from '../components/dashboard/MetricsCard';
import CategoryCard from '../components/dashboard/CategoryCard';
import RecruitmentPhasesSection from '../components/dashboard/RecruitmentPhasesSection';
import { apiService, DashboardStats, JobCategory, RecruitmentPhase } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [recruitmentPhases, setRecruitmentPhases] = useState<RecruitmentPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isHrOrAdmin = user?.role === 'hr' || user?.role === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const requests: Promise<any>[] = [
          apiService.getDashboardStats(),
          apiService.getJobCategories(),
        ];
        if (isHrOrAdmin) {
          requests.push(apiService.getRecruitmentPhases());
        }
        const [statsData, categoriesData, phasesData] = await Promise.all(requests);
        setStats(statsData);
        setCategories(categoriesData);
        if (phasesData) setRecruitmentPhases(phasesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isHrOrAdmin]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.full_name || stats?.user.full_name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your HR system today
        </p>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <MetricsCard
            title="Total Job Postings"
            value={stats?.total_job_postings || 0}
            icon={Briefcase}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <MetricsCard
            title="Active Postings"
            value={stats?.active_job_postings || 0}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <MetricsCard
            title="Interviews"
            value={stats?.total_interviews || 0}
            icon={Calendar}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Recruitment Pipeline — HR/Admin only */}
        {isHrOrAdmin && (
          <RecruitmentPhasesSection phases={recruitmentPhases} />
        )}

        {/* Job Categories */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Job Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.name}
                  name={category.name}
                  count={category.count}
                  icon={category.icon}
                />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No job postings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by creating your first job posting to see category statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
