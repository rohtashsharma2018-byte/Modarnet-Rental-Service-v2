import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Laptop } from "../../types";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";

export default function ViewInventory() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);

  useEffect(() => {
    const q = query(collection(db, "laptops"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Laptop[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Laptop));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return dateB - dateA;
      });
      setLaptops(data);
    }, err => handleFirestoreError(err, OperationType.GET, "laptops"));
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight capitalize">View Inventory</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Laptop Model</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Description</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Offer Price</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Price / Day</th>
                <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laptops.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800 text-xs">{l.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[300px]" title={l.description}>
                    <p className="line-clamp-2">{l.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-medium">
                    {l.offerPricePerItem ? `₹${l.offerPricePerItem.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-medium">
                    ₹{l.pricePerDay.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${l.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {l.stock > 0 ? `${l.stock} In Stock` : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
              {laptops.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 font-medium italic">
                    No laptops available in the inventory at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
