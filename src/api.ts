import { supabase } from './supabaseClient'
import { Invoice, Customer, InvoiceItem } from './types'

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*)
    `)
  if (error) throw error
  return data || []
}

export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .update(invoice)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
  if (error) throw error
  return data || []
}

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateCustomer = async (customer: Customer): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', customer.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export const fetchInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
  if (error) throw error
  return data || []
}

export const createInvoiceItem = async (item: Omit<InvoiceItem, 'id'>): Promise<InvoiceItem> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateInvoiceItem = async (id: string, item: Partial<InvoiceItem>): Promise<InvoiceItem> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .update(item)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteInvoiceItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoice_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}