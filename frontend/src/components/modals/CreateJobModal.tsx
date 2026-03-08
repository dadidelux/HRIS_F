import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { CreateJobPostingData } from '../../types';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateJobPostingData) => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateJobPostingData>({
    jobTitle: '',
    department: '',
    location: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    applicationDeadline: '',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (stepErrors[name]) {
      setStepErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleArrayChange = (
    field: 'requirements' | 'responsibilities',
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'requirements' | 'responsibilities') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (
    field: 'requirements' | 'responsibilities',
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.jobTitle.trim()) errors.jobTitle = 'Job Title is required.';
      if (!formData.department.trim()) errors.department = 'Department is required.';
      if (!formData.location.trim()) errors.location = 'Location is required.';
    } else if (currentStep === 2) {
      if (!formData.description.trim()) errors.description = 'Job Description is required.';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter((r) => r.trim() !== ''),
      responsibilities: formData.responsibilities.filter((r) => r.trim() !== ''),
    };
    onCreate(cleanedData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStepErrors({});
    setFormData({
      jobTitle: '',
      department: '',
      location: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      applicationDeadline: '',
    });
    onClose();
  };

  const steps = [
    'Basic Information',
    'Job Description',
    'Requirements & Responsibilities',
    'Application Details',
  ];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Job Posting
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-6">
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentStep > index + 1
                        ? 'bg-green-500 text-white'
                        : currentStep === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {step}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 min-h-[300px]">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Datalist options */}
                <datalist id="jobTitleOptions">
                  <option value="Software Engineer" />
                  <option value="Senior Software Engineer" />
                  <option value="Frontend Developer" />
                  <option value="Backend Developer" />
                  <option value="Full Stack Developer" />
                  <option value="DevOps Engineer" />
                  <option value="Data Analyst" />
                  <option value="Data Scientist" />
                  <option value="Product Manager" />
                  <option value="Project Manager" />
                  <option value="UX Designer" />
                  <option value="UI Designer" />
                  <option value="Graphic Designer" />
                  <option value="Marketing Manager" />
                  <option value="Sales Representative" />
                  <option value="HR Specialist" />
                  <option value="Accountant" />
                  <option value="Financial Analyst" />
                  <option value="Operations Manager" />
                  <option value="Administrative Assistant" />
                  <option value="Customer Support Specialist" />
                  <option value="Business Analyst" />
                </datalist>
                <datalist id="departmentOptions">
                  <option value="Engineering" />
                  <option value="Product" />
                  <option value="Design" />
                  <option value="Analytics" />
                  <option value="Marketing" />
                  <option value="Sales" />
                  <option value="Human Resources" />
                  <option value="Finance" />
                  <option value="Operations" />
                  <option value="Administration" />
                  <option value="Customer Success" />
                  <option value="Legal" />
                  <option value="IT" />
                </datalist>
                <datalist id="locationOptions">
                  <option value="Remote" />
                  <option value="Quezon City, Philippines" />
                  <option value="Manila, Philippines" />
                  <option value="Makati, Philippines" />
                  <option value="Cebu City, Philippines" />
                  <option value="San Francisco, CA" />
                  <option value="New York, NY" />
                  <option value="Los Angeles, CA" />
                  <option value="Chicago, IL" />
                  <option value="Boston, MA" />
                  <option value="Seattle, WA" />
                  <option value="Austin, TX" />
                </datalist>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    list="jobTitleOptions"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Select or type a job title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stepErrors.jobTitle ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {stepErrors.jobTitle && <p className="text-red-500 text-xs mt-1">{stepErrors.jobTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    list="departmentOptions"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Select or type a department"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stepErrors.department ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {stepErrors.department && <p className="text-red-500 text-xs mt-1">{stepErrors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    list="locationOptions"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Select or type a location"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stepErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {stepErrors.location && <p className="text-red-500 text-xs mt-1">{stepErrors.location}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Job Description */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Enter a detailed description of the job position..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${stepErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {stepErrors.description && <p className="text-red-500 text-xs mt-1">{stepErrors.description}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Requirements & Responsibilities */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements & Qualifications
                  </label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) =>
                          handleArrayChange('requirements', index, e.target.value)
                        }
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities
                  </label>
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) =>
                          handleArrayChange(
                            'responsibilities',
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Responsibility ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem('responsibilities', index)
                          }
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('responsibilities')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Responsibility
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Application Details */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Job Title:</span>{' '}
                      {formData.jobTitle || 'Not set'}
                    </p>
                    <p>
                      <span className="font-medium">Department:</span>{' '}
                      {formData.department || 'Not set'}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {formData.location || 'Not set'}
                    </p>
                    <p>
                      <span className="font-medium">Deadline:</span>{' '}
                      {formData.applicationDeadline || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  Create Job Posting
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
