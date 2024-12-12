const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

// Paths
const excelFilePath = 'C:\\Users\\debra\\Downloads\\bhubaneswar modified 2.xlsx';
const bhubaneswarFolderPath = 'C:\\Users\\debra\\Downloads\\bhubaneswar_image\\image';

// Step 1: Read the Uid values from the Excel file
function getUidFromExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return sheetData.map(row => row.Uid); // Extract the Uid column
}

// Step 2: Get all subfolder names in the Bhubaneswar folder
function getSubfolders(folderPath) {
    return fs.readdirSync(folderPath).filter(item => {
        const itemPath = path.join(folderPath, item);
        return fs.statSync(itemPath).isDirectory(); // Ensure it's a folder
    });
}

// Step 3: Delete unwanted subfolders
function deleteUnwantedFolders(folderPath, validUids) {
    const allSubfolders = getSubfolders(folderPath);
    const unwantedFolders = allSubfolders.filter(folder => !validUids.includes(folder));

    unwantedFolders.forEach(folder => {
        const folderPathToDelete = path.join(folderPath, folder);
        fs.rmSync(folderPathToDelete, { recursive: true, force: true });
    });

    return unwantedFolders; // Return the list of deleted folders
}

// API Endpoint to clean up folders
app.get('/cleanup', (req, res) => {
    try {
        // Step 1: Get valid Uids from the Excel file
        const validUids = getUidFromExcel(excelFilePath);

        // Step 2: Identify and delete unwanted folders
        const deletedFolders = deleteUnwantedFolders(bhubaneswarFolderPath, validUids);

        // Step 3: Respond with the results
        res.json({
            success: true,
            message: `${deletedFolders.length} unwanted folders deleted.`,
            deletedFolders,
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
