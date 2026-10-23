"""Organization profile (#profile) — step 15, 2026-10-22. Serve the platform over http first (CIA_BASE, default http://127.0.0.1:8802).
Covers: the view and header button in AR/EN at 1280 and 390 (no errors, no undefined/NaN, no overflow); validation; save → cia-org:v1 with the
documented schema; logo upload (a large PNG is resized to ≤ 512 px and ≤ 300 KB; an SVG with a script and an external reference is cleaned;
remove); export and import JSON; import from the Executive Cockpit with its preview; clear; the first-visit prompt; the cover preview.
Usage: python3 tests/hub/test_profile.py"""
import os, sys, json, base64, io, re
sys.path.insert(0, os.path.dirname(__file__))
from hubkit import *  # noqa
from PIL import Image

TMP = os.path.join(RES, "tmp"); os.makedirs(TMP, exist_ok=True)
big = Image.new("RGBA", (1600, 900), (27, 42, 74, 255))
for x in range(0, 1600, 7):
    for y in range(0, 900, 11): big.putpixel((x, y), ((x * 7) % 255, (y * 3) % 255, (x + y) % 255, 255))
big.save(os.path.join(TMP, "logo-big.png"))
open(os.path.join(TMP, "logo-bad.svg"), "w").write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" onload="alert(1)">'
    '<script>alert(2)</script><image xlink:href="https://evil.example/x.png" width="10" height="10"/><circle cx="50" cy="50" r="40" fill="#1E8C93" onclick="alert(3)"/>'
    '<foreignObject><div>x</div></foreignObject><rect width="20" height="20" style="fill:url(https://evil.example/p)"/></svg>')
open(os.path.join(TMP, "not-image.txt"), "w").write("hello")
KEYS = ["v", "updated", "name", "legal", "cr", "sector", "size", "country", "city", "sites", "depts", "top", "qhse", "prepFor", "prepBy", "email", "phone", "scope", "held", "target", "fy", "lang", "logo", "brand"]

