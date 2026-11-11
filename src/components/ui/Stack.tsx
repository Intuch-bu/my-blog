import type { CSSProperties } from "react";
import MuiStack, { type StackProps as MuiStackProps } from "@mui/material/Stack";
import type { ResponsiveStyleValue, SxProps } from "@mui/system";
import type { Theme } from "@mui/material/styles";

type Props = MuiStackProps & {
  alignItems?: ResponsiveStyleValue<CSSProperties["alignItems"]>;
  justifyContent?: ResponsiveStyleValue<CSSProperties["justifyContent"]>;
};

export default function Stack({ alignItems, justifyContent, sx, ...props }: Props) {
  const styles = [
    { alignItems, justifyContent },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ] as SxProps<Theme>;
  return <MuiStack {...props} sx={styles} />;
}
