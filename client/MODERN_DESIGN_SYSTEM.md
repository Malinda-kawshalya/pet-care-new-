# Modern Design System - 2027 Standard

## Color Palette
- **Primary**: #0ea5e9 (Cyan/Sky Blue) → #0284c7 (Darker blue)
- **Secondary**: #8b5cf6 (Purple/Violet)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber/Orange)
- **Danger**: #ef4444 (Red)
- **Ink**: #0f0f1f (Dark text)
- **Muted**: #64748b (Gray text)
- **Line**: #e2e8f0 (Border color)
- **Paper**: #ffffff (Card background)
- **Soft**: #f8fafc (Light background)

## Typography
- **Font Family**: Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif
- **Heading Weight**: 700-800
- **Heading Sizes**: 
  - H1: clamp(2rem, 5vw, 3.5rem)
  - H2: clamp(1.5rem, 4vw, 2.5rem)
  - H3: clamp(1.25rem, 3vw, 1.75rem)
- **Body Size**: 1rem / 16px
- **Letter Spacing**: -0.01em (headings)

## Spacing System
- **Section Padding**: 80px vertical, clamp(18px, 5vw, 86px) horizontal
- **Card Padding**: 1.5rem (24px)
- **Gap Spacing**: 12px (buttons), 16px (cards), 20px (grid)
- **Margin Bottom**: 1-2rem between sections

## Border Radius
- **Components**: 12px (buttons, inputs, small cards)
- **Cards**: 16px
- **Large Cards/Sections**: 20px
- **Badges**: 20px (pill-shaped)
- **Images**: 20px

## Shadows
- **Shadow SM**: 0 4px 12px rgba(15, 15, 31, 0.08)
- **Shadow MD**: 0 20px 60px rgba(15, 15, 31, 0.15)  ← Default for cards
- **Shadow LG**: 0 40px 80px rgba(15, 15, 31, 0.2)

## Button Styles

### Primary Button
- Background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)
- Color: white
- Padding: 0.875rem 1.75rem
- Border-radius: 12px
- Font-weight: 700
- Box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3)
- Hover: translateY(-2px), increased shadow
- Transition: all 0.3s ease

### Ghost Button
- Background: rgba(255, 255, 255, 0.8)
- Color: #0f0f1f
- Border: 2px solid rgba(226, 232, 240, 0.8)
- Backdrop-filter: blur(10px)
- Hover: white background, blue border & text, shadow

### Secondary Button
- Background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)
- Color: white
- Similar hover effects to primary

## Card Styles

### Base Card
- Background: white
- Border: 1px solid rgba(226, 232, 240, 0.8)
- Border-radius: 16px
- Padding: 1.5rem
- Box-shadow: 0 4px 12px rgba(15, 15, 31, 0.08)
- Hover: translateY(-4px), 0 20px 50px rgba(15, 15, 31, 0.12), border-color shift
- Transition: all 0.3s ease

### Gradient Card
- Background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)
- Border: 1px solid rgba(14, 165, 233, 0.2)
- Good for action cards, info cards

### Stat Card
- Border-top: 4px solid (color varies by stat type)
- Colored top accent indicator
- Heading in matching color

## Badge Styles
- Display: inline-flex
- Padding: 0.35rem 0.85rem
- Border-radius: 20px
- Font-size: 0.8125rem
- Font-weight: 600
- Background: rgba(color, 0.15)
- Border: 1px solid rgba(color, 0.3)

## Input/Form Styles
- Border-radius: 12px
- Border: 2px solid #e2e8f0
- Padding: 0.75rem 1rem
- Background: #f8fafc
- Focus: #0ea5e9 border, white background, blue shadow

## Hero Section Pattern
- Background: Gradient (linear-gradient(135deg, #ffffff 0%, #f0f9ff 20%, #e0f2fe 40%, ...))
- Grid layout: 2 columns (content + image)
- Gap: 2rem
- Padding: 3rem 2rem
- Border-radius: 20px
- Image: 20px radius, shadow

## Grid Patterns
- **Stat Cards**: repeat(auto-fit, minmax(200px, 1fr))
- **Role Cards**: repeat(auto-fit, minmax(280px, 1fr))
- **Pet Cards**: repeat(auto-fill, minmax(320px, 1fr))
- **Products**: repeat(auto-fill, minmax(240px, 1fr))
- **Modules**: repeat(auto-fit, minmax(260px, 1fr))
- **Features**: repeat(auto-fit, minmax(280px, 1fr))

## Hover Effects
- Primary interaction: translateY(-2px to -4px)
- Box-shadow increase
- Color transitions
- Duration: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## Responsive Breakpoints
- Mobile-first with clamp() functions
- Typical widths use: clamp(18px, 5vw, 86px)
- Typography uses: clamp(value1, vw%, value2)
- Grid columns use: minmax() with auto-fit/auto-fill

## Applied To (2027 Modern)
✅ Home.jsx - Complete redesign
✅ PetProfiles.jsx - Complete modernization  
✅ PetOwnerDashboard.jsx - Modern dashboard cards
⏳ Other dashboards pending
⏳ Auth page pending
⏳ Other pages pending
