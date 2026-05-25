# 사내 ERP 교육 자동화 (TECZEN)

회사 ERP의 '교육 이수' 입력을 자동화하는 도구입니다.
**본인 PC에서 실행**합니다 (사내망 ERP라 클라우드에서 접속 불가).

## 들어있는 것

| 파일 | 용도 |
|---|---|
| `training/make_template.py` | 입력 양식(엑셀) 생성 |
| `training/prepare.py` | 명단 + 수료증 검증 → `작업목록.xlsx` 생성 |
| `training/config.py` | 규칙·컬럼 설정 |
| (예정) 브라우저 자동입력(RPA) | 교육과정등록 → 개설등록 → 결과등록 자동 클릭 |

## 처음 한 번만 설치

1. **Python 설치** — https://www.python.org/downloads/ (설치 시 "Add Python to PATH" 체크)
2. 다운로드한 폴더에서 명령창(cmd)을 열고:
   ```
   pip install -r training/requirements.txt
   ```

## 사용

```
cd training
python make_template.py                 # 입력 양식(교육_입력양식.xlsx) 생성
python prepare.py --roster 명단.xlsx     # 명단+수료증 검증 → output/작업목록.xlsx
```

- 입력 양식의 '교육정보' 시트에 교육 1건, '대상자' 시트에 들은 사람들 입력
- 수료증은 `training/수료증/` 폴더에 `사번.pdf` 형태로
- 규칙·컬럼은 `training/config.py`에서 수정

## 주의

- 명단·수료증·결과 엑셀은 깃에 올라가지 않습니다(개인정보 보호).
- 3단계 화면 자동입력(RPA)은 실제 데이터 전에 **'테스트용 교육' 1건으로 먼저** 확인하세요.
