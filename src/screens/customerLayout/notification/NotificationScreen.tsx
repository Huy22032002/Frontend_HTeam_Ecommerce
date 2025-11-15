import { Box } from "@mui/material";
import useNotification from "./Notification.hook";
import useNotifications from "../../../hooks/useNotification";

const NotificationScreen = () => {
  const { getAllByCustomerId } = useNotifications();

  return <Box></Box>;
};

export default NotificationScreen;
