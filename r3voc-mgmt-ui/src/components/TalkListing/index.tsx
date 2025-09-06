import type { FC } from 'react';
import { useMemo, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import FileListing from '@/components/FileListing';
import { useApiStore } from '@/stores/api-store';
import { useUiStore } from '@/stores/ui-store';

const TalkListing: FC = () => {
    const schedule = useApiStore(state => state.schedule);
    const setSelectedGuid = useUiStore(
        state => state.setSelectedTalkImportGuid,
    );

    const [sortMode, setSortMode] = useState<'date-asc' | 'date-desc'>(
        'date-desc',
    );

    const talks = useMemo(() => {
        const allTalks =
            schedule?.conference.days.flatMap(day =>
                Object.values(day.rooms).flat(),
            ) || [];

        return sortMode === 'date-asc'
            ? allTalks.sort((a, b) => {
                  if (!a.date) return 1;
                  if (!b.date) return -1;
                  return (
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  );
              })
            : allTalks.sort((a, b) => {
                  if (!a.date) return 1;
                  if (!b.date) return -1;
                  return (
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
              });
    }, [schedule, sortMode]);

    return (
        <Box display="flex" flexDirection="column" gap={1} my={2}>
            <FormControlLabel
                control={
                    <Switch
                        checked={sortMode === 'date-asc'}
                        onChange={() =>
                            setSortMode(prev =>
                                prev === 'date-asc' ? 'date-desc' : 'date-asc',
                            )
                        }
                    />
                }
                label={`Sort by date: ${sortMode === 'date-asc' ? 'Ascending' : 'Descending'}`}
            />
            {talks?.map(talk => {
                const date = talk.date
                    ? new Date(talk.date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZoneName: 'long',
                      })
                    : 'N/A';

                return (
                    <Accordion key={talk.guid}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                                display="flex"
                                flexDirection="row"
                                justifyContent="space-between"
                                width="100%"
                            >
                                <Box>
                                    <Typography variant="h5">
                                        {talk.title}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {talk.subtitle || 'No subtitle'}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="subtitle2"
                                    color="textSecondary"
                                    alignSelf="center"
                                >
                                    {date}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                <strong>Speaker(s):</strong>{' '}
                                {talk.persons
                                    // eslint-disable-next-line deprecation/deprecation
                                    .map(p => p.public_name || p.name)
                                    .join(', ')}
                            </Typography>
                            <Typography>
                                <strong>Abstract:</strong>{' '}
                                {talk.abstract || 'N/A'}
                            </Typography>
                            <Typography>
                                <strong>Language:</strong>{' '}
                                {talk.language || 'N/A'}
                            </Typography>
                            <Typography>
                                <strong>Date:</strong> {date}
                            </Typography>
                            <Typography>
                                <strong>Duration:</strong>{' '}
                                {talk.duration || 'N/A'}
                            </Typography>
                            <Typography>
                                <strong>GUID:</strong> {talk.guid}
                            </Typography>
                            <Typography>
                                {/* eslint-disable-next-line deprecation/deprecation */}
                                <strong>ID:</strong> {talk.id || 'N/A'}
                            </Typography>
                            <textarea
                                readOnly
                                style={{ width: '100%', marginTop: '10px' }}
                                rows={6}
                                value={
                                    talk.description ||
                                    'No description provided.'
                                }
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ my: 1 }}
                                onClick={() => setSelectedGuid(talk.guid)}
                            >
                                Select this talk for upload
                            </Button>
                            <FileListing guid={talk.guid} />
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default TalkListing;
