"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Eye, EyeOff, X } from "lucide-react";

const inputVariants = cva(
  "flex w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm ring-offset-white dark:ring-offset-zinc-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
  {
    variants: {
      variant: {
        default: "border-zinc-200 dark:border-zinc-800",
        destructive:
          "border-red-500 focus-visible:ring-red-500",
        ghost:
          "border-transparent bg-zinc-100 dark:bg-zinc-800 focus-visible:bg-white dark:focus-visible:bg-zinc-900 focus-visible:border-zinc-200 dark:focus-visible:border-zinc-800",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-9 px-3 py-1 text-xs",
        lg: "h-14 px-5 py-3 text-base",
        xl: "h-16 px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = "text",
      leftIcon,
      rightIcon,
      error,
      clearable,
      onClear,
      value,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      props.defaultValue || "",
    );
    
    // Create internal ref if no ref is provided
    const internalRef = React.useRef<HTMLInputElement>(null);
    const inputRef = ref || internalRef;

    const inputVariant = error ? "destructive" : variant;
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    // Determine if this is a controlled component
    const isControlled = value !== undefined;
    const inputValue = isControlled ? value : internalValue;
    const showClearButton =
      clearable && inputValue && String(inputValue).length > 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      props.onChange?.(e);
    };

    const handleClear = () => {
      // Get reference to the input element
      const inputElement = typeof inputRef === 'function' ? null : inputRef?.current;
      
      if (inputElement) {
        // Set the input's value directly
        inputElement.value = "";
        
        // Create a proper synthetic event
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: inputElement
        });
        
        // Dispatch the event to trigger onChange handlers
        inputElement.dispatchEvent(event);
      }

      // Update internal state for uncontrolled components
      if (!isControlled) {
        setInternalValue("");
      }
      
      // Call the onClear callback
      onClear?.();
      
      // Create synthetic React event for onChange
      if (props.onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.ChangeEvent<HTMLInputElement>;
        
        props.onChange(syntheticEvent);
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 [&_svg]:size-5 [&_svg]:shrink-0 z-10">
            {leftIcon}
          </div>
        )}

        <input
          type={actualType}
          className={cn(
            inputVariants({ variant: inputVariant, size, className }),
            leftIcon && "pl-12",
            (rightIcon || isPassword || showClearButton) && "pr-12"
          )}
          ref={inputRef as React.Ref<HTMLInputElement>}
          {...(isControlled
            ? { value: inputValue }
            : { defaultValue: props.defaultValue })}
          onChange={handleInputChange}
          {...(({ defaultValue, ...rest }) => rest)(props)}
        />

        {/* Right side icons container */}
        {(rightIcon || isPassword || showClearButton) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            {/* Custom right icon */}
            {rightIcon && (
              <div className="text-zinc-500 [&_svg]:size-5 [&_svg]:shrink-0">
                {rightIcon}
              </div>
            )}

            {/* Clear button */}
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors [&_svg]:size-5 [&_svg]:shrink-0"
                tabIndex={-1}
              >
                <X />
              </button>
            )}

            {/* Password visibility toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors [&_svg]:size-5 [&_svg]:shrink-0"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
