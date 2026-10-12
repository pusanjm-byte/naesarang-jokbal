import re
from bs4 import BeautifulSoup, NavigableString, Tag

src = open('work/before-edit-mode.html', encoding='utf-8').read()
FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,700;125,900&family=Noto+Sans+KR:wght@400;600;700;900&display=swap'
css = src[src.index('<style>')+7:src.index('</style>')]
markup = src[src.index('<header class="site-head">'):src.index('<script>')]

soup = BeautifulSoup(markup, 'html.parser')

def wrap_text(el, tag):
    """el의 직계 텍스트 노드를 tag로 감싼다 (공백만 있는 것은 제외)."""
    for node in list(el.children):
        if isinstance(node, NavigableString) and node.strip():
            t = soup.new_tag(tag); t.string = node.strip()
            node.replace_with(t)

# 1) 글자와 태그가 섞인 요소를 정리
for sm in soup.select('.row small'): wrap_text(sm, 'span')
for fc in soup.select('.strip figcaption'): wrap_text(fc, 'b')
for dt in soup.select('.list dt'):
    if dt.find('small'): wrap_text(dt, 'span')
for h in soup.select('h3.shop'): wrap_text(h, 'span')

# 2) 주문 링크
onc = None
for a in soup.select('a.pill'):
    if 'GOhvwcdF' in a.get('href', ''):
        a['data-href'] = 'naver'; a['data-default'] = a['href']; onc = a
    elif 'naver.me' in a.get('href', ''):
        a['data-href'] = 'main_naver'; a['data-default'] = a['href']
order = BeautifulSoup('''<div class="act" id="order" hidden>
        <a class="pill ghost" data-href="baemin" data-default="https://s.baemin.com/Y4000AIeibj3y" href="https://s.baemin.com/Y4000AIeibj3y" target="_blank" rel="noopener">배달의민족 주문</a>
        <a class="pill ghost" data-href="coupang" data-default="https://web.coupangeats.com/share?storeId=991533&amp;dishId&amp;key=7492274f-632a-4cb5-ad2c-f72bcdb93ed0" href="https://web.coupangeats.com/share?storeId=991533&amp;dishId&amp;key=7492274f-632a-4cb5-ad2c-f72bcdb93ed0" target="_blank" rel="noopener">쿠팡이츠 주문</a>
      </div>''', 'html.parser')
# (Visit의 배달 버튼 제거: 포장 구역에 있음)

# 3) 편집 키 부여
LEAF = {'h1','h2','h3','p','small','dd','dt','span','b','figcaption','summary','li'}
n = 0
def has_el_children(el): return any(isinstance(c, Tag) for c in el.children)
def only_br(el): return all((isinstance(c, NavigableString)) or c.name == 'br' for c in el.children)
for el in soup.find_all(True):
    if el.find_parent(['a', 'button', 'nav']) or el.name in ('a', 'button'): continue
    if el.find_parent(class_='mq'): continue
    txt = el.get_text(strip=True)
    if not txt: continue
    ok = False
    if el.name in LEAF and not has_el_children(el): ok = True
    elif el.name == 'div' and 'num' in el.get('class', []) and not has_el_children(el): ok = True
    elif el.name in ('h1', 'h2', 'p') and has_el_children(el) and only_br(el):
        ok = True; el['data-ml'] = ''
    if ok:
        n += 1; el['data-k'] = 't%d' % n
print('editable elements:', n)

tpl = str(soup)
assert '</template>' not in tpl and '</script>' not in tpl

css_extra = '''
.strip figcaption b{font-weight:600}
#order{margin-top:10px}
.list dt small{margin-left:8px}
.lang{font:700 .84rem var(--kr);background:transparent;color:var(--fg);border:1.5px solid var(--line);border-radius:999px;padding:8px 16px;cursor:pointer;white-space:nowrap}
.lang:hover{border-color:var(--sun);color:var(--sun)}

/* 편집 모드 */
.ed-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:20;background:var(--fg);color:var(--bg);border:0;border-radius:999px;padding:12px 20px;font:700 .95rem var(--kr);cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.5)}
.ed-bar{position:fixed;left:0;right:0;top:0;z-index:30;background:var(--sun);color:var(--on-sun);display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 10px;font-weight:600}
.ed-bar span{flex:1;min-width:12em}
.ed-bar button{font:700 .92rem var(--kr);border-radius:999px;padding:9px 18px;cursor:pointer;border:1.5px solid var(--on-sun);background:transparent;color:var(--on-sun)}
.ed-bar button.go{background:var(--on-sun);color:var(--sun)}
.ed-bar button:disabled{opacity:.5;cursor:default}
.ed-panel{position:fixed;right:16px;bottom:16px;z-index:30;width:min(360px,calc(100vw - 32px));max-height:70vh;overflow:auto;background:#1b1611;border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px}
.ed-panel h4{margin:0;font:900 1.05rem var(--kr)}
.ed-panel p{color:var(--dim);font-size:.86rem}
.ed-panel label{display:flex;flex-direction:column;gap:5px;font-size:.86rem;color:var(--dim)}
.ed-panel input{font:400 .95rem var(--kr);background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:10px;padding:10px 12px;width:100%}
.ed-panel input:focus{outline:2px solid var(--sun);border-color:transparent}
.ed-close{align-self:flex-end;font:700 .88rem var(--kr);background:transparent;color:var(--fg);border:1.5px solid var(--fg);border-radius:999px;padding:8px 16px;cursor:pointer}
.editing body{padding-top:64px}
.editing .dock,.editing .site-head{display:none}
.editing .fu{opacity:1;transform:none}
.editing [data-k]{outline:1px dashed rgba(255,210,31,.55);outline-offset:3px;border-radius:2px;cursor:text;min-width:1.5em}
.editing [data-k]:focus{outline:2px solid var(--sun)}
.editing [data-k]:empty::before{content:"(비어 있음)";color:var(--dim)}
.editing .mq{animation:none}
@media (max-width:820px){.ed-fab{bottom:calc(74px + env(safe-area-inset-bottom,0px))}.ed-panel{bottom:8px}}
'''

js = open('edit_main.js', encoding='utf-8').read().replace('__FONTS__', FONTS).replace('__EN__', __import__('json').dumps(__import__('json').load(open('en.json',encoding='utf-8')),ensure_ascii=False).replace('<','\\u003c'))
assert '</script>' not in js

state = '{"v":1,"text":{},"links":{}}'
out = ('<title>내사랑족발 온천장점</title>\n'
       '<link rel="stylesheet" href="%s">\n' % FONTS +
       '<style id="css">' + css.rstrip() + '\n' + css_extra + '</style>\n\n'
       '<template id="tpl">\n' + tpl.strip() + '\n</template>\n'
       '<div id="app"></div>\n'
       '<script type="application/json" id="state">' + state + '</script>\n'
       '<script id="main">\n' + js + '\n</script>\n')
open('naesarang-oncheonjang.html', 'w', encoding='utf-8').write(out)
print('written', len(out))
