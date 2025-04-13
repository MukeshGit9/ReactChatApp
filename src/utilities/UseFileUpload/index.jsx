import axios from "axios";
import { useState } from "react";

const UseFileUpload = (socketRef, SOCKET_SERVER_URL) => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSelectedFile(files);
    const newPreviews = [];


    // for preview
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            type: "image",
            src: reader.result,
            name: file.name,
          });
          if (newPreviews.length === files.length) setPreview(newPreviews);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            type: "video",
            src: reader.result,
            name: file.name,
          });
          if (newPreviews.length === files.length) setPreview(newPreviews);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        newPreviews.push({ type: "pdf", name: file.name });
        if (newPreviews.length === files.length) setPreview(newPreviews);
      } else {
        newPreviews.push({ type: "other", name: file.name });
        if (newPreviews.length === files.length) setPreview(newPreviews);
      }
    });
  };

  // upload files handle
  const handleUpload = async (receiverId) => {
    console.log(selectedFile);
    if (!selectedFile) return;

    const formData = new FormData();
    // formData.append("files", selectedFile); // 'files' should match what your Multer middleware expects
    selectedFile.forEach((file) => formData.append("files", file));

    console.log("2 selected fiels", selectedFile);

    try {
      const response = await axios.post(
        `${SOCKET_SERVER_URL}/api/upload`,
        formData,
        {
          headers: {},
        }
      );

      // const uploadedFile = response?.data?.files[0];
      const uploadedFile = response?.data?.files;

      if (!uploadedFile || uploadedFile.length === 0) {
        console.error("No file received from server");
        return;
      }

      uploadedFile.forEach((uploadedFile) => {
        socketRef.current.emit("upload_file", {
          receivedId: receiverId,
          originalName: uploadedFile.originalName,
          fileName: uploadedFile.fileName,
          fileMimeType: uploadedFile.mimeType,
          fileUrl: uploadedFile.fileUrl,
          size: uploadedFile.size,
        });
      });

      setSelectedFile([]);
      setPreview([]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  

  return {
    selectedFile,
    preview,
    handleFileChange,
    handleUpload,
    setPreview
  };
};

export default UseFileUpload;
