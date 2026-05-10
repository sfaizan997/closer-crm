import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const LeadContext = createContext();

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    // Subscribe to leads collection for current user
    const leadsRef = collection(db, 'users', user.uid, 'leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for compatibility with existing UI
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      }));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addLead = async (leadData) => {
    if (!user) return;
    const leadsRef = collection(db, 'users', user.uid, 'leads');
    const docRef = await addDoc(leadsRef, {
      ...leadData,
      notes: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateLead = async (id, updatedLead) => {
    if (!user) return;
    const leadRef = doc(db, 'users', user.uid, 'leads', id);
    await updateDoc(leadRef, updatedLead);
  };

  const deleteLead = async (id) => {
    if (!user) return;
    const leadRef = doc(db, 'users', user.uid, 'leads', id);
    await deleteDoc(leadRef);
  };

  const getLead = (id) => {
    return leads.find(lead => lead.id === id);
  };

  const addNote = async (leadId, text) => {
    if (!user) return;
    const lead = getLead(leadId);
    if (!lead) return;

    const note = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      text,
    };

    const leadRef = doc(db, 'users', user.uid, 'leads', leadId);
    await updateDoc(leadRef, {
      notes: [note, ...(lead.notes || [])]
    });
  };

  const updateStatus = async (id, status) => {
    if (!user) return;
    const leadRef = doc(db, 'users', user.uid, 'leads', id);
    await updateDoc(leadRef, { status });
  };

  const migrateLocalData = async () => {
    if (!user) return;
    try {
      const localLeads = JSON.parse(localStorage.getItem('fex_crm_leads') || '[]');
      if (localLeads.length === 0) return 0;

      const leadsRef = collection(db, 'users', user.uid, 'leads');
      let count = 0;
      
      for (const lead of localLeads) {
        const { id, ...data } = lead;
        await addDoc(leadsRef, {
          ...data,
          createdAt: data.createdAt || new Date().toISOString()
        });
        count++;
      }
      
      localStorage.removeItem('fex_crm_leads');
      return count;
    } catch (err) {
      console.error("Migration failed:", err);
      return 0;
    }
  };

  return (
    <LeadContext.Provider value={{ 
      leads, 
      loading, 
      addLead, 
      updateLead, 
      deleteLead, 
      getLead, 
      addNote, 
      updateStatus,
      migrateLocalData
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => useContext(LeadContext);
