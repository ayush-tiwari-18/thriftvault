import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <div className="space-y-8 text-sm md:text-base leading-relaxed">
        {/* Introduction */}
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Privacy Policy describes how <strong>8178308335</strong> and its affiliates (collectively "8178308335, we, our, us")
            collect, use, share, protect or otherwise process your information/personal data through our website 
            <a href="https://thriftvault.vercel.app" className="text-blue-600 hover:underline"> https://thriftvault.vercel.app</a> (hereinafter referred to as Platform).
          </p>
          <p className="mt-3">
            By visiting this Platform, providing your information or availing any product/service offered on the Platform, 
            you expressly agree to be bound by the terms and conditions of this Privacy Policy and the laws of India.
          </p>
        </section>

        {/* Collection */}
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Collection of Information</h2>
          <p>
            We collect your personal data when you use our Platform or services. This includes, but is not limited to: 
            name, date of birth, address, telephone/mobile number, email ID, and proof of identity. Sensitive personal data, 
            such as bank account or payment instrument information, is collected only with your consent and in accordance 
            with applicable laws.
          </p>
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Usage of Data</h2>
          <p>
            We use personal data to provide requested services, assist in fulfilling orders, resolve disputes, 
            inform you about updates, and protect against error or fraud. You may opt-out of marketing communications at any time.
          </p>
        </section>

        {/* Sharing */}
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Sharing of Information</h2>
          <p>
            We may share your data with group entities, logistics partners, and payment issuers to facilitate services. 
            We may also disclose data to law enforcement if required by law or in good faith belief that such 
            disclosure is necessary to comply with legal processes.
          </p>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-xl font-semibold mb-3">5. Security Precautions</h2>
          <p>
            We adopt reasonable security practices to protect your data. However, as internet transmission is 
            not completely secure, users are responsible for protecting their account login and password records.
          </p>
        </section>

        {/* Grievance Officer Section - Filled with your details */}
        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-12">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Grievance Officer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Name:</p>
              <p className="text-base mb-3">Ayush Tiwari</p>
              
              <p className="text-xs font-bold uppercase text-slate-500">Designation:</p>
              <p className="text-base mb-3">Founder</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Address:</p>
              <p className="text-base mb-3">IIT Ropar, Rupnagar, Punjab - 140001</p>
              
              <p className="text-xs font-bold uppercase text-slate-500">Contact Details:</p>
              <p className="text-base">Phone: 8178308335</p>
              <p className="text-xs text-slate-500 italic">Mon - Fri (9:00 - 18:00)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy