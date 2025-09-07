import type { FC } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import FileUploadComponent from '@/components/FileUploadComponent';
import TalkListing from '@/components/TalkListing';

const HomePage: FC = () => (
    <Box>
        <FileUploadComponent />
        <Divider
            sx={{
                my: 2,
            }}
        />
        <TalkListing />
    </Box>
);

export default HomePage;
