export const startRecording = async (): Promise<MediaRecorder> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      return mediaRecorder;
    } catch (error: unknown) {
      throw new Error('Error accessing microphone: ' + (error as Error).message);
    }
  };
  
  export const stopRecording = (mediaRecorder: MediaRecorder): Promise<{ audioBlob: Blob; duration: number }> => {
    return new Promise((resolve) => {
      let audioChunks: BlobPart[] = [];
      let startTime: number;
  
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
  
      mediaRecorder.onstart = () => {
        startTime = Date.now();
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const duration = (Date.now() - startTime) / 1000; // in seconds
        resolve({ audioBlob, duration });
      };
  
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  };
  
  export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64String = base64data.split(',')[1]; // Remove the data URL prefix
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };