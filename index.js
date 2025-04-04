const express = require('express');
const fetch = require('node-fetch').default;
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());

// Delay aleatorio entre 1 y 3 segundos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Lista de User-Agents realistas para rotar
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) Firefox/115.0',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/118.0.5993.90 Safari/537.36'
];

app.get('/consulta/:placa', async (req, res) => {
  const placa = req.params.placa.toUpperCase();
  const url = `https://consultas.atm.gob.ec/SVT/paginas/svt_datosPersonas.jsp?ps_tipoServicio=MAT&ps_servicio=3&ps_tramite=0&ps_area=&ps_valorParametro1=${placa}`;

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    // Espera aleatoria de 1 a 3 segundos
    await delay(Math.random() * 2000 + 1000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-EC,es;q=0.9',
        'Referer': 'https://consultas.atm.gob.ec/SVT/paginas/svt_datosPersonas.jsp?ps_area=',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    let nombre = '';

    // Buscar el <tr> que contiene "Nombre:"
    $('tr').each((i, el) => {
      const label = $(el).find('td').first().text().trim();
      if (label.includes('Nombre:')) {
        nombre = $(el).find('td').eq(1).text().trim();
      }
    });

    if (nombre) {
      res.json({ placa, nombre });
    } else {
      res.status(404).json({ error: 'No se encontró el nombre del propietario.' });
    }

  } catch (error) {
    console.error('Error al consultar:', error);
    res.status(500).json({ error: 'Error al obtener la información.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚗 Servidor funcionando en http://localhost:${PORT}`);
});

