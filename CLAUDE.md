# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Any Shape Form is a lightweight, type-safe React form library that provides a flexible API for form management, validation, and state control. The library is built with TypeScript and emphasizes minimal bundle size, type safety, and zero unnecessary re-renders.

## Development Commands

```bash
# Run development server (Vite)
npm run dev

# Build library for distribution
npm run build

# Run tests with type checking
npm test

# Run linting
npm run lint

# Start Storybook for component documentation
npm run storybook

# Build Storybook for production
npm run build-storybook
```

## Architecture

### Core Architecture Pattern

The library uses a **subscription-based state management** pattern centered around the `FormApi` class. This architecture enables:
- Form state access outside of React components
- Fine-grained subscriptions to prevent unnecessary re-renders
- Type-safe field access through TypeScript generics

### Key Components

**FormApi (`src/FormApi.ts`)**
- Core state management class that handles all form operations
- Manages field values, validation rules, errors, and subscriptions
- Provides subscriber pattern for field changes, errors, and validation status
- Tracks visible fields and validation state per field

**createForm function (`src/useForm.tsx`)**
- Factory function that creates a typed form instance
- Returns a compound component with `Form`, `Form.Item`, `Form.ArrayItem`, and hooks (`useWatch`, `useField`, `useFieldErrors`, `useArrayField`)
- Each form instance has its own isolated `FormApi` instance

**Form Component (`src/Form.tsx`)**
- React component wrapper that connects to FormApi
- Handles form submission and validation triggers
- Provides FormContext for child components

**FormItem Component (`src/FormItem.tsx`)**
- Renders individual form fields with validation
- Supports custom render functions for labels and errors
- Handles validation rules and triggers (onChange, onFinish)

**FormArrayItem Component (`src/FormArrayItem.tsx`)**
- Manages array fields with add/remove/update operations
- Provides `useArrayField` hook for array field manipulation

### Hooks

- `useWatch(form, field)` - Subscribe to field value changes
- `useField(form, field)` - Get field value and setter function
- `useFieldValidation(form, field)` - Get validation errors and status
- `useArrayField(form, field, rules?)` - Manage array field operations

### Validation System

Validation is promise-based and supports:
- Built-in rules: `required`, `min`, `max`, `pattern`, `email`
- Custom async validators
- Validation triggers: `onChange` (debounced) or `onFinish` (on submit)
- Per-field validation status tracking: `notStarted`, `validating`, `success`, `error`

Validation logic is in `src/basicValidation.ts` and `src/helpers/getValidationErrors.ts`.

### Type System

**Generic Type Flow:**
- `FormApi<State>` - State shape is captured at instantiation
- `GetFields<State>` helper extracts valid field keys
- `ArrayOnlyFields<State>` filters to array-type fields only
- All hooks and components inherit types from the FormApi instance

See `src/typesHelpers.ts` for type utilities.

## Project Structure

```
src/
├── index.ts              # Main exports
├── Form.tsx              # Form component
├── FormItem.tsx          # Field component
├── FormArrayItem.tsx     # Array field component
├── FormApi.ts            # Core state management
├── FormContext.ts        # React context utilities
├── useForm.tsx           # Form creation and hooks
├── types.ts              # Type definitions
├── typesHelpers.ts       # Generic type utilities
├── basicValidation.ts    # Built-in validators
└── helpers/              # Utility functions

test/                     # Vitest tests
stories/                  # Storybook examples
```

## Testing

- Tests use Vitest with jsdom environment
- Test setup in `test/setup.ts`
- Run tests: `npm test`
- Tests cover FormApi methods, validation, and React integration

## Build Configuration

- **Vite** for bundling (ES modules only)
- **vite-plugin-dts** for TypeScript declarations
- **terser** for minification
- Output: `dist/bundle.es.js` with tree-shaking support
- External deps: react, react-dom

## Important Patterns

1. **Subscription cleanup**: All subscription methods in FormApi return cleanup functions
2. **Type inference**: Use `FormApiGenericTypes<typeof form>` to extract state/field types
3. **Field visibility**: FormApi tracks visible fields to validate only mounted fields
4. **Immutable updates**: State updates trigger subscriber callbacks only for changed fields
5. **Validation state**: Each field has independent validation status to support async validation