with sync_playwright() as p:
    b = launch(p)
    for lang, w in (("ar", 1280), ("en", 1280), ("ar", 390), ("en", 390)):
        ctx, pg, errs = hub(b, lang, w, hash_="#profile")
        tag = f"{lang} {w}px"
        check(f"{tag}: #profile opens the organization profile", pg.evaluate("curView") == "profile")
        tx = pg.evaluate("document.getElementById('profile').innerText")
        check(f"{tag}: no undefined/NaN/[object Object]", not bad_words(tx), bad_words(tx))
        check(f"{tag}: no horizontal overflow", overflow(pg) <= 1, overflow(pg))
        check(f"{tag}: header button invites registration", pg.evaluate("document.getElementById('orgLbl').textContent") == ("سجّل منشأتك" if lang == "ar" else "Register your organization"))
        check(f"{tag}: the note says the profile stays in this browser until the shared-platform phase", ("في متصفحك فقط" if lang == "ar" else "in your browser only") in tx)
        check(f"{tag}: every section is there (7)", pg.evaluate("document.querySelectorAll('#pfForm fieldset').length") == 7)
        check(f"{tag}: every field has a label", pg.evaluate("[...document.querySelectorAll('#pfForm input:not([type=file]),#pfForm select,#pfForm textarea')].every(e=>e.labels&&e.labels.length||e.getAttribute('aria-label'))"))
        check(f"{tag}: no console errors", not errs, errs[:3])
        ctx.close()
    # ---- validation, save, schema
    ctx, pg, errs = hub(b, "ar", 1280, hash_="#profile")
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    check("save with no name is refused with a message on the field", pg.evaluate("!localStorage.getItem('cia-org:v1')") and pg.evaluate("document.querySelector('#pfNameAr').getAttribute('aria-invalid')") == "true"
          and pg.evaluate("document.activeElement.id") == "pfNameAr")
    pg.fill("#pfNameAr", "شركة الاختبار"); pg.fill("#pfNameEn", "Test Co"); pg.fill("#pfEmail", "bad@"); pg.fill("#pfCr", "1010-55")
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    check("a wrong email is refused", pg.evaluate("!localStorage.getItem('cia-org:v1')") and pg.evaluate("document.querySelector('#pfEmail').getAttribute('aria-invalid')") == "true")
    pg.fill("#pfEmail", "qhse@test.sa"); pg.select_option("#pfSector", "ene"); pg.select_option("#pfCountry", "sa")
    pg.click("#pfSiteAdd"); pg.fill('[data-site="0"][data-k="name"]', "الرياض"); pg.fill('[data-site="0"][data-k="city"]', "الرياض")
    pg.fill("#pfDeptIn", "الجودة"); pg.click("#pfDeptAdd"); pg.fill("#pfDeptIn", "السلامة"); pg.press("#pfDeptIn", "Enter")
    pg.fill("#pfTop", "م. أحمد"); pg.fill("#pfPrepFor", "الرئيس التنفيذي"); pg.fill("#pfPrepBy", "مدثر سلامه"); pg.fill("#pfScopeAr", "كل المواقع")
    pg.click('[data-chip="held"][data-v="ISO 9001:2026"]'); pg.click('[data-chip="target"][data-v="ISO 45001:2018"]')
    check("unsaved changes are shown", ("لم تُحفظ" in pg.evaluate("document.getElementById('pfState').textContent")))
    pg.click("#pfSave"); pg.wait_for_timeout(250)
    o = pg.evaluate("JSON.parse(localStorage.getItem('cia-org:v1'))")
    check("saved: cia-org:v1 holds the documented schema (v1, every field)", o and o.get("v") == 1 and sorted(o.keys()) == sorted(KEYS), o and sorted(o.keys()))
    check("saved: the values typed", o["name"] == {"ar": "شركة الاختبار", "en": "Test Co"} and o["sites"][0]["name"] == "الرياض" and o["depts"] == ["الجودة", "السلامة"]
          and o["held"] == ["ISO 9001:2026"] and o["target"] == ["ISO 45001:2018"] and o["sector"] == "ene" and o["cr"] == "1010-55" and o["updated"])
    check("header button shows the organization's name", pg.evaluate("document.getElementById('orgLbl').textContent") == "شركة الاختبار")
    check("cover preview shows the name and 'prepared for … · prepared by …'", all(x in pg.evaluate("document.getElementById('pfPrev').innerText") for x in ("شركة الاختبار", "الرئيس التنفيذي", "مدثر سلامه")))
    # ---- logo: big PNG
    pg.set_input_files("#pfLogoIn", os.path.join(TMP, "logo-big.png")); pg.wait_for_timeout(1500)
    lg = pg.evaluate("PF.logo")
    dims = pg.evaluate("(u)=>new Promise(r=>{ const i=new Image(); i.onload=()=>r([i.naturalWidth,i.naturalHeight]); i.src=u; })", lg) if lg else [0, 0]
    check("a 1600×900 PNG is resized in the browser to 512 px at most", lg.startswith("data:image/") and max(dims) <= 512 and max(dims) >= 256, dims)
    check("the stored logo is 300 KB or less", len(base64.b64decode(lg.split(",", 1)[1])) <= 300 * 1024, len(lg))
    check("the logo is previewed on a light and a dark background", pg.evaluate("document.querySelectorAll('.pf-lb img').length") == 2)
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    check("the saved profile carries the logo; the header button shows it", pg.evaluate("JSON.parse(localStorage.getItem('cia-org:v1')).logo.length") > 1000 and pg.evaluate("!!document.querySelector('#orgAv img')"))
    # ---- SVG cleaning
    pg.set_input_files("#pfLogoIn", os.path.join(TMP, "logo-bad.svg")); pg.wait_for_timeout(800)
    svg = pg.evaluate("PF.logo.startsWith('data:image/svg+xml;base64,') ? decodeURIComponent(escape(atob(PF.logo.split(',')[1]))) : ''")
    check("an SVG logo is kept as a vector", svg.startswith("<svg"), svg[:80])
    check("SVG cleaned: no script, no event attribute, no foreignObject", "<script" not in svg and not re.search(r"\son[a-z]+=", svg) and "foreignObject" not in svg, svg)
    check("SVG cleaned: no external reference", "evil.example" not in svg, svg)
    pg.set_input_files("#pfLogoIn", os.path.join(TMP, "not-image.txt")); pg.wait_for_timeout(400)
    check("a file that is not a supported image is refused with a message", pg.evaluate("!!document.querySelector('.pf-logo .pf-err')"))
    pg.click("#pfLogoDel"); pg.wait_for_timeout(150)
    check("remove the logo", pg.evaluate("PF.logo") == "")
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    # ---- export / import
    with pg.expect_download() as dl:
        pg.click("#pfExp")
    exp = json.load(open(dl.value.path(), encoding="utf-8"))
    check("export JSON: the saved profile, same schema", exp["name"]["ar"] == "شركة الاختبار" and sorted(exp.keys()) == sorted(KEYS))
    imp = dict(PROFILE); imp["name"] = {"ar": "منشأة مستوردة", "en": "Imported Org"}; imp["logo"] = "javascript:alert(1)"
    open(os.path.join(TMP, "imp.json"), "w", encoding="utf-8").write(json.dumps(imp, ensure_ascii=False))
    pg.set_input_files("#pfImpIn", os.path.join(TMP, "imp.json")); pg.wait_for_timeout(400)
    check("import JSON fills the form (not saved until Save)", pg.evaluate("PF.name.ar") == "منشأة مستوردة" and pg.evaluate("JSON.parse(localStorage.getItem('cia-org:v1')).name.ar") == "شركة الاختبار")
    check("import JSON drops a logo that is not an image data URL", pg.evaluate("PF.logo") == "")
    open(os.path.join(TMP, "bad.json"), "w").write("{not json")
    pg.set_input_files("#pfImpIn", os.path.join(TMP, "bad.json")); pg.wait_for_timeout(300)
    check("a broken JSON file changes nothing", pg.evaluate("PF.name.ar") == "منشأة مستوردة")
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    # ---- the Executive Cockpit's organization fields
    pg.evaluate("localStorage.setItem('cia-workspace:v1', JSON.stringify({org:{name:'Cockpit Energy Co',sector:'Power',fy:'2026',owner:'QHSE',notes:'Three plants'},r:{}}))")
    w0 = pg.evaluate("localStorage.getItem('cia-workspace:v1')")
    pg.click("#pfW8"); pg.wait_for_timeout(250)
    check("import from the Executive Cockpit shows a preview first", pg.evaluate("document.getElementById('pfDlg').open") and "Cockpit Energy Co" in pg.evaluate("document.getElementById('pfDlg').innerText"))
    pg.click("#pfDlgOk"); pg.wait_for_timeout(250)
    check("after confirming, the English name goes to its box; nothing changes in the cockpit", pg.evaluate("PF.name.en") == "Cockpit Energy Co" and pg.evaluate("localStorage.getItem('cia-workspace:v1')") == w0)
    pg.click("#pfSave"); pg.wait_for_timeout(200)
    check("the cockpit import is saved only by Save", pg.evaluate("JSON.parse(localStorage.getItem('cia-org:v1')).name.en") == "Cockpit Energy Co")
    # ---- clear
    pg.click("#pfClr"); pg.wait_for_timeout(250)
    check("clear (after confirmation) deletes cia-org:v1 and resets the button", pg.evaluate("localStorage.getItem('cia-org:v1')") is None and pg.evaluate("document.getElementById('orgLbl').textContent") == "سجّل منشأتك")
    check("no console errors in the profile workflow", not errs, errs[:3])
    ctx.close()
    # ---- first-visit prompt on the home page
    ctx, pg, errs = hub(b, "ar", 1280, hash_="#home")
    check("home: the first-visit prompt invites registration", not pg.evaluate("document.getElementById('orgPrompt').hidden") and "سجّل منشأتك مرة واحدة" in pg.evaluate("document.getElementById('orgPrompt').innerText"))
    pg.click("#orgLater"); pg.wait_for_timeout(100); pg.reload(); pg.wait_for_timeout(700)
    check("home: 'later' hides the prompt for good", pg.evaluate("document.getElementById('orgPrompt').hidden"))
    ctx.close()
    ctx, pg, errs = hub(b, "en", 1280, hash_="#home", profile=PROFILE)
    check("home: no prompt once a profile exists; header shows the English name", pg.evaluate("document.getElementById('orgPrompt').hidden") and pg.evaluate("document.getElementById('orgLbl').textContent") == "Al-Riyada Contracting & Energy")
    pg.click("#orgBtn"); pg.wait_for_timeout(300)
    check("header button opens the profile with the saved values", pg.evaluate("curView") == "profile" and pg.evaluate("document.getElementById('pfNameEn').value") == "Al-Riyada Contracting & Energy")
    ctx.close()
    b.close()
sys.exit(1 if save("hub-profile") else 0)
