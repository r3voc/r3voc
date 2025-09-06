import type React from 'react';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import axios from 'axios';
import moment from 'moment';

import { useApiStore } from '@/stores/api-store';
import { useUiStore } from '@/stores/ui-store';

import { useDebounce } from '@uidotdev/usehooks';

const FileUploadComponent: FC = () => {
    const schedule = useApiStore(state => state.schedule);
    const fetchFiles = useApiStore(state => state.fetchFiles);

    const [fileSize, setFileSize] = useState<number | null>(null);
    const [bytesUploaded, setBytesUploaded] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    const debouncedTimeRemaining = useDebounce(timeRemaining, 500);

    const selectedGuid =
        useUiStore(state => state.selectedTalkImportGuid) || '';
    const setSelectedGuid = useUiStore(
        state => state.setSelectedTalkImportGuid,
    );

    const progress = useMemo(
        () => Math.round(fileSize ? (bytesUploaded / fileSize) * 100 : 0),
        [bytesUploaded, fileSize],
    );

    const handleFormSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        data.set('guid', selectedGuid);

        const guid = data.get('guid') as string | unknown;
        const file = data.get('file') as File | unknown;

        if (!file || !(file instanceof File)) {
            setUploadError('Please select a valid file to upload.');
            return;
        }

        if (!guid) {
            setUploadError('Please provide a valid GUID.');
            return;
        }

        setFileSize(file.size);
        setBytesUploaded(0);
        setUploadError(null);

        const uploadStartTime = Date.now();

        try {
            await axios.post('/api/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: progressEvent => {
                    if (progressEvent.total) {
                        setBytesUploaded(progressEvent.loaded);
                        console.log(
                            `Upload progress: ${progressEvent.loaded} / ${progressEvent.total}`,
                        );
                        const elapsedTime =
                            (Date.now() - uploadStartTime) / 1000; // in seconds
                        const uploadSpeed = progressEvent.loaded / elapsedTime; // bytes per second
                        const remainingBytes =
                            progressEvent.total - progressEvent.loaded;
                        const estimatedSecondsRemaining = Math.round(
                            remainingBytes / uploadSpeed,
                        );
                        setTimeRemaining(
                            `${moment
                                .duration(estimatedSecondsRemaining, 'seconds')
                                .humanize()} remaining`,
                        );
                    }
                },
            });
            setBytesUploaded(file.size);
            setTimeRemaining('Done!');
            setUploadError(null);
            setFileSize(null);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setUploadError(
                    `Upload failed: ${
                        error.response?.data?.error || error.message
                    }`,
                );
            } else if (error instanceof Error) {
                setUploadError(`Upload failed: ${error.message}`);
            } else {
                setUploadError('Upload failed: Unknown error occurred');
            }
            setFileSize(null);
            setBytesUploaded(0);
            setTimeRemaining(null);
        }

        fetchFiles();
    };

    const scheduleOptions: { guid: string; title: string }[] = useMemo(() => {
        if (!schedule) {
            return [];
        }

        return schedule.conference.days.flatMap(day =>
            Object.values(day.rooms).flatMap(room =>
                room.map(event => ({
                    guid: event.guid,
                    title: event.title,
                })),
            ),
        );
    }, [schedule]);

    const searchedOptions = useMemo(() => {
        if (!searchTerm) {
            return scheduleOptions;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return scheduleOptions.filter(
            option =>
                option.title.toLowerCase().includes(lowerSearchTerm) ||
                option.guid.toLowerCase().includes(lowerSearchTerm),
        );
    }, [searchTerm, scheduleOptions]);

    return (
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Upload a raw talk
            </Typography>
            <Typography variant="body1" gutterBottom>
                Upload your talk video file (MP4 or MKV format). This is the
                file after cutting the OBS output to the correct length.
            </Typography>
            {uploadError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                </Alert>
            ) : null}
            <Box mb={2}>
                <LinearProgress
                    variant="determinate"
                    color={
                        uploadError
                            ? 'error'
                            : progress === 100
                              ? 'success'
                              : 'primary'
                    }
                    value={progress}
                    sx={{ height: 10, borderRadius: 5, marginBottom: 2 }}
                />
                {progress}% / 100% (
                {debouncedTimeRemaining
                    ? `${debouncedTimeRemaining}`
                    : 'estimating...'}
                )
            </Box>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleFormSubmit}>
                <FormControl component="fieldset" variant="filled" fullWidth>
                    <Box mb={2}>
                        <Autocomplete
                            options={searchedOptions}
                            getOptionLabel={option =>
                                `${option.title} (${option.guid})`
                            }
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Select Event GUID"
                                    variant="outlined"
                                    required
                                />
                            )}
                            value={
                                scheduleOptions.find(
                                    option => option.guid === selectedGuid,
                                ) || null
                            }
                            onChange={(_, value) => {
                                setSelectedGuid(value?.guid || '');
                            }}
                            onInputChange={(_, value) => setSearchTerm(value)}
                            isOptionEqualToValue={(option, value) =>
                                option.guid === value.guid
                            }
                            fullWidth
                        />
                    </Box>
                    <input type="file" accept=".mp4,.mkv" name="file" />
                    <Box mt={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={fileSize !== null}
                        >
                            Start Upload
                        </Button>
                    </Box>
                </FormControl>
            </form>
        </Paper>
    );
};

export default FileUploadComponent;
