// 1단계 · 교육과정 등록 폼 자동 채우기 (브라우저 콘솔 붙여넣기용)
//
// 사용법:
//   1) ERP 교육과정 등록 화면(빈 입력폼)에서 F12 → 콘솔
//   2) 아래 전체를 복사해 붙여넣고 엔터
//   3) 칸이 채워지는지 확인 (※ 테스트 단계에서는 저장 누르지 말 것)
//
// 지금은 예시값(맨 아래 DATA)으로 채운다. 실제 값은 DATA만 바꾸면 된다.

(() => {
  const $ = window.$ || window.jQuery || (window.kendo && window.kendo.jQuery);
  const log = [];
  const el = (id) => document.getElementById(id);
  const L = (id, msg) => log.push(`${id} : ${msg}`);

  function setText(id, v) {
    const e = el(id); if (!e) return L(id, '칸없음');
    e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    L(id, 'OK(글자) → ' + v);
  }
  function setDate(id, v) {
    const e = el(id); if (!e) return L(id, '칸없음');
    const w = $ && $(e).data('kendoDatePicker');
    if (w) { w.value(new Date(v)); w.trigger('change'); return L(id, 'OK(날짜) → ' + v); }
    e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); L(id, 'OK(날짜·기본) → ' + v);
  }
  function setNum(id, v) {
    const e = el(id); if (!e) return L(id, '칸없음');
    const w = $ && $(e).data('kendoNumericTextBox');
    if (w) { w.value(Number(v)); w.trigger('change'); return L(id, 'OK(숫자) → ' + v); }
    e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); L(id, 'OK(숫자·기본) → ' + v);
  }
  function setDDL(id, text) {
    const e = el(id); if (!e) return L(id, '칸없음');
    const w = $ && $(e).data('kendoDropDownList');
    if (w) {
      const ds = w.dataSource.data();
      const tf = w.options.dataTextField;
      let ok = false;
      for (let i = 0; i < ds.length; i++) {
        const t = tf ? ds[i][tf] : (ds[i].text !== undefined ? ds[i].text : ds[i]);
        if (('' + t).trim() === text) { w.select(i); ok = true; break; }
      }
      if (!ok && e.options) {
        for (const o of e.options) { if (o.text.trim() === text) { w.value(o.value); ok = true; break; } }
      }
      w.trigger('change');
      return L(id, ok ? 'OK(드롭다운) → ' + text : '옵션없음: ' + text);
    }
    if (e.options) {
      for (const o of e.options) {
        if (o.text.trim() === text) { e.value = o.value; e.dispatchEvent(new Event('change', { bubbles: true })); return L(id, 'OK(select) → ' + text); }
      }
    }
    L(id, '옵션없음: ' + text);
  }

  // ===== DATA (실제로는 여기만 바꾸면 됨) =====
  setText('CURS_NM', '[테스트] 어학교육');
  setDate('START_DT', '2026-02-01');
  setDate('END_DT', '2026-05-31');
  setDDL('EUCPART_CD', '향상교육');       // 교육구분
  setDDL('INOUTCOM_FG_CD', '사내교육');   // 사내외구분
  setDDL('EDUTYPE_CD', '집체교육');       // 교육형태
  setText('PRPOEDC_DC', '[테스트] 교육목적');
  setText('EDU_DC', '[테스트] 교육내용');
  setText('PLCEDC_NM', '[테스트] 본사 교육장');
  setNum('EDU_TM_DY', 6);                 // 교육시간
  setNum('EDUCOST_AMT', 1500000);         // 교육비
  setDDL('RFLT_FG', '교육대상자등록');     // 이수여부반영
  // ==========================================

  const out = '[1단계 채우기 결과]\n' + log.join('\n');
  console.log(out);
  try {
    const b = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'step1_result.txt'; a.click();
  } catch (e) {}
  console.log('%c채워진 칸을 눈으로 확인하세요. 테스트 단계라 저장(완료)은 누르지 마세요!', 'color:green;font-size:14px;font-weight:bold');
})();
