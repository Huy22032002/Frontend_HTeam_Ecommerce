import { Tabs, Tab, Box, useTheme } from "@mui/material";
import React, { useState } from "react";
import { tokens } from "../../theme/theme";

import type { Manufacturer } from "../../models/manufacturer/Manufacturer";

export interface ManufacturerTabsProps {
  items: Manufacturer[];
}

const ManufacturerTabs: React.FC<ManufacturerTabsProps> = ({ items }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selected, setSelected] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelected(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={selected}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        slotProps={{
          indicator: {
            sx: {
              display: "none",
            },
          },
        }}
      >
        {items.map((i) => (
          <Tab
            sx={{
              border: `1px solid ${colors.primary[900]}`,
              fontWeight: "bold",
              borderRadius: 4,
              background: colors.primary[400],
              mr: 1,
              "&:hover": {
                bgcolor:
                  selected === i.id ? colors.primary[600] : colors.primary[800],
              },
            }}
            key={i.id}
            label={i.name}
          />
        ))}
      </Tabs>
    </Box>
  );
};
export default ManufacturerTabs;
