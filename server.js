const express = require('express');
const carbone = require('carbone');
const multer = require('multer');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/render', upload.single('template'), (req, res) => {
  const data = req.body.data ? JSON.parse(req.body.data) : {};
  const templatePath = req.file.path;

  carbone.render(templatePath, data, (err, result) => {
    fs.unlinkSync(templatePath);
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.setHeader('Content-Disposition', 'attachment; filename=report.docx');
      res.end(result);
    }
  });
});

app.listen(3000, () => console.log('Carbone render server running on port 3000'));