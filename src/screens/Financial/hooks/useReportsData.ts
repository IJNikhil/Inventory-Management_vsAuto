import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/use-toast';
import { partService } from '../../../services/part-service';
import type { Invoice, Part, Transaction } from '../../../types/database';

type ReportData = {
  totalRevenue: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  netProfit: number;
  invoiceCount: number;
  partsSoldCount: number;
  grossProfitMargin: number;
  avgRevenuePerInvoice: number;
  salesByShopkeeper: { name: string; totalSales: number; invoiceCount: number }[];
  topSellingParts: { name: string; partNumber: string; quantity: number }[];
  expenseBreakdown: { category: string, total: number }[];
  productPerformance: any[];
};

const calculateReportData = async (
  dateRange: { from: Date; to: Date },
  allInvoices: Invoice[],
  allTransactions: Transaction[]
): Promise<ReportData | null> => {
  const { from, to } = dateRange;
  if (!from || !to) return null;

  try {
    const allParts = await partService.findAll();
    
    const paidInvoicesInRange = allInvoices.filter(inv => {
      if (!inv.payment_date) return false;
      const invDate = new Date(inv.payment_date);
      return inv.status === 'paid' && invDate >= from && invDate <= to;
    });

    const manualExpensesInRange = allTransactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return t.amount < 0 && t.status === 'completed' && t.category !== 'Stock Purchase' && tDate >= from && tDate <= to;
    });

    const hasData = paidInvoicesInRange.length > 0 || manualExpensesInRange.length > 0;
    if (!hasData) return null;

    const totalRevenue = paidInvoicesInRange.reduce((sum, inv) => sum + inv.total, 0);
    const productPerformanceMap = new Map();
    
    const costOfGoodsSold = paidInvoicesInRange.reduce((cogs, inv) => {
      const invoiceItems = (inv as any).items || [];
      
      return cogs + invoiceItems.reduce((itemCogs: number, item: any) => {
        const part = allParts.find(p => p.id === item.part_id);
        if (!part) return itemCogs;
        
        const revenue = item.unit_price * item.quantity;
        const cost = part.purchase_price * item.quantity;
        const profit = revenue - cost;
        
        const current = productPerformanceMap.get(part.id) || {
          name: part.name,
          partNumber: part.part_number,
          quantitySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          profitMargin: 0
        };
        
        current.quantitySold += item.quantity;
        current.totalRevenue += revenue;
        current.totalCost += cost;
        current.totalProfit += profit;
        productPerformanceMap.set(part.id, current);
        
        return itemCogs + cost;
      }, 0);
    }, 0);

    const productPerformance = Array.from(productPerformanceMap.values()).map(p => ({
      ...p,
      profitMargin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0,
    }));

    const grossProfit = totalRevenue - costOfGoodsSold;
    const totalOperatingExpenses = manualExpensesInRange.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const invoiceCount = paidInvoicesInRange.length;
    const avgRevenuePerInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
    
    const partsSoldCount = paidInvoicesInRange.reduce((sum, inv) => {
      const invoiceItems = (inv as any).items || [];
      return sum + invoiceItems.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
    }, 0);
    
    const salesByShopkeeper = paidInvoicesInRange.reduce((acc, inv) => {
      const generatedBy = inv.generated_by;
      if (!generatedBy) return acc;
      
      const existing = acc.find(s => s.name === generatedBy);
      if (existing) {
        existing.totalSales += inv.total;
        existing.invoiceCount += 1;
      } else {
        acc.push({ name: generatedBy, totalSales: inv.total, invoiceCount: 1 });
      }
      return acc;
    }, [] as { name: string; totalSales: number; invoiceCount: number }[]).sort((a, b) => b.totalSales - a.totalSales);
    
    const topSellingParts = [...productPerformance].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5).map(p => ({
      name: p.name,
      partNumber: p.partNumber,
      quantity: p.quantitySold
    }));
    
    const expenseBreakdown = manualExpensesInRange.reduce((acc, t) => {
      const existing = acc.find(e => e.category === t.category);
      if (existing) {
        existing.total += Math.abs(t.amount);
      } else {
        acc.push({ category: t.category, total: Math.abs(t.amount) });
      }
      return acc;
    }, [] as { category: string, total: number }[]).sort((a, b) => b.total - a.total);

    return {
      totalRevenue, grossProfit, totalOperatingExpenses, netProfit,
      invoiceCount, partsSoldCount,
      grossProfitMargin,
      avgRevenuePerInvoice,
      salesByShopkeeper, topSellingParts,
      expenseBreakdown, productPerformance
    };
  } catch (error) {
    console.error('Error calculating report data:', error);
    return null;
  }
};

export function useReportsData() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  const generateReport = useCallback(async (
    dateRange: { from: Date; to: Date },
    invoices: Invoice[] = [],
    transactions: Transaction[] = []
  ) => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select a valid start and end date.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingReport(true);
    try {
      const data = await calculateReportData(dateRange, invoices, transactions);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [toast]);

  return {
    reportData,
    generateReport,
    isGeneratingReport,
  };
}
