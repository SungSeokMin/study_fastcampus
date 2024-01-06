앞서 작성했던 [RFC](https://github.com/SungSeokMin/front-end-practice-learning-from-scenarios/blob/master/2%EC%9E%A5%20-%20%EC%83%88%EB%A1%9C%EC%9A%B4%20%EC%B6%9C%EB%B0%9C/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EB%B6%84%EC%84%9D%20%EB%B0%8F%20%EA%B8%B0%ED%9A%8D.md)의 요구사항을 바탕으로 `Client Side Rendering`과 `Server Side Rendering` 중 하나의 기술을 선택하려고 한다.

[CSR | SSR | SSG 파악하기](https://velog.io/@jkl1545/CSR-SSR-SSG)

# 프로젝트 요구사항

1. 서비스가 `더 많은` 사용자에게 `노출`될 수 있도록 한다.
2. 사용자에게 더 많은 서비스 정보를 제공한다.
3. 사용자에게 서비스의 `매력을 증진`시킨다.

위 항목 중 중요하게 봐야 할 부분은 `더 많은 노출`, `서비스 매력`이다.

### 더 많은 노출 : [SEO](https://developer.mozilla.org/ko/docs/Glossary/SEO)(Search Engine Optimzation)

![SEO](https://user-images.githubusercontent.com/72539723/190345164-f5bf78cb-dce8-42a2-a699-45ace4465d87.png)

- Cross linking : 링크가 많이 걸려있는 문서
- title tag and meta description : html문서 내의 제목과 meta tag를 정교하게 기입
- URL canonicalization : 유니크한 컨텐츠를 하나의 URL로 정리

추가적으로 `SEO`에 도움되는 몇 가지 항목들이다.

- HTTPS version (Secure Site) : HTTP의 보안 강화
- [Page Speed](https://pagespeed.web.dev/) : 페이지 속도
- Structured Data : 구조화된 데이터
- [Mobile Compatibility](https://search.google.com/test/mobile-friendly) : 모바일 최적화
- [Open Graph](https://ogp.me/)

### 서비스 매력 : 퍼포먼스

[Web Vitals](https://web.dev/i18n/ko/vitals/)

- LCP( 최대 콘텐츠풀 페인트, Largest Contentful Paint ) : 로딩 성능 측정
  - 웹사이트가 사용자한테 전달될 때 가장 큰 콘텐츠가 표시되는 시점까지 걸리는 시간
- FID( 최초 입력 지연, First Input Delay ) : 상호 작용 측정
  - 사용자가 어떤 인터랙션을 했을 때 얼마나 빠르게 반응하는가에 대한 시간
- CLS( 누적 레이아웃 시프트, Cumulative Layout Shift ) : 시각적 안정성 측정
  - 화면에 레이아웃들이 조립되는 모습의 흔들림 정도를 측정
