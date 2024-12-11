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

## 타입 Validator

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

## 숫자 Validator

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

## 문자 Validator

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

## Pipe

![Pipe](https://github.com/user-attachments/assets/64311228-27d0-48fc-8342-d09fe6c66e49)

## Middleware

![Middleware](https://github.com/user-attachments/assets/22c89d93-ea09-4001-941c-62280682e290)
