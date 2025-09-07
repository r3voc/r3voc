import type { FC } from 'react';
import { useState } from 'react';

import { lighten } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useApiStore } from '@/stores/api-store';

export interface FileListingProps {
    guid: string;
}

const FileListing: FC<FileListingProps> = ({ guid }) => {
    const renderTalk = useApiStore(state => state.renderTalk);
    const fetchFiles = useApiStore(state => state.fetchFiles);
    const apiKey = useApiStore(state => state.user?.apiKey || '');

    const file = useApiStore(state =>
        state.files?.find(f => f.importGuid === guid),
    );

    const [loading, setLoading] = useState<boolean>(false);

    if (!file) {
        return (
            <Box>
                <Typography>No files found</Typography>
            </Box>
        );
    }

    const performRender = async (): Promise<void> => {
        setLoading(true);

        const result = await renderTalk(file.importId);

        setLoading(false);

        if (result.success) {
            // Optionally, you can add some success feedback here
            console.log('Render initiated successfully');
            await fetchFiles();
        } else {
            // Optionally, you can add some error feedback here
            // eslint-disable-next-line no-alert
            alert(`Failed to initiate render: ${result.error}`);
            console.error('Failed to initiate render:', result.error);
        }
    };

    return (
        <Box
            mt={2}
            color="primary.contrastText"
            p={2}
            borderRadius={2}
            sx={theme => ({
                backgroundColor: lighten(theme.palette.primary.main, 0.75),
                color: theme.palette.getContrastText(
                    lighten(theme.palette.primary.main, 0.75),
                ),
            })}
        >
            <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                    File Details
                </Typography>
                <Typography variant="body1">
                    <strong>Filename:</strong> {file.path}
                </Typography>
                <Typography variant="body1">
                    <strong>ID:</strong> {file.id}
                </Typography>
                <Typography variant="body1">
                    <strong>Rendered:</strong> {file.rendered ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1">
                    <strong>Is Rendering:</strong>{' '}
                    {file.isRendering ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1">
                    <strong>Render-state:</strong> {file.renderState || 'N/A'}
                </Typography>
                <Typography variant="body1">
                    <strong>Import ID:</strong> {file.importId}
                </Typography>
                <Typography variant="body1">
                    <strong>Import GUID:</strong> {file.importGuid}
                </Typography>
            </Box>
            <Box>
                <Button
                    onClick={performRender}
                    variant="contained"
                    // For some reason, mui is buggy
                    loading={Boolean(loading || file.isRendering)}
                    color="success"
                >
                    Render file now
                </Button>
                <a
                    href={`/api/uploaded-files/${file.importGuid}/final.mkv?apiKey=${apiKey}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        textDecoration: 'none',
                        pointerEvents: file.rendered ? 'auto' : 'none',
                    }}
                >
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ ml: 2 }}
                        disabled={!file.rendered}
                    >
                        Download rendered file (also url can be used to import)
                    </Button>
                </a>
            </Box>
        </Box>
    );
};

export default FileListing;
