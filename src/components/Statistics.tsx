import React from 'react';
import { Invoice } from '../types';
import { DollarSign, TrendingUp, FileText, AlertCircle } from 'lucide-react';

interface StatisticsProps {
  invoices: Invoice[];
}

const Statistics: React.FC<StatisticsProps> = ({ invoices }) => {
  const calculateStatistics = () => {
    const currentDate = new Date();
    return invoices.reduce(
      (acc, invoice) => {
        if (invoice.status === 'paid') {
          acc.collected += invoice.total;
        } else {
          acc.due += invoice.total;
          acc.openInvoices += 1;
          
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < currentDate) {
            acc.overdueInvoices += 1;
          }
        }
        return acc;
      },
      { collected: 0, due: 0, openInvoices: 0, overdueInvoices: 0 }
    );
  };

  const { collected, due, openInvoices, overdueInvoices } = calculateStatistics();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-800">${collected.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Total Due</p>
              <p className="text-2xl font-bold text-yellow-800">${due.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Open Invoices</p>
              <p className="text-2xl font-bold text-blue-800">{openInvoices}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-800">{overdueInvoices}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;