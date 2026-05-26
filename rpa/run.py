# -*- coding: utf-8 -*-
"""
교육 자동등록 - 전체 흐름 (하나의 스크립트)

  1) 교육과정등록(CDMEDB00100) : 칸 자동입력  (SAVE=True 면 저장)
  2) 교육과정개설등록(CDMCUO00100) : 차수추가(F3) -> 코드 입력 -> 데이터 불러오기
     -> 대상구분 '사원별'  (SAVE=True 면 저장)

[실행]  디버깅 크롬에 ERP 로그인 상태에서  ->  python run.py

[중요]  SAVE = False 가 기본. 먼저 '잘 채워지는지'만 확인하고,
        다 맞으면 SAVE = True 로 바꿔 실제 저장까지 자동으로 한다.
"""
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

CDP = "http://127.0.0.1:9222"
BASE = "https://erp.teczen.kr/HR"
REG_URL = BASE + "/CDMEDB00100"     # 교육과정등록(1단계)
OPEN_URL = BASE + "/CDMCUO00100"    # 교육과정개설등록(2단계)

# ===== 설정 =====
SAVE = True             # F8 저장 켬 (확인창도 자동 클릭). 끄려면 False
CODE = "700"            # 교육과정 코드
TRGT_FG = "사원별"       # 대상구분

DATA = {
    "CURS_CD": CODE,
    "CURS_NM": "[테스트] 어학교육",
    "START_DT": "2026-02-01",
    "END_DT": "2026-05-31",
    "EUCPART_CD": "향상교육",
    "INOUTCOM_FG_CD": "사내교육",
    "EDUTYPE_CD": "집체교육",
    "PRPOEDC_DC": "[테스트] 교육목적",
    "EDU_DC": "[테스트] 교육내용",
    "PLCEDC_NM": "[테스트] 본사 교육장",
    "EDU_TM_DY": 6,
    "EDUCOST_AMT": 1500000,
    "RETURN_YN": "N",
    "RFLT_FG": "교육대상자등록",
}
KIND = {
    "CURS_CD": "text", "CURS_NM": "text", "PRPOEDC_DC": "text", "EDU_DC": "text", "PLCEDC_NM": "text",
    "START_DT": "date", "END_DT": "date",
    "EDU_TM_DY": "num", "EDUCOST_AMT": "num",
    "EUCPART_CD": "ddl", "INOUTCOM_FG_CD": "ddl", "EDUTYPE_CD": "ddl",
    "RETURN_YN": "ddl", "RFLT_FG": "ddl",
}
# ================

# 화면에 보이는(=활성 탭의) 요소를 id로 고른다. (SPA가 다른 화면 id를 같이 들고 있어서)
JS_FILL = r"""
(args) => {
  const {data, kind} = args;
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const log = [];
  const pick = id => { const els = document.querySelectorAll('[id="'+id+'"]'); for (const e of els){ if (e.getClientRects().length>0) return e; } return els[0]||null; };
  const L = (id,m)=>log.push(id+' : '+m);
  function setText(id,v){const e=pick(id);if(!e)return L(id,'칸없음');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK글자 -> '+v);}
  function setDate(id,v){const e=pick(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoDatePicker');if(w){w.value(new Date(v));w.trigger('change');return L(id,'OK날짜 -> '+v);}e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK날짜기본 -> '+v);}
  function setNum(id,v){const e=pick(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoNumericTextBox');if(w){w.value(Number(v));w.trigger('change');return L(id,'OK숫자 -> '+v);}e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK숫자기본 -> '+v);}
  function setDDL(id,t){const e=pick(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoDropDownList');if(w){const ds=w.dataSource.data();const tf=w.options.dataTextField;let ok=false;for(let i=0;i<ds.length;i++){const x=tf?ds[i][tf]:(ds[i].text!==undefined?ds[i].text:ds[i]);if((''+x).trim()===t){w.select(i);ok=true;break;}}if(!ok&&e.options){for(const o of e.options){if(o.text.trim()===t){w.value(o.value);ok=true;break;}}}w.trigger('change');return L(id,ok?'OK드롭 -> '+t:'옵션없음: '+t);}if(e.options){for(const o of e.options){if(o.text.trim()===t){e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));return L(id,'OKselect -> '+t);}}}L(id,'옵션없음: '+t);}
  const fn={text:setText,date:setDate,num:setNum,ddl:setDDL};
  for(const id in data){ (fn[kind[id]]||setText)(id, data[id]); }
  return log;
}
"""

JS_SET_DDL = r"""
(args) => {
  const {id, text} = args;
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const els = document.querySelectorAll('[id="'+id+'"]');
  let e=null; for(const x of els){ if(x.getClientRects().length>0){e=x;break;} } if(!e) e=els[0];
  if(!e) return id+' : 칸없음';
  const w = $ && $(e).data('kendoDropDownList');
  if(w){const ds=w.dataSource.data();const tf=w.options.dataTextField;let ok=false;for(let i=0;i<ds.length;i++){const t=tf?ds[i][tf]:(ds[i].text!==undefined?ds[i].text:ds[i]);if((''+t).trim()===text){w.select(i);ok=true;break;}}if(!ok&&e.options){for(const o of e.options){if(o.text.trim()===text){w.value(o.value);ok=true;break;}}}w.trigger('change');return id+(ok?' : OK드롭 -> '+text:' : 옵션없음 -> '+text);}
  if(e.options){for(const o of e.options){if(o.text.trim()===text){e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));return id+' : OKselect -> '+text;}}}
  return id+' : 옵션없음 -> '+text;
}
"""


