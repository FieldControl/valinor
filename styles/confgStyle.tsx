import { createTheme } from "@nextui-org/react"

// configuração de cores do tema do nextui
export const theme = createTheme({
    type: "light", // "light" ou "dark"
    theme: {
      colors: {

        inputColor: '#241E38',
        bgInputColor: '#ffffff',
        
        primaryLight: '#ffffff',
        primaryLightHover: '#FFFFFF',
        primaryLightActive: '#535353',
        primaryLightContrast: '#535353',
        primary: '#338ef7',
        primaryBorder: '#0064D6',
        primaryBorderHover: '#0064D6',
        primarySolidHover: '#0064D6',
        primarySolidContrast: '$white',
        primaryShadow: '#000000',
      },
      space: {},
      fonts: {}
    }
  })