import type { FC } from 'react';
import { useEffect } from 'react';
import * as React from 'react';

import { useApiStore } from '@/stores/api-store';

export interface ApiFetchWrapperProps {
    children: React.ReactNode;
}

const ApiFetchWrapper: FC<ApiFetchWrapperProps> = ({ children }) => {
    const user = useApiStore(state => state.user);

    const fetchUser = useApiStore(state => state.fetchUser);
    const fetchSchedule = useApiStore(state => state.fetchSchedule);
    const fetchFiles = useApiStore(state => state.fetchFiles);
    const fetchInfo = useApiStore(state => state.fetchInfo);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            await fetchSchedule();
            await fetchFiles();
        };

        let intervalId: NodeJS.Timeout;

        if (user) {
            fetchData(); // Initial fetch
            intervalId = setInterval(fetchData, 10 * 1000); // Fetch every 10 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchSchedule, user, fetchFiles]);

    return <>{children}</>;
};

export default ApiFetchWrapper;
