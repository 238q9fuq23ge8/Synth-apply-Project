// src/components/AutomationStatusBanner.tsx
import { useState, useEffect } from 'react';
import { useAutomation } from '@/contexts/AutomationContext';
import { Loader2, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function AutomationStatusBanner() {
  const { status, fetchStatus, clearRunning } = useAutomation();
  const [elapsedTime, setElapsedTime] = useState('0s');

  // Update elapsed time every second
  useEffect(() => {
    if (!status.is_running || !status.started_at) {
      return;
    }

    const updateElapsedTime = () => {
      const start = new Date(status.started_at!).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      
      setElapsedTime(minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [status.is_running, status.started_at]);

  if (!status.is_running) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin" />
              <Activity className="h-3 w-3 absolute -bottom-1 -right-1 text-green-300" />
            </div>
            
            <div>
              <p className="font-semibold text-sm">
                🤖 AI Automation Running
              </p>
              <p className="text-xs text-purple-100">
                Applying to jobs in background • Elapsed: {elapsedTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={() => {
                fetchStatus();
              }}
            >
              <Activity className="h-3 w-3 mr-1" />
              Check Status
            </Button>
            
            <button
              onClick={clearRunning}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Dismiss (automation continues)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
// import { useEffect } from 'react';
// import { useAutomationStore } from '@/store/automationStore';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Activity, Clock, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export function AutomationStatusBanner() {
//   const {
//     status,
//     isLoading,
//     fetchStatus,
//     clearRunning,
//   } = useAutomationStore();

//   useEffect(() => {
//     // Fetch status on mount
//     fetchStatus();
//   }, []);

//   if (!status.is_running) return null;

//   const getElapsedTime = () => {
//     if (!status.started_at) return '0m';
    
//     const start = new Date(status.started_at);
//     const now = new Date();
//     const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    
//     return `${elapsed}m`;
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ y: -100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: -100, opacity: 0 }}
//         className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
//       >
//         <div className="container mx-auto px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Activity className="h-5 w-5 animate-pulse" />
//               <div>
//                 <p className="font-semibold">AI Automation Running</p>
//                 {status.run_details && (
//                   <p className="text-xs text-purple-100">
//                     Applying to {status.run_details.role} jobs in {status.run_details.country}
//                   </p>
//                 )}
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 text-sm">
//                 <Clock className="h-4 w-4" />
//                 <span>Running for {getElapsedTime()}</span>
//               </div>
              
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 className="text-white hover:bg-white/20"
//                 onClick={() => {
//                   // This just hides the banner, doesn't stop automation
//                   clearRunning();
//                 }}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }