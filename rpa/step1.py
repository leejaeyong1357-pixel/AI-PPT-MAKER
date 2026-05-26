# -*- coding: utf-8 -*-
"""
1단계 - 교육과정 등록 자동 채우기 (Python + Playwright)

[준비물]  pip install playwright      (브라우저 따로 설치 불필요: 켜놓은 크롬에 붙음)

[실행 순서]
  1) 크롬을 '디버깅 모드'로 켠다 (cmd 한 줄):
       "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%USERPROFILE%\\erp_rpa_profile"
  2) 그 크롬에서 ERP 로그인 -> 교육과정 등록 화면(빈 폼)을 띄운다.
  3) python step1.py

* 지금은 아래 DATA 의 '예시값'으로 채운다. 실제로는 DATA 만 본인 교육정보로 바꾸면 된다.
* 테스트 단계에서는 채워지는 것만 확인하고 저장(완료)은 누르지 말 것.
"""
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

CDP = "http://127.0.0.1:9222"  # localhost(::1, IPv6) 회피 - 반드시 127.0.0.1

# ===== 여기(DATA)만 본인 교육정보로 바꾸면 됨 =====
DATA = {
    "CURS_NM": "[테스트] 어학교육",        # 교육과정명
    "START_DT": "2026-02-01",             # 시작일
    "END_DT": "2026-05-31",               # 종료일
    "EUCPART_CD": "향상교육",              # 교육구분
    "INOUTCOM_FG_CD": "사내교육",          # 사내외구분
    "EDUTYPE_CD": "집체교육",              # 교육형태
    "PRPOEDC_DC": "[테스트] 교육목적",      # 교육목적
    "EDU_DC": "[테스트] 교육내용",          # 교육내용
    "PLCEDC_NM": "[테스트] 본사 교육장",    # 교육장소
    "EDU_TM_DY": 6,                        # 교육시간
    "EDUCOST_AMT": 1500000,                # 교육비
    "RFLT_FG": "교육대상자등록",            # 이수여부반영
}
# ===================================================

KIND = {
    "CURS_NM": "text", "PRPOEDC_DC": "text", "EDU_DC": "text", "PLCEDC_NM": "text",
    "START_DT": "date", "END_DT": "date",
    "EDU_TM_DY": "num", "EDUCOST_AMT": "num",
    "EUCPART_CD": "ddl", "INOUTCOM_FG_CD": "ddl", "EDUTYPE_CD": "ddl", "RFLT_FG": "ddl",
}

JS_FILL = r"""
(args) => {
  const {data, kind} = args;
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const log = [];
  const el = id => document.getElementById(id);
  const L = (id,m)=>log.push(id+' : '+m);
  function setText(id,v){const e=el(id);if(!e)return L(id,'칸없음');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK글자 -> '+v);}
  function setDate(id,v){const e=el(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoDatePicker');if(w){w.value(new Date(v));w.trigger('change');return L(id,'OK날짜 -> '+v);}e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK날짜기본 -> '+v);}
  function setNum(id,v){const e=el(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoNumericTextBox');if(w){w.value(Number(v));w.trigger('change');return L(id,'OK숫자 -> '+v);}e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));L(id,'OK숫자기본 -> '+v);}
  function setDDL(id,t){const e=el(id);if(!e)return L(id,'칸없음');const w=$&&$(e).data('kendoDropDownList');if(w){const ds=w.dataSource.data();const tf=w.options.dataTextField;let ok=false;for(let i=0;i<ds.length;i++){const x=tf?ds[i][tf]:(ds[i].text!==undefined?ds[i].text:ds[i]);if((''+x).trim()===t){w.select(i);ok=true;break;}}if(!ok&&e.options){for(const o of e.options){if(o.text.trim()===t){w.value(o.value);ok=true;break;}}}w.trigger('change');return L(id,ok?'OK드롭 -> '+t:'옵션없음: '+t);}if(e.options){for(const o of e.options){if(o.text.trim()===t){e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));return L(id,'OKselect -> '+t);}}}L(id,'옵션없음: '+t);}
  const fn={text:setText,date:setDate,num:setNum,ddl:setDDL};
  for(const id in data){ (fn[kind[id]]||setText)(id, data[id]); }
  return log;
}
"""


def find_form_page(browser):
    for ctx in browser.contexts:
        for page in ctx.pages:
            try:
                if page.evaluate("() => !!document.getElementById('CURS_NM')"):
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
            print("    크롬을 --remote-debugging-port=9222 로 켰는지 확인하세요 (파일 위 설명 참고).")
            sys.exit(1)

        page = find_form_page(browser)
        if not page:
            print("[!] 교육과정 등록 화면(CURS_NM 칸)을 못 찾았어요.")
            print("    그 화면(빈 폼)을 디버깅 크롬에 띄우고 다시 실행하세요.")
            return

        result = page.evaluate(JS_FILL, {"data": DATA, "kind": KIND})
        print("=== 1단계 채우기 결과 ===")
        for line in result:
            print("  " + line)
        print("\n채워진 칸을 눈으로 확인하세요. 테스트라 저장(완료)은 누르지 마세요.")


if __name__ == "__main__":
    main()
