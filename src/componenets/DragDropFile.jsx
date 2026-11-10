import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";


// Audio-Validation Schema :

const validationSchema = yup.object().shape({
  audioFile: yup
    .mixed()
    .required('An audio file is required')
    .test('fileRequired', 'Please select a file', (value) => {
      
      return value && value.length > 0;
    })
    .test('fileSize', 'The file is too large (Max: 10MB)', (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= MAX_FILE_SIZE;
    })
    .test('fileType', 'Unsupported audio format', (value) => {
      if (!value || value.length === 0) return true;
      return SUPPORTED_FORMATS.includes(value[0].type);
    }),
});






const DragDropFile= ()=> {
  const [files, setFiles] = useState([]);

  // Handles files added via drop or click
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // Restrict file types (optional)
      'application/pdf': []
    }
  });

  // Remove file from list
  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };



// For Audio-File validation check

const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const onSubmit = (data) => {
   
    const selectedFile = data.audioFile[0]; 
    console.log('Valid file uploaded successfully:', selectedFile);
   
  };


  return (
    <Box sx={{ maxWidth: 500, margin: '20px auto' }} onSubmit={handleSubmit(onSubmit)}>
      {/* Drag & Drop Target Area */}
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          padding: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'text.disabled',
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
         {...register('audioFile')}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        
        {isDragActive ? (
          <Typography variant="body1" color="primary">
            Drop the files here...
          </Typography>
        ) : (
          <Typography variant="body1" >
            Drag 'n' drop audio files here, or click to select files
          </Typography>
        )}
        <Typography variant="caption" color="textSecondary">
          Supports: Images, PDFs
        </Typography>
      </Paper>

      {/* File List Preview */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file) => (
            <ListItem
              key={file.name}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(file.name)}>
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
            >
              <ListItemIcon>
                <InsertDriveFileIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={file.name} 
                secondary={`${(file.size / 1024).toFixed(1)} KB`} 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default DragDropFile;