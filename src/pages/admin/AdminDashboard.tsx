import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { RentalRequest, Laptop, PurchaseRequest } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ 
    requests: 0, 
    active: 0, 
    overdue: 0, 
    totalAssets: 0, 
    totalRentals: 0,
    pendingPurchases: 0
  });

  useEffect(() => {
    // Rental Requests
    const reqQ = query(collection(db, "rentalRequests"));
    const unsubReq = onSnapshot(reqQ, (snapshot) => {
      let reqs = 0, active = 0, overdue = 0, totalRentals = 0;
      snapshot.forEach(doc => {
        const d = doc.data() as RentalRequest;
        if (d.status === "pending") reqs++;
        if (d.status === "active" || d.status === "approved" || d.status === "overdue") {
          totalRentals += (d.totalCost || 0);
        }
        if (d.status === "active" || d.status === "approved") active++;
        if (d.status === "overdue") overdue++;
      });
      setStats(prev => ({ ...prev, requests: reqs, active, overdue, totalRentals }));
    }, err => console.error(err));

    // Purchase Requests
    const pReqQ = query(collection(db, "purchaseRequests"));
    const unsubPReq = onSnapshot(pReqQ, (snapshot) => {
      let reqs = 0;
      snapshot.forEach(doc => {
        const d = doc.data() as PurchaseRequest;
        if (d.status === "pending") reqs++;
      });
      setStats(prev => ({ ...prev, pendingPurchases: reqs }));
    }, err => console.error(err));

    const laptopQ = query(collection(db, "laptops"));
    const unsubLaptops = onSnapshot(laptopQ, (snapshot) => {
      let assets = 0;
      snapshot.forEach(doc => {
        const d = doc.data() as Laptop;
        assets += (d.price || 0);
      });
      setStats(prev => ({ ...prev, totalAssets: assets }));
    }, err => console.error(err));

    return () => {
      unsubReq();
      unsubPReq();
      unsubLaptops();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Admin Portal: {user?.displayName || 'Administrator'}
            </h1>
            <div className="flex items-center gap-2 mt-1 opacity-90">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                {role || 'Admin'}
              </span>
              <span className="text-xs font-medium italic opacity-75">{user?.email}</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex items-center gap-4 text-right">
                <div>
                   <div className="text-xs font-bold opacity-60 uppercase tracking-widest leading-none mb-1">Authorization</div>
                   <div className="text-sm font-semibold">Elevated Privileges</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                   <Shield size={20} className="opacity-80" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Assets</div>
          <div className="text-2xl font-bold truncate" title={`₹${stats.totalAssets.toLocaleString()}`}>₹{stats.totalAssets.toLocaleString()}</div>
          <div className="text-emerald-500 text-[10px] mt-2 font-semibold">Inventory Valuation</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Rentals</div>
          <div className="text-2xl font-bold truncate" title={`₹${stats.totalRentals.toLocaleString()}`}>₹{stats.totalRentals.toLocaleString()}</div>
          <div className="text-blue-500 text-[10px] mt-2 font-semibold">Revenue from Rentals</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Pending Rental Reqs</div>
          <div className="text-2xl font-bold truncate">{stats.requests}</div>
          <div className="text-blue-500 text-[10px] mt-2 font-semibold">Awaiting Approval</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Pending Purchase Reqs</div>
          <div className="text-2xl font-bold truncate">{stats.pendingPurchases}</div>
          <div className="text-emerald-500 text-[10px] mt-2 font-semibold">Sales Pipeline</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Active Rentals</div>
          <div className="text-2xl font-bold text-slate-800 truncate">{stats.active}</div>
          <div className="text-slate-400 text-[10px] mt-2 font-semibold">Currently Out</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Overdue Items</div>
          <div className="text-2xl font-bold text-rose-500 truncate">{stats.overdue}</div>
          <div className="text-rose-400 text-[10px] mt-2 font-semibold italic">{stats.overdue > 0 ? "Immediate Action Required" : "All good"}</div>
        </div>
      </div>
    </div>
  );
}