def vcount(page, id_):
    return page.locator(f"[id='{id_}']:visible").count()


def find_erp(browser):
    for ctx in browser.contexts:
        for page in ctx.pages:
            if "erp.teczen.kr" in (page.url or ""):
                return page
    return None


def goto(page, url, label):
    if url.split("/")[-1] not in (page.url or ""):
        print(f"-> {label} 화면으로 이동: {url}")
        try:
            page.goto(url, wait_until="domcontentloaded")
        except Exception as e:
            print("   이동 실패:", str(e)[:70])
        page.wait_for_timeout(3000)
    print("   현재 화면:", page.url[:60])


def try_save(page, label):
    if not SAVE:
        print(f"   [{label}] 저장 생략 (SAVE=False)")
        return
    page.bring_to_front()
    page.keyboard.press("F8")          # 더존 저장 단축키
    page.wait_for_timeout(1500)
    # 저장 확인창(예/확인)이 뜨면 자동 클릭
    for name in ["예", "확인", "저장"]:
        try:
            btn = page.get_by_role("button", name=name, exact=True)
            if btn.count() > 0 and btn.first.is_visible():
                btn.first.click(timeout=1500)
                print(f"   [{label}] F8 -> 확인창 '{name}' 클릭")
                page.wait_for_timeout(1500)
                return
        except Exception:
            pass
    print(f"   [{label}] F8 저장 시도 (확인창 없음/자동저장). 저장 안 되면 알려주세요)")


def open_chasu(page):
    """차수추가 폼 열기: 보이는 버튼 클릭 우선, 안되면 F3."""
    if vcount(page, "CURS_CD_text") > 0:
        return True
    page.bring_to_front()
    attempts = [
        ("차수추가 버튼(보임)", lambda: page.locator("[id='AddSq']:visible").first.click(timeout=3000)),
        ("버튼텍스트 차수추가", lambda: page.locator("button:has-text('차수추가')").first.click(timeout=3000)),
        ("F3", lambda: page.keyboard.press("F3")),
        ("[id=AddSq] 강제", lambda: page.locator("[id='AddSq']").first.click(timeout=3000, force=True)),
    ]
    for name, act in attempts:
        try:
            act()
            page.wait_for_timeout(1300)
            if vcount(page, "CURS_CD_text") > 0:
                print(f"   차수추가 성공: {name}")
                return True
            print(f"   시도했지만 폼 안열림: {name}")
        except Exception as e:
            print(f"   실패({name}): {str(e)[:50]}")
    return vcount(page, "CURS_CD_text") > 0


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[!] 먼저: pip install playwright"); sys.exit(1)

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP)
        except Exception as e:
            print("[!] 디버깅 크롬 연결 실패:", e); sys.exit(1)

        page = find_erp(browser)
        if not page:
            print("[!] ERP 페이지를 못 찾음. 디버깅 크롬에서 ERP 로그인하세요."); return
        page.bring_to_front()

        # ===== 1단계: 교육과정등록 =====
        print("\n[1단계] 교육과정등록")
        goto(page, REG_URL, "교육과정등록")
        if vcount(page, "CURS_NM") == 0:
            print("   [!] 등록 입력칸이 안 보여요. 신규 입력 상태인지 확인 필요(직접 신규 한번 눌러주세요).")
        result = page.evaluate(JS_FILL, {"data": DATA, "kind": KIND})
        for line in result:
            print("   " + line)
        try_save(page, "1단계")

        # ===== 2단계: 교육과정개설등록 =====
        print("\n[2단계] 교육과정개설등록")
        goto(page, OPEN_URL, "교육과정개설등록")
        if not open_chasu(page):
            print("   [!] 차수추가 폼이 안 열려요. 직접 차수추가 눌렀을 때 팝업이 뜨는지 알려주세요.")
            return
        print("   차수추가 OK -> 코드 입력")
        box = page.locator("[id='CURS_CD_text']:visible").first
        box.click(); box.fill(""); box.press_sequentially(CODE, delay=100); box.press("Enter")
        page.wait_for_timeout(2500)
        loaded = page.evaluate("() => { const e=document.getElementById('CURS_CD'); return e? e.value : null; }")
        print(f"   코드(CURS_CD): {loaded}")
        if not loaded:
            print("   (※ 코드 인식 실패 - 700이 실제 저장된 과정인지 확인 필요)")
        print("   " + page.evaluate(JS_SET_DDL, {"id": "TRGT_FG_CD", "text": TRGT_FG}))
        try_save(page, "2단계")

        print("\n완료. 화면 확인하세요. (SAVE=False면 저장은 안 됨)")


if __name__ == "__main__":
    main()
