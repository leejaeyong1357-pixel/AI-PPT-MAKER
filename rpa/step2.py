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

        def vcount(id_):
            return target.locator(f"[id='{id_}']:visible").count()

        target.bring_to_front()

        # 교육과정 코드는 CURS_CD_text(보이는 칸)에 입력한다.
        # (CURS_CD 는 코드 저장용 hidden 칸이라 항상 display:none)
        # 입력 폼이 안 떠 있으면 '차수추가'를 자동으로 시도한다(여러 방법).
        def open_form():
            if vcount("CURS_CD_text") > 0:
                return True
            attempts = [
                ("버튼텍스트 '차수추가' 클릭", lambda: target.get_by_role("button", name="차수추가").first.click(timeout=3000)),
                ("text=차수추가 클릭", lambda: target.locator("button:has-text('차수추가')").first.click(timeout=3000)),
                ("F3 단축키", lambda: target.keyboard.press("F3")),
                ("[id=AddSq] 클릭", lambda: target.locator("[id='AddSq']").first.click(timeout=3000, force=True)),
            ]
            for name, act in attempts:
                try:
                    act()
                    target.wait_for_timeout(1300)
                    if vcount("CURS_CD_text") > 0:
                        print(f"  차수추가 성공: {name}")
                        return True
                    else:
                        print(f"  시도했지만 폼 안 열림: {name}")
                except Exception as e:
                    print(f"  실패({name}): {str(e)[:60]}")
            return vcount("CURS_CD_text") > 0

        if not open_form():
            print("\n[!] 차수추가 자동 시도 다 해봤는데 입력 폼이 안 열려요.")
            print("    혹시 화면에서 직접 차수추가 눌렀을 때 '팝업/확인창'이 뜨나요? 그렇다면 알려주세요.")
            return

        print("\n=== 입력 진행 ===")
        box = target.locator("[id='CURS_CD_text']:visible").first
        box.click()
        box.fill("")
        box.press_sequentially(CURS_CD, delay=100)  # 실제 타이핑처럼
        box.press("Enter")
        print(f"  교육과정 코드 입력: {CURS_CD} (엔터)")
        target.wait_for_timeout(2500)

        loaded_code = target.evaluate("() => { const e = document.getElementById('CURS_CD'); return e ? e.value : null; }")
        loaded_name = target.evaluate(JS_VISIBLE_TEXT, "CURS_CD_text")
        print(f"  코드(CURS_CD): {loaded_code}  /  표시(CURS_CD_text): {loaded_name}")
        if not loaded_code:
            print("  (※ 코드가 안 잡히면: 700이 실제 저장된 과정인지 확인, 또는 도움창이 떴는지 화면 확인)")

        print("  " + target.evaluate(JS_SET_DDL, {"id": "TRGT_FG_CD", "text": TRGT_FG}))
        print("\n화면 확인하세요. 테스트라 저장(완료)은 누르지 마세요.")


if __name__ == "__main__":
    main()
