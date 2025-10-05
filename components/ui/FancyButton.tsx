import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { cn } from '@/lib/utils';
import type { EmotionalStyle } from '@/types/emotional';

export type ButtonVariant = 'default' | 'green' | 'red' | 'blue' | 'indigo' | 'yellow';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface FancyButtonProps {
    icon?: React.ReactNode;
    children?: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
    playSound?: boolean;
    emotionalMode?: 'auto' | 'manual';
}

const variantClasses: Record<ButtonVariant, string> = {
    default: ({ colors }: EmotionalStyle) => `border-white/10 hover:border-white/30 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 hover:shadow-white/20`,
    green: ({ colors }: EmotionalStyle) => `border-${colors.primary}/20 hover:border-${colors.primary}/50 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-${colors.primary}/10 hover:to-black/40 hover:shadow-${colors.primary}/30`,
    red: 'border-red-500/20 hover:border-red-500/50 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-red-500/10 hover:to-black/40 hover:shadow-red-500/30',
    blue: 'border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-blue-500/10 hover:to-black/40 hover:shadow-blue-500/30',
    indigo: 'border-indigo-500/20 hover:border-indigo-500/50 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-indigo-500/10 hover:to-black/40 hover:shadow-indigo-500/30',
    yellow: 'border-yellow-500/20 hover:border-yellow-500/50 bg-gradient-to-tr from-black/60 to-black/40 hover:bg-gradient-to-tr hover:from-yellow-500/10 hover:to-black/40 hover:shadow-yellow-500/30'
};

const glowGradientClasses: Record<ButtonVariant, string> = {
    default: 'via-white/10',
    green: 'via-green-400/20',
    red: 'via-red-400/20',
    blue: 'via-blue-400/20',
    indigo: 'via-indigo-400/20',
    yellow: 'via-yellow-400/20'
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
};

const iconSizeClasses: Record<ButtonSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
};

export const FancyButton: React.FC<FancyButtonProps> = ({
    icon,
    children,
    variant = 'default',
    size = 'md',
    isLoading = false,
    disabled = false,
    onClick,
    className = '',
    ariaLabel,
    playSound = true,
    emotionalMode = 'auto'
}) => {
    const [rippleStyle, setRippleStyle] = useState({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { context } = useTaraStudio();
    const { getEmotionalStyle } = useEmotionalStyling();

    // Get emotional styling if in auto mode
    const emotionalStyle = emotionalMode === 'auto' && context?.emotional_state
        ? getEmotionalStyle(context.emotional_state)
        : {};

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;

        // Ripple effect
        const button = buttonRef.current;
        if (button) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setRippleStyle({
                left: `${x}px`,
                top: `${y}px`
            });
        }

        // Play sound if enabled
        if (playSound) {
            const audio = new Audio('/sounds/click.mp3');
            audio.volume = 0.5;
            audio.play();
        }

        onClick?.();
    };

    return (
        <motion.button
            ref={buttonRef}
            onClick={handleClick}
            aria-label={ariaLabel}
            disabled={disabled || isLoading}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
                'relative overflow-hidden rounded-lg border backdrop-blur-lg shadow-lg transition-all duration-300 ease-out',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variantClasses[variant],
                sizeClasses[size],
                className,
                emotionalStyle?.containerStyle
            )}
            style={{
                ...emotionalStyle?.customStyle,
                '--glow-color': emotionalStyle?.colors?.primary || 'transparent'
            } as React.CSSProperties}
        >
            {/* Ripple effect */}
            <span
                className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20',
                    'animate-ripple pointer-events-none'
                )}
                style={rippleStyle}
            />

            {/* Glow gradient */}
            <motion.div
                className={cn(
                    'absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full',
                    'group-hover:translate-x-full transition-transform duration-700 ease-out',
                    glowGradientClasses[variant]
                )}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <motion.div
                            className={cn('animate-spin', iconSizeClasses[size])}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            ⟳
                        </motion.div>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && (
                            <span className={iconSizeClasses[size]}>
                                {icon}
                            </span>
                        )}
                        {children}
                    </>
                )}
            </div>
        </motion.button>
    );
};

export default FancyButton;