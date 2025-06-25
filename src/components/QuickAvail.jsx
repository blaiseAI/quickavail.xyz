import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check, ChevronLeft, ChevronRight, Eye, Download, User, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';

const QuickAvail = ({ initialData = null, readOnly = false }) => {
  const [currentStep, setCurrentStep] = useState(readOnly ? 4 : 1);
  const [selectedDates, setSelectedDates] = useState(initialData?.selectedDates || {});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [generatedLink, setGeneratedLink] = useState(readOnly ? (initialData?.shareUrl || '') : '');
  const [copied, setCopied] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('17:00');
  const [showPreview, setShowPreview] = useState(false);
  const [personName, setPersonName] = useState(initialData?.personName || '');
  const [personEmail, setPersonEmail] = useState(initialData?.personEmail || '');
  const [expirationDays, setExpirationDays] = useState(7);
  const [projects, setProjects] = useState(initialData?.projects || [
    { id: 'general', name: 'General', color: 'bg-blue-500' },
    { id: 'client', name: 'Client Meetings', color: 'bg-green-500' },
    { id: 'team', name: 'Team Sync', color: 'bg-purple-500' },
    { id: 'personal', name: 'Personal', color: 'bg-orange-500' }
  ]);
  const [selectedProject, setSelectedProject] = useState(initialData?.selectedProject || 'general');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-blue-500');
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);

  const steps = [
    { number: 1, title: 'Select Project', description: 'Choose or create a category' },
    { number: 2, title: 'Set Availability', description: 'Pick dates and times' },
    { number: 3, title: 'Your Information', description: 'Enter your name and email' },
    { number: 4, title: 'Review & Share', description: 'Generate link or export' }
  ];

  const projectColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const quickTimeSlots = [
    { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM' },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 5:00 PM' },
    { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM' }
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return selectedProject;
      case 2:
        return getSelectedCount() > 0;
      case 3:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return personName.trim() && personEmail.trim() && emailRegex.test(personEmail);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      color: newProjectColor
    };
    
    setProjects(prev => [...prev, newProject]);
    setNewProjectName('');
    setShowProjectForm(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date) => {
    // Use local timezone to avoid date shifting issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (dateKey) => {
    // Parse dateKey (YYYY-MM-DD) safely in local timezone
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  };

  const toggleDate = (date) => {
    const dateKey = formatDateKey(date);
    console.log('toggleDate called:', { date: date.toISOString(), dateKey, selectedProject });
    
    setSelectedDates(prev => {
      const newDates = { ...prev };
      
      if (!newDates[selectedProject]) {
        newDates[selectedProject] = {};
      }
      
      if (newDates[selectedProject][dateKey]) {
        console.log('Removing date:', dateKey);
        // Create new project object without the date
        const { [dateKey]: removed, ...restDates } = newDates[selectedProject];
        
        if (Object.keys(restDates).length === 0) {
          // Remove the entire project if no dates left
          const { [selectedProject]: removedProject, ...restProjects } = newDates;
          return restProjects;
        } else {
          newDates[selectedProject] = restDates;
        }
      } else {
        console.log('Adding date:', dateKey);
        // Create new project object with the new date
        newDates[selectedProject] = {
          ...newDates[selectedProject],
          [dateKey]: { quickSlots: [], customSlots: [] }
        };
      }
      
      console.log('Updated selectedDates:', newDates);
      return newDates;
    });
  };

  const toggleTimeSlot = (date, timeSlotId) => {
    const dateKey = formatDateKey(date);
    console.log('toggleTimeSlot called:', { date: date.toISOString(), dateKey, timeSlotId, selectedProject });
    
    setSelectedDates(prev => {
      // Create completely new objects to ensure React detects the change
      const newDates = { ...prev };
      
      if (!newDates[selectedProject]) {
        newDates[selectedProject] = {};
      }
      
      if (!newDates[selectedProject][dateKey]) {
        newDates[selectedProject][dateKey] = { quickSlots: [], customSlots: [] };
      }
      
      // Create a new project object
      newDates[selectedProject] = {
        ...newDates[selectedProject],
        [dateKey]: {
          ...newDates[selectedProject][dateKey],
          quickSlots: [...(newDates[selectedProject][dateKey].quickSlots || [])],
          customSlots: [...(newDates[selectedProject][dateKey].customSlots || [])]
        }
      };
      
      const quickSlots = newDates[selectedProject][dateKey].quickSlots;
      console.log('Current quickSlots for', dateKey, ':', quickSlots);
      
      if (quickSlots.includes(timeSlotId)) {
        newDates[selectedProject][dateKey].quickSlots = quickSlots.filter(slot => slot !== timeSlotId);
        console.log('Removed timeSlot:', timeSlotId);
      } else {
        newDates[selectedProject][dateKey].quickSlots = [...quickSlots, timeSlotId];
        console.log('Added timeSlot:', timeSlotId);
      }
      
      console.log('Updated selectedDates after timeSlot toggle:', newDates);
      return newDates;
    });
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const addCustomTimeSlot = (date) => {
    // Prevent double-clicking/rapid submissions
    if (isAddingTimeSlot) return;
    setIsAddingTimeSlot(true);
    
    const dateKey = formatDateKey(date);
    const startTime = customStartTime;
    const endTime = customEndTime;
    
    if (startTime >= endTime) {
      alert('End time must be after start time');
      setIsAddingTimeSlot(false);
      return;
    }
    
    // Generate a more unique ID to prevent duplicates
    const customSlot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime,
      endTime,
      display: `${formatTime(startTime)} - ${formatTime(endTime)}`
    };
    
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (!newDates[selectedProject]) {
        newDates[selectedProject] = {};
      }
      if (!newDates[selectedProject][dateKey]) {
        newDates[selectedProject][dateKey] = { quickSlots: [], customSlots: [] };
      }
      
      // Check if a similar slot already exists to prevent duplicates
      const existingSlots = newDates[selectedProject][dateKey].customSlots || [];
      const slotExists = existingSlots.some(slot => 
        slot.startTime === startTime && slot.endTime === endTime
      );
      
      if (!slotExists) {
        newDates[selectedProject][dateKey].customSlots = [...existingSlots, customSlot];
      }
      
      return newDates;
    });
    
    setEditingDate(null);
    setCustomStartTime('09:00');
    setCustomEndTime('17:00');
    
    // Reset the flag after a short delay
    setTimeout(() => setIsAddingTimeSlot(false), 100);
  };

  const removeCustomTimeSlot = (date, slotId) => {
    const dateKey = formatDateKey(date);
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (newDates[selectedProject] && newDates[selectedProject][dateKey] && newDates[selectedProject][dateKey].customSlots) {
        newDates[selectedProject][dateKey].customSlots = newDates[selectedProject][dateKey].customSlots.filter(slot => slot.id !== slotId);
      }
      return newDates;
    });
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Date', 'Day', 'Project', 'Time Slots', 'Hours']);
    
    Object.entries(selectedDates).forEach(([projectId, projectDates]) => {
      const project = projects.find(p => p.id === projectId);
      Object.entries(projectDates).forEach(([dateKey, dateData]) => {
        const date = parseDateKey(dateKey);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const allTimes = [];
        let dayHours = 0;
        
        // Quick slots
        if (dateData.quickSlots) {
          dateData.quickSlots.forEach(slotId => {
            const slot = quickTimeSlots.find(s => s.id === slotId);
            if (slot) {
              allTimes.push(slot.time);
              if (slotId === 'morning') dayHours += 3;
              if (slotId === 'afternoon') dayHours += 5;
              if (slotId === 'evening') dayHours += 3;
            }
          });
        }
        
        // Custom slots
        if (dateData.customSlots) {
          dateData.customSlots.forEach(slot => {
            allTimes.push(slot.display);
            const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
            const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
            const diffMs = endTime - startTime;
            const diffHours = diffMs / (1000 * 60 * 60);
            dayHours += diffHours;
          });
        }
        
        csvData.push([dateStr, dayName, project?.name || projectId, allTimes.join('; '), dayHours]);
      });
    });
    
    // Add total row
    csvData.push(['', '', '', 'TOTAL HOURS:', calculateTotalHours()]);
    
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${personName || personEmail || 'availability'}_schedule.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState('');

  const generateLink = async () => {
    if (!personName.trim() || !personEmail.trim()) {
      alert('Please fill in your name and email first.');
      return;
    }

    if (!selectedProject) {
      alert('Please select at least one project type first.');
      return;
    }

    if (Object.keys(selectedDates).length === 0) {
      alert('Please select at least one available time slot.');
      return;
    }

    setIsGeneratingLink(true);
    
    try {
      // Detect user's timezone for consistent expiration handling
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName,
          personEmail,
          selectedProject,
          projects,
          selectedDates,
          expirationDays,
          userTimezone
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule');
      }

      const data = await response.json();
      
      setGeneratedLink(data.shareUrl);
      setCurrentStep(4);
      
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Failed to generate link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentMonth);
  const today = new Date();

  const getSelectedCount = () => {
    return Object.values(selectedDates).reduce((total, projectDates) => 
      total + Object.keys(projectDates).length, 0
    );
  };

  const calculateTotalHours = () => {
    let totalHours = 0;
    
    // Only calculate hours for the currently selected project
    const projectData = selectedDates[selectedProject];
    if (!projectData) return totalHours;
    
    Object.values(projectData).forEach(dateData => {
      // Quick slots hours
      if (dateData.quickSlots) {
        dateData.quickSlots.forEach(slotId => {
          if (slotId === 'morning') totalHours += 3; // 9AM-12PM = 3 hours
          if (slotId === 'afternoon') totalHours += 5; // 12PM-5PM = 5 hours  
          if (slotId === 'evening') totalHours += 3; // 5PM-8PM = 3 hours
        });
      }
      
      // Custom slots hours
      if (dateData.customSlots) {
        dateData.customSlots.forEach(slot => {
          const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
          const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
          const diffMs = endTime - startTime;
          const diffHours = diffMs / (1000 * 60 * 60);
          totalHours += diffHours;
        });
      }
    });
    
    return totalHours;
  };

  const formatHours = (hours) => {
    if (hours === 0) return '0 hours';
    if (hours === 1) return '1 hour';
    if (hours % 1 === 0) return `${hours} hours`;
    return `${hours.toFixed(1)} hours`;
  };

  const renderProgressBar = () => (
    <div className="relative max-w-4xl mx-auto mb-12">
      {/* Background line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
      
      {/* Progress line */}
      <div 
        className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>
      
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-3 transition-all duration-300 ${
              step.number <= currentStep 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg transform scale-105' 
                : 'bg-white text-gray-400 border-gray-300 shadow-sm'
            }`}>
              {step.number <= currentStep ? (
                step.number === currentStep ? (
                  step.number
                ) : (
                  <Check className="h-5 w-5" />
                )
              ) : (
                step.number
              )}
            </div>
            <div className="mt-3 text-center max-w-24">
              <div className={`text-sm font-semibold font-funnel transition-colors duration-300 ${
                step.number <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <h2 className="text-3xl font-bold font-funnel bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 mx-auto">
          <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold font-funnel">
          Almost done! Who should people contact?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <p className="text-base text-green-800 text-center">
              🎉 <strong>Great job!</strong> You've set up your availability. Now let people know who to contact when they see your schedule.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold font-funnel mb-3 text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold font-funnel mb-3 text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={personEmail}
                onChange={(e) => setPersonEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-base font-semibold font-funnel mb-3 text-gray-700">
                Link Expiration
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white"
              >
                <option value={1}>1 day (expires tomorrow)</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week (default)</option>
                <option value={14}>2 weeks</option>
                <option value={21}>3 weeks</option>
                <option value={30}>1 month (maximum)</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Your shared link will automatically expire after this time period for security and privacy.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>Contact Information</strong><br/>
                This will be shown on your shared schedule so people know who to contact for booking.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
              <p className="text-sm text-green-800 text-center">
                <strong>Link expires in {expirationDays} {expirationDays === 1 ? 'day' : 'days'}</strong><br/>
                {expirationDays <= 3 ? 'Short expiration for maximum privacy' : 
                 expirationDays <= 7 ? 'Standard expiration period' : 
                 'Extended access for ongoing scheduling'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl font-bold font-funnel">What type of availability are you sharing?</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowProjectForm(true)}
            className="bg-white/80 hover:bg-white border-gray-200 shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span className="hidden sm:inline">+ Add Custom Project</span>
            <span className="sm:hidden">+ Add Custom</span>
          </Button>
        </div>
        <p className="text-gray-600 text-base mt-2">
          Choose a category to help organize your availability. You can use one of our presets or create your own.
        </p>
      </CardHeader>
      <CardContent>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedProject === project.id ? 'scale-105' : ''
                }`}
                onClick={() => {
                  setSelectedProject(project.id);
                  // Clear any existing data for other projects to avoid confusion
                  setSelectedDates(prev => ({
                    [project.id]: prev[project.id] || {}
                  }));
                }}
              >
                <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedProject === project.id 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center shadow-sm`}>
                      <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg font-funnel text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">Perfect for scheduling</p>
                    </div>
                  </div>
                  {selectedProject === project.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {showProjectForm && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Client Calls, Interviews, Workshops"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Choose a Color</label>
                <div className="flex gap-2">
                  {projectColors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newProjectColor === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                      onClick={() => setNewProjectColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addProject}>Create Project</Button>
                <Button size="sm" variant="outline" onClick={() => setShowProjectForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {projects.find(p => p.id === selectedProject)?.name}<br/>
              You can create multiple availability schedules for different types of meetings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-funnel flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${projects.find(p => p.id === selectedProject)?.color || 'bg-blue-500'}`}></div>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              <span className="text-sm font-normal text-gray-600">
                - {projects.find(p => p.id === selectedProject)?.name}
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">Click days to mark your availability</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2"></div>;
              }
              
              const dateKey = formatDateKey(date);
              const isSelected = selectedDates[selectedProject] && selectedDates[selectedProject][dateKey];
              const isPast = date < today.setHours(0, 0, 0, 0);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div key={index} className="relative">
                  <Button
                    variant={isSelected ? "default" : "ghost"}
                    className={`w-full h-10 p-0 text-sm relative ${
                      isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                    } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => !isPast && toggleDate(date)}
                    disabled={isPast}
                  >
                    {date.getDate()}
                  </Button>
                  {isSelected && (selectedDates[selectedProject][dateKey]?.quickSlots?.length > 0 || selectedDates[selectedProject][dateKey]?.customSlots?.length > 0) && (
                    <Badge className={`absolute -top-2 -right-2 h-5 w-5 p-0 text-xs text-white flex items-center justify-center ${projects.find(p => p.id === selectedProject)?.color || 'bg-blue-500'}`}>
                      {(selectedDates[selectedProject][dateKey]?.quickSlots?.length || 0) + (selectedDates[selectedProject][dateKey]?.customSlots?.length || 0)}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {selectedDates[selectedProject] && Object.keys(selectedDates[selectedProject]).length > 0 && (
            <div className="mt-6 space-y-6">
              {Object.entries(selectedDates[selectedProject]).map(([dateKey, dateData]) => {
                const date = parseDateKey(dateKey);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={dateKey} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{dayName}, {dateStr}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDate(date)}
                        className="text-red-500 h-8 w-8 p-0 hover:bg-red-50"
                        title="Remove this date"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Quick options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {quickTimeSlots.map(slot => {
                          const isSelected = dateData.quickSlots?.includes(slot.id);
                          console.log(`Rendering ${slot.id} for ${dateKey}: selected=${isSelected}, quickSlots=${JSON.stringify(dateData.quickSlots)}`);
                          
                          return (
                            <Button
                              key={`${dateKey}-${slot.id}`}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="h-auto p-2 flex flex-col items-start"
                              onClick={() => toggleTimeSlot(date, slot.id)}
                            >
                              <div className="font-medium text-xs">{slot.label}</div>
                              <div className="text-xs opacity-75">{slot.time}</div>
                              <div className="text-xs text-red-500">{isSelected ? 'SELECTED' : 'NOT SELECTED'}</div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Custom times:</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingDate(dateKey)}
                          className="text-xs"
                        >
                          + Add Time
                        </Button>
                      </div>
                      
                      {dateData.customSlots && dateData.customSlots.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {dateData.customSlots.map(slot => (
                            <div key={slot.id} className="flex items-center justify-between bg-white p-2 rounded border">
                              <span className="text-sm font-medium">{slot.display}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomTimeSlot(date, slot.id)}
                                className="text-red-500 h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {editingDate === dateKey && (
                        <div className="bg-white p-3 rounded border space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={customStartTime}
                                onChange={(e) => setCustomStartTime(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">End Time</label>
                              <input
                                type="time"
                                value={customEndTime}
                                onChange={(e) => setCustomEndTime(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => addCustomTimeSlot(date)}
                              disabled={isAddingTimeSlot}
                            >
                              {isAddingTimeSlot ? 'Adding...' : 'Add'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingDate(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {getSelectedCount() === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <h3 className="font-medium text-yellow-800">Select at least one day</h3>
              <p className="text-sm text-yellow-700">
                Click on the calendar days when you're available, then choose your preferred time slots.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep4 = () => {
    const allEntries = Object.entries(selectedDates).flatMap(([projectId, projectDates]) => 
      Object.entries(projectDates).map(([dateKey, dateData]) => ({ projectId, dateKey, dateData }))
    );

    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold font-funnel">
              Your Availability Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Contact Info Card */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl mb-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{personName}</p>
                  <p className="text-base text-gray-600">{personEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${projects.find(p => p.id === selectedProject)?.color}`}></div>
                  <span className="font-semibold text-gray-700">{projects.find(p => p.id === selectedProject)?.name}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>📅 {getSelectedCount()} days</span>
                  <span>⏰ {formatHours(calculateTotalHours())}</span>
                </div>
              </div>
            </div>

            {allEntries.length > 0 && (
              <div className="space-y-3">
                {allEntries.map(({ dateKey, dateData }) => {
                  const date = parseDateKey(dateKey);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  const allTimes = [];
                  
                  if (dateData.quickSlots) {
                    dateData.quickSlots.forEach(slotId => {
                      const slot = quickTimeSlots.find(s => s.id === slotId);
                      if (slot) allTimes.push(slot.time);
                    });
                  }
                  
                  if (dateData.customSlots) {
                    dateData.customSlots.forEach(slot => {
                      allTimes.push(slot.display);
                    });
                  }
                  
                  return (
                    <div key={dateKey} className="p-3 bg-white border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{dayName}, {dateStr}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {allTimes.join(', ')}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-blue-600 ml-4">
                          {(() => {
                            let dayHours = 0;
                            if (dateData.quickSlots) {
                              dateData.quickSlots.forEach(slotId => {
                                if (slotId === 'morning') dayHours += 3;
                                if (slotId === 'afternoon') dayHours += 5;
                                if (slotId === 'evening') dayHours += 3;
                              });
                            }
                            if (dateData.customSlots) {
                              dateData.customSlots.forEach(slot => {
                                const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
                                const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
                                const diffMs = endTime - startTime;
                                const diffHours = diffMs / (1000 * 60 * 60);
                                dayHours += diffHours;
                              });
                            }
                            return formatHours(dayHours);
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Hours Summary */}
            {allEntries.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Total Available Time:</span>
                  <span className="text-xl font-bold text-blue-900">{formatHours(calculateTotalHours())}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Perfect for time tracking and billing purposes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            {!generatedLink ? (
              <div className="text-center space-y-6">
                {/* Error message */}
                {linkError && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 font-medium">{linkError}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold font-funnel text-gray-900">Ready to share your availability?</h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Generate a secure link to share your schedule, preview how it looks, or export to CSV
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                  <Button 
                    onClick={generateLink}
                    disabled={isGeneratingLink}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-200"
                  >
                    {isGeneratingLink ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating Link...
                      </>
                    ) : (
                      <>
                        🔗 Generate Shareable Link
                      </>
                    )}
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      className="px-6 py-4 text-lg flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 rounded-xl shadow-sm"
                      disabled={isGeneratingLink}
                    >
                      <Eye className="h-5 w-5" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={exportToCSV}
                      className="px-6 py-4 text-lg flex items-center gap-2 bg-white/80 hover:bg-white border-gray-200 rounded-xl shadow-sm"
                      disabled={isGeneratingLink}
                    >
                      <Download className="h-5 w-5" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-green-800 font-bold text-lg">Link generated successfully! 🎉</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold font-funnel text-gray-900">Your schedule is ready to share</h3>
                </div>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 bg-transparent text-base font-mono text-gray-700 outline-none"
                    />
                    <Button 
                      onClick={copyLink} 
                      variant="outline" 
                      className="px-4 py-2 bg-white hover:bg-gray-50 border-gray-300 rounded-lg shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="ml-2 text-green-600 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="ml-2">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border-gray-200 rounded-xl shadow-sm"
                    >
                      <Eye className="h-5 w-5" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border-gray-200 rounded-xl shadow-sm"
                    >
                      <Download className="h-5 w-5" />
                      Export CSV
                    </Button>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-base text-blue-800">
                      <strong>Share this link</strong> with anyone who needs to know your availability.<br/>
                      <span className="text-sm">🔒 Secure link • ⏰ Expires in 7 days</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPreviewMode = () => {
    const allEntries = Object.entries(selectedDates).flatMap(([projectId, projectDates]) => 
      Object.entries(projectDates).map(([dateKey, dateData]) => ({ projectId, dateKey, dateData }))
    );

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          {!readOnly && (
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
          )}
          <div className={`flex gap-2 ${readOnly ? 'ml-auto' : ''}`}>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold font-funnel">Availability Schedule</h1>
            </div>
            {personName && (
              <p className="text-lg text-gray-700 font-medium">{personName}</p>
            )}
            {personEmail && (
              <p className="text-base text-gray-600">{personEmail}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {allEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No availability scheduled
            </div>
          ) : (
            <div className="space-y-6">
              {projects.filter(project => project.id === selectedProject).map(project => {
                const projectEntries = allEntries.filter(entry => entry.projectId === project.id);
                if (projectEntries.length === 0) return null;
                
                projectEntries.sort((a, b) => parseDateKey(a.dateKey) - parseDateKey(b.dateKey));
                
                return (
                  <div key={project.id} className="border-l-4 pl-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                      <h2 className="text-xl font-semibold">{project.name}</h2>
                    </div>
                    
                    <div className="grid gap-3">
                      {projectEntries.map(({ dateKey, dateData }) => {
                        const date = parseDateKey(dateKey);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        const dateStr = date.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        });
                        
                        const allTimes = [];
                        
                        if (dateData.quickSlots) {
                          dateData.quickSlots.forEach(slotId => {
                            const slot = quickTimeSlots.find(s => s.id === slotId);
                            if (slot) allTimes.push(slot.time);
                          });
                        }
                        
                        if (dateData.customSlots) {
                          dateData.customSlots.forEach(slot => {
                            allTimes.push(slot.display);
                          });
                        }
                        
                        return (
                          <div key={dateKey} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-gray-900">
                                {dayName}, {dateStr}
                              </div>
                              <div className="text-sm font-medium text-blue-600 ml-4">
                                {(() => {
                                  let dayHours = 0;
                                  if (dateData.quickSlots) {
                                    dateData.quickSlots.forEach(slotId => {
                                      if (slotId === 'morning') dayHours += 3;
                                      if (slotId === 'afternoon') dayHours += 5;
                                      if (slotId === 'evening') dayHours += 3;
                                    });
                                  }
                                  if (dateData.customSlots) {
                                    dateData.customSlots.forEach(slot => {
                                      const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
                                      const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
                                      const diffMs = endTime - startTime;
                                      const diffHours = diffMs / (1000 * 60 * 60);
                                      dayHours += diffHours;
                                    });
                                  }
                                  return formatHours(dayHours);
                                })()}
                              </div>
                            </div>
                            <div className="text-gray-700">
                              {allTimes.map((time, index) => (
                                <span key={index} className="inline-block bg-white px-2 py-1 rounded text-sm mr-2 mb-1">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
            <p>Created with QuickAvail • Link expires in 7 days</p>
            {generatedLink && (
              <p className="mt-1">Share this link: {generatedLink}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNavigationButtons = () => {
    if (showPreview) return null;

    return (
      <div className="flex justify-between items-center mt-12 max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-medium bg-white/80 hover:bg-white border-gray-200 shadow-sm disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
          <div className="text-base font-medium text-gray-700">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {currentStep < 4 ? (
          <Button 
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-24"></div>
        )}
      </div>
    );
  };

  const getValidationMessage = () => {
    if (currentStep === 2 && getSelectedCount() === 0) {
      return "Please select at least one day and time slot to continue.";
    }
    if (currentStep === 3) {
      if (!personName.trim()) {
        return "Please enter your full name to continue.";
      }
      if (!personEmail.trim()) {
        return "Please enter your email address to continue.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personEmail)) {
        return "Please enter a valid email address (e.g., name@domain.com).";
      }
    }
    return null;
  };

  // Show preview mode for read-only shares OR when preview is enabled
  if (readOnly || showPreview) {
    return renderPreviewMode();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8 relative">
          {/* Back to Home button - top left */}
          <div className="absolute top-0 left-0">
            <Link href="/">
                             <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-funnel bg-white/80 hover:bg-white border-gray-200 shadow-sm">
                 <Home className="h-4 w-4" />
                 Back to Home
               </Button>
            </Link>
          </div>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-funnel bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            QuickAvail
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and share your availability in 4 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content */}
        <div className="min-h-96">
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep1()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Validation Message */}
        {getValidationMessage() && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl shadow-sm">
            <p className="text-yellow-800 text-sm text-center font-medium">
              {getValidationMessage()}
            </p>
          </div>
        )}

        {/* Navigation */}
        {renderNavigationButtons()}
      </div>
    </div>
  );
};

export default QuickAvail;