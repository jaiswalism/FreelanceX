{
"designSystem": {
"name": "Freelance Protocol",
"version": "1.0",
"description": "A high-contrast mobile design system for a blockchain-powered freelance marketplace. The visual language combines dark financial interfaces, developer tooling, and restrained orange accents. It should feel trustworthy, technical, direct, and premium without looking like a generic crypto or AI product.",
"designDirection": {
"primaryStyle": "dark industrial fintech",
"secondaryStyle": "developer tooling",
"visualCharacter": [
"technical",
"confident",
"precise",
"professional",
"minimal",
"high-contrast"
],
"avoid": [
"AI SaaS aesthetics",
"purple branding",
"blue-purple gradients",
"excessive glassmorphism",
"neon cyberpunk styling",
"crypto-casino aesthetics",
"overly rounded interfaces",
"decorative 3D crypto imagery",
"excessive visual effects"
]
}
},

"colorSystem": {
"mode": "dark-first",

    "background": {
      "app": "#090909",
      "primary": "#0B0B0B",
      "secondary": "#101010",
      "elevated": "#151515"
    },

    "surface": {
      "default": "#121212",
      "raised": "#181818",
      "pressed": "#1D1D1D",
      "selected": "#21170F"
    },

    "border": {
      "subtle": "#202020",
      "default": "#292929",
      "strong": "#383838"
    },

    "brand": {
      "primary": "#FF6A00",
      "strong": "#FF7A00",
      "deep": "#D94F00",
      "soft": "#FF8A33",
      "tint": "#2A160B"
    },

    "semantic": {
      "success": "#5EE6B5",
      "successBackground": "#0D2119",
      "warning": "#F5B942",
      "warningBackground": "#241C0C",
      "danger": "#FF5C5C",
      "dangerBackground": "#250F0F",
      "info": "#A3A3A3",
      "infoBackground": "#181818"
    },

    "text": {
      "primary": "#F5F5F5",
      "secondary": "#A3A3A3",
      "tertiary": "#737373",
      "disabled": "#4A4A4A",
      "inverse": "#090909"
    },

    "special": {
      "verified": "#5EE6B5",
      "wallet": "#FF6A00",
      "escrow": "#FF7A00",
      "blockchain": "#A3A3A3"
    },

    "restrictions": {
      "purple": "Do not use",
      "blue": "Do not use as a brand color",
      "cyan": "Do not use as a brand color",
      "gradientBranding": "Do not use",
      "rainbowGradients": "Do not use"
    },

    "usageRules": {
      "orange": "Reserved primarily for primary actions, active states, financial actions, important values, and brand identity.",
      "mint": "Reserved for verified blockchain state, completed payments, successful operations, and trusted on-chain facts.",
      "red": "Reserved for destructive actions, disputes, failed transactions, and critical errors.",
      "yellow": "Reserved for pending or attention-required states.",
      "gray": "Used for neutral information and supporting content.",
      "colorDensity": "Most of the interface should remain neutral. Accent colors must remain intentional rather than decorative."
    }
},

"lightTheme": {
"status": "supported",
"philosophy": "warm neutral light interface with black typography and orange interaction accents",

    "background": {
      "app": "#F6F6F3",
      "primary": "#FAFAF8",
      "secondary": "#F0F0ED",
      "elevated": "#FFFFFF"
    },

    "surface": {
      "default": "#FFFFFF",
      "raised": "#FFFFFF",
      "pressed": "#F1F1EE",
      "selected": "#FFF0E5"
    },

    "border": {
      "subtle": "#E8E8E4",
      "default": "#DCDCD7",
      "strong": "#C8C8C2"
    },

    "brand": {
      "primary": "#E95700",
      "strong": "#D94D00",
      "deep": "#B84000"
    },

    "text": {
      "primary": "#111111",
      "secondary": "#5F5F5A",
      "tertiary": "#858580",
      "disabled": "#B0B0AA"
    }
},

"typography": {
"fontFamily": {
"primary": "Inter",
"fallback": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
"numeric": "JetBrains Mono",
"monospace": "JetBrains Mono"
},

    "weights": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },

    "scale": {
      "display": {
        "size": 32,
        "weight": 700,
        "lineHeight": 1.1,
        "letterSpacing": -0.8
      },
      "heading1": {
        "size": 26,
        "weight": 700,
        "lineHeight": 1.2,
        "letterSpacing": -0.5
      },
      "heading2": {
        "size": 22,
        "weight": 650,
        "lineHeight": 1.25,
        "letterSpacing": -0.3
      },
      "heading3": {
        "size": 18,
        "weight": 600,
        "lineHeight": 1.3,
        "letterSpacing": -0.1
      },
      "body": {
        "size": 15,
        "weight": 400,
        "lineHeight": 1.5,
        "letterSpacing": 0
      },
      "bodyMedium": {
        "size": 15,
        "weight": 500,
        "lineHeight": 1.5,
        "letterSpacing": 0
      },
      "label": {
        "size": 13,
        "weight": 600,
        "lineHeight": 1.3,
        "letterSpacing": 0.2
      },
      "caption": {
        "size": 12,
        "weight": 500,
        "lineHeight": 1.3,
        "letterSpacing": 0.3
      },
      "micro": {
        "size": 10,
        "weight": 600,
        "lineHeight": 1.2,
        "letterSpacing": 0.6
      }
    },

    "rules": {
      "headlineStyle": "compact and confident",
      "bodyStyle": "highly readable and neutral",
      "uppercase": "Use selectively for labels and metadata, not paragraphs.",
      "gradientText": false,
      "strokeText": false,
      "decorativeTypography": false,
      "financialValues": "Use tabular or monospace numerals where precision matters."
    }
},

