# 도메인 배포용 묶음 생성: python3 build_edit.py 후 python3 build_deploy.py
import re, os, shutil, json
SITE_URL = 'https://pusanjm-byte.github.io/naesarang-jokbal'   # 도메인 확정 후 입력 (예: https://naesarangjokbal.com)
src = open('naesarang-oncheonjang.html', encoding='utf-8').read()
tpl = src[src.index('<template id="tpl">')+len('<template id="tpl">'):src.index('</template>')]
body = src[src.index('<template id="tpl">'):]
body = body.replace('<div id="app"></div>', '<div id="app">' + tpl.strip() + '</div>', 1)
css = src[src.index('<style id="css">'):src.index('</style>')+8]
fonts = re.search(r'<link rel="stylesheet" href="([^"]+)">', src).group(1)
title = '내사랑족발 온천장점 | 부산 온천장 족발·보쌈, 매일 직접 삶습니다'
desc = '부산 동래구 온천장 족발·보쌈 전문점 내사랑족발 온천장점. 2008년 시청 본점에서 시작해 앞다리만 골라 매일 직접 삶습니다. 점심특선, 단체석 30명, 2층 놀이방, 무료 주차. 051-711-3848'
ld = {"@context":"https://schema.org","@type":"Restaurant","name":"내사랑족발 온천장점","servesCuisine":["족발","보쌈","한식"],
 "telephone":"+82-51-711-3848","priceRange":"₩₩",
 "address":{"@type":"PostalAddress","streetAddress":"금강로 135, 1층","addressLocality":"동래구","addressRegion":"부산","addressCountry":"KR"},
 "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"11:30","closes":"22:30"}],
 "hasMap":"https://naver.me/GOhvwcdF"}
if SITE_URL: ld["url"]=SITE_URL; ld["image"]=SITE_URL+'/img/og.jpg'
og_img = (SITE_URL+'/img/og.jpg') if SITE_URL else 'img/og.jpg'
head = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0b0907">
<meta name="format-detection" content="telephone=no">
{f'<link rel="canonical" href="{SITE_URL}/">' if SITE_URL else ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="내사랑족발 온천장점">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og_img}">
{f'<meta property="og:url" content="{SITE_URL}/">' if SITE_URL else ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="apple-touch-icon" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{css}
</head>
<body>
'''
out = head + body + '</body>\n</html>\n'
D = 'deploy'
shutil.rmtree(D, ignore_errors=True); os.makedirs(D+'/img'); os.makedirs(D+'/video')
used = sorted(set(re.findall(r'(?:img|video)/[\w\-]+\.\w+', out)))
for u in used:
    if os.path.exists('site/'+u): shutil.copy('site/'+u, D+'/'+u)
    else: print('MISSING', u)
open(D+'/index.html','w',encoding='utf-8').write(out)
open(D+'/.nojekyll','w').write('')
open(D+'/robots.txt','w').write('User-agent: *\nAllow: /\n' + (f'Sitemap: {SITE_URL}/sitemap.xml\n' if SITE_URL else ''))
if SITE_URL:
    open(D+'/sitemap.xml','w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{SITE_URL}/</loc></url></urlset>\n')
    if 'github.io' not in SITE_URL: open(D+'/CNAME','w').write(re.sub(r'^https?://','',SITE_URL)+'\n')
print(len(out), len(used), 'assets')
