import React, { useState } from 'react';
import { Calendar, Clock, Copy, Check, ChevronLeft, ChevronRight, Eye, Download, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const QuickAvail = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('17:00');
  const [showPreview, setShowPreview] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [projects, setProjects] = useState([
    { id: 'general', name: 'General', color: 'bg-blue-500' },
    { id: 'client', name: 'Client Meetings', color: 'bg-green-500' },
    { id: 'team', name: 'Team Sync', color: 'bg-purple-500' },
    { id: 'personal', name: 'Personal', color: 'bg-orange-500' }
  ]);
  const [selectedProject, setSelectedProject] = useState('general');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-blue-500');

  const steps = [
    { number: 1, title: 'Your Information', description: 'Enter your name and email' },
    { number: 2, title: 'Select Project', description: 'Choose or create a category' },
    { number: 3, title: 'Set Availability', description: 'Pick dates and times' },
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return personName.trim() && personEmail.trim() && emailRegex.test(personEmail);
      case 2:
        return selectedProject;
      case 3:
        return getSelectedCount() > 0;
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
    return date.toISOString().split('T')[0];
  };

  const toggleDate = (date) => {
    const dateKey = formatDateKey(date);
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (!newDates[selectedProject]) {
        newDates[selectedProject] = {};
      }
      
      if (newDates[selectedProject][dateKey]) {
        delete newDates[selectedProject][dateKey];
        if (Object.keys(newDates[selectedProject]).length === 0) {
          delete newDates[selectedProject];
        }
      } else {
        newDates[selectedProject][dateKey] = { quickSlots: [], customSlots: [] };
      }
      return newDates;
    });
  };

  const toggleTimeSlot = (date, timeSlotId) => {
    const dateKey = formatDateKey(date);
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (!newDates[selectedProject]) {
        newDates[selectedProject] = {};
      }
      if (!newDates[selectedProject][dateKey]) {
        newDates[selectedProject][dateKey] = { quickSlots: [], customSlots: [] };
      }
      
      const quickSlots = newDates[selectedProject][dateKey].quickSlots || [];
      if (quickSlots.includes(timeSlotId)) {
        newDates[selectedProject][dateKey].quickSlots = quickSlots.filter(slot => slot !== timeSlotId);
      } else {
        newDates[selectedProject][dateKey].quickSlots = [...quickSlots, timeSlotId];
      }
      
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
    const dateKey = formatDateKey(date);
    const startTime = customStartTime;
    const endTime = customEndTime;
    
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }
    
    const customSlot = {
      id: Date.now().toString(),
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
      
      newDates[selectedProject][dateKey].customSlots = [...(newDates[selectedProject][dateKey].customSlots || []), customSlot];
      return newDates;
    });
    
    setEditingDate(null);
    setCustomStartTime('09:00');
    setCustomEndTime('17:00');
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
        const date = new Date(dateKey);
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

  const generateLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    setGeneratedLink(`https://quickavail.com/view/${randomId}`);
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
    
    Object.values(selectedDates).forEach(projectDates => {
      Object.values(projectDates).forEach(dateData => {
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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step.number < currentStep ? 'bg-green-500 text-white' :
              step.number === currentStep ? 'bg-blue-500 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {step.number < currentStep ? <Check className="h-5 w-5" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Tell us about yourself
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={personEmail}
              onChange={(e) => setPersonEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why do we need this?</strong><br/>
              Your name and email will be shown to people viewing your availability so they know who to contact.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Choose or Create a Project Category</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowProjectForm(true)}
          >
            + Add Custom Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map(project => (
              <Button
                key={project.id}
                variant={selectedProject === project.id ? "default" : "outline"}
                className="h-auto p-4 flex items-center gap-3 justify-start"
                onClick={() => setSelectedProject(project.id)}
              >
                <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                <span className="font-medium">{project.name}</span>
              </Button>
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
            <CardTitle className="text-xl flex items-center gap-2">
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
                    <Badge className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs text-white ${projects.find(p => p.id === selectedProject)?.color || 'bg-blue-500'}`}>
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
                const date = new Date(dateKey);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={dateKey} className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-3">{dayName}, {dateStr}</h3>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Quick options:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {quickTimeSlots.map(slot => (
                          <Button
                            key={slot.id}
                            variant={dateData.quickSlots?.includes(slot.id) ? "default" : "outline"}
                            size="sm"
                            className="h-auto p-2 flex flex-col items-start"
                            onClick={() => toggleTimeSlot(date, slot.id)}
                          >
                            <div className="font-medium text-xs">{slot.label}</div>
                            <div className="text-xs opacity-75">{slot.time}</div>
                          </Button>
                        ))}
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
                            <Button size="sm" onClick={() => addCustomTimeSlot(date)}>
                              Add
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Your Availability Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">{personName}</p>
                  <p className="text-sm text-gray-600">{personEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${projects.find(p => p.id === selectedProject)?.color}`}></div>
                <span className="text-sm font-medium">{projects.find(p => p.id === selectedProject)?.name}</span>
                <span className="text-sm text-gray-500">• {getSelectedCount()} days selected</span>
                <span className="text-sm text-gray-500">• {formatHours(calculateTotalHours())}</span>
              </div>
            </div>

            {allEntries.length > 0 && (
              <div className="space-y-3">
                {allEntries.map(({ dateKey, dateData }) => {
                  const date = new Date(dateKey);
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

        <Card>
          <CardContent className="pt-6">
            {!generatedLink ? (
              <div className="text-center space-y-4">
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={generateLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    Generate Shareable Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="px-6 py-3 text-lg flex items-center gap-2"
                  >
                    <Eye className="h-5 w-5" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={exportToCSV}
                    className="px-6 py-3 text-lg flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Export CSV
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Generate a link to share your availability, preview how it looks, or export to spreadsheet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Link generated successfully!</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 p-3 border rounded-lg bg-gray-50 text-sm"
                  />
                  <Button onClick={copyLink} variant="outline" className="px-4">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Share this link with anyone who needs to know your availability. Link expires in 7 days.
                </p>
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
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
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
              <h1 className="text-2xl font-bold">Availability Schedule</h1>
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
              {projects.map(project => {
                const projectEntries = allEntries.filter(entry => entry.projectId === project.id);
                if (projectEntries.length === 0) return null;
                
                projectEntries.sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
                
                return (
                  <div key={project.id} className="border-l-4 pl-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                      <h2 className="text-xl font-semibold">{project.name}</h2>
                    </div>
                    
                    <div className="grid gap-3">
                      {projectEntries.map(({ dateKey, dateData }) => {
                        const date = new Date(dateKey);
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
      <div className="flex justify-between items-center mt-8">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <Button 
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    );
  };

  const getValidationMessage = () => {
    if (currentStep === 1) {
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
    if (currentStep === 3 && getSelectedCount() === 0) {
      return "Please select at least one day and time slot to continue.";
    }
    return null;
  };

  return (
    <div>
      {showPreview ? renderPreviewMode() : (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              QuickAvail
            </h1>
            <p className="text-gray-600">Create and share your availability in 4 simple steps</p>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          <div className="min-h-96">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Validation Message */}
          {getValidationMessage() && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm text-center">
                {getValidationMessage()}
              </p>
            </div>
          )}

          {/* Navigation */}
          {renderNavigationButtons()}
        </div>
      )}
    </div>
  );
};

export default QuickAvail;