const express = require('express');
const axios = require('axios');
const gTTS = require('google-tts-api');
const app = express();

async function getNewsText() {
  try {
    const response = await axios.get('https://api.allorigins.win/raw?url=https://rotter.net/rss/');
    const rssText = response.data;

    // פשוט נחלץ את כותרות החדשות מ-<title> מתוך ה-RSS (כולל כותרת ראשית)
    const titles = [...rssText.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]);
    
    // נחלץ כ-10 כותרות ראשונות (מעבר לכותרת הראשית של האתר)
    const news = titles.slice(1, 11).join('. ');
    
    return news || "לא נמצאו חדשות";
  } catch {
    return "לא הצלחתי למשוך חדשות מהרוטר.";
  }
}

app.get('/news-stream.mp3', async (req, res) => {
  try {
    const text = await getNewsText();

    const url = gTTS.getAudioUrl(text, {
      lang: 'he',
      slow: false,
      host: 'https://translate.google.com',
    });

    res.redirect(url);
  } catch (e) {
    res.status(500).send('Error generating stream');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
