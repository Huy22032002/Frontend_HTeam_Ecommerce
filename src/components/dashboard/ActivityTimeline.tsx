import { Card, CardHeader, CardContent, List, ListItem, ListItemText } from "@mui/material";
import type { ActivityItem } from "../../models/dashboard/ActivityItem";

export const ActivityTimeline = ({ items }: { items: ActivityItem[] }) => {
  return (
    <Card variant="outlined">
      <CardHeader title="Activity" sx={{ pb: 0 }} />
      <CardContent>
        <List dense>
          {items.map(a => (
            <ListItem key={a.id} disableGutters>
              <ListItemText primary={a.message} secondary={new Date(a.createdAt).toLocaleTimeString()} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
