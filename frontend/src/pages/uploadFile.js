import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const UploadFile = ({ onFileUploaded }) => {
  const [fileName, setFileName] = useState(""); // État pour stocker le nom du fichier

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFileName(file.name); // Met à jour le nom du fichier
    try {
      const jsonData = await readExcelFile(file);
      console.log(jsonData);
      // Créer un objet pour stocker les sommes par numéro d'article
      const sumByArticleNumber = {};

      // Parcourir les données et calculer les sommes par numéro d'article
      jsonData.forEach(row => {
        const articleNumber = row[3]; // Supposons que le numéro d'article est à l'indice 3 du tableau
        const quantitySold = parseInt(row[8]); // Supposons que la quantité vendue est à l'indice 8 du tableau
        if (articleNumber && !isNaN(quantitySold)) { // Vérifier que le numéro d'article et la quantité vendue sont présents
          if (sumByArticleNumber.hasOwnProperty(articleNumber)) {
            sumByArticleNumber[articleNumber] += quantitySold;
          } else {
            sumByArticleNumber[articleNumber] = quantitySold;
          }
        }
      });

      // Afficher les sommes par numéro d'article
      console.log('Sommes par numéro d\'article :', sumByArticleNumber);

      // Appeler la fonction de rappel avec les données Excel et les sommes calculées
      onFileUploaded({ jsonData, sumByArticleNumber });

    } catch (error) {
      console.error("Une erreur s'est produite lors de la lecture du fichier :", error);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx' });

  const readExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        resolve(jsonData);
      };
  
      fileReader.onerror = (error) => {
        reject(error);
      };
  
      fileReader.readAsArrayBuffer(file);
    });
  };

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Fichier à télécharger</p>
        {fileName && <p>Nom du fichier : {fileName}</p>} {/* Affiche le nom du fichier si disponible */}
      </div>
    </div>
  );
};

export default UploadFile;
