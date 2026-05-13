import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { RentalRequest, PurchaseRequest } from "../../types";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";
import { ShoppingBag, Clock } from "lucide-react";

export default function UserDashboard() {
  const { user, role } = useAuth();
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch Rental Requests
    const qRental = query(
      collection(db, "rentalRequests"),
      where("userId", "==", user.uid)
    );

    const unsubRental = onSnapshot(qRental, (snapshot) => {
      const data: RentalRequest[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as RentalRequest);
      });
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return dateB - dateA;
      });
      setRentalRequests(data);
    }, (err) => handleFirestoreError(err, OperationType.GET, "rentalRequests"));

    // Fetch Purchase Requests
    const qPurchase = query(
      collection(db, "purchaseRequests"),
      where("userId", "==", user.uid)
    );

    const unsubPurchase = onSnapshot(qPurchase, (snapshot) => {
      const data: PurchaseRequest[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as PurchaseRequest);
      });
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return dateB - dateA;
      });
      setPurchaseRequests(data);
    }, (err) => handleFirestoreError(err, OperationType.GET, "purchaseRequests"));

    return () => {
      unsubRental();
      unsubPurchase();
    };
  }, [user]);

  const activeRentals = rentalRequests.filter(r => r.status === "active" || r.status === "approved" || r.status === "overdue");
  const pendingRentals = rentalRequests.filter(r => r.status === "pending");
  const pendingPurchases = purchaseRequests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome back, {user?.displayName || 'User'}
            </h1>
            <div className="flex items-center gap-2 mt-1 opacity-90">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                {role || 'User'}
              </span>
              <span className="text-xs font-medium italic opacity-75">{user?.email}</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex items-center gap-4 text-right">
                <div>
                   <div className="text-xs font-bold opacity-60 uppercase tracking-widest leading-none mb-1">Status</div>
                   <div className="text-sm font-semibold">Logged in successfully</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                   <Clock size={20} className="opacity-80" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Pending Request Status</h3>
          </div>
          <div className="p-4">
            {pendingRentals.length === 0 && pendingPurchases.length === 0 ? (
              <p className="text-sm text-slate-500">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {/* Rental Section */}
                {pendingRentals.map(req => (
                  <div key={req.id} className="bg-amber-50/50 p-2.5 rounded border border-amber-200 flex items-center justify-between">
                    <div className="flex gap-2">
                       <div className="bg-amber-100 p-1.5 h-fit rounded text-amber-600">
                          <Clock size={14} />
                       </div>
                       <div>
                        <div className="text-xs font-bold text-slate-900">{req.laptopName} <span className="text-amber-700">(Rental)</span></div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {req.quantity || 1} • {req.duration} Days
                        </div>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {req.status}
                    </span>
                  </div>
                ))}

                {/* Purchase Section */}
                {pendingPurchases.map(req => (
                  <div key={req.id} className="bg-blue-50/50 p-2.5 rounded border border-blue-200 flex items-center justify-between">
                    <div className="flex gap-2">
                       <div className="bg-blue-100 p-1.5 h-fit rounded text-blue-600">
                          <ShoppingBag size={14} />
                       </div>
                       <div>
                        <div className="text-xs font-bold text-slate-900">{req.laptopName} <span className="text-blue-700">(Purchase)</span></div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {req.quantity || 1} • ₹{req.totalCost?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Active Rentals</h3>
          </div>
          <div className="p-4">
            {activeRentals.length === 0 ? (
              <p className="text-sm text-slate-500">No active rentals.</p>
            ) : (
              <div className="space-y-2">
                {activeRentals.map(req => (
                  <div key={req.id} className={`p-2.5 rounded border flex items-center justify-between ${req.status === 'overdue' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{req.laptopName} (Qty: {req.quantity || 1})</div>
                      <div className={`text-[10px] ${req.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        Return by: {format(req.returnDate?.toMillis ? req.returnDate.toMillis() : req.returnDate, "MMM d, yyyy")}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${req.status === 'overdue' ? 'bg-rose-600 text-white' : 'bg-green-100 text-green-700'}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

