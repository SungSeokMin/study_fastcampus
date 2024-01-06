# 12shop PoC

## Setup

### 1. Docker 설치

[Docker 설치하기](https://www.docker.com/)

```
// mysql 이미지 생성
docker pull mysql:latest

// mysql container 생성
docker run --mysql-container -e MYSQL_ROOT_PASSWORD=1234 -d -p 3306:3306 mysql
```

### 2. 데이터베이스 생성

```sql
CREATE DATABASE 12shop DEFAULT CHARACTER SET = 'utf8mb4';
```

### 3. 더미 데이터 추가

```sql
insert into products (~) values (~);

insert into product-photos (~) values (~);
```

### 4. b2c server 및 cdn 서버 실행

### 5. rest client를 이용해 request 보내기

`rest client` 익스텐션 설치

```http
### Products
GET http://localhost:3000/products HTTP/1.1
```

```js
[
  {
    "id": "0021c4d6-9ad4-473a-a7d0-06158a26b646",
    "productName": "빈티지 일렉 기타",
    "price": 12,
    "detailDescription": "",
    "active": true,
    "photos": [
      {
        "id": "ece4fac7-afeb-4c2d-833f-cc5cdd8aa92d",
        "url": "01,ece4fac7-afeb-4c2d-833f-cc5cdd8aa92d.jpg",
        "contentType": "image/jpeg",
        "width": 1920,
        "height": 1134,
        "filesize": 0
      }
    ]
  },
  ...
]
```

## PoC 계획과 목표

- Next.js SSR 라우트 구조 확인
- 페이지별 Meta Taging
- API Fetching
- Next.js 기능 목록 체크

### Next.js SSR 라우트 구조 확인

Next.js는 `file-system` 라우터를 제공한다.

예를들면 아래와 같다.

```js
pages/index.js -> '/'

pages/blog/index.js -> '/blog'

pages/blog/[id].js -> '/blog/:id'
```

React에서는 `Link` 태그를 아래와 같이 사용했다면

```js
import { Link } from 'react-router-dom';

<Link to="/">홈</Link>;
```

Next.js에서는 아래와 같이 사용한다.

```js
import { Link } from 'next/link';

<Link href="/">
  <a>홈</a>
</Link>;
```

### 페이지별 Meta Taging

SEO의 강점을 가지고 있는 Next.js는 아래와 같이 meta tag를 작성할 수 있다.

```js
import { Head } from 'next/head';

<div>
  <Head>
    <title>타이틀 입니다.</title>
    <meat name="description" content="설명입니다."></meat>
  </Head>
</div>;
```

### API Fetching

- server side
  - getServerSideProps (페이지가 사용자로부터 요청을 받을 때마다 호출된다.)
  - getStaticProps (애플리케이션이 실행될 때 한 번만 호출된다.)
- client side
- API gateway

### Next.js 기능 목록 체크

- Image optimization
- Font optimization
