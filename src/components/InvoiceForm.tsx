import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Customer } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { fetchCustomers } from '../api';

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [taxPercentage, setTaxPercentage] = useState<number>(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const fetchedCustomers = await fetchCustomers();
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (taxPercentage / 100);
    return subtotal + taxAmount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    const invoice: Invoice = {
      customer: selectedCustomer,
      date,
      dueDate,
      items,
      total: calculateTotal(),
      status,
      taxPercentage,
    };
    onSubmit(invoice);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer">
          Customer
        </label>
        <select
          id="customer"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.companyName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Invoice Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
            Due Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
          Status
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
          required
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap items-center mb-2">
            <input
              className="shadow appearance-none border rounded w-full sm:w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 sm:mb-0 sm:mr-2"
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              required
            />
            <input
              className="shadow appearance-none border rounded w-1/2 sm:w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 sm:mb-0 sm:mr-2"
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
              required
              min="1"
            />
            <input
              className="shadow appearance-none border rounded w-1/2 sm:w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 sm:mb-0 sm:mr-2"
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
              required
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center mt-2"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Item
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxPercentage">
          Tax Percentage
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="taxPercentage"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={taxPercentage}
          onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
          required
        />
      </div>
      <div className="mb-4">
        <p className="text-lg font-semibold">Subtotal: ${calculateSubtotal().toFixed(2)}</p>
        <p className="text-lg font-semibold">Tax Amount: ${(calculateSubtotal() * (taxPercentage / 100)).toFixed(2)}</p>
        <p className="text-xl font-bold">Total: ${calculateTotal().toFixed(2)}</p>
      </div>
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;