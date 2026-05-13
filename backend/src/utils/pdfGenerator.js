const PDFDocument = require('pdfkit');

const COLORS = {
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  bg: '#F9FAFB',
  forest: '#10B981',
  forestBg: '#ECFDF5',
  ocean: '#3B82F6',
  oceanBg: '#EFF6FF',
  mountain: '#8B5CF6',
  mountainBg: '#F5F3FF',
  defaultAccent: '#6366F1',
  defaultBg: '#EEF2FF',
  streak: '#F59E0B',
  streakBg: '#FFFBEB'
};

function getAccentColor(ambience) {
  if (ambience === 'forest') return { accent: COLORS.forest, bg: COLORS.forestBg, label: 'Forest' };
  if (ambience === 'ocean') return { accent: COLORS.ocean, bg: COLORS.oceanBg, label: 'Ocean' };
  if (ambience === 'mountain') return { accent: COLORS.mountain, bg: COLORS.mountainBg, label: 'Mountain' };
  return { accent: COLORS.defaultAccent, bg: COLORS.defaultBg, label: 'General' };
}

function drawRoundedRect(doc, x, y, w, h, r, fillColor, strokeColor) {
  doc.roundedRect(x, y, w, h, r).fillAndStroke(fillColor, strokeColor);
}

async function generateEmotionInsightsPdf(options, user, entries) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      // Draw global background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.bg);

      // --- STATS CALCULATION ---
      const totalEntries = entries.length;
      let mostCommonEmotion = 'N/A';
      let mostCommonAmbience = 'forest';
      let mostActiveDay = 'N/A';

      if (totalEntries > 0) {
        const emotionCount = {};
        const ambienceCount = {};
        const dayCount = {};
        entries.forEach(e => {
          if (e.emotion) emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
          if (e.ambience) ambienceCount[e.ambience] = (ambienceCount[e.ambience] || 0) + 1;
          const day = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
          dayCount[day] = (dayCount[day] || 0) + 1;
        });

        mostCommonEmotion = Object.keys(emotionCount).sort((a, b) => emotionCount[b] - emotionCount[a])[0] || 'N/A';
        mostCommonAmbience = Object.keys(ambienceCount).sort((a, b) => ambienceCount[b] - ambienceCount[a])[0] || 'forest';
        mostActiveDay = Object.keys(dayCount).sort((a, b) => dayCount[b] - dayCount[a])[0] || 'N/A';
      }

      const theme = getAccentColor(mostCommonAmbience);

      // --- HEADER SECTION ---
      let startY = 50;
      doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text('ReflectAI', margin, startY, { align: 'center' });
      
      const timeFilterMap = {
        today: 'Today\'s Report',
        this_week: 'This Week',
        this_month: 'This Month',
        this_year: 'This Year'
      };
      const timeRangeText = timeFilterMap[options.timeFilter] || 'All Time';
      
      doc.fontSize(14).font('Helvetica').fillColor(COLORS.textSecondary).text('Emotion Insights Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor(COLORS.textMuted).text(`${timeRangeText}  •  Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      let currentY = doc.y + 30;

      // --- HERO SECTION: MOST COMMON EMOTION ---
      const heroHeight = 110;
      drawRoundedRect(doc, margin, currentY, contentWidth, heroHeight, 12, theme.bg, theme.accent);
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor(theme.accent).text('Dominant Emotion', margin + 20, currentY + 20);
      doc.fontSize(26).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text(`${theme.label} ${mostCommonEmotion.charAt(0).toUpperCase() + mostCommonEmotion.slice(1)}`, margin + 20, currentY + 45);
      
      currentY += heroHeight + 20;

      // --- QUICK STATS ROW ---
      const statCardWidth = (contentWidth - 20) / 3;
      const statCardHeight = 80;

      // Total Entries
      drawRoundedRect(doc, margin, currentY, statCardWidth, statCardHeight, 8, COLORS.cardBg, COLORS.cardBorder);
      doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Total Entries', margin + 15, currentY + 15);
      doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text(totalEntries.toString(), margin + 15, currentY + 35);

      // Current Streak
      drawRoundedRect(doc, margin + statCardWidth + 10, currentY, statCardWidth, statCardHeight, 8, COLORS.cardBg, COLORS.cardBorder);
      doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Current Streak', margin + statCardWidth + 25, currentY + 15);
      doc.fontSize(22).font('Helvetica-Bold').fillColor(COLORS.streak).text(`${user?.currentStreak || 0}`, margin + statCardWidth + 25, currentY + 35);

      // Active Days
      drawRoundedRect(doc, margin + (statCardWidth + 10) * 2, currentY, statCardWidth, statCardHeight, 8, COLORS.cardBg, COLORS.cardBorder);
      doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Active Days', margin + (statCardWidth + 10) * 2 + 15, currentY + 15);
      doc.fontSize(22).font('Helvetica-Bold').fillColor(theme.accent).text(`${user?.totalActiveDays || 0}`, margin + (statCardWidth + 10) * 2 + 15, currentY + 35);

      currentY += statCardHeight + 30;

      // Helper for Section Titles
      const drawSectionTitle = (title, y) => {
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text(title, margin, y);
        return y + 25;
      };

      // Helper to check page break
      const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > doc.page.height - margin) {
          doc.addPage();
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.bg);
          currentY = margin;
          return true;
        }
        return false;
      };

      // --- AI INSIGHT SECTION ---
      if (options.includeAiSummary) {
        checkPageBreak(120);
        currentY = drawSectionTitle('AI Insight', currentY);
        
        const aiInsightText = totalEntries > 0 
          ? `Your entries ${options.timeFilter === 'today' ? 'today' : 'this ' + options.timeFilter.replace('this_', '')} reflect predominantly ${mostCommonEmotion.toLowerCase()} patterns. Consistency in journaling is clearly helping you process these emotional states effectively.`
          : 'Not enough entries to generate detailed AI insights. Start journaling to see patterns!';

        const insightHeight = 90;
        drawRoundedRect(doc, margin, currentY, contentWidth, insightHeight, 8, COLORS.defaultBg, COLORS.defaultAccent);
        doc.fontSize(14).font('Helvetica-Oblique').fillColor(COLORS.textPrimary)
           .text(`"${aiInsightText}"`, margin + 20, currentY + 25, { width: contentWidth - 40, align: 'center', lineGap: 4 });
        
        currentY += insightHeight + 30;
      }

      // --- MOOD ANALYTICS SECTION ---
      if (options.includeEmotionCharts && totalEntries > 0) {
        checkPageBreak(300);
        currentY = drawSectionTitle('Mood Analytics', currentY);

        const chartCardHeight = 240;
        drawRoundedRect(doc, margin, currentY, contentWidth, chartCardHeight, 8, COLORS.cardBg, COLORS.cardBorder);

        const counts = {};
        entries.forEach(e => {
          if (e.emotion) counts[e.emotion] = (counts[e.emotion] || 0) + 1;
        });
        
        const labels = Object.keys(counts);
        const data = Object.values(counts);

        if (labels.length > 0) {
          try {
            const chartConfig = {
              type: 'doughnut',
              data: {
                labels,
                datasets: [{ 
                  data,
                  backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'],
                  borderWidth: 0
                }]
              },
              options: {
                plugins: {
                  legend: { position: 'right', labels: { font: { size: 14, family: 'Helvetica' } } },
                  datalabels: { color: '#fff', font: { weight: 'bold', size: 14 } }
                }
              }
            };
            const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=400&h=200`;
            const response = await fetch(chartUrl);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              doc.image(buffer, margin + (contentWidth - 400) / 2, currentY + 20, { fit: [400, 200] });
            }
          } catch (e) {
            console.error('Failed to load chart image', e);
          }
        }
        currentY += chartCardHeight + 30;
      }

      // --- CONSISTENCY & STREAKS SECTION ---
      if (options.includeMoodStreaks && user) {
        checkPageBreak(120);
        currentY = drawSectionTitle('Consistency & Streaks', currentY);

        const streakCardHeight = 90;
        drawRoundedRect(doc, margin, currentY, contentWidth, streakCardHeight, 8, COLORS.cardBg, COLORS.cardBorder);
        
        const colWidth = contentWidth / 3;
        
        doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Current Streak', margin + 20, currentY + 20);
        doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.streak).text(`${user.currentStreak} Days`, margin + 20, currentY + 45);

        doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Longest Streak', margin + colWidth + 20, currentY + 20);
        doc.fontSize(20).font('Helvetica-Bold').fillColor(theme.accent).text(`${user.longestStreak} Days`, margin + colWidth + 20, currentY + 45);

        const score = totalEntries > 0 ? Math.min(100, Math.round((user.currentStreak / 7) * 100)) : 0;
        doc.fontSize(12).font('Helvetica').fillColor(COLORS.textSecondary).text('Weekly Consistency', margin + colWidth * 2 + 20, currentY + 20);
        doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text(`${score}%`, margin + colWidth * 2 + 20, currentY + 45);

        currentY += streakCardHeight + 30;
      }

      // --- JOURNAL TIMELINE SECTION ---
      if (options.includeMoodTimeline && totalEntries > 0) {
        checkPageBreak(150);
        currentY = drawSectionTitle('Entry Highlights', currentY);

        entries.slice(0, 5).forEach((entry) => {
          const entryHeight = 90;
          checkPageBreak(entryHeight + 20);

          drawRoundedRect(doc, margin, currentY, contentWidth, entryHeight, 8, COLORS.cardBg, COLORS.cardBorder);
          
          const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          const emotion = entry.emotion ? entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1) : 'Unknown';
          
          doc.fontSize(10).font('Helvetica-Bold').fillColor(theme.accent).text(dateStr, margin + 20, currentY + 15);
          doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.textPrimary).text(`Emotion: ${emotion}`, margin + 150, currentY + 15);
          
          let preview = entry.text.replace(/\n/g, ' ').trim();
          if (preview.length > 120) preview = preview.substring(0, 120) + '...';
          
          doc.fontSize(11).font('Helvetica').fillColor(COLORS.textSecondary).text(`"${preview}"`, margin + 20, currentY + 40, { width: contentWidth - 40, lineGap: 2 });
          
          currentY += entryHeight + 15;
        });
      }

      // --- FOOTER ---
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).font('Helvetica').fillColor(COLORS.textMuted)
           .text('Generated by ReflectAI Analytics  •  Take a deep breath and keep reflecting.', margin, doc.page.height - 40, { align: 'center', width: contentWidth });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateEmotionInsightsPdf };
