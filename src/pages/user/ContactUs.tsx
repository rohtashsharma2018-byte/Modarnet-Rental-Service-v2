import React from "react";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Us</h1>
        <p className="text-slate-500">We're here to help with your laptop rental needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Registered Office</h3>
              <div className="mt-2 text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Modarnet Computer Networks Pvt Ltd.</p>
                <div className="flex items-start gap-2 pt-2">
                  <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p>Plot No. E-60-61, Mansaram Park,<br />Uttam Nagar, New Delhi - 110059</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Phone Number</h3>
              <p className="text-slate-600">96754 96755</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Email Address</h3>
              <p className="text-slate-600">client@modarnet.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center space-y-4">
          <h3 className="font-bold text-slate-800">Customer Support</h3>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Our support team is available Monday through Saturday, from 10:00 AM to 7:00 PM to assist you with any questions about rentals, inventory, or technical issues.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:client@modarnet.com" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              <Mail size={18} />
              Send an Email
            </a>
          </div>
      </div>
    </div>
  );
}
