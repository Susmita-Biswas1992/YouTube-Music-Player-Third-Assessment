import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Slider,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIndicatorIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';

// Yup validation schema for audio file and song name
const schema = yup.object().shape({
  songName: yup.string().required('Song name is required'),
  audioFile: yup
    .mixed()
    .test('fileRequired', 'An audio file is required', (value) => {
      return value && value.length > 0;
    })
    .test('fileType', 'Only audio files (.mp3, .wav, .ogg) are allowed', (value) => {
      if (!value || !value[0]) return true;
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
      return validTypes.includes(value[0].type);
    })
    .test('fileSize', 'File size must be less than 15MB', (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 15 * 1024 * 1024;
    }),
});

const MusicPlay=()=> {
  const [songs, setSongs] = useState([
    { id: 1, name: 'Sample Track 1', url: 'https://soundhelix.com' },
    { id: 2, name: 'Sample Track 2', url: 'https://soundhelix.com' },
  ]);

  const [activeSongId, setActiveSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Rename Dialog State
  const [openRename, setOpenRename] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [newName, setNewName] = useState('');

  const audioRef = useRef(new Audio());

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      songName: '',
      audioFile: null,
    },
  });

  // Handle Play/Pause for a song
  const togglePlaySong = (song) => {
    const audio = audioRef.current;
    if (activeSongId === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = song.url;
      audio.play();
      setActiveSongId(song.id);
      setIsPlaying(true);
    }
  };

  // Add new song form submit
  const onSubmit = (data) => {
    const file = data.audioFile[0];
    const objectUrl = URL.createObjectURL(file);
    const newSong = {
      id: Date.now(),
      name: data.songName,
      url: objectUrl,
    };
    setSongs((prev) => [...prev, newSong]);
    reset();
  };

  // Delete song
  const handleDelete = (id) => {
    if (activeSongId === id) {
      audioRef.current.pause();
      setIsPlaying(false);
      setActiveSongId(null);
    }
    setSongs((prev) => prev.filter((song) => song.id !== id));
  };

  // Open Rename Dialog
  const handleOpenRename = (song) => {
    setEditingSong(song);
    setNewName(song.name);
    setOpenRename(true);
  };

  const handleSaveRename = () => {
    if (!newName.trim()) return;
    setSongs((prev) =>
      prev.map((s) => (s.id === editingSong.id ? { ...s, name: newName } : s))
    );
    setOpenRename(false);
    setEditingSong(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const updatedSongs = [...songs];
    const [movedItem] = updatedSongs.splice(draggedIndex, 1);
    updatedSongs.splice(dropIndex, 0, movedItem);
    setSongs(updatedSongs);
    setDraggedIndex(null);
  };

  return (
    <Box>
  
   <Box sx={{ maxWidth: 800, margin: '2rem auto', padding: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Material UI Music Player Table
      </Typography>

      {/* Add Song Form */}
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, mb: 3}}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignitems="center">
          <Controller
            name="songName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Song Name"
                size="small"
                error={!!errors.songName}
                helperText={errors.songName?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="audioFile"
            control={control}
            render={({ field: { onChange, onBlur, name } }) => (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={errors.audioFile ? 'error' : 'primary'}
              >
                Upload Audio (.mp3/.wav)
                <input
                  type="file"
                  hidden
                  accept="audio/*"
                  name={name}
                  onBlur={onBlur}
                  onChange={(e) => onChange(e.target.files)}
                />
              </Button>
            )}
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ minWidth: 120 }}
          >
            Add Song
          </Button>
        </Stack>
        {errors.audioFile && (
          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
            {errors.audioFile.message}
          </Typography>
        )}
      </Paper>

      {/* Music Player Table / Grid */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Left Side: Music Icon & Play Toggle/Slider */}
              <TableCell width="120px">
                <Stack direction="row" alignitems="center" spacing={1}>
                  <MusicNoteIcon color="primary" />
                  <Typography variant="subtitle2">Play</Typography>
                </Stack>
              </TableCell>

              {/* Right Side: Song List */}

              <Box sx={{display:'flex', flexDirection:'row', gap:2}}>
                <ToggleButton value="left" aria-label="left aligned">
              <FormatAlignLeftIcon/>
              </ToggleButton>

              <TableCell>Song List</TableCell>
              </Box>
              
                

              {/* Right Side: Toggle / Actions after song list */}
               
              <TableCell align="right" width="220px">
                Actions & Toggle
              </TableCell>
 
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map((song, index) => {
              const isCurrentSong = activeSongId === song.id;
              const isThisPlaying = isCurrentSong && isPlaying;

              return (
                <TableRow
                  key={song.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  sx={{ cursor: 'grab', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  {/* Left Side: Music Icon + Play Toggle / Slider */}
                  <TableCell>
                    <Stack direction="row" alignitems="center" spacing={1}>
                      <DragIndicatorIcon color="action" fontSize="small" />
                      <IconButton
                        color="primary"
                        onClick={() => togglePlaySong(song)}
                        aria-label="play-toggle"
                      >
                        {isThisPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      {/* Mini slider / visual indicator when active */}
                      {isCurrentSong && (
                        <Box sx={{ width: 45 }}>
                          <Slider
                            size="small"
                            value={isThisPlaying ? 50 : 0}
                            aria-label="Playing slider"
                          />
                        </Box>
                      )}
                    </Stack>
                  </TableCell>

                  {/* Song Name (Right Side Main Column) */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={isCurrentSong ? 'bold' : 'normal'}
                      color={isCurrentSong ? 'primary.main' : 'textPrimary'}
                    >
                      {song.name}
                    </Typography>
                  </TableCell>

                  {/* Actions: Rename, Delete, Toggle */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifycontent="flex-end" alignitems="center">
                      <IconButton size="small" onClick={() => handleOpenRename(song)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(song.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>


  </Box>
    </Box>
  )};
      

      export default MusicPlay;



