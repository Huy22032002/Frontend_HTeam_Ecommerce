import { Card, CardContent, Typography, Box } from "@mui/material";
import type { KPI } from "../../models/dashboard/KPI";

export const StatCard = ({ title, value, change, icon }: KPI) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={700}>{value}</Typography>
            {change && (
              <Typography variant="body2" color={change.startsWith('-') ? 'error.main' : 'success.main'}>
                {change}
              </Typography>
            )}
          </Box>
          {icon && <Box fontSize={48}>{icon}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
};
