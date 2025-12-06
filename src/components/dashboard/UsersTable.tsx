import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import type { UserSummary } from "../../models/dashboard/UserSummary";

export const UsersTable = ({ users }: { users: UserSummary[] }) => {
  return (
    <Card variant="outlined">
      <CardHeader title="New Users" sx={{ pb: 0 }} />
      <CardContent>
        <List dense>
          {users.map((u) => (
            <ListItem key={u.id} disableGutters>
              <Avatar sx={{ mr: 1 }}>{u.fullName.charAt(0)}</Avatar>
              <ListItemText primary={u.fullName} secondary={u.email} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
