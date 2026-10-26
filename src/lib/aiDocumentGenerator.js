import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export function saveFileBlob(blob, filename) {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {}
  }, 250);
}

// Document Export - PDF Format
export function exportToPDF(title, content) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const maxLineWidth = pageWidth - margin * 2;

    // Header Background
    doc.setFillColor(10, 14, 26); // #0a0e1a
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246); // Blue
    doc.text('NEXORA', margin, 14);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Executive Workspace Document', margin + 30, 14);

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    doc.text(dateStr, pageWidth - margin, 14, { align: 'right' });

    // Document Title
    let currentY = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    const cleanTitle = (title || 'AI Generated Document').replace(/[#*`]/g, '');
    const titleLines = doc.splitTextToSize(cleanTitle, maxLineWidth);
    doc.text(titleLines, margin, currentY);
    currentY += titleLines.length * 8 + 4;

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Content Body parsing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);

    const rawLines = content.split('\n');
    for (let rawLine of rawLines) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      const trimmed = rawLine.trim();

      if (!trimmed) {
        currentY += 4;
        continue;
      }

      // H1 Heading (### or #)
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        currentY += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        const headingText = trimmed.replace(/^#+\s*/, '').replace(/[*_`]/g, '');
        const headingLines = doc.splitTextToSize(headingText, maxLineWidth);
        doc.text(headingLines, margin, currentY);
        currentY += headingLines.length * 6 + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(51, 65, 85);
        continue;
      }

      if (trimmed.startsWith('### ')) {
        currentY += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(59, 130, 246);
        const headingText = trimmed.replace(/^###\s*/, '').replace(/[*_`]/g, '');
        const headingLines = doc.splitTextToSize(headingText, maxLineWidth);
        doc.text(headingLines, margin, currentY);
        currentY += headingLines.length * 5 + 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(51, 65, 85);
        continue;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = '• ' + trimmed.substring(2).replace(/[*_`]/g, '');
        const wrapped = doc.splitTextToSize(bulletText, maxLineWidth - 4);
        doc.text(wrapped, margin + 4, currentY);
        currentY += wrapped.length * 5 + 1;
        continue;
      }

      // Standard text
      const cleanLine = trimmed.replace(/[*_`]/g, '');
      const wrapped = doc.splitTextToSize(cleanLine, maxLineWidth);
      doc.text(wrapped, margin, currentY);
      currentY += wrapped.length * 5 + 1.5;
    }

    // Save File
    const filename = `${cleanTitle.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}_nexora.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('PDF Export Error:', err);
    throw err;
  }
}

// Document Export - Word Format (.docx)
export async function exportToWord(title, content) {
  try {
    const cleanTitle = (title || 'Project Document').replace(/[#*`]/g, '');
    const paragraphs = [
      new Paragraph({
        text: 'NEXORA — Project Workspace Document',
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 120 },
      }),
      new Paragraph({
        text: cleanTitle,
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
      }),
    ];

    const rawLines = content.split('\n');
    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: '' }));
        continue;
      }

      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        paragraphs.push(
          new Paragraph({
            text: trimmed.replace(/^#+\s*/, '').replace(/[*_`]/g, ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          })
        );
        continue;
      }

      if (trimmed.startsWith('### ')) {
        paragraphs.push(
          new Paragraph({
            text: trimmed.replace(/^###\s*/, '').replace(/[*_`]/g, ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          })
        );
        continue;
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/[*_`]/g, ''),
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `${cleanTitle.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}_nexora.docx`;
    saveFileBlob(blob, filename);
    return true;
  } catch (err) {
    console.error('Word Export Error:', err);
    throw err;
  }
}

// Visual Style Profiles
export const IMAGE_STYLES = {
  photorealistic: {
    id: 'photorealistic',
    label: '📸 8K Photorealistic',
    suffix: 'hyperrealistic 8k photograph, sharp focus, cinematic volumetric lighting, 35mm lens, f/1.8, award-winning photography, photorealistic textures, masterpiece, high dynamic range',
    fallbackCategory: 'photo-1503376780353-7e6692767b70'
  },
  digital_art: {
    id: 'digital_art',
    label: '🎨 Digital Art & Concept',
    suffix: 'digital concept art, trending on ArtStation, vivid colors, intricate details, atmospheric lighting, smooth shading, masterpiece digital illustration',
    fallbackCategory: 'photo-1579783900882-c0d3dad7b119'
  },
  logo: {
    id: 'logo',
    label: '💎 Minimalist Logo & Icon',
    suffix: 'minimalist vector graphic emblem logo, clean flat design, iconic brand symbol, Behance award winner, isolated on clean background, crisp geometric vector lines',
    fallbackCategory: 'photo-1626785774573-4b799315345d'
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: '⚡ Cyberpunk & Sci-Fi',
    suffix: 'futuristic cyberpunk aesthetic, neon glowing reflections on asphalt, high-tech metropolis, moody volumetric fog, octane render, 8k sci-fi',
    fallbackCategory: 'photo-1508739773434-c26b3d09e071'
  },
  anime: {
    id: 'anime',
    label: '🏮 Anime & Studio Ghibli',
    suffix: 'makoto shinkai aesthetic, gorgeous anime key visual, studio ghibli lighting, vibrant colors, sharp clean line art, 4k digital anime painting',
    fallbackCategory: 'photo-1578632767115-351597cf2477'
  },
  isometric: {
    id: 'isometric',
    label: '🏛️ 3D Isometric Render',
    suffix: '3d isometric illustration, blender render, unreal engine 5, soft shadows, cute miniature model, ambient occlusion, pastel palette, 8k 3d',
    fallbackCategory: 'photo-1618005182384-a83a8bd57fbe'
  },
  cinematic: {
    id: 'cinematic',
    label: '🎬 Hollywood Cinematic',
    suffix: 'cinematic movie still, 70mm IMAX, anamorphic lens flare, dramatic studio lighting, color graded, film grain, photorealistic masterpiece',
    fallbackCategory: 'photo-1485846234645-a62644f84728'
  }
};

export const ASPECT_RATIOS = {
  '1:1': { id: '1:1', label: '1:1 Square', width: 1024, height: 1024, desc: 'Instagram / Avatar' },
  '16:9': { id: '16:9', label: '16:9 Landscape', width: 1280, height: 720, desc: 'YouTube / Banner' },
  '9:16': { id: '9:16', label: '9:16 Portrait', width: 720, height: 1280, desc: 'Mobile Story / Wallpaper' },
  '4:3': { id: '4:3', label: '4:3 Standard', width: 1024, height: 768, desc: 'Presentation / Tablet' }
};

export const IMAGE_MODELS = {
  turbo: { id: 'turbo', label: '⚡ Ultra Fast (Instant)', desc: 'Generates in 2 seconds' },
  flux: { id: 'flux', label: '✨ 4K High Definition', desc: 'Deep color & sharpness' }
};

export const DEFAULT_SHOWCASE_IMAGES = [
  {
    id: 'showcase-1',
    prompt: 'Luxury modern aerodynamic supercar driving on coastal highway at sunset, 8k',
    enhancedPrompt: 'luxury aerodynamic sports supercar driving on scenic coastal highway at sunset, 8k photorealistic photography, cinematic lighting, sharp focus, masterwork',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1024&q=80',
    style: 'photorealistic',
    aspectRatio: '16:9',
    model: 'turbo',
    createdAt: 'Just now',
    width: 1280,
    height: 720,
    seed: 4892011
  },
  {
    id: 'showcase-2',
    prompt: 'Futuristic cyberpunk metropolis neon city skyline at night, glowing holograms',
    enhancedPrompt: 'futuristic cyberpunk aesthetic, neon glowing reflections on asphalt, high-tech metropolis, moody volumetric fog, octane render, 8k sci-fi',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1024&q=80',
    style: 'cyberpunk',
    aspectRatio: '1:1',
    model: 'flux',
    createdAt: 'Just now',
    width: 1024,
    height: 1024,
    seed: 7182903
  },
  {
    id: 'showcase-3',
    prompt: 'Minimalist geometric eagle logo on clean background, modern emblem',
    enhancedPrompt: 'minimalist vector graphic emblem logo, clean flat design, iconic brand symbol, Behance award winner, isolated on clean background, crisp geometric vector lines',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1024&q=80',
    style: 'logo',
    aspectRatio: '1:1',
    model: 'turbo',
    createdAt: 'Just now',
    width: 1024,
    height: 1024,
    seed: 3910283
  },
  {
    id: 'showcase-4',
    prompt: 'Majestic royal lion with golden mane in African savannah, dramatic lighting',
    enhancedPrompt: 'majestic royal lion with golden mane in African golden grassland, cinematic studio lighting, photorealistic 8k, sharp focus, award-winning',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1024&q=80',
    style: 'photorealistic',
    aspectRatio: '1:1',
    model: 'flux',
    createdAt: 'Just now',
    width: 1024,
    height: 1024,
    seed: 9481729
  },
  {
    id: 'showcase-5',
    prompt: 'Breathtaking alpine mountain range with crystal clear turquoise lake at sunset',
    enhancedPrompt: 'dramatic snow-capped alpine mountain range, crystal clear turquoise lake reflection, golden hour sunset, 8k ultra realistic photography',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1024&q=80',
    style: 'photorealistic',
    aspectRatio: '16:9',
    model: 'turbo',
    createdAt: 'Just now',
    width: 1280,
    height: 720,
    seed: 5829104
  },
  {
    id: 'showcase-6',
    prompt: '3D isometric miniature high-tech office building with neon lighting, Blender 3D',
    enhancedPrompt: '3d isometric illustration, blender render, unreal engine 5, soft shadows, cute miniature model, ambient occlusion, pastel palette, 8k 3d',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1024&q=80',
    fallbackUrl2: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1024&q=80',
    fallbackPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1024&q=80',
    style: 'isometric',
    aspectRatio: '4:3',
    model: 'flux',
    createdAt: 'Just now',
    width: 1024,
    height: 768,
    seed: 2849103
  }
];

/**
 * Multilingual prompt preprocessor and stylistic enhancer
 */
export function enhanceImagePrompt(prompt, styleId = 'photorealistic') {
  let text = (prompt || '').trim();

  // Phonetic and colloquial term normalizer
  const urduReplacements = [
    { regex: /\b(bnao|banao|bana do|bana de|chahiye|dikhao|karo|bna de|likh do)\b/gi, replacement: '' },
    { regex: /\b(mujhe|humein|mera|meri|mere|apna|apni)\b/gi, replacement: '' },
    { regex: /\b(ek|aik|ye|yeh)\b/gi, replacement: 'a' },
    { regex: /\b(gari|gaari|car)\b/gi, replacement: 'luxury aerodynamic sports supercar' },
    { regex: /\b(billi|mano)\b/gi, replacement: 'adorable cute fluffy kitten' },
    { regex: /\b(kutta|dog)\b/gi, replacement: 'noble golden retriever dog' },
    { regex: /\b(sher|tiger|babbar sher)\b/gi, replacement: 'majestic royal lion with golden mane' },
    { regex: /\b(parinda|chiriya|tota)\b/gi, replacement: 'graceful exotic bird with colorful iridescent feathers in flight' },
    { regex: /\b(pahar|paharon)\b/gi, replacement: 'dramatic snow-capped alpine mountain range' },
    { regex: /\b(samandar|darya|pani)\b/gi, replacement: 'crystal clear turquoise ocean waves hitting sunlit coastline' },
    { regex: /\b(chand|sitare)\b/gi, replacement: 'luminous celestial glowing full moon in starry galaxy cosmos' },
    { regex: /\b(suraj|dhoop|subah)\b/gi, replacement: 'radiant golden sunrise with morning sunbeams' },
    { regex: /\b(shaam|maghrib)\b/gi, replacement: 'cinematic golden sunset over horizon' },
    { regex: /\b(jangal|darakht|paude)\b/gi, replacement: 'lush mystical enchanted forest with sunbeams piercing canopy' },
    { regex: /\b(shehar|city)\b/gi, replacement: 'futuristic modern metropolitan skyline with glass skyscrapers' },
    { regex: /\b(ghar|makan|kothi|bungalow)\b/gi, replacement: 'ultra-modern luxury architectural glass villa with infinity pool' },
    { regex: /\b(larki|aurat|khatoon)\b/gi, replacement: 'portrait of an elegant stunning woman, studio lighting' },
    { regex: /\b(ladka|larka|mard|admi)\b/gi, replacement: 'portrait of a handsome charismatic gentleman, cinematic lighting' },
    { regex: /\b(bacha|bachi)\b/gi, replacement: 'happy smiling adorable child with expressive eyes' },
    { regex: /\b(khana|biryani|burger|pizza)\b/gi, replacement: 'delicious gourmet culinary meal beautifully presented, five-star food photography' },
    { regex: /\b(chai|coffee)\b/gi, replacement: 'steaming artisan hot cup of tea with rising steam in warm light' },
    { regex: /\b(pakistan|pakistani)\b/gi, replacement: 'historic Pakistan architectural landmark with emerald aesthetic' },
    { regex: /\b(khubsurat|khoobsurat|pyara|pyari|acha|achhi)\b/gi, replacement: 'breathtaking, magnificent, highly detailed' },
    { regex: /\b(tasweer|tasveer|photo|picture|pic|image)\b/gi, replacement: '' },
    { regex: /\b(ki|ka|ke|ko|se|par|me|mein|wali|wala|wale)\b/gi, replacement: '' }
  ];

  // Apply replacements
  for (const item of urduReplacements) {
    text = text.replace(item.regex, item.replacement);
  }

  // Clean extra spaces
  text = text.replace(/\s+/g, ' ').trim();

  // If prompt was cleaned to empty, restore original
  if (!text) {
    text = (prompt || '').trim();
  }

  // Append style suffix
  const styleObj = IMAGE_STYLES[styleId] || IMAGE_STYLES.photorealistic;
  if (styleObj?.suffix) {
    text = `${text}, ${styleObj.suffix}`;
  }

  return text;
}

/**
 * Builds image resource URLs with seed and style definitions
 */
export function generateAIImageUrl(prompt, options = {}) {
  const {
    width = 1024,
    height = 1024,
    style = 'photorealistic',
    model = 'turbo',
    enhance = true,
    seed = Math.floor(Math.random() * 9000000) + 1000000
  } = typeof options === 'object' ? options : { width: options || 1024, height: arguments[2] || 1024 };

  const finalPrompt = enhance ? enhanceImagePrompt(prompt, style) : prompt.trim();
  const cleanEncoded = encodeURIComponent(finalPrompt);
  const rawEncoded = encodeURIComponent(prompt.trim());

  const url = `https://image.pollinations.ai/prompt/${cleanEncoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  // Fallback 1: Alternative Pollinations /p/ path
  const fallbackUrl = `https://pollinations.ai/p/${cleanEncoded}?width=${width}&height=${height}&seed=${seed}`;

  // Fallback 2: Raw prompt with basic masterpiece enhancer
  const fallbackUrl2 = `https://image.pollinations.ai/prompt/${rawEncoded}%20masterpiece%20hd?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  // Fallback 3: Curated Unsplash photo if network is offline
  const styleObj = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  const photoId = styleObj.fallbackCategory || 'photo-1618005182384-a83a8bd57fbe';
  const fallbackPhoto = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;

  return {
    url,
    fallbackUrl,
    fallbackUrl2,
    fallbackPhoto,
    seed,
    enhancedPrompt: finalPrompt,
    originalPrompt: prompt,
    width,
    height,
    style,
    model
  };
}

/**
 * Download image directly as a file blob onto user's computer
 */
export async function downloadImageAsBlob(imageUrl, filename = 'nexora_ai_art.jpg') {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    saveFileBlob(blob, filename);
    return true;
  } catch (err) {
    console.warn('Direct blob download failed, falling back to window.open:', err);
    // Fallback: Create invisible link with target="_blank"
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 300);
      return true;
    } catch {
      window.open(imageUrl, '_blank');
      return false;
    }
  }
}
