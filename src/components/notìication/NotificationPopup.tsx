import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import type { Notification } from "../../models/notification/Notification";
import useNotifications from "../../hooks/useNotification";

type NotificationPopupProps = {
  open: boolean;
  onClose: () => void;
  onUpdateUnread: (count: number) => void;
};

const NotificationPopup = ({
  open,
  onClose,
  onUpdateUnread,
}: NotificationPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);

  //state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<
    Notification[]
  >([]);

  const { markAsRead, getAllByCustomerId, getUnreadCustomerNotifications } =
    useNotifications();

  //tab : All & Unread
  const [tab, setTab] = useState(0);
  const listToRender = tab === 0 ? notifications : unreadNotifications;

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      const all = await getAllByCustomerId();
      const unread = await getUnreadCustomerNotifications();

      setNotifications(all || []);
      setUnreadNotifications(unread || []);

      onUpdateUnread(unread?.length || 0); // báo lên Topbar
    };

    fetchData();
  }, []);
  if (!open) return null;

  return (
    <Box
      ref={popupRef}
      sx={{
        position: "absolute",
        top: 80,
        right: 560,
        width: 360,
        bgcolor: "background.paper",
        boxShadow: 5,
        borderRadius: 3,
        zIndex: 2000,
        overflow: "hidden",
        animation: "fadeIn 0.2s ease-in-out",
        display: "flex",
        flexDirection: "column",
        maxHeight: 500,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Thông báo
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: "1px solid #eee",
          borderRadius: 4,
          ".MuiTab-root": { textTransform: "none", fontSize: 15 },
        }}
      >
        <Tab label="Tất cả" />
        <Tab label="Chưa đọc" />
      </Tabs>

      {/* List of notifications */}
      <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {listToRender.length === 0 && (
          <ListItem>
            <ListItemText primary="Không có thông báo nào." />
          </ListItem>
        )}

        {listToRender.map((noti) => (
          <React.Fragment key={noti.id}>
            <ListItem
              sx={{
                px: 2,
                py: 1.5,
                cursor: "pointer",
                bgcolor: noti.read ? "white" : "rgba(33, 150, 243, 0.10)",
                transition: "0.2s",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                borderRadius: 0.5,
              }}
              onClick={async () => {
                await markAsRead(noti.id);

                setNotifications((prev) =>
                  prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
                );

                setUnreadNotifications((prev) => {
                  const updated = prev.filter((n) => n.id !== noti.id);
                  onUpdateUnread(updated.length); // cập nhật topbar
                  return updated;
                });
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography
                      variant="subtitle1"
                      fontWeight={noti.read ? 400 : 700}
                    >
                      {noti.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, whiteSpace: "nowrap" }}
                    >
                      {new Date(noti.audit.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {noti.message}
                  </Typography>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>

      {/* Mark as read all */}
      <Box sx={{ p: 1.5, borderTop: "1px solid #eee", bgcolor: "white" }}>
        <Button
          startIcon={<DoneIcon />}
          fullWidth
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            py: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={() => {}}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationPopup;
