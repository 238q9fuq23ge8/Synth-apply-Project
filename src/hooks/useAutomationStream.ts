import { useEffect, useRef, useState } from 'react';
import { automationApi } from '@/lib/automationApi';

export function useAutomationStream(runId: string) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ successful: 0, failed: 0, processed: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;

    eventSourceRef.current = automationApi.connectToStream(runId, (data) => {
      // Add log message
      if (data.msg) {
        setLogs((prev) => [...prev, `[${(data.type || 'INFO').toUpperCase()}] ${data.msg}`]);
      }

      // Update progress on success events
      if (data.type === 'success') {
        setProgress((prev) => ({ ...prev, successful: prev.successful + 1, processed: prev.processed + 1 }));
      }

      // Update progress object if provided
      if (data.progress) {
        setProgress(data.progress);
      }

      // Handle completion
      if (data.type === 'completion') {
        setIsComplete(true);
        if (data.total_applied) {
          setProgress((prev) => ({
            ...prev,
            successful: data.successful ?? prev.successful,
            total: data.total_applied,
          }));
        }
        // Close stream on completion
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      }

      // Close on error
      if (data.type === 'error') {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      }
    });

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [runId]);

  return { logs, progress, isComplete };
}
