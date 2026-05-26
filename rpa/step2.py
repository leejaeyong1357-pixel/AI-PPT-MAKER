# -*- coding: utf-8 -*-
"""
2단계 - 교육과정 개설등록 (Python + Playwright)

[하는 일]
  1) 개설등록 화면의 '코드' 칸에 1단계에서 만든 코드를 입력 -> 엔터 (과정 자동 불러오기)
  2) '대상구분' 을 '사원별' 로 선택

[실행 순서]
  1) 디버깅 크롬(--remote-debugging-port=9222)에서 ERP 로그인
  2) '교육과정 개설등록' 화면을 띄운다 (화면에 보이게)
  3) 아래 CURS_CD 를 실제 코드로 바꾼다
  4) python step2.py

* SPA 특성상 1단계와 id가 중복되므로, '화면에 보이는' 칸만 골라서 조작한다.
* 테스트 단계에서는 저장(완료)은 누르지 말 것.
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

# 화면에 보이는(=현재 활성 탭의) 요소 1개를 id로 찾는다
JS_VISIBLE_TEXT = """
(id) => {
  const els = document.querySelectorAll('[id="'+id+'"]');
  for (const e of els) { if (e.offsetParent !== null) return (e.value || ''); }
  return null;
}
"""

JS_IS_VISIBLE = """
(id) => {
  const els = document.querySelectorAll('[id="'+id+'"]');
  for (const e of els) { if (e.offsetParent !== null) return true; }
  return false;
}
"""

JS_SET_DDL = r"""
(args) => {
  const {id, text} = args;
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const els = document.querySelectorAll('[id="'+id+'"]');
  let e = null;
  for (const x of els) { if (x.offsetParent !== null) { e = x; break; } }
  if (!e) e = els[0];
  if (!e) return id + ' : 칸없음(화면에 안보임)';
  const w = $ && $(e).data('kendoDropDownList');
  if (w) {
    const ds = w.dataSource.data();
    const tf = w.options.dataTextField;
    let ok = false;
    for (let i = 0; i < ds.length; i++) {
      const t = tf ? ds[i][tf] : (ds[i].text !== undefined ? ds[i].text : ds[i]);
      if (('' + t).trim() === text) { w.select(i); ok = true; break; }
    }
    if (!ok && e.options) { for (const o of e.options) { if (o.text.trim() === text) { w.value(o.value); ok = true; break; } } }
    w.trigger('change');
    return id + (ok ? ' : OK드롭 -> ' + text : ' : 옵션없음 -> ' + text);
  }
  if (e.options) {
    for (const o of e.options) { if (o.text.trim() === text) { e.value = o.value; e.dispatchEvent(new Event('change', {bubbles:true})); return id + ' : OKselect -> ' + text; } }
  }
  return id + ' : 옵션없음 -> ' + text;
}
"""


def find_page(browser):
    for ctx in browser.contexts:
        for page in ctx.pages:
            try:
                if page.evaluate("() => !!document.querySelector('[id=\"TRGT_FG_CD\"]')"):
                    return page
            except Exception:
                continue
    return None


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[!] 먼저:  pip install playwright")
        sys.exit(1)

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP)
        except Exception as e:
            print("[!] 디버깅 크롬 연결 실패:", e)
            print("    크롬을 --remote-debugging-port=9222 로 켰는지 확인하세요.")
            sys.exit(1)

        page = find_page(browser)
        if not page:
            print("[!] 개설등록 화면(TRGT_FG_CD)을 못 찾았어요. 그 화면을 띄우고 다시 실행하세요.")
            return
        if not page.evaluate(JS_IS_VISIBLE, "TRGT_FG_CD"):
            print("[!] 개설등록 화면이 '보이지' 않아요. 디버깅 크롬에서 그 화면을 활성화(앞으로)하고 다시 실행하세요.")
            return

        print("=== 2단계 개설등록 ===")

        # 1) 코드 입력 (실제 타이핑 + 엔터 -> 코드피커가 과정을 불러옴)
        code = page.locator("[id='CURS_CD']:visible").first
        code.click()
        code.fill("")
        code.fill(CURS_CD)
        code.press("Enter")
        print(f"  코드 입력: {CURS_CD} (엔터)")

        # 2) 과정 불러오기 대기 후 확인
        page.wait_for_timeout(2000)
        loaded = page.evaluate(JS_VISIBLE_TEXT, "CURS_CD_text")
        print("  불러온 과정명(CURS_CD_text):", (loaded if loaded else "(비어있음 - 코드 확인 필요)"))

        # 3) 대상구분 = 사원별
        print("  " + page.evaluate(JS_SET_DDL, {"id": "TRGT_FG_CD", "text": TRGT_FG}))

        print("\n화면 확인하세요. 과정이 불러와지고 대상구분이 '사원별'이면 성공.")
        print("테스트라 저장(완료)은 누르지 마세요.")


if __name__ == "__main__":
    main()
