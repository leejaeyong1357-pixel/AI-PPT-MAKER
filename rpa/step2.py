# -*- coding: utf-8 -*-
"""
2단계 - 교육과정 개설등록 (Python + Playwright)

먼저 '화면 상태'를 찍어서 입력 폼이 떠 있는지 확인하고,
떠 있으면 코드 입력 + 대상구분(사원별)까지 진행한다.

[실행]  디버깅 크롬에서 개설등록 화면을 띄운 뒤  ->  python step2.py
"""
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

CDP = "http://127.0.0.1:9222"

# ===== 여기만 바꾸면 됨 =====
CURS_CD = "700"        # 1단계에서 만든(또는 기존) 교육과정 코드
TRGT_FG = "사원별"      # 대상구분
# ===========================

KEY_IDS = ["CURS_CD", "CURS_CD_text", "TRGT_FG_CD", "GENRE_CD",
           "DT_DATE_startinput", "AddSq", "addBtn", "eduCopy"]

JS_DIAG = r"""
(ids) => {
  const vis = el => el.getClientRects().length > 0;
  const out = { url: location.href, items: [], buttons: [] };
  for (const id of ids) {
    const els = document.querySelectorAll('[id="' + id + '"]');
    let visible = 0, sample = '';
    for (const e of els) { if (vis(e)) { visible++; if (!sample) sample = (e.value || e.innerText || '').trim().slice(0, 20); } }
    out.items.push({ id, total: els.length, visible, sample });
  }
  const seen = new Set();
  document.querySelectorAll('button').forEach(b => {
    if (b.getClientRects().length > 0) { const t = (b.innerText || '').trim(); if (t && !seen.has(t)) { seen.add(t); out.buttons.push(t); } }
  });
  out.buttons = out.buttons.slice(0, 50);
  return out;
}
"""

JS_VISIBLE_TEXT = """
(id) => {
  const els = document.querySelectorAll('[id="' + id + '"]');
  for (const e of els) { if (e.getClientRects().length > 0) return (e.value || ''); }
  return null;
}
"""

JS_SET_DDL = r"""
(args) => {
  const { id, text } = args;
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const els = document.querySelectorAll('[id="' + id + '"]');
  let e = null;
  for (const x of els) { if (x.getClientRects().length > 0) { e = x; break; } }
  if (!e) e = els[0];
  if (!e) return id + ' : 칸없음';
  const w = $ && $(e).data('kendoDropDownList');
  if (w) {
    const ds = w.dataSource.data(); const tf = w.options.dataTextField; let ok = false;
    for (let i = 0; i < ds.length; i++) {
      const t = tf ? ds[i][tf] : (ds[i].text !== undefined ? ds[i].text : ds[i]);
      if (('' + t).trim() === text) { w.select(i); ok = true; break; }
    }
    if (!ok && e.options) { for (const o of e.options) { if (o.text.trim() === text) { w.value(o.value); ok = true; break; } } }
    w.trigger('change');
    return id + (ok ? ' : OK드롭 -> ' + text : ' : 옵션없음 -> ' + text);
  }
  if (e.options) { for (const o of e.options) { if (o.text.trim() === text) { e.value = o.value; e.dispatchEvent(new Event('change', { bubbles: true })); return id + ' : OKselect -> ' + text; } } }
  return id + ' : 옵션없음 -> ' + text;
}
"""


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[!] 먼저:  pip install playwright"); sys.exit(1)

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP)
        except Exception as e:
            print("[!] 디버깅 크롬 연결 실패:", e); sys.exit(1)

        target = None
        print("=== 페이지 점검 ===")
        for ctx in browser.contexts:
            for page in ctx.pages:
                try:
                    has = page.evaluate("() => !!(document.querySelector('[id=\"TRGT_FG_CD\"]') || document.querySelector('[id=\"AddSq\"]'))")
                except Exception:
                    continue
                print(f"  page: {page.url[:65]}  개설요소={has}")
                if has:
                    target = page
        if not target:
            print("[!] 개설등록 요소를 못 찾았어요. 개설 화면을 띄우고 다시 실행하세요.")
            return

        diag = target.evaluate(JS_DIAG, KEY_IDS)
        print(f"\n=== 개설화면 요소 상태 (URL: {diag['url'][:55]}) ===")
        for it in diag["items"]:
            print(f"  {it['id']:<20} 존재 {it['total']} / 보임 {it['visible']}   {it['sample']}")
        print("\n  [보이는 버튼들]:", ", ".join(diag["buttons"]))

        code_visible = any(it["id"] == "CURS_CD" and it["visible"] > 0 for it in diag["items"])
        if not code_visible:
            print("\n[!] 입력 폼(코드/대상구분)이 아직 화면에 안 떴어요.")
            print("    위 '보이는 버튼들' 중 '차수추가'/'추가' 같은 걸 눌러 입력 폼을 연 뒤 다시 실행해보세요.")
            print("    (어떤 버튼이 입력 폼을 여는지 알려주시면 자동으로 누르게 만들게요.)")
            return

        print("\n=== 입력 진행 ===")
        code = target.locator("[id='CURS_CD']:visible").first
        code.click(); code.fill(""); code.fill(CURS_CD); code.press("Enter")
        print(f"  코드 입력: {CURS_CD} (엔터)")
        target.wait_for_timeout(2000)
        loaded = target.evaluate(JS_VISIBLE_TEXT, "CURS_CD_text")
        print("  불러온 과정명(CURS_CD_text):", (loaded if loaded else "(비어있음 - 코드 확인 필요)"))
        print("  " + target.evaluate(JS_SET_DDL, {"id": "TRGT_FG_CD", "text": TRGT_FG}))
        print("\n화면 확인하세요. 테스트라 저장(완료)은 누르지 마세요.")


if __name__ == "__main__":
    main()
