
interface AvatarProps {
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const colors = [
    'from-teal-600 to-teal-700',
    'from-slate-600 to-slate-700',
    'from-blue-600 to-blue-700',
    'from-emerald-600 to-emerald-700',
    'from-indigo-600 to-indigo-700',
    'from-cyan-600 to-cyan-700',
    'from-sky-600 to-sky-700'
];

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
};

const getColorClass = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export default function Avatar({ name = '?', size = 'md', className = '' }: AvatarProps) {
    const initial = name.charAt(0).toUpperCase();
    const colorGradient = getColorClass(name);
    const sizeClass = sizeClasses[size];

    return (
        <div className={`rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white/10 shrink-0 select-none bg-gradient-to-br ${colorGradient} ${sizeClass} ${className}`}>
            {initial}
        </div>
    );
}
