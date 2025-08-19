import type { Part, Supplier } from "../../types/database"; // ✅ FIXED: Use database types

export interface StockBadgeInfo {
  text: string;
  icon: React.ElementType;
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

export interface PartDetailProps {
  part: Part;
  supplier: Supplier | null;
}
