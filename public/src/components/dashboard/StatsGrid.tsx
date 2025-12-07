import { Box } from "@mui/material";
import { StatCard } from "./StatCard";
import type { KPI } from "../../models/dashboard/KPI";

export const StatsGrid = ({ kpis }: { kpis: KPI[] }) => {
  return (
    <Box
      display="grid"
      gap={2}
      gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
    >
      {kpis.map(k => (
        <Box key={k.id}>
          <StatCard {...k} />
        </Box>
      ))}
    </Box>
  );
};
