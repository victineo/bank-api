const express = require('express'); // Run 'npm install express' on project directory terminal
const fs = require('fs'); // Run 'npm install fs' on project directory terminal
const swaggerUI = require('swagger-ui-express'); // Run 'npm install swagger-ui-express' on project directory terminal
const yaml = require('yaml'); // Run 'npm install yaml' on ptoject directory terminal

const file = fs.readFileSync('./swagger.yaml', 'utf-8'); // Make sure the path goes to the right file
const swaggerDoc = yaml.parse(file)

const router = express.Router();

router.use('/', swaggerUI.serve);
router.get('/', swaggerUI.setup(swaggerDoc));

module.exports = router;