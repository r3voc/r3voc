import type { FC } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useApiStore } from '@/stores/api-store';

const CalendarEmbed: FC = () => {
    const user = useApiStore(state => state.user);
    const url = useApiStore(state => state.info?.calendarEmbedUrl);

    if (!user) {
        return null;
    }

    if (!url) {
        return (
            <Alert sx={{ mb: 2 }} severity="warning">
                <Typography>Calendar embed URL is not configured.</Typography>
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                // make this full height
                height: `calc(100vh - 64px)`,
                width: '100%',
                border: 'none',
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            <iframe width="100%" height="100%" src={url}></iframe>
        </Box>
    );
};

export default CalendarEmbed;
