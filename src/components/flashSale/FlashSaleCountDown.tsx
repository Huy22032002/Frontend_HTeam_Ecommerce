import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";

interface FlashSaleCountdownProps {
  endTime: string; // ISO string
}

const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    Math.max(new Date(endTime).getTime() - Date.now(), 0)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(new Date(endTime).getTime() - Date.now(), 0);
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Convert milliseconds to hours, minutes, seconds
  const hours = Math.floor(timeLeft / 1000 / 3600);
  const minutes = Math.floor(((timeLeft / 1000) % 3600) / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  if (timeLeft <= 0) {
    return (
      <Typography color="error" fontWeight={600}>
        Flash Sale đã kết thúc
      </Typography>
    );
  }

  return (
    <Typography color="error" fontWeight={600}>
      ⏰ Còn lại: {hours} giờ {minutes} phút {seconds} giây
    </Typography>
  );
};

export default FlashSaleCountdown;
