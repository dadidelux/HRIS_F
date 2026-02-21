import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: 'Account',
    question: 'How do I update my profile information?',
    answer:
      'Go to the "My Profile" tab and click the "Edit Profile" button. You can update your bio, skills, phone, and address. Click "Save Changes" when done.',
  },
  {
    category: 'Account',
    question: 'How do I change my password?',
    answer:
      'Navigate to the "Settings" tab, enter your current password and new password, then click "Change Password".',
  },
  {
    category: 'Job Postings',
    question: 'How do I create a job posting?',
    answer:
      'Go to the "Job Postings" page from the sidebar, click "Create Job Posting", fill in the required information (title, department, location, description, requirements, etc.), and click "Create".',
  },
  {
    category: 'Job Postings',
    question: 'Can I edit or delete a job posting?',
    answer:
      'Yes! On the Job Postings page, each posting has an "Edit" and "Delete" button. Click Edit to modify the posting or Delete to remove it completely.',
  },
  {
    category: 'Dashboard',
    question: 'What metrics are shown on the dashboard?',
    answer:
      'The dashboard displays total users, total job postings, active job postings, and scheduled interviews. It also shows job postings grouped by department.',
  },
  {
    category: 'Applications',
    question: 'How do I apply for a job?',
    answer:
      'The applications feature will be available in the next update. You will be able to submit applications directly through the system.',
  },
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer:
      'The HRIS system works best on modern browsers including Chrome, Firefox, Safari, and Edge (latest versions).',
  },
  {
    category: 'Technical',
    question: 'Who can I contact for technical support?',
    answer:
      'Please contact your system administrator or HR department for technical support and assistance.',
  },
];

const HelpCenterTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Help Center</h3>
            <p className="text-sm text-gray-600">
              Find answers to frequently asked questions
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);

          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-md font-semibold text-gray-900 mb-3">{category}</h4>
              <div className="space-y-2">
                {categoryFAQs.map((faq) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <div
                      key={globalIndex}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : globalIndex)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No results found for "{searchTerm}"</p>
            <p className="text-sm text-gray-500 mt-2">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenterTab;
