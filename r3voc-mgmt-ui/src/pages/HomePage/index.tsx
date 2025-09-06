import type { FC } from 'react';

import Box from '@mui/material/Box';

import FileUploadComponent from '@/components/FileUploadComponent';
import TalkListing from '@/components/TalkListing';

const HomePage: FC = () => (
    <Box>
        <FileUploadComponent />
        <TalkListing />
    </Box>
);

export default HomePage;
