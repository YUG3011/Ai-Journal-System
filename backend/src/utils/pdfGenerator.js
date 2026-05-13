const PDFDocument = require('pdfkit');

async function generateEmotionInsightsPdf(options, user, entries) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // 1. Cover Section
      doc.fontSize(24).font('Helvetica-Bold').text('ReflectAI', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Emotion Insights Report', { align: 'center' });
      doc.moveDown(0.5);
      
      const dateRangeText = 
        options.timeFilter === 'today' ? 'Today\'s Report' :
        options.timeFilter === 'this_week' ? 'This Week\'s Report' :
        options.timeFilter === 'this_month' ? 'This Month\'s Report' : 'This Year\'s Report';
      
      doc.fontSize(12).fillColor('#666666').text(`Time Range: ${dateRangeText}`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);
      
      // Calculate Stats
      const totalEntries = entries.length;
      let mostCommonEmotion = 'N/A';
      let mostActiveDay = 'N/A';
      
      if (totalEntries > 0) {
        const emotionCount = {};
        const dayCount = {};
        entries.forEach(e => {
          if (e.emotion) {
            emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
          }
          const day = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
          dayCount[day] = (dayCount[day] || 0) + 1;
        });
        
        mostCommonEmotion = Object.keys(emotionCount).sort((a, b) => emotionCount[b] - emotionCount[a])[0] || 'N/A';
        mostActiveDay = Object.keys(dayCount).sort((a, b) => dayCount[b] - dayCount[a])[0] || 'N/A';
      }

      // 2. Emotion Summary
      doc.fontSize(18).fillColor('#333333').font('Helvetica-Bold').text('Emotion Summary');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor('#000000');
      doc.text(`Total Entries: ${totalEntries}`);
      doc.text(`Most Common Emotion: ${mostCommonEmotion}`);
      doc.text(`Most Active Day: ${mostActiveDay}`);
      doc.moveDown(1.5);

      // 3. AI Insight Section (Simulated/Basic Summary based on emotions)
      if (options.includeAiSummary) {
        doc.fontSize(18).font('Helvetica-Bold').text('AI Insight');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(
          totalEntries > 0 
            ? `Based on your recent entries, you mostly expressed ${mostCommonEmotion.toLowerCase()} emotions. ` +
              `Keeping a journal helps process these feelings effectively.`
            : 'Not enough entries to generate AI insights.'
        );
        doc.moveDown(1.5);
      }

      // 4 & 5. Mood Distribution Chart / Timeline (Using QuickChart API or simple text)
      if (options.includeEmotionCharts && totalEntries > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Mood Distribution');
        doc.moveDown(0.5);
        
        // Count emotions
        const counts = {};
        entries.forEach(e => {
          if (e.emotion) counts[e.emotion] = (counts[e.emotion] || 0) + 1;
        });
        
        const labels = Object.keys(counts);
        const data = Object.values(counts);
        
        if (labels.length > 0) {
          try {
            const chartConfig = {
              type: 'pie',
              data: {
                labels,
                datasets: [{ data }]
              }
            };
            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=400&h=200`;
            const response = await fetch(chartUrl);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              doc.image(buffer, { fit: [400, 200], align: 'center' });
              doc.moveDown(1);
            }
          } catch (e) {
            console.error('Failed to load chart image', e);
          }
        }
        doc.moveDown(1.5);
      }

      // 6. Mood Streak Information
      if (options.includeMoodStreaks && user) {
        doc.fontSize(18).font('Helvetica-Bold').text('Consistency & Streaks');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Current Streak: ${user.currentStreak} days`);
        doc.text(`Longest Streak: ${user.longestStreak} days`);
        doc.text(`Total Active Days: ${user.totalActiveDays} days`);
        doc.moveDown(1.5);
      }

      // 7. Journal Entry History
      if (options.includeMoodTimeline) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Journal Entry History');
        doc.moveDown(1);
        
        entries.slice(0, 20).forEach((entry, idx) => {
          doc.fontSize(12).font('Helvetica-Bold').text(new Date(entry.createdAt).toLocaleString());
          doc.font('Helvetica').fillColor('#666666').text(`Emotion: ${entry.emotion || 'N/A'}`);
          doc.fillColor('#000000').text(`Preview: ${entry.text.substring(0, 100)}...`);
          doc.moveDown(1);
        });
        
        if (entries.length > 20) {
          doc.text(`... and ${entries.length - 20} more entries.`);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateEmotionInsightsPdf };
