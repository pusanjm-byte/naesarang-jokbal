# 내사랑족발 온천장점 홈페이지 — 소스

`main` 브랜치 = 실제 공개되는 결과물(GitHub Pages). 이 `source` 브랜치 = 편집용 원본.

## 수정 순서
1. `work/before-edit-mode.html` 수정 (마크업+CSS). 한국어 문구를 바꾸면 `en.json`에 같은 키로 영어 번역 추가/교체.
2. `site/` 폴더 = `main` 브랜치 체크아웃 (img/, video/ 에셋). 새 사진·영상은 `site/img`, `site/video`에 **새 파일명**으로 추가.
3. `python3 build_edit.py && python3 build_deploy.py`
   - `naesarang-oncheonjang.html` = Claude 아티팩트(미리보기, 편집 모드 포함)
   - `deploy/` = GitHub Pages용 (index.html + 참조된 에셋만)
4. `deploy/index.html`과 새 에셋을 `main`에 복사 → 커밋 → push.
