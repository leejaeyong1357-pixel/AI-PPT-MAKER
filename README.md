# 사내 ERP 자동화 (TECZEN)

회사 ERP 입력을 자동화하는 도구 모음입니다. 모두 **본인 PC에서 실행**합니다
(사내망 ERP라 클라우드에서 접속 불가).

## 들어있는 것

| 폴더/파일 | 용도 |
|---|---|
| `extract.py` (루트) | **외국어 점수**: 성적표 사진/PDF를 AI가 읽어 ERP 업로드용 엑셀 생성 |
| `training/` | **교육 이수**: 명단·수료증 정리(`prepare.py`), 입력양식 생성(`make_template.py`), (예정) 브라우저 자동입력 |

## 처음 한 번만 설치

1. **Python 설치** — https://www.python.org/downloads/ (설치 시 "Add Python to PATH" 체크)
2. 다운로드한 폴더에서 명령창(cmd)을 열고:
   ```
   pip install -r requirements.txt
   pip install -r training/requirements.txt
   ```
3. **API 키** (외국어 도구만 필요) — `.env.example`을 복사해 `.env`로 이름 바꾼 뒤
   `ANTHROPIC_API_KEY=sk-ant-...` 한 줄 입력. 키 발급: https://console.anthropic.com

## ① 외국어 점수 변환기

```
python extract.py
```
- `input/` 폴더에 성적표 사진(.jpg/.png)·PDF를 넣고 실행
- 결과: `output/외국어_업로드.xlsx` → ERP 외국어 화면에 대량 업로드
- (선택) `roster.csv`(성명,사번)를 두면 사번 자동 매칭
- 등급→능력(상/중/하) 규칙·컬럼은 `config.py`에서 수정

## ② 교육 이수

```
cd training
python make_template.py          # 입력 양식(교육_입력양식.xlsx) 생성
python prepare.py --roster 명단.xlsx   # 명단+수료증 검증 → output/작업목록.xlsx
```
- 수료증은 `training/수료증/` 폴더에 `사번.pdf` 형태로
- 규칙·컬럼은 `training/config.py`에서 수정
- 3단계 화면 자동입력(RPA)은 ERP 화면 구조 확인 후 추가 예정

## 주의

- `.env`, 명단·수료증·결과 엑셀은 깃에 올라가지 않습니다(개인정보 보호).
- 교육 RPA는 실제 데이터 전에 **'테스트용 교육' 1건으로 먼저** 확인하세요.
