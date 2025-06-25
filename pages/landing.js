// Landing page for QuickAvail
// URL: /landing (we'll make this the new homepage)

import Link from 'next/link'
import { useState } from 'react'
import { NextSeo, WebPageJsonLd, SoftwareAppJsonLd } from 'next-seo'
import { pageSEO } from '../lib/seo.config'
import { siteConfig, urls, structuredData } from '../lib/site.config'

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: '⚡',
      title: 'Create in 4 Steps',
      description: 'Select project → Set availability → Add contact info → Share link',
      demo: 'Simple 4-step process gets you sharing availability in under 2 minutes'
    },
    {
      icon: '🌍',
      title: 'Timezone Smart',
      description: 'Works perfectly across all timezones with automatic DST handling',
      demo: 'Your Edmonton schedule works perfectly with Tokyo colleagues'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Crypto-secure share IDs with automatic 7-day expiration',
      demo: 'Links expire automatically - no permanent data exposure'
    },
    {
      icon: '📱',
      title: 'Share Anywhere',
      description: 'Beautiful mobile-friendly links work on any device',
      demo: 'Slack, email, text - your availability looks great everywhere'
    }
  ]

  const useCases = [
    {
      title: 'Client Meetings',
      description: 'Share your availability with clients for consultations, demos, or project kickoffs',
      icon: '🤝',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Team Coordination',
      description: 'Coordinate with team members across different timezones for meetings and sprints',
      icon: '👥',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Interviews',
      description: 'Streamline hiring by sharing interview slots with candidates effortlessly',
      icon: '💼',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Personal Events',
      description: 'Organize family gatherings, social events, or personal appointments',
      icon: '🎉',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <>
      <NextSeo {...pageSEO.landing} />
      <WebPageJsonLd
        description={`${siteConfig.name} is a web application that allows users to create and share availability schedules instantly without any signup required.`}
        id={`${urls.home()}/#webpage`}
        lastReviewed={new Date().toISOString()}
        reviewedBy={{
          type: 'Organization',
          name: siteConfig.name
        }}
      />
      <SoftwareAppJsonLd
        name={siteConfig.name}
        price="0"
        priceCurrency="USD"
        aggregateRating={{ ratingValue: '4.9', reviewCount: '127' }}
        operatingSystem="Web Browser"
        applicationCategory="ProductivityApplication"
        keywords={siteConfig.keywords}
      />
      
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
            </div>
            
                         {/* Hero Title */}
             <h1 className="text-5xl md:text-6xl font-bold font-funnel bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
               Share Your Availability
               <br />
               <span className="text-4xl md:text-5xl">In Under 2 Minutes</span>
             </h1>
            
            {/* Hero Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Create beautiful, secure availability schedules that work perfectly across timezones. 
              No signups, no complexity - just quick, professional scheduling.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/create">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold font-funnel rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Create Schedule Now
                  <span className="ml-2">→</span>
                </button>
              </Link>
              <button 
                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/80 text-gray-700 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-300"
              >
                See How It Works
              </button>
            </div>
            
            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                No signup required
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Secure & private
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Works globally
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Mobile friendly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="demo" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl font-bold font-funnel text-gray-900 mb-4">
               Why QuickAvail?
             </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for the modern world of remote work and global collaboration
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{feature.icon}</div>
                                         <div>
                       <h3 className="text-xl font-semibold font-funnel text-gray-900 mb-2">
                         {feature.title}
                       </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Feature Demo */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
              <div className="text-center">
                <div className="text-6xl mb-6">{features[activeFeature].icon}</div>
                                 <h3 className="text-2xl font-bold font-funnel text-gray-900 mb-4">
                   {features[activeFeature].title}
                 </h3>
                <p className="text-lg text-gray-600">
                  {features[activeFeature].demo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl font-bold font-funnel text-gray-900 mb-4">
               Perfect For Any Scheduling Need
             </h2>
            <p className="text-xl text-gray-600">
              From business meetings to family gatherings
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className={`w-16 h-16 bg-gradient-to-r ${useCase.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{useCase.icon}</span>
                </div>
                                 <h3 className="text-xl font-semibold font-funnel text-gray-900 mb-3">
                   {useCase.title}
                 </h3>
                <p className="text-gray-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl font-bold font-funnel text-gray-900 mb-4">
               Simple 4-Step Process
             </h2>
            <p className="text-xl text-gray-600">
              Get sharing your availability in under 2 minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Select Project', desc: 'Choose or create a category for your availability' },
              { step: 2, title: 'Set Times', desc: 'Pick your available dates and time slots' },
              { step: 3, title: 'Add Info', desc: 'Enter your name, email, and expiration preferences' },
              { step: 4, title: 'Share Link', desc: 'Get a beautiful, secure link to share anywhere' }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                                 <h3 className="text-lg font-semibold font-funnel text-gray-900 mb-2">
                   {item.title}
                 </h3>
                <p className="text-gray-600 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                     <h2 className="text-4xl font-bold font-funnel text-white mb-6">
             Ready to Share Your Availability?
           </h2>
          <p className="text-xl text-blue-100 mb-10">
            Create your first schedule now - no signup required, completely free
          </p>
          <Link href="/create">
            <button className="px-10 py-5 bg-white text-blue-600 text-lg font-semibold font-funnel rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Create Your Schedule
              <span className="ml-2">🚀</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
            </div>
                         <h3 className="text-2xl font-bold font-funnel mb-2">QuickAvail</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              The fastest way to share your availability with anyone, anywhere in the world.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>Secure</span>
              <span>•</span>
              <span>Private</span>
              <span>•</span>
              <span>Global</span>
              <span>•</span>
              <span>Free</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
} 