"spacing": {
"baseUnit": 4,

    "scale": {
      "xs": 4,
      "sm": 8,
      "md": 12,
      "lg": 16,
      "xl": 20,
      "xxl": 24,
      "xxxl": 32,
      "section": 40
    },

    "rules": {
      "screenHorizontalPadding": 20,
      "compactContentPadding": 12,
      "standardContentPadding": 16,
      "largeContentPadding": 20,
      "avoidExcessiveWhitespace": true,
      "density": "moderately dense, optimized for information-heavy financial and marketplace interfaces"
    }
},

"shapeLanguage": {
"philosophy": "controlled geometry rather than soft consumer-app styling",

    "cornerRadius": {
      "none": 0,
      "small": 4,
      "default": 8,
      "medium": 10,
      "large": 12,
      "pill": 999
    },

    "rules": {
      "cards": "Use 8-12px radius.",
      "buttons": "Use 8px radius for primary actions; pill shapes only for compact tags or status indicators.",
      "inputs": "Use 8px radius.",
      "bottomSheets": "Use 16px radius on top corners.",
      "avoid": "Do not use excessive 20-32px rounded containers."
    }
},

"surfaces": {
"style": "solid surfaces with subtle borders",

    "rules": {
      "glassmorphism": false,
      "backdropBlur": "Only when technically useful, never as the default card treatment.",
      "heavyShadows": false,
      "defaultElevation": "communicated primarily through surface color and border rather than shadows",
      "cardTransparency": false,
      "borderPriority": "Prefer subtle borders over floating shadows."
    },

    "levels": {
      "level0": "#090909",
      "level1": "#101010",
      "level2": "#151515",
      "level3": "#1B1B1B"
    }
},

"buttons": {
"primary": {
"background": "#FF6A00",
"foreground": "#090909",
"pressed": "#D94F00",
"radius": 8,
"weight": 600
},

    "secondary": {
      "background": "#181818",
      "foreground": "#F5F5F5",
      "border": "#292929",
      "pressed": "#202020",
      "radius": 8
    },

    "outline": {
      "background": "transparent",
      "foreground": "#FF6A00",
      "border": "#FF6A00",
      "radius": 8
    },

    "destructive": {
      "background": "#FF5C5C",
      "foreground": "#090909",
      "radius": 8
    },

    "rules": {
      "textTransform": "sentence case",
      "avoidAllCapsButtons": true,
      "pillButtons": false,
      "minimumHeight": 44,
      "touchTarget": 44
    }
},

