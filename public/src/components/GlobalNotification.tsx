import { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';

const GlobalNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleShowNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      setMessage(customEvent.detail.message || '');
      setOpen(true);
    };

    window.addEventListener('show-chat-notification', handleShowNotification);

    return () => {
      window.removeEventListener('show-chat-notification', handleShowNotification);
    };
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      message={message}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: '#1976d2',
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(25, 118, 210, 0.35)',
          fontWeight: 500,
          zIndex: 9999
        }
      }}
    />
  );
};

export default GlobalNotification;
