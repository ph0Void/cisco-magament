# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# Antigravity Agent Rules

- MODE: EXECUTION ONLY.
- Never write text action plans, summaries, or explanations.
- Never ask for confirmation before modifying code.
- Immediately modify the required files or execute terminal commands.
- Tech Stack: Next.js (App Router, Server Components, Server Actions), React 19, Tailwind CSS v4, Shadcn UI.
- Always use components from '@ai-sdk/ui' or 'ai-element' for chat implementations.
- Read 'package.json' automatically to verify installed dependencies before adding code.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:styling-rules -->
# Styling & UI Development Rules

## Shadcn UI & Tailwind CSS

### Component Structure
- Use Shadcn UI components as the primary UI library with the `radix-nova` style.
- Import components from `@/components/ui` using the configured aliases.
- **Custom components must be placed in `src/components/` directory.**
- All components must be client components only when necessary; prefer server components by default.
- Use the `cn()` utility from `@/lib/utils` for conditional className merging.

### Styling Patterns
- Use Tailwind CSS v4 with PostCSS configuration for styling.
- Apply dark mode support using the `dark:` prefix and CSS variables.
- Use CSS variables from the `globals.css` configuration for theming.
- Follow Shadcn's `radix-nova` style conventions for consistent UI patterns.

### Color Scheme
- Base color: `neutral` with CSS variables enabled.
- Use `--primary` and `--secondary` CSS variables for theming.
- Apply subtle menu accents with `menuAccent: "subtle"` and `menuColor: "default"`.

### Responsive Design
- **Mobile-first approach**: Design for mobile devices first, then scale up.
- Use Tailwind's responsive prefixes:
  - `sm:` (640px) - tablets
  - `md:` (768px) - small laptops
  - `lg:` (1024px) - desktops
  - `xl:` (1280px) - large desktops
  - `2xl:` (1536px) - extra large desktops
- Use responsive grid systems with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Apply responsive spacing with `p-4 md:p-6 lg:p-8`.
- Use responsive typography with `text-base md:text-lg lg:text-xl`.
- Consider using container queries for component-level responsiveness.
- Test layouts across all breakpoints during development.
- Use `flex-col md:flex-row` for responsive flex layouts.
- Apply `w-full sm:w-auto` for responsive width control.
- Use `hidden md:block` for responsive visibility.

### Animations & Transitions
- Use `motion` library for animations and transitions.
- Utilize `tw-animate-css` for Tailwind-based animations.
- Apply `transition-all` and `duration-200` for smooth interactions by default.

### Typography
- Use the `lucide-react` icon library for icons.
- Apply consistent heading and text styles using Tailwind utility classes.
- Use `sonner` for toast notifications and alerts.

### Component Standards
- All UI components must be accessible (ARIA labels, keyboard navigation).
- Use `radix-ui` primitives for complex components (dropdowns, dialogs, etc.).
- Implement `cmdk` for command palette and search interfaces.
- Use `class-variance-authority` for variant-based styling.

### File Organization
- **Shadcn UI components**: `src/components/ui/`
- **ai-elements components**: `src/component/ai-elements/`
- **Custom components**: `src/component/`
- Page components: `src/app/` directory structure
- Styles: `src/app/globals.css`
- Utilities: `src/lib/utils.ts`

### Performance Considerations
- Use Next.js Image component for images.
- Implement lazy loading for heavy components.
- Use Server Components when possible for better performance.
- Apply `use client` directive only for interactive components.

<!-- END:styling-rules -->