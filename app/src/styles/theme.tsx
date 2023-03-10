import { deepmerge } from "@mui/utils";
import type {} from "@mui/material/themeCssVarsAugmentation";
import {
  experimental_extendTheme as extendMuiTheme,
  PaletteColor,
  TypeText,
  TypeAction,
  Overlays,
  PaletteColorChannel,
  PaletteAlert,
  PaletteAppBar,
  PaletteAvatar,
  PaletteChip,
  PaletteFilledInput,
  PaletteLinearProgress,
  PaletteSlider,
  PaletteSkeleton,
  PaletteSnackbarContent,
  PaletteSpeedDialAction,
  PaletteStepConnector,
  PaletteStepContent,
  PaletteSwitch,
  PaletteTableCell,
  PaletteTooltip,
  Shadows,
  ZIndex
} from "@mui/material/styles";
import colors from "@mui/joy/colors";
import {
  extendTheme as extendJoyTheme,
  Theme as JoyTheme,
  ThemeCssVar as JoyThemeCssVar
} from "@mui/joy/styles";

// Joy UI components
import { CommonColors } from "@mui/material/styles/createPalette";
import { TypeBackground } from "@mui/material";

// extends Joy theme to include tokens from Material UI
declare module "@mui/joy/styles" {
  interface Palette {
    secondary: PaletteColorChannel;
    error: PaletteColorChannel;
    dividerChannel: string;
    action: TypeAction;
    Alert: PaletteAlert;
    AppBar: PaletteAppBar;
    Avatar: PaletteAvatar;
    Chip: PaletteChip;
    FilledInput: PaletteFilledInput;
    LinearProgress: PaletteLinearProgress;
    Skeleton: PaletteSkeleton;
    Slider: PaletteSlider;
    SnackbarContent: PaletteSnackbarContent;
    SpeedDialAction: PaletteSpeedDialAction;
    StepConnector: PaletteStepConnector;
    StepContent: PaletteStepContent;
    Switch: PaletteSwitch;
    TableCell: PaletteTableCell;
    Tooltip: PaletteTooltip;
  }
  interface PalettePrimary extends PaletteColor {}
  interface PaletteInfo extends PaletteColor {}
  interface PaletteSuccess extends PaletteColor {}
  interface PaletteWarning extends PaletteColor {}
  interface PaletteCommon extends CommonColors {}
  interface PaletteText extends TypeText {}
  interface PaletteBackground extends TypeBackground {}

  interface ThemeVars {
    // attach to Joy UI `theme.vars`
    shadows: Shadows;
    overlays: Overlays;
    zIndex: ZIndex;
  }
}

type MergedThemeCssVar = { [k in JoyThemeCssVar]: true };

declare module "@mui/material/styles" {
  interface Theme {
    // put everything back to Material UI `theme.vars`
    vars: JoyTheme["vars"];
  }

  // makes Material UI theme.getCssVar() sees Joy theme tokens
  interface ThemeCssVarOverrides extends MergedThemeCssVar {}
}

const { unstable_sxConfig: muiSxConfig, ...muiTheme } = extendMuiTheme({
  cssVarPrefix: "joy",
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: colors.blue[500]
        },
        grey: colors.grey,
        error: {
          main: colors.red[500]
        },
        info: {
          main: colors.purple[500]
        },
        success: {
          main: colors.green[500]
        },
        warning: {
          main: colors.yellow[200]
        },
        common: {
          white: "#FFF",
          black: "#09090D"
        },
        divider: colors.grey[200],
        text: {
          primary: colors.grey[800],
          secondary: colors.grey[600]
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: colors.blue[600]
        },
        grey: colors.grey,
        error: {
          main: colors.red[600]
        },
        info: {
          main: colors.purple[600]
        },
        success: {
          main: colors.green[600]
        },
        warning: {
          main: colors.yellow[300]
        },
        common: {
          white: "#FFF",
          black: "#09090D"
        },
        divider: colors.grey[800],
        text: {
          primary: colors.grey[100],
          secondary: colors.grey[300]
        }
      }
    }
  }
});

const { unstable_sxConfig: joySxConfig, ...joyTheme } = extendJoyTheme();

const mergedTheme = deepmerge(muiTheme, joyTheme);

// @ts-ignore
mergedTheme.unstable_sxConfig = {
  ...muiSxConfig,
  ...joySxConfig
};

export default mergedTheme;