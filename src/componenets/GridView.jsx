
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";



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




const GridView = () => {

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
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div>
        <label htmlFor="audioFile" style={{ display: 'block', marginBottom: '8px' }}>
          Upload Track:
        </label>
        <input
          id="audioFile"
          type="file"
          accept="audio/*" // Native browser filtering
          {...register('audioFile')}
        />
        
        {/* 4. Conditionally display error messages */}
        {errors.audioFile && (
          <p style={{ color: 'red', marginTop: '4px' }}>
            {errors.audioFile.message}
          </p>
        )}
      </div>

      <button type="submit" style={{ marginTop: '16px' }}>
        Load into Player
      </button>
    </form>
  );
}

export default GridView