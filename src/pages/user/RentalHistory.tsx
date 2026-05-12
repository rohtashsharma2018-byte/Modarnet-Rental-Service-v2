import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { RentalRequest, PurchaseRequest } from "../../types";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";

export default function History() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'rentals' | 'purchases'>('rentals');

  useEffect(() => {
    if (!user) return;
    
    // Rentals
    const qr = query(collection(db, "rentalRequests"), where("userId", "==", user.uid));
    const unsubr = onSnapshot(qr, (snapshot) => {
      const data: RentalRequest[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as RentalRequest));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return dateB - dateA;
      });
      setRentals(data);
    }, err => handleFirestoreError(err, OperationType.GET, "rentalRequests"));

    // Purchases
    const qp = query(collection(db, "purchaseRequests"), where("userId", "==", user.uid));
    const unsubp = onSnapshot(qp, (snapshot) => {
      const data: PurchaseRequest[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as PurchaseRequest));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return dateB - dateA;
      });
      setPurchases(data);
    }, err => handleFirestoreError(err, OperationType.GET, "purchaseRequests"));

    return () => { unsubr(); unsubp(); };
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'rentals' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          RENTAL HISTORY
        </button>
        <button 
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'purchases' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          PURCHASE HISTORY
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">{activeTab === 'rentals' ? 'Rental Request History' : 'Purchase Request History'}</h3>
        </div>
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'rentals' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Laptop Model</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs font-mono">{req.laptopName}</span>
                      <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase">Qty: {req.quantity || 1}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="text-xs">{format(req.pickupDate?.toMillis ? req.pickupDate.toMillis() : req.pickupDate, "MMM d, yy")} - {format(req.returnDate?.toMillis ? req.returnDate.toMillis() : req.returnDate, "MMM d, yy")}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="text-[10px] font-bold text-blue-600 uppercase">{req.duration} Days (₹{req.totalCost})</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                        req.status === 'active' ? 'bg-green-100 text-green-700' :
                        req.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rentals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-500">You have no rental history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Laptop Model</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Delivery Date</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Total Cost</th>
                  <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs font-mono">{req.laptopName}</span>
                      <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase">Qty: {req.quantity || 1}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="text-xs">{format(req.deliveryDate?.toMillis ? req.deliveryDate.toMillis() : req.deliveryDate, "MMM d, yyyy")}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-bold text-xs">
                      ₹{req.totalCost}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-500">You have no purchase history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