"cards": {
"style": "structured information containers",

    "default": {
      "background": "#121212",
      "border": "1px solid #292929",
      "radius": 10,
      "padding": 16
    },

    "interactive": {
      "background": "#121212",
      "border": "1px solid #292929",
      "pressedBackground": "#181818",
      "pressedBorder": "#3A3A3A"
    },

    "rules": {
      "glass": false,
      "gradientBackground": false,
      "largeShadow": false,
      "decorativeGlow": false,
      "informationHierarchy": "Use typography, spacing, dividers, and accent values rather than decoration."
    }
},

"navigation": {
"style": "compact mobile navigation",
"position": "bottom",
"background": "#101010",
"borderTop": "#292929",
"activeColor": "#FF6A00",
"inactiveColor": "#737373",
"labelStyle": "12px medium",
"iconStyle": "outline",
"iconSize": 22,
"height": 64,
"rules": {
"avoidFloatingNav": true,
"avoidGlassNav": true,
"avoidLargeDecorativeIcons": true
}
},

"icons": {
"style": "minimal technical outline",
"libraryPreference": "Lucide or equivalent",
"strokeWidth": 1.8,
"defaultSize": 20,
"smallSize": 16,
"largeSize": 24,

    "rules": {
      "filledIllustrativeIcons": false,
      "emojiAsUIIcons": false,
      "custom3DIcons": false,
      "consistentStroke": true
    }
},

"financialData": {
"visualTreatment": "precise and restrained",

    "rules": {
      "currency": "Use clear currency labels such as USDC.",
      "largeValues": "Use semibold or bold typography.",
      "numericFont": "JetBrains Mono or tabular numerals.",
      "decimals": "Display only meaningful precision.",
      "positiveValues": "Mint when communicating confirmed incoming/completed funds.",
      "negativeValues": "Neutral or red depending on whether the value represents an expense or failure.",
      "escrow": "Use orange as the primary financial-action indicator."
    }
},

"statusSystem": {
"pending": {
"color": "#F5B942",
"background": "#241C0C"
},
"active": {
"color": "#FF6A00",
"background": "#2A160B"
},
"success": {
"color": "#5EE6B5",
"background": "#0D2119"
},
"danger": {
"color": "#FF5C5C",
"background": "#250F0F"
},
"neutral": {
"color": "#A3A3A3",
"background": "#181818"
},

    "rules": {
      "statusIndicators": "Use small dots, badges, labels, or compact indicators.",
      "animation": "Do not continuously animate status indicators.",
      "meaning": "Color must communicate state, not decoration."
    }
},

"blockchainVisualLanguage": {
"purpose": "Make blockchain functionality understandable without turning the interface into a crypto dashboard.",

    "principles": [
      "Hide unnecessary blockchain complexity.",
      "Expose transaction hashes and explorers when users need verification.",
      "Clearly distinguish confirmed state from pending state.",
      "Make escrow state visually understandable.",
      "Use blockchain terminology only where it improves understanding."
    ],

    "verifiedState": {
      "color": "#5EE6B5",
      "iconStyle": "minimal check or shield",
      "labelExamples": [
        "Verified",
        "On-chain",
        "Confirmed"
      ]
    },

    "transactionState": {
      "pending": "amber",
      "confirmed": "mint",
      "failed": "red"
    }
},

"illustrationAndGraphics": {
"style": "minimal geometric technical graphics",
"usage": "sparingly",

    "allowed": [
      "subtle grid patterns",
      "thin technical lines",
      "simple geometric marks",
      "small orange data accents",
      "minimal blockchain/network diagrams"
    ],

    "avoid": [
      "3D coins",
      "glowing Ethereum logos",
      "floating crypto cubes",
      "purple neon meshes",
      "AI robot imagery",
      "holographic dashboards",
      "generic abstract blobs",
      "stock-style startup illustrations"
    ]
},

"backgroundTreatment": {
"default": "solid",
"texture": "optional extremely subtle noise",
"grid": "optional and sparse",
"gradients": false,
"radialGlows": false,
"neonGlow": false,

    "rule": "The background should disappear behind the content rather than compete with it."
},

