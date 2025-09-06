import type { FC } from 'react';
import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';

import { useApiStore } from '@/stores/api-store';

export interface RestrictedRouteProps {
    type: 'loginRequired' | 'loginProhibited';
}

const RestrictedRoute: FC<RestrictedRouteProps> = ({ type }) => {
    const user = useApiStore(state => state.user);
    const hasFetchedUser = useApiStore(state => state.hasFetchedUser);

    const navigateTo = useMemo(() => {
        let calculatedRoute: string | null = null;

        if (!hasFetchedUser) {
            // Still fetching user data, do not navigate yet
            return null;
        }

        switch (type) {
            case 'loginRequired': {
                if (!user) {
                    calculatedRoute = '/login';
                }
                break;
            }
            case 'loginProhibited': {
                if (user) {
                    calculatedRoute = '/';
                }
                break;
            }
            default: {
                calculatedRoute = null;
            }
        }

        return calculatedRoute;
    }, [hasFetchedUser, type, user]);

    if (navigateTo) {
        return <Navigate to={navigateTo} replace />;
    }

    return <Outlet />;
};

export default RestrictedRoute;
