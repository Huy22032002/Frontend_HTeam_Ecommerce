export interface KPI {
  id: string;
  title: string;
  value: number;
  change?: string; // e.g. '+5%' or '-2%'
  icon?: string; // simple emoji placeholder; replace with MUI icon if desired
}
