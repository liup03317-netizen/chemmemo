import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative">
      <motion.div
        className="h-full bg-[#58CC02] rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="absolute top-1 right-2 bottom-1 left-2 rounded-full bg-white/20 blur-[1px]" />
      </motion.div>
    </div>
  );
}
