# محرك فيديوهات «مساء التميّز» (Whiteboard)

دليل لأي جلسة جديدة تكمّل السلسلة: صوت م. مدثر ← فيديو وايت بورد كامل.

## خطوات كل حلقة
1. **التفريغ:** `transcribe.py` (Whisper turbo عن طريق sherpa-onnx)، على مقاطع الكلام اللي بيطلّعها `ffmpeg silencedetect`.
2. **تقصير الوقفات الطويلة:** `edit_audio2.py voice48k.wav voice_edit.wav removed.json cuts.json`
   - `cuts.json` = `[[بداية_السكتة, نهايتها, اللي_يفضل_منها], ...]`
   - `removed.json` بيتنسخ في `const CUTS` جوه الصفحة، والدالة `T(t)` بتحوّل توقيتات التسجيل الأصلي لتوقيتات الفيديو.
3. **تنضيف الصوت (ffmpeg):** `highpass` ← `arnndn` (موديل `std.rnnn` من richardpl/arnndn-models) ← EQ ← `deesser` ← `acompressor` ← `loudnorm`.
4. **المشاهد:** ملف `epNN_build.js` (دالة `build()`)، ويتدمج بـ `make_ep01.py` (عدّل فيه `caps` و`CUTS` ونص العدّاد).
   - المكتبة جوه الصفحة: `R.*` رسم بخط اليد (rough.js)، و`wtext` كتابة عربي من اليمين للشمال والإيد ماشية معاها، و`pop` و`sparkle` و`popFigure` و`dashed`.
   - ممنوع الرسم في الركن اليمين فوق، لأنه محجوز للوجو.
5. **الرندر:** `PAGE=epNN.html node render.js frames 0 N` (4 عمليات بالتوازي)، وبيكتب `events.json`.
6. **الصوت:**
   - `music.py out.wav TOTAL`: يوكوليلي متولّد بالكود، فمفيش حقوق.
   - `sfx.py events.json sfx.wav TOTAL`: خربشة قلم، وpop، وwhoosh، وختم، وتك.
   - المكس: `sidechaincompress` (الموسيقى بتوطى تحت الصوت)، وبعده `alimiter`، وبعده `loudnorm` على مرحلتين لحد -14 LUFS.
7. **التصدير:** `ffmpeg libx264 crf 17` + `aac 192k`، وبعده ملفات SRT (عربي وإنجليزي، 7 كلمات بالكتير في السطر).

## تجهيز البيئة في جلسة جديدة
```bash
pip install sherpa-onnx soundfile
curl -L -o turbo.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2 && tar xjf turbo.tar.bz2
curl -L -o std.rnnn https://raw.githubusercontent.com/richardpl/arnndn-models/master/std.rnnn
npm i playwright@1.48.2 roughjs@4.6.6   # المتصفح: /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell
```
الخطوط موجودة في `fonts/` (Aref Ruqaa وCairo وCaveat، من Google Fonts بترخيص OFL)، واللوجو في `logo.png`. من الحلقة 05 اللوجو الجديد هو `logo2.png`، و`make_ep05.py` بيحطّه مكان القديم.

## مقاس 16:9 (من الحلقة 03)
`make_ep03.py` بيحوّل المحرك لمقاس 1920×1080: بيغيّر الـviewBox، ومكان اللوجو (الدايرة في النص، وفي الركن 140px على بعد 50px من الحواف، وفي الختام 400px)، والترجمة على y=992، والعدّاد على y=1056.
للرندر: `VW=1920 VH=1080 PAGE=ep03.html node render.js frames 0 N`

## من الحلقة 06
- **`make_ep.py`:** سكريبت بناء عام، بيتشغّل كده: `python3 make_ep.py BUILD WORK TOTAL epNN_cfg.json`. ملف الإعدادات فيه `ep` و`tcl` و`caps` (الجمل بتوقيتات التسجيل الأصلي).
- **الموسيقى:** `music_calm2.py` من الحلقة 07 (بيانو ولحن ناعم ووتريات). الحلقة 06 كانت `music_calm.py` (بيانو ناعم وخلفية هادية وصدى طويل) بدل اليوكوليلي. مستواها -28 LUFS قبل ما توطى تحت الصوت.
- **تسجيلات فيها دوشة:** نضّف الصوت الأول (`arnndn` بـ `mix=1`)، وبعدها اعمل `silencedetect` على -40dB.
