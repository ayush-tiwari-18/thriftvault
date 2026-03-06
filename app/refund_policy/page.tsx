import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4">Privacy Policy</h1>
      
      <section className="space-y-6 text-sm md:text-base">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Privacy Policy describes how <strong>8178308335</strong> and its affiliates 
            (collectively "8178308335, we, our, us") collect, use, share, protect or 
            otherwise process your information/personal data through our website 
            <a href="https://thriftvault.vercel.app" className="text-blue-600 underline ml-1">
              https://thriftvault.vercel.app
            </a> (hereinafter referred to as Platform).
          </p>
          <p className="mt-2">
            By visiting this Platform, providing your information or availing any 
            product/service offered on the Platform, you expressly agree to be bound by 
            the terms and conditions of this Privacy Policy and the laws of India.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Collection of Information</h2>
          <p>
            We collect your personal data when you use our Platform or services. This 
            includes but is not limited to: name, date of birth, address, telephone/mobile 
            number, email ID, and proof of identity. Sensitive data like bank account 
            or payment instrument information is collected only with your consent 
            in accordance with applicable laws.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Usage of Data</h2>
          <p>
            We use personal data to provide the services you request, assist business 
            partners in fulfilling orders, resolve disputes, and detect/protect us 
            against error, fraud, and other criminal activity.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Security Precautions</h2>
          <p>
            To protect your personal data from unauthorised access, we adopt reasonable 
            security practices and adhere to security guidelines. While we offer a 
            secure server, the transmission of information over the internet is not 
            completely secure for reasons beyond our control.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-10">
          <h2 className="text-xl font-semibold mb-4">Grievance Officer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs">Name:</p>
              <p className="mb-3 text-base">Ayush Tiwari</p>
              
              <p className="font-bold text-slate-500 uppercase text-xs">Designation:</p>
              <p className="mb-3 text-base">Founder</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs">Company Address:</p>
              <p className="mb-3 text-base">IIT Ropar, Rupnagar, Punjab - 140001</p>
              
              <p className="font-bold text-slate-500 uppercase text-xs">Contact:</p>
              <p className="text-base">Phone: 8178308335</p>
              <p className="text-xs text-slate-400 italic">Mon - Fri (9:00 - 18:00)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;