"motion": {
"philosophy": "functional motion only",

    "durations": {
      "instant": "100ms",
      "fast": "150ms",
      "normal": "200ms",
      "slow": "300ms"
    },

    "easing": {
      "standard": "ease-out",
      "enter": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      "exit": "cubic-bezier(0.4, 0, 1, 1)"
    },

    "allowed": [
      "button press feedback",
      "screen transitions",
      "bottom-sheet transitions",
      "progress updates",
      "transaction state transitions",
      "subtle list insertion/removal"
    ],

    "prohibited": [
      "constant floating animations",
      "parallax-heavy interfaces",
      "scroll-triggered gimmicks",
      "continuous glowing effects",
      "excessive spring animations"
    ]
},

"interactionDesign": {
"touchTargets": {
"minimum": 44,
"preferred": 48
},

    "feedback": {
      "success": "brief visual confirmation with mint",
      "failure": "clear red error state with actionable explanation",
      "pending": "explicit pending state; never pretend a transaction completed",
      "walletRejection": "explain that the wallet transaction was rejected without treating it as an application error"
    },

    "forms": {
      "style": "clean bordered fields",
      "focusBorder": "#FF6A00",
      "errorBorder": "#FF5C5C",
      "background": "#121212"
    }
},

"accessibility": {
"contrast": "WCAG-conscious high contrast",
"minimumTextContrast": "Prefer at least 4.5:1 for normal text.",
"colorOnlyCommunication": false,
"touchTargets": "Minimum 44px.",
"fontScaling": "Support Android system font scaling without breaking layouts.",
"motionReduction": "Respect reduced-motion preferences where available."
},

"responsiveBehavior": {
"target": "Android phones first",
"orientation": "portrait-first",
"tabletSupport": "layouts should gracefully expand rather than simply scale",

    "principles": [
      "Maintain comfortable touch targets.",
      "Avoid desktop-style dense tables on phones.",
      "Use vertical information hierarchy.",
      "Keep financial values visually prominent.",
      "Do not sacrifice readability for information density."
    ]
},

"brandPersonality": {
"traits": [
"serious",
"technical",
"direct",
"confident",
"modern",
"trustworthy",
"builder-oriented"
],

    "tone": {
      "communication": "concise and factual",
      "microcopy": "action-oriented",
      "avoid": [
        "marketing fluff",
        "crypto hype",
        "AI buzzwords",
        "excessive exclamation marks",
        "corporate jargon"
      ]
    },

    "exampleLanguage": {
      "preferred": [
        "Fund escrow",
        "Submit milestone",
        "Approve payment",
        "Raise dispute",
        "View transaction",
        "Verified on-chain"
      ],
      "avoid": [
        "Unlock the future",
        "Revolutionize your workflow",
        "Powering the decentralized future",
        "Next-generation Web3 experience"
      ]
    }
},

"designAntiPatterns": {
"explicitlyForbidden": [
"purple primary accent",
"purple-blue gradients",
"rainbow gradients",
"glassmorphism everywhere",
"excessive rounded cards",
"neon glow around every element",
"giant hero typography inside functional screens",
"floating 3D crypto assets",
"AI-generated abstract blobs",
"excessive decorative patterns",
"emoji-based navigation",
"gradient text",
"glowing borders",
"dark background with random cyan/purple highlights"
]
},

"implementationGuidelines": {
"platform": "React Native Android",
"styling": "Use a centralized theme/token system rather than hard-coding visual values throughout components.",
"themeTokens": [
"colors",
"typography",
"spacing",
"radii",
"borders",
"elevation",
"statusColors"
],
"componentRule": "Components must consume design tokens and should not introduce arbitrary colors, radii, shadows, or typography.",
"darkMode": "Primary/default theme.",
"lightMode": "Supported secondary theme.",
"consistency": "New components must follow the existing token system instead of creating one-off styles."
},

"designPrinciples": [
"Function before decoration.",
"Orange is the identity, not wallpaper.",
"Mint communicates verified success, not branding.",
"Neutral surfaces carry most of the interface.",
"Borders communicate structure better than heavy shadows.",
"Typography creates hierarchy.",
"Blockchain should feel like infrastructure, not a visual gimmick.",
"Financial information must be precise and immediately understandable.",
"Every color should have a semantic purpose.",
"The interface should look good even with all decorative effects removed."
]
}