import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

/**
 * PayOS Callback Handler Component
 * Handles the redirect from PayOS after payment
 * Verifies payment status and provides feedback to user
 */
export const PayOSCallbackHandler: React.FC<{
  onSuccess?: (data: any) => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
}> = ({ onSuccess, onFailure, onCancel }) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure' | 'cancelled'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Extract parameters from callback URL
    const paymentStatus = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    const transactionId = searchParams.get('transactionId');
    const code = searchParams.get('code'); // PayOS response code

    console.log('PayOS Callback:', { paymentStatus, orderCode, transactionId, code });

    // Process callback based on status
    if (paymentStatus === 'success' || code === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công! Đơn hàng đang được xử lý...');
      onSuccess?.({
        orderCode,
        transactionId,
        status: 'completed',
      });
    } else if (paymentStatus === 'cancelled') {
      setStatus('cancelled');
      setMessage('Thanh toán đã bị hủy.');
      onCancel?.();
    } else if (paymentStatus === 'failed' || (code && code !== '00')) {
      setStatus('failure');
      setMessage(searchParams.get('message') || 'Thanh toán thất bại. Vui lòng thử lại.');
      onFailure?.(message);
    } else {
      // Default pending state
      setStatus('loading');
      setMessage('Đang xác nhận thanh toán...');
    }
  }, [searchParams, onSuccess, onFailure, onCancel]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f8f9fa',
        p: 2,
      }}
    >
      {status === 'loading' && (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">{message}</Typography>
        </Box>
      )}

      {status === 'success' && (
        <Alert severity="success" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" fontWeight="bold">
            ✅ {message}
          </Typography>
        </Alert>
      )}

      {status === 'failure' && (
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" fontWeight="bold">
            ❌ {message}
          </Typography>
        </Alert>
      )}

      {status === 'cancelled' && (
        <Alert severity="warning" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" fontWeight="bold">
            ⚠️ {message}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};
