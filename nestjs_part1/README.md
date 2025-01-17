# NestJS Part_1

## NestJS 요청 라이플 사이클

- Module(Controller > Service > Repository)는 필수요소 입니다.
- Middleware & Guard & Interceptor & Pipe & Exception Filter는 필수요소가 아닙니다.

![NestJS 라이플 사이클](https://github.com/user-attachments/assets/d485ebfc-bbdf-49b0-a2ae-6884a744dbd4)

![NestJS 세부 라이프 사이클](https://github.com/user-attachments/assets/447ce39f-626d-48c2-b5c2-96ef4c2cc5b1)

## Module

NestJS CLI를 통해서 Module을 자동생성 할 수 있습니다.

```
nest g resource
```

## Controller & Service

- Controller: 들어오는 요청에 대한 쿼리, 바디, 파라미터 체크, 타입 체크 등을 확인하는 역할을 합니다.
- Service: 실제 요청의 로직을 실행합니다.

## Class Validator

`개발자가 원하는 타입, 유형이 맞는지 검증은 해주지만 변환은 해주지 않습니다.`

![class validator](https://github.com/user-attachments/assets/46d5341c-8c1d-49b4-afeb-903b217b3f50)

### 공통 Validator

```ts
// !== null || !== undefined
@IsDefined()

// === null, === undefined
@IsOptional()

// ===
@Equals(comparison: any)

// !==
@NotEquals(comparison: any)

// === '', === null, === undefined
@IsEmpty()

// !== '', !== null, !== undefined
@IsNotEmpty()

// value is in an array
@IsIn(values: any[])

// value is not in an array
@IsNotIn(values: any[])
```

### 타입 Validator

```ts
// value is a boolean
@IsBoolean()

// value is a string
@IsString()

// value is a number
@IsNumber()

// value is an integer number
@IsInt()

// value is an array
@IsArray()

// value is a valid enum
enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

@IsEnum(MovieGenre)

// value is a date.
@IsDate()

// value is a date string.
@IsDateString()
```

### 숫자 Validator

```ts
// 값이 다른 숫자로 나누어 떨어지는 숫자
@IsDivisibleBy(num: number)

// 양수
@IsPositive()

// 음수
@IsNegative()

// 최솟값
@Min(num: number)

// 최댓값
@Max(num: number)
```

### 문자 Validator

```ts
// seed가 포함된 문자열
@Contains(seed: string)

// seed가 포함되지 않는 문자열
@NotContains(seed: string)

// 알파벳 + 숫자
@IsAlphanumeric()

// Hex Color
@IsHexColor()

// 최대 길이
@MaxLength(num: number)

// 최소 길이
@MinLength(num: number)

// uuid
@IsUUID()

// 위도 & 경도
@IsLatLong()
```

### Custom Validator

```ts
@ValidatorConstraint()
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: any): Promise<boolean> | boolean {
    // 비밀번호 길이는 4-8
    return value.length > 4 && value.length < 8;
  }

  defaultMessage(): string {
    return '비밀번호의 길이는 4~8자 여야합니다.';
  }
}

// 방법 1
@Validate(PasswordValidator)
password: string;

// 방법 2
function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    });
  };
}

@IsPasswordValid()
password: string;
```

## Class Transformer

`개발자가 원하는 타입, 유형이 맞는지 검증을 하지는 않지만 변환은 해줍니다.`

```ts
class User {
  @Exclude()
  name: string;

  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
```

## DataBase 연결 후 테이블 생성

TypeORM을 이용해서 PostgreSQL과 연결할 수 있습니다.

- TypeOrmModule.forRootAsync함수를 호출하는 이유는 ConfigModule이 IoC에 등록된 후 TypeOrmModule에 환경변수를 injection 하기 위함입니다.

```ts
// movie.entity.ts
@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Movie],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    MovieModule,
  ],
  controllers: [],
  providers: [],
})
```

## Repository CRUD

### Create & Delete 관련

create()

- 객체를 생성하는 역할을 합니다.
- 단, 데이터베이스에 데이터를 생성하지 않고 "객체"를 생성만 합니다.

```ts
const user = repository.create({
  id: 1,
  firstName: 'Timber',
  lastName: 'Saw',
});
```

save()

- 데이터베이스에 저장됩니다.
- 만약에 이미 Row가 존재한다면(primary key 값으로 구분) 업데이트 합니다.

```ts
await repository.save();
```

upsert()

- update와 insert를 합친 기능입니다.
- 데이터 생성 시도를 한 후 만약에 이미 존재하는 데이터라면 업데이트를 진행합니다.
- save()와 다르게 하나의 transaction에서 작업이 실행됩니다.

```ts
await repository.upsert(
  [
    { externalId: 'abc123', firstName: 'Sung' },
    { externalId: 'def456', firstName: 'Kim' },
  ],
  ['externalId'],
);
```

delete()

- Row를 삭제할때 사용됩니다.
- 대체적으로 Primary Key를 사용해서 삭제합니다.

```ts
await repository.delete(1);
await repository.delete([1, 2, 3]);
await repository.delete({ firstName: 'Sung' });
```

softDelete() & restore()

- softDelete()는 비영구적으로 삭제합니다.
- restore()는 sortDelete() 했던 Row를 복구할 수 있습니다.

```ts
// 샥제
await repository.softDelete(1);

// 복구
await repository.restore(1);
```

### Update 관련

update()

- 첫번째 파라미터에 검색 조건을 입력해줍니다.
- 두번째 파리미터에 변경 필드를 입력해줍니다.

```ts
await repository.update({ age: 20 }, { category: 'ADULT' });
```

### Find 관련

find() & findOne() & findAndCount()

- find(): 해당되는 Row를 모두 반환합니다.
- findOne(): 해당되는 첫번째 Row를 반환합니다. 없을경우 null을 반환합니다.
- findAndCount(): 해당되는 Row와 전체 갯수를 반환합니다.

```ts
const rows = await repository.find({
  where: {
    firstName: 'Sung',
  },
});

const rows = await repository.findOne({
  where: {
    firstName: 'Sung',
  },
});

const [rows, count] = await repository.findAndCount({
  where: {
    firstName: 'Sung',
  },
});
```

exists()

- 특정 조건의 Row가 존재하는지 Boolean 값을 반환 받을 수 있습니다.

```ts
const exists = await repository.exists({
  where: {
    firstName: 'Sung',
  },
});
```

preload()

- 데이터베이스에 저장된 값을 Primary Key 기준으로 불러오고 입력된 객체의 값으로 프로퍼티를 덮어씁니다.
- 덮어쓰는 과정에서 데이터베이스에 업데이트 요청이 보내지지는 않습니다.

```ts
const partialUser = {
  id: 1,
  firstName: 'Sung',
  profile: {
    id: 1,
  },
};

const user = await repository.preload(partialUser);
```

## Middleware

![Middleware](https://github.com/user-attachments/assets/22c89d93-ea09-4001-941c-62280682e290)

## Guard

![Guard](https://github.com/user-attachments/assets/70740e7e-b45c-49bd-8aea-3d413c6c855a)

## Interceptor

![Interceptor](https://github.com/user-attachments/assets/33d335c1-0d5a-48aa-b751-48f6a72f6048)

## Pipe

![Pipe](https://github.com/user-attachments/assets/64311228-27d0-48fc-8342-d09fe6c66e49)

## Exception Filter

![Exception Filter](https://github.com/user-attachments/assets/8e6adc97-29e2-434e-97bd-bb771a794c40)

## Pagination

- 데이터 분할: 큰 분량의 데이터를 분할해서 다루기 쉽게 부분적으로 불러 올 수 있습니다.
- 네비게이션 컨트롤: 다음 페이지, 이전 페이지등 기능을 통해 쉽게 페이지 이동이 가능합니다.
- 균일한 데이터 규격: 요청과 응답이 균일한 규격으로 제공되어 예측하기 쉽습니다.
- 상태 유지: Pagination 요청 자체에 상태 정보가 존재합니다.
- 퍼포먼스 최적화: 한번에 필요한 분량의 데이터만 불러오기 때문에 퍼포먼스 최적화가 가능합니다.

![pagination](https://github.com/user-attachments/assets/c1dc8e6d-9036-4d53-bc8b-47f779e091a8)

### Page Based Pagination

[Basic](https://github.com/SungSeokMin/study_fastcampus/commit/8912b5cab9b4df916347bd92e5199aade8a5373b?diff=split&w=1)

### Cursor Based Pagination

[Basic](https://github.com/SungSeokMin/study_fastcampus/commit/bf562667b918bcc221f6dc41cfd4c5c780a4be69?diff=split)

[Multi Column](https://github.com/SungSeokMin/study_fastcampus/commit/e4bc1d9be844b9b763b4ea16348a3d1283ea4771?diff=split)

### SQL 다중 칼럼

```sql
-- Page Pagination 기반 SQL
-- Page 1
SELECT id, title, "likeCount"
FROM movie
ORDER BY id DESC
LIMIT 5;

-- Page 2
SELECT id, title, "likeCount"
FROM movie
ORDER BY id DESC
LIMIT 5
OFFSET 5;

-- Page + likeCount 기반 SQL
SELECT id, title, "likeCount"
FROM movie
ORDER BY "likeCount" DESC, id DESC
LIMIT 5;

SELECT id, title, "likeCount"
FROM movie
ORDER BY "likeCount" DESC, id DESC
LIMIT 5
OFFSET 5;

-- Cursor Pagination 기반 SQL
-- id <= 300
SELECT id, title, "likeCount"
FROM movie
WHERE id <= 300
ORDER BY id DESC
LIMIT 5;

-- id < 296
SELECT id, title, "likeCount"
FROM movie
WHERE id < 296
ORDER BY id DESC
LIMIT 5;

-- Cursor + likeCount 기반 SQL
SELECT id, title, "likeCount"
FROM movie
ORDER BY "likeCount" DESC, id DESC
LIMIT 5;

-- likeCount가 20이하 이면서 id가 35보다 작은 경우
SELECT id, title, "likeCount"
FROM movie
WHERE ("likeCount" < 20)
 OR ("likeCount" = 20 AND id < 35)
ORDER BY "likeCount" DESC, id DESC
LIMIT 5;

-- MySql, PostgresSql에서는 다음과 같이 줄일 수 있다.
SELECT id, title, "likeCount"
FROM movie
WHERE (id, "likeCount") < (35, 20)
ORDER BY "likeCount" DESC, id DESC
LIMIT 5;
```

## Task Scheduling

![Cron 문법](https://github.com/user-attachments/assets/c8c42646-cf45-436b-9462-d6f82156f055)

```
0초마다 실행 (1분에 한번 실행)
0 * * * * *

정확히 자정에 실행 (0초 0분 0시)
0 0 0 * * *

일요일 3시 0분 30초에 실행 (일요일 3:00:00AM)
30 0 3 * * 0

매월 마지막 날 5시 30분 45초에 실행 (매월 마지막 날 5:30:45PM)
45 30 17 L * *

월,수,금 10시 45분에 실행 (월,수,금 10:15:00PM)
0 45 10 * * 1,3,5

0초 5분마다 실행 (5분마다 실행, 시 정각에 실행)
0 */5 * * * *
```

## Testing

### 기본 Matcher

- toBe(value): 값이 같은지 확인합니다.
- toEqual(value): 객체의 모든 값이 같은지 재귀적으로 확인합니다.
- toBeNull(): null 값을 확인합니다.
- toBeUndefined(): undefined 값을 확인합니다.
- toBeDefined(): toBeUndefined()의 반대입니다.
- toBeTruthy(): JS에서 인지하는 true 값을 반환하는지 확인합니다.
- toBeFalsy(): JS에서 인지하는 false 값을 반환하는지 확인합니다.
- toBeNan(): 숫자가 아님을 확인합니다.

### 숫자 Matcher

- toBeGreaterThan(number): 값이 더 큰지 확인합니다.
- toBeGreaterThanOrEqual(number): 값이 더 크거나 같은지 확인합니다.
- toBeLessThan(number): 값이 더 작은지 확인합니다.
- toBeLessThanOrEqual(number): 값이 더 작거나 같은지 확인합니다.
- toBeCloseTo(number, numDigits?): 특정 소수점까지 같은 값인지 확인합니다.

### 함수 Matcher

실행에 따른 함수

- toHaveBeenCalled(): mock function이 호출되었는지 확인합니다.
- toHaveBeenCalledTimes(number): mock function이 지정된 횟수만큼 호출되었는지 확인합니다.
- toHaveBeenCalledWith(arg1, arg2, …): mock function이 특정 파라미터와 함께 호출되었는지 확인합니다.
- toHaveBeenLastCalledWith(value): mock function이 마지막으로 호출될 때 특정 파라미터와 함께 호출되었는지 확인합니다.
- toHaveBeenNthCalledWith(nthCall, value): mock function이 n번째로 호출될 때 특정 파라미터와 함께 호출되었는지 확인합니다.

반환에 대한 함수

- toHaveReturned(): mock function이 값을 반환했는지 확인합니다. (에러를 던지지 않음)
- toHaveReturnedTimes(number): mock function이 값을 지정된 횟수만큼 반환했는지 확인합니다.
- toHaveReturnedWith(value): mock function이 특정 값을 반환했는지 확인합니다.
- toHaveLastReturnedWith(value): mock function이 마지막으로 특정 값을 반환했는지 확인합니다.
- toHaveNthReturnedWith(nthCall, value): mock function이 n번째로 특정 값을 반환했는지 확인합니다.

### 배열 및 객체 Matcher

- toContain(item): 배열 또는 문자열에 특정 항목이 포함되어 있는지 확인합니다.
- toContainEqual(item): 배열에 구조적으로 같은 항목이 포함되어 있는지 확인합니다.
- toHaveLength(number): 배열, 문자열 또는 객체의 길이/크기가 특정 값과 일치하는지 확인합니다.
- toHaveProperty(keyPath, value?): 객체에 특정 경로의 속성이 존재하고, 선택적으로 해당 속성의 값이 특정 값과 일치하는지 확인합니다.
- toMatchObject(object): 객체가 특정 객체와 부분적으로 일치하는지 확인합니다.

### 에러 Matcher

- toThrow(error?): 함수가 호출될 때 특정 오류를 던지는지 확인합니다.

### 기타 Matcher

- toStrictEqual(value): 객체가 구조적으로 완벽히 동일한지 확인합니다. (프로토타입 및 비열거형 속성 포함)
- toBeInstanceOf(Class): 값이 특정 클래스의 인스턴스인지 확인합니다.
- toMatch(regexp | string): 문자열이 정규 표현식 또는 문자열과 일치하는지 확인합니다.
- expect.anything(): 아무 값이나 허용하지만 null이나 undefined는 제외한다.
- expect.any(constructor): 특정 생성자의 인스턴스인지 확인합니다.
- expect.arrayContaining(array): 입력된 array가 비교 대상 array의 subset인지 확인합니다. (전부 포함하는지)
- expect.objectContaining(object): 입력된 객체가 비교 대상 객체의 subset인지 확인합니다. (전부 포함하는지)
- expect.stringContaining(string): 특정 문자열이 포함 돼있는지 확인합니다.

## Mock / Stub / Fake

테스트할때 의존성을 해결하는 방법은 다양하게 존재합니다. 모든 의존성을 그대로 사용하는 테스트도 존재하지만 그런 테스트는 너무 무겁고 오래 걸리므로, 일반적으로 의존성을 각자 객체로 스왑 후 사용합니다.

![Testing](https://github.com/user-attachments/assets/42efd065-b9e4-48f8-b279-0ac6bad3c2d9)

- Mock: 상호작용을 검증하는 객체입니다.
- Stub: 함수나 객체의 간소화된 버전으로 미리 정의된 값을 반환합니다.
- Fake: 실제 객체를 간소하게 구현한 형태로, 복잡한 실제 객체의 작동 방식을 최소화하여 구현한 형태입니다. 실제 객체는 무겁지만 Stub 보다는 현설적인 작동이 필요할때 많이 사용됩니다.

`의존성 해결을 해주는 객체가 셋중 꼭 어느 하나에 속한다고 생각할 필요는 없습니다. 명칭은 위와 같이 정의하지만 일반적으론 일괄적으로 Mock이라고 부릅니다.`

## Mock Function 구현

- mockFn.mockImplementation(fn): mock function의 구현체를 변경합니다. (실행할 함수)
- mockFn.mockImplementationOnce(fn): mockImplementation을 단 한번만 실행합니다. 여러번 chaining 가능하다.

---

- mockFn.mockReturnThis(): mock function이 호출될 때마다 this를 반환하도록 설정합니다.

---

- mockFn.mockReturnValue(value): mock function이 호출될 때마다 특정 값을 반환하도록 설정합니다.
- mockFn.mockReturnValueOnce(value): mockReturnValue를 단 한번만 실행합니다. 여러번 chaining 가능하다.

---

- mockFn.mockResolvedValue(value): mock function이 호출될 때 Promise가 특정 값으로 Resolve 되도록 합니다.
- mockFn.mockResolvedValueOnce(value): mockResolvedValue를 단 한번만 실행합니다. 여러번 chaining 가능하다.

---

- mockFn.mockRejectedValue(value): mock function이 호출될 때 Promise가 특정 값으로 Reject 되도록 설정합니다.
- mockFn.mockRejectedValueOnce(value): mock function의 다음 한 번의 호출에 대해 프로미스가 특정 값으로 거부되도록 설정합니다.

---

- mockFn.mockClear(): mock function의 호출 기록과 반환 값들을 지웁니다 (상태 초기화).
- mockFn.mockReset(): mockClear()의 기능을 모두 실행하고 mock 함수를 빈 함수로 대체합니다.
- mockFn.mockRestore(): mockReset()의 작업을 모두 진행하고 mock 함수를 원래 구현체로 복원합니다
