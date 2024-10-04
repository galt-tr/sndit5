import React, { useState } from 'react';
import { Invoice } from '../types';
import { X, Download, Eye } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import Modal from 'react-modal';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onClose }) => {
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const calculateSubtotal = () => {
    return invoice.items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * (invoice.taxPercentage / 100);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Invoice Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      {/* ... (rest of the invoice details remain unchanged) ... */}
      <div className="mt-6 flex justify-end space-x-4">
        <PDFDownloadLink document={<InvoicePDF invoice={invoice} />} fileName={`invoice-${invoice.id}.pdf`}>
          {({ blob, url, loading, error }) => 
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              disabled={loading}
            >
              <Download className="mr-2" size={20} />
              {loading ? 'Loading document...' : 'Download PDF'}
            </button>
          }
        </PDFDownloadLink>
        <button
          onClick={() => setIsPDFModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Eye className="mr-2" size={20} />
          View PDF
        </button>
      </div>
      <Modal
        isOpen={isPDFModalOpen}
        onRequestClose={() => setIsPDFModalOpen(false)}
        contentLabel="Invoice PDF Viewer"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-100">
            <h2 className="text-xl font-bold">Invoice PDF Preview</h2>
            <button onClick={() => setIsPDFModalOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow">
            <PDFViewer width="100%" height="100%" className="border-none">
              <InvoicePDF invoice={invoice} />
            </PDFViewer>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceDetails;