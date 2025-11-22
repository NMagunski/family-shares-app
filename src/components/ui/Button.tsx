import React from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        styles.button,
        {
          [styles.primary]: variant === "primary",
          [styles.secondary]: variant === "secondary",
          [styles.outline]: variant === "outline",
          [styles.danger]: variant === "danger",
          [styles.sm]: size === "sm",
          [styles.md]: size === "md",
          [styles.lg]: size === "lg",
        },
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
