# -*- coding: utf-8 -*-
"""
0단계 · 화면 진단기 (ERP 폼 구조 뽑기)

사용법 (Windows 기준):
  1) 크롬을 '디버깅 모드'로 켠다 (cmd 창에 아래 한 줄 붙여넣기):
       "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\\erp_rpa_profile"
     -> 새 크롬 창이 뜸. 여기서 ERP에 로그인하고, 진단할 화면(예: 교육과정 등록)을 띄운다.
  2) 다른 cmd 창에서:
       pip install -r requirements.txt
       python -m playwright install chromium   (최초 1회)
       python inspect_erp.py
  3) 출력 전체를 복사해서 클로드에게 붙여넣는다.

이 스크립트는 아무것도 입력/저장하지 않는다. 화면을 '읽기만' 한다.
"""
import sys

CDP_URL = "http://localhost:9222"

# 이 ID 중 하나라도 들어있는 프레임을 'ERP 폼 프레임'으로 본다 (1·2·3단계 공통 마커)
MARKERS = [
    "CURS_CD", "CURS_NM", "START_DT", "END_DT", "PRPOEDC_DC", "EDU_DC",
    "PLCEDC_NM", "CURS_CD_text", "btnResist", "keyword",
    "cdtDate_startinput", "cdtDate_endinput",
]

JS_FIND = """
(markers) => markers.filter(id => document.getElementById(id)).length
"""

JS_DUMP = r"""
() => {
  const info = { url: location.href, controls: [] };
  const sels = 'input, textarea, select, button, span.k-input, [data-role="dropdownlist"], [data-role="combobox"]';
  const seen = new Set();
  document.querySelectorAll(sels).forEach(el => {
    if (seen.has(el)) return; seen.add(el);
    let label = '';
    if (el.id) {
      const l = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]');
      if (l) label = (l.innerText || '').trim();
    }
    if (!label) {
      const p = el.closest('td, th, .dews-form-group, .form-group, dd, li, tr');
      if (p) {
        const l = p.parentElement && p.parentElement.querySelector('th, .dews-label, label, dt');
        if (l) label = (l.innerText || '').trim();
      }
    }
    const tag = el.tagName.toLowerCase();
    info.controls.push({
      tag: tag,
      type: el.getAttribute('type') || '',
      id: el.id || '',
      name: el.getAttribute('name') || '',
      bind: el.getAttribute('data-dews-bind-column') || '',
      role: el.getAttribute('data-role') || el.getAttribute('role') || '',
      readonly: el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === 'true',
      disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
      cls: String(el.className || '').slice(0, 140),
      label: label.slice(0, 40),
      text: (tag === 'span' || tag === 'button') ? (el.innerText || '').trim().slice(0, 40) : ''
    });
  });
  return info;
}
"""


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[!] playwright 가 없어요. 먼저:  pip install -r requirements.txt")
        sys.exit(1)

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP_URL)
        except Exception as e:
            print("[!] 크롬 디버깅 창에 연결 실패:", e)
            print("    크롬을 --remote-debugging-port=9222 로 먼저 켰는지 확인하세요 (파일 맨 위 설명 참고).")
            sys.exit(1)

        print("=" * 70)
        print("열려있는 페이지 / 프레임 목록")
        print("=" * 70)
        form_frames = []
        for ci, ctx in enumerate(browser.contexts):
            for pi, page in enumerate(ctx.pages):
                print(f"[page {ci}.{pi}] {page.url}")
                for fr in page.frames:
                    try:
                        n = fr.evaluate(JS_FIND, MARKERS)
                    except Exception:
                        n = 0
                    mark = "  <== ERP 폼 발견" if n else ""
                    print(f"    frame: {fr.url[:90]}{mark}")
                    if n:
                        form_frames.append(fr)

        if not form_frames:
            print("\n[!] ERP 폼 프레임을 못 찾았어요.")
            print("    진단할 화면(예: 교육과정 등록)이 그 크롬 창에 떠 있는지 확인하고 다시 실행하세요.")
            return

        for fi, fr in enumerate(form_frames):
            info = fr.evaluate(JS_DUMP)
            print("\n" + "=" * 70)
            print(f"[폼 프레임 {fi}]  {info['url']}")
            print("=" * 70)
            print(f"{'라벨':<12} {'tag':<9} {'type':<10} {'id':<20} "
                  f"{'role':<13} {'RO':<3} {'bind':<14} text")
            print("-" * 70)
            for c in info["controls"]:
                ro = "Y" if c["readonly"] else ("D" if c["disabled"] else "")
                print(f"{c['label']:<12} {c['tag']:<9} {c['type']:<10} {c['id']:<20} "
                      f"{str(c['role']):<13} {ro:<3} {c['bind']:<14} {c['text']}")
        print("\n[끝] 위 출력 전체를 복사해서 클로드에게 붙여넣어 주세요.")


if __name__ == "__main__":
    main()
