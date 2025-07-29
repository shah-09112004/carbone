const express = require('express');
const carbone = require('carbone');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/render', async (req, res) => {
  const { templateUrl, data } = req.body;

  if (!templateUrl || !data) {
    return res.status(400).json({ error: 'templateUrl and data are required.' });
  }

  try {
    // 1. Download the template from Supabase
    const response = await axios.get(templateUrl, { responseType: 'arraybuffer' });
    const tempFilePath = path.join(__dirname, 'temp_template.docx');
    fs.writeFileSync(tempFilePath, response.data);

    // 2. Render the template to DOCX (no PDF conversion)
    carbone.render(tempFilePath, data, (err, result) => {
      // Delete temp file
      fs.unlinkSync(tempFilePath);

      if (err) {
        console.error('Carbone render error:', err);
        return res.status(500).send('Rendering failed: ' + err.message);
      }

      // 3. Send the DOCX as downloadable file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment; filename="output.docx"');
      res.end(result);
    });

  } catch (err) {
    console.error('Download or render error:', err);
    res.status(500).json({ error: 'Failed to process template: ' + err.message });
  }
});

app.listen(3000, () => {
  console.log('Carbone DOCX render server running on http://localhost:3000');
});