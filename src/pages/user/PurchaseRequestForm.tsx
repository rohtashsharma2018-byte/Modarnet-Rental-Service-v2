import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { collection, query, onSnapshot, addDoc, doc, updateDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Laptop } from "../../types";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";

interface FormValues {
  laptopId: string;
  quantity: number;
  deliveryDate: string;
  phone: string;
  address: string;
  comments: string;
}

export default function PurchaseRequestForm() {
  const { user } = useAuth();
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>();

  const watchLaptopId = watch("laptopId");
  const watchQuantity = watch("quantity", 1);

  useEffect(() => {
    const q = query(collection(db, "laptops"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Laptop[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() } as Laptop));
      setLaptops(data.filter(l => l.stock > 0)); 
    }, err => handleFirestoreError(err, OperationType.GET, "laptops"));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (watchLaptopId) {
      setSelectedLaptop(laptops.find(l => l.id === watchLaptopId) || null);
    }
  }, [watchLaptopId, laptops]);

    const onSubmit = async (data: FormValues) => {
    console.log("Form valid, starting submission...", data);
    if (!user) {
      toast.error("You must be logged in to submit a request.");
      return;
    }
    if (!selectedLaptop) {
      toast.error("Please select a laptop first.");
      return;
    }

    try {
      const dDate = new Date(data.deliveryDate);
      if (isNaN(dDate.getTime())) {
        toast.error("Invalid delivery date.");
        return;
      }

      const quantity = Number(data.quantity) || 1;
      const offerPrice = selectedLaptop.offerPricePerItem || 0;
      const totalCost = offerPrice * quantity;

      console.log("Calculated data:", { quantity, offerPrice, totalCost });

      // Ensure user profile has phone/address populated
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const u = userDoc.data();
        if (!u.phone || !u.address) {
           console.log("Updating user profile with phone/address...");
           await updateDoc(userRef, {
             phone: data.phone,
             address: data.address,
             updatedAt: serverTimestamp()
           });
        }
      }

      console.log("Adding purchase request doc...");
      await addDoc(collection(db, "purchaseRequests"), {
        userId: user.uid,
        laptopId: selectedLaptop.id,
        laptopName: selectedLaptop.name,
        quantity: Math.floor(quantity), 
        offerPrice: Number(offerPrice),
        totalCost: Number(totalCost),
        deliveryDate: Timestamp.fromDate(dDate),
        comments: data.comments || "",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Purchase request submitted successfully");
      reset();
    } catch (e: any) {
      console.error("Submission error details:", e);
      // Try to parse JSON error if it's from handleFirestoreError
      try {
        const errObj = JSON.parse(e.message);
        toast.error(`Submission failed: ${errObj.error}`);
      } catch {
        toast.error("Failed to submit purchase request. Check console for details.");
      }
      handleFirestoreError(e, OperationType.CREATE, "purchaseRequests");
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Purchase Request</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Laptop</label>
                <select 
                  {...register("laptopId", { required: "Laptop selection is required" })}
                   className={`w-full rounded border ${errors.laptopId ? 'border-rose-500' : 'border-slate-300'} p-2 text-sm focus:outline-none focus:border-blue-500 bg-white`}
                >
                  <option value="">-- Select a laptop --</option>
                  {laptops.map(l => (
                    <option key={l.id} value={l.id}>{l.name} (Offer: ₹{l.offerPricePerItem} - {l.stock} available)</option>
                  ))}
                </select>
                {errors.laptopId && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.laptopId.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                <input 
                  type="number" 
                  min={1} 
                  max={selectedLaptop?.stock || 1}
                  {...register("quantity", { 
                    required: "Quantity is required", 
                    min: { value: 1, message: "Min quantity is 1" }, 
                    valueAsNumber: true 
                  })} 
                  className={`w-full rounded border ${errors.quantity ? 'border-rose-500' : 'border-slate-300'} p-2 text-sm focus:outline-none focus:border-blue-500 bg-white`} 
                />
                {errors.quantity && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.quantity.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preferred Delivery Date</label>
              <input 
                type="date" 
                {...register("deliveryDate", { required: "Delivery date is required" })} 
                className={`w-full rounded border ${errors.deliveryDate ? 'border-rose-500' : 'border-slate-300'} p-2 text-sm focus:outline-none focus:border-blue-500 bg-white`} 
              />
              {errors.deliveryDate && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.deliveryDate.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                 <input value={user?.email || ''} readOnly disabled className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-500 cursor-not-allowed" />
              </div>
              <div className="lg:col-span-1">
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</label>
                 <input 
                   {...register("phone", { required: "Phone is required" })} 
                   placeholder="+1 234 567 8900" 
                   className={`w-full rounded border ${errors.phone ? 'border-rose-500' : 'border-slate-300'} p-2 text-sm focus:outline-none focus:border-blue-500 bg-white`} 
                 />
                 {errors.phone && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.phone.message}</p>}
              </div>
              <div className="lg:col-span-2">
                 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Address</label>
                 <input 
                   {...register("address", { required: "Address is required" })} 
                   placeholder="123 Main St, City" 
                   className={`w-full rounded border ${errors.address ? 'border-rose-500' : 'border-slate-300'} p-2 text-sm focus:outline-none focus:border-blue-500 bg-white`} 
                 />
                 {errors.address && <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.address.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Additional Comments</label>
              <textarea {...register("comments")} rows={3} placeholder="Any special instructions or questions..." className="w-full rounded border border-slate-300 p-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>

            {selectedLaptop && (
              <div className="p-3 bg-blue-50 rounded border border-blue-100 flex justify-between items-center text-sm">
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Total Purchase Cost</div>
                  <div className="text-slate-500 text-xs">₹{selectedLaptop.offerPricePerItem} × {watchQuantity} items</div>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  ₹{ (selectedLaptop.offerPricePerItem || 0) * watchQuantity }
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded text-sm font-bold tracking-wide transition-colors mt-2">
              SUBMIT PURCHASE REQUEST
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
