// src/contexts/AutomationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

interface AutomationStatus {
    is_running: boolean;
    run_id: string | null;
    started_at: string | null;
}

interface AutomationContextType {
    status: AutomationStatus;
    isLoading: boolean;
    fetchStatus: () => Promise<void>;
    setRunning: (runId: string) => void;
    clearRunning: () => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export function AutomationProvider({ children }: { children: React.ReactNode }) {
    const [activeAutomation, setActiveAutomation] = useState<any>(null);

    const [status, setStatus] = useState<AutomationStatus>({
        is_running: false,
        run_id: null,
        started_at: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastCheckedRef = useRef<number>(0);

    const fetchStatus = useCallback(async () => {
        const now = Date.now();

        // Prevent fetching too frequently (min 5 seconds between checks)
        if (now - lastCheckedRef.current < 5000) {
            return;
        }

        lastCheckedRef.current = now;
        setIsLoading(true);

        try {
            // 🔥 1) Get Supabase session token
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token;

            if (!accessToken) {
                console.warn("⚠️ No auth token found, skipping status check.");
                setActiveAutomation(null);
                return;
            }

            // 🔥 2) Call backend with Authorization header
            const response = await api.get("/v1/automation/status", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = response.data;

            console.log('📊 Automation status:', data);

            setStatus({
                is_running: data.has_active || data.is_running || false,
                run_id: data.run_id || null,
                started_at: data.started_at || null,
            });
        } catch (error: any) {
            console.error('❌ Failed to fetch automation status:', error);

            // On 404, assume no active automation
            if (error?.response?.status === 404) {
                setStatus({ is_running: false, run_id: null, started_at: null });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setRunning = useCallback((runId: string) => {
        console.log('🚀 Setting automation running:', runId);
        setStatus({
            is_running: true,
            run_id: runId,
            started_at: new Date().toISOString(),
        });
    }, []);

    const clearRunning = useCallback(() => {
        console.log('🛑 Clearing automation running status');
        setStatus({
            is_running: false,
            run_id: null,
            started_at: null,
        });

        // Stop polling when cleared
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    // Start/stop polling based on automation status
    useEffect(() => {
        if (status.is_running) {
            console.log('🔄 Starting automation status polling');

            // Clear any existing interval
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }

            // Poll every 10 seconds
            pollingIntervalRef.current = setInterval(() => {
                fetchStatus();
            }, 10000);
        } else {
            // Stop polling when not running
            if (pollingIntervalRef.current) {
                console.log('⏹️ Stopping automation status polling');
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [status.is_running, fetchStatus]);

    // Check status on mount
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // Listen for automation completion events
    useEffect(() => {
        const handleAutomationComplete = () => {
            console.log('🎉 Automation completed event - clearing status');
            clearRunning();
        };

        window.addEventListener('automation-completed', handleAutomationComplete);

        return () => {
            window.removeEventListener('automation-completed', handleAutomationComplete);
        };
    }, [clearRunning]);

    return (
        <AutomationContext.Provider value={{ status, isLoading, fetchStatus, setRunning, clearRunning }}>
            {children}
        </AutomationContext.Provider>
    );
}

export function useAutomation() {
    const context = useContext(AutomationContext);
    if (context === undefined) {
        throw new Error('useAutomation must be used within AutomationProvider');
    }
    return context;
}