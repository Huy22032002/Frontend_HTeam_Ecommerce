export const downloadExcelFile = (data: Blob, filename: string) => {

    const url = window.URL.createObjectURL(new Blob([data]));
  
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    
    // Clean up the Blob URL
    window.URL.revokeObjectURL(url);
};

export const getFilenameFromContentDisposition = (contentDisposition: string): string => {
    try {
        const filename = contentDisposition
        .split("filename=")[1]
        .split('"')[1] || "export.xlsx";
        return filename;
    } catch (e) {
        return "export.xlsx";
    }
};
