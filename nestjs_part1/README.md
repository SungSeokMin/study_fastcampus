# NestJS Part_1

## NestJS 요청 라이플 사이클

- Module(Controller > Service > Repository)는 필수요소 입니다.
- Middleware & Guard & Interceptor & Pipe & Exception Filter는 필수요소가 아닙니다.

![NestJS 라이플 사이클](https://github.com/user-attachments/assets/d485ebfc-bbdf-49b0-a2ae-6884a744dbd4)

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
