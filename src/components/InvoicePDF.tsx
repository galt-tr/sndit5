import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '../types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4F46E5', // Indigo color for branding
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: '#4F46E5',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>sndit Invoice</Text>
        <Text style={styles.subheader}>Invoice #{invoice.id}</Text>
        <Text style={styles.text}>Date: {invoice.date}</Text>
        <Text style={styles.text}>Due Date: {invoice.dueDate}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subheader}>Customer Information</Text>
        <Text style={styles.text}>Name: {invoice.customer.name}</Text>
        <Text style={styles.text}>Company: {invoice.customer.companyName}</Text>
        <Text style={styles.text}>Email: {invoice.customer.email}</Text>
        <Text style={styles.text}>Phone: {invoice.customer.phoneNumber}</Text>
        <Text style={styles.text}>Address: {invoice.customer.address}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subheader}>Invoice Items</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Description</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Quantity</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Price</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Total</Text></View>
          </View>
          {invoice.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.description}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${item.price.toFixed(2)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</Text></View>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.text}>Subtotal: ${(invoice.total / (1 + invoice.taxPercentage / 100)).toFixed(2)}</Text>
        <Text style={styles.text}>Tax ({invoice.taxPercentage}%): ${(invoice.total - invoice.total / (1 + invoice.taxPercentage / 100)).toFixed(2)}</Text>
        <Text style={styles.subheader}>Total: ${invoice.total.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;