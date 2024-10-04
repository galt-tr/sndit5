import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import InvoiceDetails from './InvoiceDetails';
import CustomerList from './CustomerList';
import Statistics from './Statistics';
import { Invoice } from '../types';
import { fetchInvoices, createInvoice, deleteInvoice } from '../api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers'>('invoices');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const fetchedInvoices = await fetchInvoices();
      setInvoices(fetchedInvoices);
      setError(null);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Failed to load invoices. Please try again later.');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await createInvoice(invoice);
      setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice. Please try again.');
    }
  };

  const removeInvoice = async (id: string) => {
    try {
      await deleteInvoice(id);
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice. Please try again.');
    }
  };

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-4">Please log in to view the dashboard.</div>;
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">sndit Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-md ${activeTab === 'invoices' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-md ${activeTab === 'customers' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Customers
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Statistics invoices={invoices} />
      {activeTab === 'invoices' && (
        <>
          <div className="mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
            >
              <PlusCircle className="mr-2" size={20} />
              <span>Create Invoice</span>
            </button>
          </div>
          {showForm ? (
            <InvoiceForm onSubmit={addInvoice} onCancel={() => setShowForm(false)} />
          ) : selectedInvoice ? (
            <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          ) : (
            <InvoiceList invoices={invoices} onDelete={removeInvoice} onView={viewInvoice} />
          )}
        </>
      )}
      {activeTab === 'customers' && <CustomerList />}
    </div>
  );
}

export default Dashboard;